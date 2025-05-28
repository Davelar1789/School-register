import Students from "../models/Student.model.js";
import Classes from "../models/Class.model.js";

/** Map the levels in order of promotion */
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

  if (!schoolId) return res.status(400).json({ message: "School ID is required." });

  try {
    // Step 1: Fetch all classes
    const allClasses = await Classes.find({ school: schoolId });

    // Build a lookup table from level+number to class ID
    const classMap = {};
    allClasses.forEach(cls => {
      const key = `${cls.level}-${cls.number || "0"}`;
      classMap[key] = cls._id;
    });

    // Step 2: Loop through class order (except last one, since no class to promote to)
    for (let i = 0; i < CLASS_ORDER.length - 1; i++) {
      const current = CLASS_ORDER[i];
      const next = CLASS_ORDER[i + 1];

      const currentKey = `${current.level}-${current.number || "0"}`;
      const nextKey = `${next.level}-${next.number || "0"}`;

      const currentClassId = classMap[currentKey];
      const nextClassId = classMap[nextKey];

      if (!currentClassId || !nextClassId) continue;

      // Find students currently in this class
      const studentsToPromote = await Students.find({
        classes: currentClassId,
        schoolId,
      });

      for (const student of studentsToPromote) {
        // Replace the current class with the next one
        student.classes = student.classes.map(clsId =>
          clsId.toString() === currentClassId.toString() ? nextClassId : clsId
        );
        await student.save();
      }
    }

    res.status(200).json({ message: "Students promoted successfully." });

  } catch (err) {
    console.error("Error during promotion:", err);
    res.status(500).json({ message: "Failed to promote students", error: err.message });
  }
};
