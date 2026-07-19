import MarkingScheme from "../models/MarkingScheme.model.js";
import Teacher from "../models/Teacher.model.js";
import { v2 as cloudinary } from "cloudinary";

// ⚠️ TEMPORARY fallback while auth middleware is disabled.
// Remove this once protect/verifyAdmin is wired back in.
const FALLBACK_SCHOOL_ID = "680e3a1b4798fa9e62db7ee8";

/* ══════════════════════════════════════════
   ADMIN — Upload a marking scheme
══════════════════════════════════════════ */
export const uploadScheme = async (req, res) => {
  console.log("🔥 uploadScheme HIT");
  console.log("body:", req.body);
  console.log("file:", req.file);
  try {
    const { classId, subjectId, term, academicYear, title, availableFrom } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    if (!classId || !subjectId || !term || !academicYear || !availableFrom) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const schoolId = req.admin?.school || FALLBACK_SCHOOL_ID;
    const uploadedById = req.admin?._id || null;

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

    console.log("✅ scheme created:", scheme._id);
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
  console.log("🔥 getAllSchemesForSchool HIT");
  try {
    const schoolId = req.admin?.school || FALLBACK_SCHOOL_ID;

    const schemes = await MarkingScheme.find({ school: schoolId })
      .populate("class", "name")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    console.log("✅ schemes found:", schemes.length);
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