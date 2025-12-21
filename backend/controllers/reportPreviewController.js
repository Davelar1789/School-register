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

export const previewClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId required" });
    }

    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found" });

    const isTermThree = term.termName?.trim().toLowerCase() === "term 3";

    const classInfo = await Class.findById(classId).populate("students");
    if (!classInfo) return res.status(404).json({ message: "Class not found" });

    const template = await ReportTemplate.findOne({ classIds: classId });
    if (!template) return res.status(404).json({ message: "No report template found" });

    const cloudResponse = await axios.get(template.templatePath, { responseType: "arraybuffer" });
    const templateBuffer = Buffer.from(cloudResponse.data, "binary");

    // Compute class scores & ranking
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
    for (let i = 0; i < classScores.length; i++) {
      const s = classScores[i];
      if (s.total !== lastScore) currentRank = rankedScores.length + 1;
      rankedScores.push({ ...s, position: getOrdinal(currentRank) });
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

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const previewPdf = await PDFDocument.create();

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

      const coreSubjects = ["English Language", "Mathematics", "Integrated Science", "Social Studies"];
      const coreGrades = subjectData.filter(s => coreSubjects.includes(s.name)).map(s => parseInt(s.grade, 10)).filter(Boolean);
      const electiveGrades = subjectData.filter(s => !coreSubjects.includes(s.name)).map(s => parseInt(s.grade, 10)).filter(Boolean);
      electiveGrades.sort((a, b) => a - b);
      const aggregate = [...coreGrades, ...electiveGrades.slice(0, 2)].reduce((sum, g) => sum + g, 0);

      const studentTotalMarks = subjectData.reduce((sum, s) => sum + s.total, 0);
      const maxTotalMarks = subjectData.length * 100;

      const rankData = rankedScores.find(r => r.studentId === student._id.toString());
      const cc = rankData?.position || "";

      const presentDays = await Attendance.countDocuments({ studentId: student._id, termId, present: true });
      const totalSchoolDays = getWeekdays(new Date(term.startDate), new Date(term.endDate));

      const conductOptions = ["Excellent", "Satisfactory", "Very obedient", "Well-behaved"];
      const conduct = conductOptions[Math.floor(Math.random() * conductOptions.length)];

      const highestScore = Math.max(...subjectData.map(s => s.total));
      const interestSubjects = subjectData.filter(s => s.total === highestScore).map(s => s.name).slice(0, 2);
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
      if (termRecord?.fees) arrears = termRecord.fees.balance || 0;

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
        totalFeesDue,
      };

      // DOCX generation
const zip = new PizZip(templateBuffer);

// Pass the student data directly via `data` instead of setData or compile
const doc = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
  data: studentData
});

doc.render(); // Render with the data
const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

      const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });

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

// --- HELPERS ---
const CLASS_ORDER = [
  "Creche","Nursery 1","Nursery 2","KG 1","KG 2",
  "Basic 1","Basic 2","Basic 3","Basic 4","Basic 5","Basic 6",
  "JHS 1","JHS 2","JHS 3"
];

const getNextClass = (currentClassName) => {
  const index = CLASS_ORDER.indexOf(currentClassName);
  if (index === -1 || index === CLASS_ORDER.length - 1) return "Completed";
  return CLASS_ORDER[index + 1];
};

const getOrdinal = (n) => {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
  return d.toLocaleDateString("en-GB", { year:"numeric", month:"long", day:"numeric" });
};