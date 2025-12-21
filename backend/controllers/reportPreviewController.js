import axios from "axios";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import Students from "../models/Student.model.js";
import GradeEntry from "../models/Grade.model.js";
import ReportTemplate from "../models/ReportTemplate.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";

/* ============================================================
   HELPERS
============================================================ */

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const computeGrade = (score) => {
  if (score >= 80) return "1";
  if (score >= 70) return "2";
  if (score >= 60) return "3";
  if (score >= 50) return "4";
  if (score >= 45) return "5";
  if (score >= 40) return "6";
  if (score >= 35) return "7";
  if (score >= 30) return "8";
  return "9";
};

const getRemark = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Credit";
  if (score >= 45) return "Pass";
  return "Fail";
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

const getNextClass = (className) => {
  const match = className.match(/\d+/);
  if (!match) return className;
  return className.replace(match[0], Number(match[0]) + 1);
};

const getWeekdays = (start, end) => {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
};

/* ============================================================
   PREVIEW REPORT CONTROLLER
============================================================ */

export const previewClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId required" });
    }

    console.log("Fetching term...");
    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found" });

    const isTermThree =
      term.termName?.trim().toLowerCase() === "term 3";

    console.log("Fetching class info...");
    const classInfo = await Class.findById(classId).populate("students");
    if (!classInfo) return res.status(404).json({ message: "Class not found" });

    console.log("Fetching report template...");
    const template = await ReportTemplate.findOne({ classIds: classId });
    if (!template)
      return res.status(404).json({ message: "No report template found" });

    console.log("Downloading template file...");
    const { data } = await axios.get(template.templatePath, {
      responseType: "arraybuffer",
    });
    const templateBuffer = Buffer.from(data);

    /* ---------- Class Ranking ---------- */
    console.log("Computing class scores and ranking...");
    const scores = [];

    for (const student of classInfo.students) {
      const grades = await GradeEntry.find({
        studentId: student._id,
        termId,
      });
      const total = grades.reduce((s, g) => s + (g.scores?.total || 0), 0);
      scores.push({ studentId: student._id.toString(), total });
    }

    scores.sort((a, b) => b.total - a.total);

    const rankedScores = [];
    let lastScore = null;
    let rank = 1;

    for (const s of scores) {
      if (s.total !== lastScore) rank = rankedScores.length + 1;
      rankedScores.push({ ...s, position: getOrdinal(rank) });
      lastScore = s.total;
    }

    /* ---------- Puppeteer ---------- */
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const previewPdf = await PDFDocument.create();

    for (const student of classInfo.students) {
      console.log(`Processing student: ${student.name}`);

      const grades = await GradeEntry.find({
        studentId: student._id,
        termId,
      }).populate("subjectId");

      const subjects = grades.map((g) => ({
        name: g.subjectId?.name || "Unknown",
        classScore:
          g.scores.test1 +
          g.scores.test2 +
          g.scores.test3 +
          g.scores.test4,
        examScore: g.scores.exam,
        total: g.scores.total,
        grade: computeGrade(g.scores.total),
        remark: getRemark(g.scores.total),
      }));

      const studentTotal = subjects.reduce((s, x) => s + x.total, 0);
      const maxTotal = subjects.length * 100;

      const rankInfo = rankedScores.find(
        (r) => r.studentId === student._id.toString()
      );

      const presentDays = await Attendance.countDocuments({
        studentId: student._id,
        termId,
        present: true,
      });

      const totalDays = getWeekdays(
        new Date(term.startDate),
        new Date(term.endDate)
      );

const studentData = {
  name: student.name,
  className: classInfo.className,
  termName: term.termName,
  yearLabel: term.yearLabel,
  subjects,
  obtained: studentTotal,
  max: maxTotal,
  present: presentDays,
  total: totalDays,
  roll: classInfo.students.length,
  cc: rankInfo?.position || "",
  promotedTo: isTermThree
    ? getNextClass(classInfo.className)
    : "N/A",
  vacationDate: formatDate(term.endDate),
  nextTermBegins: formatDate(nextTermDate),
  feesNextTerm: Number(nextTermFees),
};

console.log(
  `CC CHECK → ${student.name} | Position: ${studentData.cc}`
);

/* DOCXTEMPLATER */
const zip = new PizZip(templateBuffer);
const doc = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
});

doc.render(studentData);


      const docxBuffer = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      const { value: html } = await mammoth.convertToHtml({
        buffer: docxBuffer,
      });

      const page = await browser.newPage();
      await page.setContent(`<html><body>${html}</body></html>`);
      const pdfBuffer = await page.pdf({ format: "A4" });
      await page.close();

      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const [page0] = await previewPdf.copyPages(pdfDoc, [0]);
      previewPdf.addPage(page0);
    }

    await browser.close();

    const finalPdf = await previewPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=preview.pdf");
    res.send(Buffer.from(finalPdf));

    console.log("Preview PDF sent successfully");
  } catch (err) {
    console.error("❌ Preview error:", err);
    res.status(500).json({
      message: "Preview failed",
      error: err.message,
    });
  }
};
