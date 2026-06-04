import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

// ─── Class IDs from DB1 (school website DB) with their names ──────────────
const DB1_CLASSES = [
  { name: "Creche",    id: "680e3af74798fa9e62db7f0d" },
  { name: "Nursery 1", id: "680e3b054798fa9e62db7f15" },
  { name: "Nursery 2", id: "680e3b174798fa9e62db7f1b" },
  { name: "KG 1",      id: "680e3b284798fa9e62db7f23" },
  { name: "KG 2",      id: "680e3b384798fa9e62db7f29" },
  { name: "Basic 1",   id: "680e3b464798fa9e62db7f31" },
  { name: "Basic 2",   id: "680e3b9d4798fa9e62db7f3d" },
  { name: "Basic 3",   id: "680e3bb94798fa9e62db7f4a" },
  { name: "Basic 4",   id: "680e3bde4798fa9e62db7f52" },
  { name: "Basic 5",   id: "680e3be84798fa9e62db7f5a" },
  { name: "Basic 6",   id: "680e3c4c4798fa9e62db7f66" },
  { name: "Basic 7",   id: "680e3c574798fa9e62db7f6c" },
  { name: "Basic 8",   id: "680e3c624798fa9e62db7f74" },
  { name: "Basic 9",   id: "680e3c6c4798fa9e62db7f7a" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const getWeekDays = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon ... 5=Fri
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// ─── Main Controller ───────────────────────────────────────────────────────
export const getWeeklyAttendanceSummary = async (req, res) => {
  try {
    const weekDays = getWeekDays(); // [Mon, Tue, Wed, Thu, Fri] as Date objects

    // ── STEP 1: For each class, check which days have attendance entries ────
    // Structure: { "Basic 1": { Monday: true, Tuesday: false, ... }, ... }
    const classAttendanceMap = {};

    for (const cls of DB1_CLASSES) {
      const dayStatus = {};

      for (let i = 0; i < 5; i++) {
        const dayStart = new Date(weekDays[i]);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(weekDays[i]);
        dayEnd.setHours(23, 59, 59, 999);

        // Find all students in this class
        const studentsInClass = await Student.find(
          { classes: cls.id },
          { _id: 1 }
        ).lean();

        if (studentsInClass.length === 0) {
          // No students enrolled in this class — treat as not marked
          dayStatus[dayNames[i]] = false;
          continue;
        }

        const studentIds = studentsInClass.map((s) => s._id);

        // If even one attendance entry exists for any student in this class
        // on this day, the class is considered marked
        const entry = await Attendance.findOne({
          studentId: { $in: studentIds },
          date: { $gte: dayStart, $lte: dayEnd },
        }).lean();

        dayStatus[dayNames[i]] = !!entry;
      }

      classAttendanceMap[cls.name] = dayStatus;
    }

    // ── STEP 2: Return classAttendanceMap to the bot ────────────────────────
    // The bot will handle teacher mapping and scoring from its own DB
    return res.status(200).json({
      message: "Weekly attendance summary retrieved successfully",
      week: {
        monday: weekDays[0].toISOString().split("T")[0],
        friday: weekDays[4].toISOString().split("T")[0],
      },
      classAttendance: classAttendanceMap,
    });

  } catch (error) {
    console.error("Error generating weekly attendance summary:", error);
    return res.status(500).json({
      message: "Error generating weekly attendance summary",
      error: error.message,
    });
  }
};