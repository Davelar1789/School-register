// controllers/teacherController.js
import Teacher from "../models/Teacher.model.js";
import School from "../models/School.model.js";
import Class from "../models/Class.model.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";


const generateToken = ({ id, fullName, email, role, schoolName, schoolId, teacherType, seenTutorial }) => {
  return jwt.sign({ id, fullName, email, role, schoolName, schoolId, teacherType, seenTutorial }, process.env.JWT_SECRET, {
    expiresIn: "6h",
  });
};

// Generate unique staff ID
const generateStaffId = async () => {
  let idExists = true;
  let staffId;

  while (idExists) {
    staffId = 'T' + Math.floor(100000 + Math.random() * 900000); // T123456
    const existing = await Teacher.findOne({ staffId });
    idExists = !!existing;
  }

  return staffId;
};

// Create teacher
export const createTeacher = async (req, res) => {
  try {
    const schoolId = req.body.schoolId || req.user?.schoolId;
    const { email } = req.body;

    if (!schoolId) return res.status(400).json({ message: "School ID is required" });

    // Log incoming data
    console.log("Incoming teacher data:", req.body);

    // Check if email already exists in Teacher model
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email is already in use by a teacher" });
    }

    // Check if email already exists in User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use by a system user" });
    }

    const { teacherType } = req.body;
      if (!["Class Teacher", "Subject Teacher", "Both"].includes(teacherType)) {
        return res.status(400).json({ message: "Invalid teacher type" });
      }


    const staffId = await generateStaffId();

    // Build new teacher
    const newTeacher = new Teacher({
      ...req.body,
      staffId,
      school: schoolId,
    });

    console.log("New teacher to be saved:", newTeacher);

    // Save to DB
    const savedTeacher = await newTeacher.save();

    // Log after saving
    console.log("Teacher successfully saved:", savedTeacher);

    // Optionally update school teacher count
    await School.findByIdAndUpdate(schoolId, {
      $inc: { numberOfTeachers: 1 },
    });

    res.status(201).json(savedTeacher);
  } catch (error) {
    console.error("Error creating teacher:", error.stack); // better error message
    res.status(500).json({
      message: error.code === 11000 ? "A teacher with that email already exists" : "Error creating teacher",
    });
  }
};


// Phase 1: Check email existence and usage
export const verifyTeacherEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: "Email not found" });
    }
    res.status(200).json({ usage: teacher.usage });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error });
  }
};

// Phase 2: First-time setup - verify staffId and set password
export const firstTimeSetup = async (req, res) => {
  const { email, staffId, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email, staffId }).populate("school", "name");

    if (!teacher || teacher.usage === "used") {
      return res.status(400).json({ message: "Invalid credentials or already used" });
    }

    teacher.password = password;
    teacher.usage = "used";
    await teacher.save();

    const token = generateToken({
      id: teacher._id,
      fullName: teacher.name,
      email: teacher.email,
      role: "Teacher",
      schoolName: teacher.school?.name || "",
      schoolId: teacher.school?._id || "",
      teacherType: teacher.teacherType,
      seenTutorial: teacher.seenTutorial,
    });

    res.status(200).json({
      message: "Password created successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        staffId: teacher.staffId,
        school: teacher.school,
        teacherType: teacher.teacherType,
        seenTutorial: teacher.seenTutorial,
        token,
      },
    });
  } catch (error) {
    console.error("Setup Error:", error);
    res.status(500).json({ message: "Error setting up teacher", error });
  }
};


// Phase 3: Normal login
export const loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email }).populate("school", "name");

    if (!teacher || teacher.usage !== "used") {
      return res.status(400).json({ message: "Invalid credentials or setup not complete" });
    }

    const isMatch = await teacher.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken({
      id: teacher._id,
      fullName: teacher.name,
      email: teacher.email,
      role: "Teacher",
      schoolName: teacher.school?.name || "",
      schoolId: teacher.school?._id || "",
      teacherType: teacher.teacherType,
      seenTutorial: teacher.seenTutorial,

    });

    res.status(200).json({
      message: "Login successful",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        staffId: teacher.staffId,
        school: teacher.school,
        teacherType: teacher.teacherType,
        seenTutorial: teacher.seenTutorial,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};


// Get all teachers for a school
export const getTeachersBySchool = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;
    const teachers = await Teacher.find({ school: schoolId }).select("-password").sort({ createdAt: -1 });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers", error });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select("-password")
      .populate("classesAssigned", "className")
      .populate("subjectSpecialization", "name"); // ✅ ADD THIS

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    // never let a client overwrite credentials or ownership through this endpoint
    const { password, usage, school, staffId, ...safe } = req.body;
    const updated = await Teacher.findByIdAndUpdate(req.params.id, safe, {
      new: true,
    }).select("-password");
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating teacher", error });
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Optionally decrement teacher count
    await School.findByIdAndUpdate(teacher.school, {
      $inc: { numberOfTeachers: -1 },
    });

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher", error });
  }
};

// Assign class(es) to teacher
export const assignClassesToTeacher = async (req, res) => {
  const { id } = req.params;
  const { classIds } = req.body;

  if (!Array.isArray(classIds) || classIds.length === 0) {
    return res.status(400).json({ message: "classIds must be a non-empty array" });
  }

  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Avoid duplicates
    const updatedClassList = Array.from(new Set([...teacher.classesAssigned.map(id => id.toString()), ...classIds]));

    teacher.classesAssigned = updatedClassList;
    await teacher.save();

    // Re-fetch the teacher and populate class names
    const updatedTeacher = await Teacher.findById(id).populate('classesAssigned', 'className');

    res.status(200).json({
      message: "Classes assigned successfully",
      classesAssigned: updatedTeacher.classesAssigned,
    });
  } catch (error) {
    console.error("Error assigning classes:", error);
    res.status(500).json({ message: "Failed to assign classes", error });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.params.teacherId || req.user._id;

    // 1️⃣ Classes where teacher is CLASS TEACHER
    const classTeacherClasses = await Class.find({
      teachers: teacherId, // class teachers stored here
    }).select("className level students");

    // 2️⃣ Classes where teacher is SUBJECT TEACHER
    const subjectTeacherClasses = await Class.find({
      "subjects.teachers": teacherId, // 🔥 THIS is the key fix
    }).select("className level students");

    // 3️⃣ Merge & deduplicate
    const classMap = new Map();

    [...classTeacherClasses, ...subjectTeacherClasses].forEach(cls => {
      classMap.set(cls._id.toString(), cls);
    });

    const classes = Array.from(classMap.values());

    res.json({
      count: classes.length,
      classes,
    });

  } catch (err) {
    console.error("❌ Error fetching teacher classes:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};



export const getTeacherSubjects = async (req, res) => {
  const { teacherId } = req.params;

  try {
    // Find classes where the teacher has subjects assigned
    const classes = await Class.find({ "subjects.teachers": teacherId })
      .populate("subjects.subject", "name")
      .select("className level subjects");

    const subjectsAssigned = [];

    for (const cls of classes) {
      cls.subjects.forEach(sub => {
        if (sub.teachers.includes(teacherId)) {
          subjectsAssigned.push({
            subjectId: sub.subject?._id,
            subjectName: sub.subject?.name || "Unknown",
            className: cls.className,
            level: cls.level,
          });
        }
      });
    }

    res.status(200).json({ subjects: subjectsAssigned });
  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    res.status(500).json({ message: "Server error fetching subjects" });
  }
};


export const getTeacherSubjects2 = async (req, res) => {
  const { teacherId } = req.params;
  const { classId } = req.query;

  console.log("🔍 Incoming request to fetch teacher subjects");
  console.log(`📌 Teacher ID: ${teacherId}`);
  if (classId) console.log(`📘 Class ID provided: ${classId}`);

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      console.warn(`⚠️ Teacher with ID ${teacherId} not found`);
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log(`👩‍🏫 Teacher found: ${teacher.fullName || teacher._id}`);
    console.log(`📖 Teacher Type: ${teacher.teacherType}`);

    let result = [];

    if (teacher.teacherType === "Subject Teacher" || teacher.teacherType === "Both") {
      console.log("🧠 Teacher is a Subject Teacher or Both. Fetching assigned subjects...");
      
      const classes = await Class.find({ "subjects.teachers": teacherId })
        .populate("subjects.subject", "name")
        .select("className level subjects");

      console.log(`🏫 Found ${classes.length} classes with subjects assigned to teacher`);

      for (const cls of classes) {
        const teacherSubjects = cls.subjects
          .filter(sub => sub.teachers.includes(teacherId))
          .map(sub => ({
            subjectId: sub.subject?._id,
            subjectName: sub.subject?.name || "Unknown",
            className: cls.className,
            level: cls.level,
          }));

        console.log(`📘 ${cls.className} (${cls.level}): ${teacherSubjects.length} subjects assigned`);
        result.push(...teacherSubjects);
      }

    } else if (teacher.teacherType === "Class Teacher" && classId) {
      console.log("🧠 Teacher is a Class Teacher. Fetching all subjects of the class...");

      const cls = await Class.findById(classId)
        .populate("subjects.subject", "name")
        .select("className level subjects");

      if (!cls) {
        console.warn(`⚠️ Class with ID ${classId} not found`);
        return res.status(404).json({ message: "Class not found" });
      }

      console.log(`🏫 Class found: ${cls.className} (${cls.level}) with ${cls.subjects.length} subjects`);

      const allSubjects = cls.subjects.map(sub => ({
        subjectId: sub.subject?._id,
        subjectName: sub.subject?.name || "Unknown",
        className: cls.className,
        level: cls.level,
      }));

      result = allSubjects;
    } else {
      console.warn("❌ Invalid request: either unsupported teacher type or classId missing for Class Teacher");
      return res.status(400).json({ message: "Invalid request or missing classId for class teachers." });
    }

    console.log(`✅ Total subjects returned: ${result.length}`);
    return res.status(200).json({ subjects: result });

  } catch (error) {
    console.error("❗ Server error fetching teacher subjects:", error);
    return res.status(500).json({ message: "Server error fetching subjects" });
  }
};


export const patchTeachers = async (req, res) => {
    try {
        const result = await Teacher.updateMany({}, { $set: { seenTutorial: false } });
        res.json({ message: `✅ Updated ${result.modifiedCount} teachers with seenTutorial field.` });
    } catch (error) {
        console.error("❌ Error patching teachers:", error);
        res.status(500).json({ message: "Error updating teachers." });
    }
};