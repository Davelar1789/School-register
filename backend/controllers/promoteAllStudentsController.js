import Students from "../models/Student.model.js";
import Class from "../models/Class.model.js";

const CLASS_ORDER = [
  { level: "Creche" },
  { level: "Nursery", number: 1 },
  { level: "Nursery", number: 2 },
  { level: "Kindergarten", number: 1 },
  { level: "Kindergarten", number: 2 },
  { level: "Primary", number: 1 },
  { level: "Primary", number: 2 },
  { level: "Primary", number: 3 },
  { level: "Primary", number: 4 },
  { level: "Primary", number: 5 },
  { level: "Primary", number: 6 },
  { level: "Junior High", number: 1 },
  { level: "Junior High", number: 2 },
  { level: "Junior High", number: 3 },
  { level: "Senior High", number: 1 },
  { level: "Senior High", number: 2 },
  { level: "Senior High", number: 3 },
];

export const promoteAllStudents = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ message: "School ID is required." });
  }

  try {
    // 1️⃣ Get all classes for the school
    const allClasses = await Class.find({ school: schoolId });

    // 2️⃣ Build a lookup of classes keyed by level-number
    const classMap = {};
    for (const cls of allClasses) {
      const key = `${cls.level}-${cls.number || "0"}`;
      classMap[key] = cls;
    }

    let totalPromoted = 0;

    // 3️⃣ Go through promotion order
    for (let i = 0; i < CLASS_ORDER.length - 1; i++) {
      const current = CLASS_ORDER[i];
      const next = CLASS_ORDER[i + 1];

      const currentKey = `${current.level}-${current.number || "0"}`;
      const nextKey = `${next.level}-${next.number || "0"}`;

      const currentClass = classMap[currentKey];
      const nextClass = classMap[nextKey];

      if (!currentClass || !nextClass) continue; // skip if either is missing

      // 4️⃣ Get students whose ONLY/MAIN class is exactly this one
      const studentsToPromote = await Students.find({
        schoolId,
        classes: { $size: 1, $in: [currentClass._id] },
      });

      // 5️⃣ Promote each student
      for (const student of studentsToPromote) {
        student.classes = [nextClass._id];
        await student.save();
        totalPromoted++;
      }
    }

    res.status(200).json({
      message: "Promotion completed successfully.",
      totalPromoted,
    });
  } catch (error) {
    console.error("Error promoting students:", error);
    res.status(500).json({
      message: "Failed to promote students.",
      error: error.message,
    });
  }
};
