import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
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

    const isTermThree = term.termName?.trim().toLowerCase() === "term 3";

    const classInfo = await Class.findById(classId).populate({ path: "students", model: "students" });
    if (!classInfo) return res.status(404).json({ message: "Class not found." });

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

    const browser = await puppeteer.launch();
    const pdfBuffers = [];

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

      const studentTotalMarks = subjectData.reduce((sum, s) => sum + s.total, 0);
      const maxTotalMarks = subjectData.length * 100;

      const rankData = rankedScores.find(r => r.studentId === student._id.toString());
      const cc = rankData?.position || "";

      const presentDays = await Attendance.countDocuments({ studentId: student._id, termId, present: true });
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

      const html = generateHtmlReport(studentData);
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      pdfBuffers.push(pdfBuffer);
      await page.close();
    }

    await browser.close();

    const mergedPdf = await PDFDocument.create();
    for (const buffer of pdfBuffers) {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(p => mergedPdf.addPage(p));
    }

    const finalBuffer = await mergedPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=class_report.pdf");
    res.send(finalBuffer);

  } catch (error) {
    console.error("❌ Error generating reports:", error);
    res.status(500).json({ message: "Error generating reports", error: error.message });
  }
};

// ====== HELPERS ======

const CLASS_ORDER = [ "Creche", "Nursery 1", "Nursery 2", "KG 1", "KG 2", "Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6", "JHS 1", "JHS 2", "JHS 3" ];

const getNextClass = (currentClassName) => {
  const index = CLASS_ORDER.indexOf(currentClassName);
  if (index === -1 || index === CLASS_ORDER.length - 1) return "Completed";
  return CLASS_ORDER[index + 1];
};

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
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
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
};

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

// 🧾 HTML report template generator
const generateHtmlReport = (data) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial; font-size: 12px; margin: 20px; }
          h2 { margin-bottom: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: center; }
        </style>
      </head>
      <body>
        <h2>${data.name.toUpperCase()}</h2>
        <p><strong>Class:</strong> ${data.className} | <strong>Term:</strong> ${data.termName} | <strong>Year:</strong> ${data.yearLabel}</p>
        <p><strong>Position:</strong> ${data.cc} | <strong>Roll:</strong> ${data.roll}</p>
        <table>
          <tr><th>Subject</th><th>Class Score</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr>
          ${data.subjects.map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${s.classScore}</td>
              <td>${s.examScore}</td>
              <td>${s.total}</td>
              <td>${s.grade}</td>
              <td>${s.remark}</td>
            </tr>
          `).join("")}
        </table>
        <p><strong>Attendance:</strong> ${data.present} / ${data.total} days</p>
        <p><strong>Conduct:</strong> ${data.conduct}</p>
        <p><strong>Interest:</strong> ${data.interest}</p>
        <p><strong>Remark:</strong> ${data.classTeacherRemark}</p>
        <p><strong>Promoted To:</strong> ${data.promotedTo}</p>
        <p><strong>Next Term:</strong> ${data.nextTermBegins} | <strong>Vacation:</strong> ${data.vacationDate}</p>
        <p><strong>Fees Due:</strong> GH¢${data.totalFeesDue.toFixed(2)}</p>
      </body>
    </html>
  `;
};

