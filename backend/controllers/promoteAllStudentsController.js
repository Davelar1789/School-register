import Students from "../models/Student.model.js";

// Direct class ID mapping (current → next)
const PROMOTION_MAP = {
  "680e3af74798fa9e62db7f0d": "680e3b054798fa9e62db7f15", // Creche → Nursery 1
  "680e3b054798fa9e62db7f15": "680e3b174798fa9e62db7f1b", // Nursery 1 → Nursery 2
  "680e3b174798fa9e62db7f1b": "680e3b284798fa9e62db7f23", // Nursery 2 → KG 1
  "680e3b284798fa9e62db7f23": "680e3b384798fa9e62db7f29", // KG 1 → KG 2
  "680e3b384798fa9e62db7f29": "680e3b464798fa9e62db7f31", // KG 2 → Basic 1
  "680e3b464798fa9e62db7f31": "680e3b9d4798fa9e62db7f3d", // Basic 1 → Basic 2
  "680e3b9d4798fa9e62db7f3d": "680e3bb94798fa9e62db7f4a", // Basic 2 → Basic 3
  "680e3bb94798fa9e62db7f4a": "680e3bde4798fa9e62db7f52", // Basic 3 → Basic 4
  "680e3bde4798fa9e62db7f52": "680e3be84798fa9e62db7f5a", // Basic 4 → Basic 5
  "680e3be84798fa9e62db7f5a": "680e3c4c4798fa9e62db7f66", // Basic 5 → Basic 6
  "680e3c4c4798fa9e62db7f66": "680e3c574798fa9e62db7f6c", // Basic 6 → JHS 1
  "680e3c574798fa9e62db7f6c": "680e3c624798fa9e62db7f74", // JHS 1 → JHS 2
  "680e3c624798fa9e62db7f74": "680e3c6c4798fa9e62db7f7a", // JHS 2 → JHS 3
  "680e3c6c4798fa9e62db7f7a": "683712472ee4d5add214692b"  // JHS 3 → SHS 1
};

export const promoteAllStudents = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ message: "School ID is required." });
  }

  try {
    let totalPromoted = 0;
    let logs = [];

    // Loop through each mapping
    for (const [currentClassId, nextClassId] of Object.entries(PROMOTION_MAP)) {
      const studentsToPromote = await Students.find({
        schoolId,
        classes: currentClassId
      });

      for (const student of studentsToPromote) {
        // Replace only the matching class ID in the array
        student.classes = student.classes.map(clsId =>
          clsId.toString() === currentClassId ? nextClassId : clsId
        );

        await student.save();
        totalPromoted++;

        logs.push({
          studentId: student._id,
          from: currentClassId,
          to: nextClassId
        });
      }
    }

    res.status(200).json({
      message: "Promotion completed successfully.",
      totalPromoted,
      changes: logs
    });
  } catch (error) {
    console.error("Error promoting students:", error);
    res.status(500).json({
      message: "Failed to promote students.",
      error: error.message
    });
  }
};
