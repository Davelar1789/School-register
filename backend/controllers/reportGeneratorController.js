// All your imports here...
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
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";


export const generateClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId are required." });
    }

    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found." });

    const isTermThree = term.termName?.trim().toLowerCase() === "term 3";

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

    const classScores = [];

    for (const student of classInfo.students) {
      const grades = await GradeEntry.find({ studentId: student._id, termId });
      const total = grades.reduce((sum, g) => sum + (g.scores?.total || 0), 0);
      classScores.push({ studentId: student._id.toString(), total });
    }

    classScores.sort((a, b) => b.total - a.total);

    const rankedScores = [];
let currentRank = 1;
let lastScore = null;
let sameRankCount = 0;

for (let i = 0; i < classScores.length; i++) {
  const s = classScores[i];

  if (s.total === lastScore) {
    sameRankCount++;
  } else {
    currentRank = rankedScores.length + 1;
    sameRankCount = 1;
  }

  rankedScores.push({
    ...s,
    position: getOrdinal(currentRank)
  });

  lastScore = s.total;
}

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
        position: g.scores.position || "",
        remark: getRemark(g.scores.total),
      }));

      // 1. Core subjects
const coreSubjects = ["English Language", "Mathematics", "Integrated Science", "Social Studies"];

// 2. Extract grades
const coreGrades = subjectData
  .filter(s => coreSubjects.includes(s.name))
  .map(s => parseInt(s.grade, 10))
  .filter(grade => !isNaN(grade)); // Remove any invalid grades

// 3. Elective subjects
const electiveGrades = subjectData
  .filter(s => !coreSubjects.includes(s.name))
  .map(s => ({ grade: parseInt(s.grade, 10), name: s.name }))
  .filter(s => !isNaN(s.grade));

// 4. Sort electives by best grade (1 is best)
electiveGrades.sort((a, b) => a.grade - b.grade);

// 5. Pick best 2 elective grades
const bestElectives = electiveGrades.slice(0, 2).map(e => e.grade);

// 6. Calculate aggregate
const aggregate = [...coreGrades, ...bestElectives].reduce((sum, g) => sum + g, 0);


      const studentTotalMarks = subjectData.reduce((sum, s) => sum + s.total, 0);
      const maxTotalMarks = subjectData.length * 100;

      const rankData = rankedScores.find(r => r.studentId === student._id.toString());
      const cc = rankData?.position || "";

      const presentDays = await Attendance.countDocuments({
        studentId: student._id,
        termId,
        present: true
      });

      const totalSchoolDays = getWeekdays(new Date(term.startDate), new Date(term.endDate));

      const conductOptions = ["Excellent", "Satisfactory", "Very obedient", "Well-behaved"];
      const conduct = conductOptions[Math.floor(Math.random() * conductOptions.length)];

      const highestScore = Math.max(...subjectData.map(s => s.total));
      const interestSubjects = subjectData
        .filter(s => s.total === highestScore)
        .map(s => s.name)
        .slice(0, 2);
      const interest = interestSubjects.join(", ");

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

      const promotedTo = isTermThree ? getNextClass(classInfo.className) : "N/A";

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
        cc,
        aggregate,

        conduct,
        interest,
        classTeacherRemark,
        promotedTo,

        vacationDate: formatDate(term.endDate),
        nextTermBegins: nextTermDate ? formatDate(nextTermDate) : "N/A",
        arrears,
        feesNextTerm,
        totalFeesDue
      };

      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      console.log(`📄 ${student.name} - Aggregate:`, aggregate);
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

// Helper: Class promotion logic
const CLASS_ORDER = [
  "Creche",
  "Nursery 1",
  "Nursery 2",
  "KG 1",
  "KG 2",
  "Basic 1",
  "Basic 2",
  "Basic 3",
  "Basic 4",
  "Basic 5",
  "Basic 6",
  "JHS 1",
  "JHS 2",
  "JHS 3"
];

const getNextClass = (currentClassName) => {
  const index = CLASS_ORDER.indexOf(currentClassName);
  if (index === -1 || index === CLASS_ORDER.length - 1) return "Completed";
  return CLASS_ORDER[index + 1];
};

// Helper: Rank suffix
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Helper: Grade
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

// Helper: Remark
const getRemark = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Pass";
  if (score >= 40) return "Average";
  return "Fail";
};

// Helper: Date formatting
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

export const previewClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId required" });
    }

    const term = await TermSession.findById(termId);
    const classInfo = await Class.findById(classId).populate("students");
    const template = await ReportTemplate.findOne({ classIds: classId });

    if (!term || !classInfo || !template) {
      return res.status(404).json({ message: "Missing data" });
    }

    const templateRes = await axios.get(template.templatePath, {
      responseType: "arraybuffer",
    });
    const templateBuffer = Buffer.from(templateRes.data, "binary");

    // Launch Puppeteer using @sparticuz/chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const previewPdf = await PDFDocument.create();

    for (const student of classInfo.students) {
      const grades = await GradeEntry.find({
        studentId: student._id,
        termId,
      }).populate("subjectId");

      const subjects = grades.map((g) => ({
        name: g.subjectId.name,
        classScore: g.scores.test1 + g.scores.test2 + g.scores.test3 + g.scores.test4,
        examScore: g.scores.exam,
        total: g.scores.total,
        grade: computeGrade(g.scores.total),
        remark: getRemark(g.scores.total),
      }));

      const studentData = {
        name: student.name,
        className: classInfo.className,
        yearLabel: term.yearLabel,
        termName: term.termName,
        subjects,
        nextTermBegins: nextTermDate ? formatDate(nextTermDate) : "N/A",
        feesNextTerm: nextTermFees,
      };

      // DOCX generation
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
// Compile and render with data
      doc.compile();
      doc.render(studentData);
      const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });


      // DOCX → HTML
      const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });

      // HTML → PDF
      const page = await browser.newPage();
      await page.setContent(`
        <html>
          <head>
            <style>
              body { font-family: Arial; margin: 40px; }
              table { width: 100%; border-collapse: collapse; }
              td, th { border: 1px solid #000; padding: 6px; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      const pdfBuffer = await page.pdf({ format: "A4" });
      await page.close();

      // Extract ONLY page 1
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const [firstPage] = await previewPdf.copyPages(pdfDoc, [0]);
      previewPdf.addPage(firstPage);
    }

    await browser.close();

    const finalPdf = await previewPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");
    res.send(Buffer.from(finalPdf));

  } catch (err) {
    console.error("❌ Preview error:", err);
    res.status(500).json({ message: "Preview failed", error: err.message });
  }
};