import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import ClassModel from "../models/Class.js";
import Teacher from "../models/Teacher.js";

// ─── Class IDs from DB1 (TIME_URI) with their names ───────────────────────
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

// Get Monday–Friday dates for the current week
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

    // ── STEP 1: DB1 — For each class, check which days have attendance ──────
    // Structure: { className -> { Monday: true/false, Tuesday: true/false, ... } }
    const classAttendanceMap = {};

    for (const cls of DB1_CLASSES) {
      const dayStatus = {};

      for (let i = 0; i < 5; i++) {
        const dayStart = new Date(weekDays[i]);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(weekDays[i]);
        dayEnd.setHours(23, 59, 59, 999);

        // Find students in this class from DB1
        const studentsInClass = await Student.find(
          { classes: cls.id },
          { _id: 1 }
        ).lean();

        if (studentsInClass.length === 0) {
          // No students enrolled — skip, treat as not marked
          dayStatus[dayNames[i]] = false;
          continue;
        }

        const studentIds = studentsInClass.map((s) => s._id);

        // Check if even one attendance entry exists for this class on this day
        const entry = await Attendance.findOne({
          studentId: { $in: studentIds },
          date: { $gte: dayStart, $lte: dayEnd },
        }).lean();

        dayStatus[dayNames[i]] = !!entry;
      }

      classAttendanceMap[cls.name] = dayStatus;
    }

    // ── STEP 2: DB2 — Get all classes with their classTeacher populated ─────
    const db2Classes = await ClassModel.find({
      name: { $in: DB1_CLASSES.map((c) => c.name) },
      status: "Active",
    })
      .populate("classTeacher", "name phone isActive")
      .lean();

    // ── STEP 3: Build teacher → classes map using name as the join key ──────
    // { teacherId -> { teacher: {...}, classes: ["Creche", "Basic 1", ...] } }
    const teacherMap = {};

    for (const cls of db2Classes) {
      if (!cls.classTeacher) continue; // class has no teacher assigned

      const teacherId = cls.classTeacher._id.toString();

      if (!teacherMap[teacherId]) {
        teacherMap[teacherId] = {
          teacher: cls.classTeacher,
          classes: [],
        };
      }

      teacherMap[teacherId].classes.push(cls.name);
    }

    // ── STEP 4: For each teacher, calculate weekly score ────────────────────
    // A teacher earns 1 point for a day only if ALL their classes were marked
    const teacherSummaries = [];

    for (const [, entry] of Object.entries(teacherMap)) {
      const { teacher, classes } = entry;

      if (!teacher.isActive) continue;

      let daysMarked = 0;
      const dailyBreakdown = {};

      for (const dayName of dayNames) {
        // All assigned classes must be marked for that day to count
        const allMarked = classes.every(
          (className) => classAttendanceMap[className]?.[dayName] === true
        );

        dailyBreakdown[dayName] = allMarked;
        if (allMarked) daysMarked++;
      }

      teacherSummaries.push({
        name: teacher.name,
        phone: teacher.phone,
        classes,
        daysMarked,       // out of 5
        dailyBreakdown,   // { Monday: true, Tuesday: false, ... }
      });
    }

    // Sort alphabetically by teacher name
    teacherSummaries.sort((a, b) => a.name.localeCompare(b.name));

    // ── STEP 5: Return ───────────────────────────────────────────────────────
    return res.status(200).json({
      message: "Weekly attendance summary retrieved successfully",
      week: {
        monday: weekDays[0].toISOString().split("T")[0],
        friday: weekDays[4].toISOString().split("T")[0],
      },
      teachers: teacherSummaries,
    });
  } catch (error) {
    console.error("Error generating weekly attendance summary:", error);
    return res.status(500).json({
      message: "Error generating weekly attendance summary",
      error: error.message,
    });
  }
};