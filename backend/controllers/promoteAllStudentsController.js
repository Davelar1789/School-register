import Students from "../models/Student.js"; // adjust path if needed

// Class promotion mapping
const classPromotionMap = {
  "680e3af74798fa9e62db7f0d": "680e3b054798fa9e62db7f15", // Creche -> Nursery 1
  "680e3b054798fa9e62db7f15": "680e3b174798fa9e62db7f1b", // Nursery 1 -> Nursery 2
  "680e3b174798fa9e62db7f1b": "680e3b284798fa9e62db7f23", // Nursery 2 -> KG 1
  "680e3b284798fa9e62db7f23": "680e3b384798fa9e62db7f29", // KG 1 -> KG 2
  "680e3b384798fa9e62db7f29": "680e3b464798fa9e62db7f31", // KG 2 -> Basic 1
  "680e3b464798fa9e62db7f31": "680e3b9d4798fa9e62db7f3d", // Basic 1 -> Basic 2
  "680e3b9d4798fa9e62db7f3d": "680e3bb94798fa9e62db7f4a", // Basic 2 -> Basic 3
  "680e3bb94798fa9e62db7f4a": "680e3bde4798fa9e62db7f52", // Basic 3 -> Basic 4
  "680e3bde4798fa9e62db7f52": "680e3be84798fa9e62db7f5a", // Basic 4 -> Basic 5
  "680e3be84798fa9e62db7f5a": "680e3c4c4798fa9e62db7f66", // Basic 5 -> Basic 6
  "680e3c4c4798fa9e62db7f66": "680e3c574798fa9e62db7f6c", // Basic 6 -> JHS 1
  "680e3c574798fa9e62db7f6c": "680e3c624798fa9e62db7f74", // JHS 1 -> JHS 2
  "680e3c624798fa9e62db7f74": "680e3c6c4798fa9e62db7f7a", // JHS 2 -> JHS 3
  "680e3c6c4798fa9e62db7f7a": "683712472ee4d5add214692b", // JHS 3 -> SHS 1
  // Add SHS 1 -> ? if needed, or leave last as final
};

export const promoteAllStudents = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ message: "schoolId is required" });
  }

  try {
    // Find all students in the school
    const students = await Students.find({ schoolId });

    if (!students.length) {
      return res.status(404).json({ message: "No students found for this school" });
    }

    // Loop through each student and update their classes array
    const bulkOps = students.map((student) => {
      const updatedClasses = student.classes.map((clsId) => {
        const clsIdStr = clsId.toString();
        return classPromotionMap[clsIdStr] || clsIdStr; // promote if possible, else keep same
      });

      return {
        updateOne: {
          filter: { _id: student._id },
          update: { classes: updatedClasses },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Students.bulkWrite(bulkOps);
    }

    return res.status(200).json({ message: "Students promoted successfully" });
  } catch (error) {
    console.error("Promotion error:", error);
    return res.status(500).json({ message: "Server error promoting students", error });
  }
};
