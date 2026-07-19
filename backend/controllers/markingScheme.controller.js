import MarkingScheme from "../models/MarkingScheme.model.js";
import Teacher from "../models/Teacher.model.js";
import { v2 as cloudinary } from "cloudinary";

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

    const scheme = await MarkingScheme.create({
      school: req.admin.school,
      class: classId,
      subject: subjectId,
      term,
      academicYear,
      title: title || "End of Term Marking Scheme",
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileType: req.file.mimetype.includes("pdf") ? "pdf" : "docx",
      availableFrom: new Date(availableFrom),
      uploadedBy: req.admin._id,
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
      // Remove old file from cloudinary before attaching new one
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
   ADMIN — List all schemes for the school (for the admin table)
══════════════════════════════════════════ */
export const getAllSchemesForSchool = async (req, res) => {
  console.log("🔥 getAllSchemesForSchool HIT");
  console.log("req.admin:", req.admin);
  try {
    const schemes = await MarkingScheme.find({ school: req.admin.school })
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
   TEACHER — Get classes the teacher can view schemes for,
   based on teacherType, WITHOUT exposing file/lock state yet.
   Returns: [{ classId, className, subjects: [{subjectId, subjectName}] }]
══════════════════════════════════════════ */
export const getTeacherSchemeScope = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher._id)
      .populate("classesAssigned", "name")
      .populate("subjectSpecialization", "name");

    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    let classIds = [];

    if (teacher.teacherType === "Class Teacher" || teacher.teacherType === "Both") {
      classIds = teacher.classesAssigned.map((c) => c._id.toString());
    }

    if (teacher.teacherType === "Subject Teacher" || teacher.teacherType === "Both") {
      // Subject teachers' classesAssigned represents the classes they teach their subject(s) in
      const subjectTeacherClassIds = teacher.classesAssigned.map((c) => c._id.toString());
      classIds = [...new Set([...classIds, ...subjectTeacherClassIds])];
    }

    if (classIds.length === 0) {
      return res.status(200).json({ classes: [] });
    }

    // Pull every scheme that belongs to this teacher's classes + school
    const schemes = await MarkingScheme.find({
      school: teacher.school,
      class: { $in: classIds },
    })
      .populate("class", "name")
      .populate("subject", "name");

    // Build class -> subjects map, respecting teacherType restrictions
    const classMap = {};

    schemes.forEach((scheme) => {
      const classId = scheme.class._id.toString();
      const subjectId = scheme.subject._id.toString();

      const isClassTeacherForThis =
        (teacher.teacherType === "Class Teacher" || teacher.teacherType === "Both") &&
        teacher.classesAssigned.some((c) => c._id.toString() === classId);

      const isSubjectTeacherForThis =
        (teacher.teacherType === "Subject Teacher" || teacher.teacherType === "Both") &&
        teacher.subjectSpecialization.some((s) => s._id.toString() === subjectId) &&
        teacher.classesAssigned.some((c) => c._id.toString() === classId);

      // Class teachers see ALL subjects in their class.
      // Subject teachers see ONLY their specialized subject(s) in their assigned classes.
      // "Both" gets the union automatically because either flag being true qualifies.
      if (!isClassTeacherForThis && !isSubjectTeacherForThis) return;

      if (!classMap[classId]) {
        classMap[classId] = {
          classId,
          className: scheme.class.name,
          subjects: [],
        };
      }

      // Avoid duplicate subject entries
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
   TEACHER — Open/download a specific scheme.
   THIS is the actual gate — date check happens server-side,
   never trust the frontend's isUnlocked flag alone.
══════════════════════════════════════════ */
export const accessScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const teacher = await Teacher.findById(req.teacher._id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const scheme = await MarkingScheme.findById(schemeId)
      .populate("class", "name")
      .populate("subject", "name");

    if (!scheme) return res.status(404).json({ message: "Marking scheme not found." });

    // Re-verify the teacher actually has access to this class/subject
    const classId = scheme.class._id.toString();
    const subjectId = scheme.subject._id.toString();

    const isClassTeacherForThis =
      (teacher.teacherType === "Class Teacher" || teacher.teacherType === "Both") &&
      teacher.classesAssigned.some((c) => c.toString() === classId);

    const isSubjectTeacherForThis =
      (teacher.teacherType === "Subject Teacher" || teacher.teacherType === "Both") &&
      teacher.subjectSpecialization.some((s) => s.toString() === subjectId) &&
      teacher.classesAssigned.some((c) => c.toString() === classId);

    if (!isClassTeacherForThis && !isSubjectTeacherForThis) {
      return res.status(403).json({ message: "You do not have access to this marking scheme." });
    }

    // THE date/time gate
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