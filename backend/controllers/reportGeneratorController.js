import axios from "axios";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import archiver from "archiver";
import Students from "../models/Student.model.js";
import GradeEntry from "../models/Grade.model.js";
import ReportTemplate from "../models/ReportTemplate.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";

export const generateClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId are required." });
    }

    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found." });

    const classInfo = await Class.findById(classId).populate({ path: "students", model: "students" });
    if (!classInfo) return res.status(404).json({ message: "Class not found." });

    const template = await ReportTemplate.findOne({ classIds: classId });
    if (!template) return res.status(404).json({ message: "No report template found for this class." });

    const cloudResponse = await axios.get(template.templatePath, { responseType: "arraybuffer" });
    const templateBuffer = Buffer.from(cloudResponse.data, "binary");

    const reportsDir = path.resolve("generatedReports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const zipPath = path.join(reportsDir, `class-${classId}-reports.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");

    archive.pipe(output);

    const numberOnRoll = classInfo.students.length;

    const getWeekdays = (start, end) => {
      let count = 0;
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        if (day >= 1 && day <= 5) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    for (const student of classInfo.students) {
      const grades = await GradeEntry.find({ studentId: student._id, termId }).populate("subjectId");

      const subjectData = grades.map(g => ({
        name: g.subjectId.name || "Unknown Subject",
        classScore: g.scores.test1 + g.scores.test2 + g.scores.test3 + g.scores.test4,
        examScore: g.scores.exam,
        total: g.scores.total,
        grade: computeGrade(g.scores.total),
        remark: getRemark(g.scores.total),
      }));

      const studentTotalMarks = subjectData.reduce((sum, s) => sum + s.total, 0);
      const maxTotalMarks = subjectData.length * 100;

      const presentDays = await Attendance.countDocuments({
        studentId: student._id,
        termId,
        present: true
      });

      const totalSchoolDays = getWeekdays(new Date(term.startDate), new Date(term.endDate));

      const conductOptions = ["Excellent", "Satisfactory", "Very obedient", "Well-behaved", "Needs improvement"];
      const conduct = conductOptions[Math.floor(Math.random() * conductOptions.length)];

      const highestScore = Math.max(...subjectData.map(s => s.total));
      const interestSubjects = subjectData
        .filter(s => s.total === highestScore)
        .map(s => s.name);

      const interest = interestSubjects.join(" and ");

      const percentage = (studentTotalMarks / (maxTotalMarks || 1)) * 100;
      let classTeacherRemark = "More room for improvement.";
      if (percentage >= 80) classTeacherRemark = "An excellent performance.";
      else if (percentage >= 70) classTeacherRemark = "Very good work done.";
      else if (percentage >= 60) classTeacherRemark = "Good effort. Keep it up.";
      else if (percentage >= 50) classTeacherRemark = "Satisfactory";

      // 🧾 Fee values
      let arrears = 0;
      const yearRecord = student.academicRecords.find(y => y.yearLabel === term.yearLabel);
      const termRecord = yearRecord?.terms?.find(t => t.termName === term.termName);
      if (termRecord?.fees) {
        arrears = termRecord.fees.balance || 0;
      }

      const feesNextTerm = parseFloat(nextTermFees);
      const totalFeesDue = arrears + feesNextTerm;

      const studentData = {
        name: student.name,
        className: classInfo.className,
        yearLabel: term.yearLabel,
        termName: term.termName,
        subjects: subjectData,

        present: presentDays,
        total: totalSchoolDays,
        roll: numberOnRoll,
        obtained: studentTotalMarks,
        max: maxTotalMarks,

        conduct,
        interest,
        classTeacherRemark,
        promotedTo: "JHS 2",

        vacationDate: formatDate(term.endDate),
        nextTermBegins: nextTermDate ? formatDate(nextTermDate) : "N/A",
        arrears,
        feesNextTerm,
        totalFeesDue
      };

      console.log(`📄 Data for ${student.name}:`, studentData);

      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.setData(studentData);

      try {
        doc.render();
      } catch (err) {
        console.error(`⚠️ Error rendering report for ${student.name}:`, err);
        continue;
      }

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const fileName = `${student.name.replace(/\s+/g, "_")}_report.docx`;
      const reportPath = `generatedReports/${fileName}`;

      fs.writeFileSync(reportPath, buffer);
      archive.append(fs.createReadStream(reportPath), { name: fileName });
    }

    await archive.finalize();

    output.on("close", () => {
      res.download(zipPath, `report_cards_class_${classId}.zip`, () => {
        fs.rmSync(zipPath);
      });
    });

  } catch (error) {
    console.error("❌ Error generating reports:", error);
    res.status(500).json({ message: "Error generating reports", error: error.message });
  }
};

const computeGrade = (score) => {
  if (score >= 80) return "1";
  if (score >= 70) return "2";
  if (score >= 60) return "3";
  if (score >= 55) return "4";
  if (score >= 50) return "5";
  if (score >= 45) return "6";
  if (score >= 40) return "7";
  if (score >= 35) return "8";
  return "9";
};

const getRemark = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Pass";
  if (score >= 40) return "Average";
  return "Fail";
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};


export const generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId, classId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!studentId || !termId || !classId) {
      return res.status(400).json({ message: "studentId, termId and classId are required." });
    }

    const [term, student, classInfo, template] = await Promise.all([
      TermSession.findById(termId),
      Students.findById(studentId),
      Class.findById(classId),
      ReportTemplate.findOne({ classIds: classId })
    ]);

    if (!term || !student || !classInfo || !template) {
      return res.status(404).json({ message: "Missing term, student, class, or template info." });
    }

    const cloudResponse = await axios.get(template.templatePath, { responseType: "arraybuffer" });
    const templateBuffer = Buffer.from(cloudResponse.data, "binary");

    const grades = await GradeEntry.find({ studentId, termId }).populate("subjectId");

    const subjectData = grades.map(g => ({
      name: g.subjectId.name || "Unknown Subject",
      classScore: g.scores.test1 + g.scores.test2 + g.scores.test3 + g.scores.test4,
      examScore: g.scores.exam,
      total: g.scores.total,
      grade: computeGrade(g.scores.total),
      remark: getRemark(g.scores.total),
    }));

    const studentTotalMarks = subjectData.reduce((sum, s) => sum + s.total, 0);
    const maxTotalMarks = subjectData.length * 100;

    const getWeekdays = (start, end) => {
      let count = 0;
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        if (day >= 1 && day <= 5) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    const presentDays = await Attendance.countDocuments({ studentId, termId, present: true });
    const totalSchoolDays = getWeekdays(new Date(term.startDate), new Date(term.endDate));

    const conductOptions = ["Excellent", "Satisfactory", "Very obedient", "Well-behaved", "Needs improvement"];
    const conduct = conductOptions[Math.floor(Math.random() * conductOptions.length)];

    const highestScore = Math.max(...subjectData.map(s => s.total));
    const interest = subjectData.filter(s => s.total === highestScore).map(s => s.name).join(" and ");

    const percentage = (studentTotalMarks / (maxTotalMarks || 1)) * 100;
    let classTeacherRemark = "More room for improvement.";
    if (percentage >= 80) classTeacherRemark = "An excellent performance.";
    else if (percentage >= 70) classTeacherRemark = "Very good work done.";
    else if (percentage >= 60) classTeacherRemark = "Good effort. Keep it up.";
    else if (percentage >= 50) classTeacherRemark = "Satisfactory";

    let arrears = 0;
    const yearRecord = student.academicRecords.find(y => y.yearLabel === term.yearLabel);
    const termRecord = yearRecord?.terms?.find(t => t.termName === term.termName);
    if (termRecord?.fees) {
      arrears = termRecord.fees.balance || 0;
    }

    const feesNextTerm = parseFloat(nextTermFees);
    const totalFeesDue = arrears + feesNextTerm;

    const studentData = {
      name: student.name,
      className: classInfo.className,
      yearLabel: term.yearLabel,
      termName: term.termName,
      subjects: subjectData,

      present: presentDays,
      total: totalSchoolDays,
      roll: classInfo.students.length,
      obtained: studentTotalMarks,
      max: maxTotalMarks,

      conduct,
      interest,
      classTeacherRemark,
      promotedTo: "JHS 2",

      vacationDate: formatDate(term.endDate),
      nextTermBegins: nextTermDate ? formatDate(nextTermDate) : "N/A",
      arrears,
      feesNextTerm,
      totalFeesDue
    };

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.setData(studentData);

    try {
      doc.render();
    } catch (err) {
      console.error("⚠️ Error rendering report:", err);
      return res.status(500).json({ message: "Error generating report", error: err.message });
    }

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const fileName = `${student.name.replace(/\s+/g, "_")}_report.docx`;
    const reportPath = `generatedReports/${fileName}`;
    fs.writeFileSync(reportPath, buffer);

    res.download(reportPath, fileName, () => {
      fs.unlinkSync(reportPath);
    });

  } catch (err) {
    console.error("❌ Error generating student report:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
