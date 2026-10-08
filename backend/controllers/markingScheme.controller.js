import MarkingScheme from "../models/MarkingScheme.model.js";
import Teacher from "../models/Teacher.model.js";
import { v2 as cloudinary } from "cloudinary";

// The school always comes from the authenticated admin — never from the request
// body and never from a hard-coded fallback.
const schoolOf = (req) => req.user?.schoolId || req.user?.school;
const ownsScheme = (req, scheme) => String(scheme.school) === String(schoolOf(req));

/* ══════════════════════════════════════════
   ADMIN — Upload a marking scheme
══════════════════════════════════════════ */
export const uploadScheme = async (req, res) => {
    try {
    const { classId, subjectId, term, academicYear, title, availableFrom } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    if (!classId || !subjectId || !term || !academicYear || !availableFrom) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const schoolId = schoolOf(req);
    if (!schoolId) return res.status(403).json({ message: "No school is linked to your account." });
    const uploadedById = req.user?._id || null;

    const scheme = await MarkingScheme.create({
      school: schoolId,
      class: classId,
      subject: subjectId,
      term,
      academicYear,
      title: title || "End of Term Marking Scheme",
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileType: req.file.mimetype.includes("pdf") ? "pdf" : "docx",
      availableFrom: new Date(availableFrom),
      uploadedBy: uploadedById,
    });

    res.status(201).json({ message: "Marking scheme uploaded successfully", scheme });
  } catch (err) {
    console.error("❌ Upload marking scheme error:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A marking scheme for this subject/class/term/year already exists. Delete or edit it instead.",
      });
    }
    res.status(500).json({ message: "Server error while uploading marking scheme." });
  }
};

/* ══════════════════════════════════════════
   ADMIN — Update availableFrom / replace file
══════════════════════════════════════════ */
export const updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, availableFrom } = req.body;

    const scheme = await MarkingScheme.findById(id);
    if (!scheme) return res.status(404).json({ message: "Marking scheme not found." });
    if (!ownsScheme(req, scheme)) return res.status(403).json({ message: "Not your school's marking scheme." });

    if (req.file) {
      await cloudinary.uploader.destroy(scheme.filePublicId, { resource_type: "raw" });
      scheme.fileUrl = req.file.path;
      scheme.filePublicId = req.file.filename;
      scheme.fileType = req.file.mimetype.includes("pdf") ? "pdf" : "docx";
    }

    if (title) scheme.title = title;
    if (availableFrom) scheme.availableFrom = new Date(availableFrom);

    await scheme.save();
    res.status(200).json({ message: "Marking scheme updated.", scheme });
  } catch (err) {
    console.error("Update marking scheme error:", err);
    res.status(500).json({ message: "Server error while updating marking scheme." });
  }
};

/* ══════════════════════════════════════════
   ADMIN — Delete a scheme
══════════════════════════════════════════ */
export const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const scheme = await MarkingScheme.findById(id);
    if (!scheme) return res.status(404).json({ message: "Marking scheme not found." });
    if (!ownsScheme(req, scheme)) return res.status(403).json({ message: "Not your school's marking scheme." });

    await cloudinary.uploader.destroy(scheme.filePublicId, { resource_type: "raw" });
    await scheme.deleteOne();

    res.status(200).json({ message: "Marking scheme deleted." });
  } catch (err) {
    console.error("Delete marking scheme error:", err);
    res.status(500).json({ message: "Server error while deleting marking scheme." });
  }
};

/* ══════════════════════════════════════════
   ADMIN — List all schemes for the school
══════════════════════════════════════════ */
export const getAllSchemesForSchool = async (req, res) => {
  try {
    const schoolId = schoolOf(req);
    if (!schoolId) return res.status(403).json({ message: "No school is linked to your account." });

    const schemes = await MarkingScheme.find({ school: schoolId })
      .populate("class", "className")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ schemes });
  } catch (err) {
    console.error("❌ Get all schemes error:", err);
    res.status(500).json({ message: "Server error while fetching marking schemes." });
  }
};

/* ══════════════════════════════════════════
   TEACHER — Get classes the teacher can view schemes for
══════════════════════════════════════════ */
export const getTeacherSchemeScope = async (req, res) => {
  try {
    const teacherId = req.user?._id || req.query.teacherId;
    if (!teacherId) return res.status(400).json({ message: "No teacher context available." });

    const teacher = await Teacher.findById(teacherId)
      .populate("classesAssigned", "className")
      .populate("subjectSpecialization", "name");

    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const classIds = teacher.classesAssigned.map((c) => c._id.toString());

    if (classIds.length === 0) {
      return res.status(200).json({ classes: [] });
    }

    const schemes = await MarkingScheme.find({
      school: teacher.school,
      class: { $in: classIds },
    })
      .populate("class", "className")
      .populate("subject", "name");

    const classMap = {};

    schemes.forEach((scheme) => {
      const classId = scheme.class._id.toString();
      const subjectId = scheme.subject._id.toString();

      // Regardless of teacherType, access to a subject's scheme requires
      // actually teaching that subject in that class.
      const teachesThisSubjectInThisClass =
        teacher.subjectSpecialization.some((s) => s._id.toString() === subjectId) &&
        teacher.classesAssigned.some((c) => c._id.toString() === classId);

      if (!teachesThisSubjectInThisClass) return;

      if (!classMap[classId]) {
        classMap[classId] = {
          classId,
          className: scheme.class.className,
          subjects: [],
        };
      }

      if (!classMap[classId].subjects.some((s) => s.subjectId === subjectId)) {
        classMap[classId].subjects.push({
          subjectId,
          subjectName: scheme.subject.name,
          schemeId: scheme._id,
          term: scheme.term,
          academicYear: scheme.academicYear,
          title: scheme.title,
          availableFrom: scheme.availableFrom,
          isUnlocked: new Date() >= new Date(scheme.availableFrom),
        });
      }
    });

    res.status(200).json({ classes: Object.values(classMap) });
  } catch (err) {
    console.error("Get teacher scheme scope error:", err);
    res.status(500).json({ message: "Server error while fetching your marking schemes." });
  }
};

/* ══════════════════════════════════════════
   TEACHER — Open/download a specific scheme
══════════════════════════════════════════ */
export const accessScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const teacherId = req.user?._id || req.query.teacherId;
    if (!teacherId) return res.status(400).json({ message: "No teacher context available." });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const scheme = await MarkingScheme.findById(schemeId)
      .populate("class", "className")
      .populate("subject", "name");

    if (!scheme) return res.status(404).json({ message: "Marking scheme not found." });

    const classId = scheme.class._id.toString();
    const subjectId = scheme.subject._id.toString();

    const teachesThisSubjectInThisClass =
      teacher.subjectSpecialization.some((s) => s.toString() === subjectId) &&
      teacher.classesAssigned.some((c) => c.toString() === classId);

    if (!teachesThisSubjectInThisClass) {
      return res.status(403).json({ message: "You do not have access to this marking scheme." });
    }

    const now = new Date();
    if (now < new Date(scheme.availableFrom)) {
      return res.status(403).json({
        message: "This marking scheme is not yet available.",
        availableFrom: scheme.availableFrom,
      });
    }

    res.status(200).json({
      fileUrl: scheme.fileUrl,
      title: scheme.title,
      fileType: scheme.fileType,
    });
  } catch (err) {
    console.error("Access scheme error:", err);
    res.status(500).json({ message: "Server error while accessing marking scheme." });
  }
};