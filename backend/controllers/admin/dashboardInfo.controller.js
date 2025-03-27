import User from "../../models/User.model.js";
import Announcement from "../../models/announcement.js";
import Assignment from "../../models/assignment.js";

export const dashboardInfo = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();
    const totalAssignments = await Assignment.countDocuments();

    // Calculate attendance rate (example calculation, adjust as needed)
    const attendanceRate = (await User.aggregate([
      { $group: { _id: null, avgAttendance: { $avg: "$attendance" } } },
    ]))[0].avgAttendance || 0;

    res.status(200).json({
      data: {
        totalUsers,
        totalAnnouncements,
        totalAssignments,
        attendanceRate: attendanceRate.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
