import Teacher from "../models/Teacher.model.js";

// ✅ Mark tutorial as seen for a teacher
export const markTutorialSeen = async (req, res) => {
    const { teacherId } = req.params;
    try {
        await Teacher.findByIdAndUpdate(teacherId, { seenTutorial: true });
        res.json({ message: "Tutorial marked as seen!" });
    } catch (error) {
        console.error("❌ Error updating tutorial status:", error);
        res.status(500).json({ message: "Failed to update tutorial status." });
    }
};

// ✅ Check if a teacher has completed the tutorial
export const getTutorialStatus = async (req, res) => {
    const { teacherId } = req.params;
    try {
        const teacher = await Teacher.findById(teacherId);
        res.json({ seenTutorial: teacher?.seenTutorial || false });
    } catch (error) {
        console.error("❌ Error fetching tutorial status:", error);
        res.status(500).json({ message: "Error retrieving tutorial status." });
    }
};
