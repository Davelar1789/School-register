// controllers/reportController.js
import axios from "axios";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import archiver from "archiver";
import Students from "../models/Student.model.js";
import GradeEntry from "../models/Grade.model.js";
import EarlyYearsReport from "../models/EarlyYearsReport.model.js";
import ReportTemplate from "../models/ReportTemplate.model.js";
import TermSession from "../models/TermSession.model.js";
import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import DocxMerger from "docx-merger";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// ─── Early-Years class detection ─────────────────────────────────────────────
// Only Creche and Nursery 1 use the ticking report format.
const EARLY_YEARS_CLASSES = ["creche", "nursery 1"];
const isEarlyYearsClass = (className = "") =>
  EARLY_YEARS_CLASSES.includes(className.trim().toLowerCase());

// ─── Activity lists — must exactly match the text in the .docx templates ─────
const ACTIVITIES = {
  creche: [
    "Speaks clearly",
    "Holds pencil/crayon properly",
    "Scribbles well",
    "Traces well",
    "Colours within lines",
    "Participates in songs/rhymes",
    "Responds to simple instructions",
    "Expresses needs and feelings clearly",
    "Plays well with others",
    "Cooperates during dressing",
  ],
  "nursery 1": [
    "Recognizes A \u2013 Z",
    "Identifies numbers 1 \u2013 20",
    "Writes letters A \u2013 Z",
    "Writes numbers 1 \u2013 20",
    "Matches objects/pictures",
    "Colours within lines",
    "Speaks clearly",
    "Responds to simple instructions",
    "Names common objects/animals",
    "Participates in songs/rhymes",
    "Plays well with others",
    "Follows classroom rules",
    "Expresses needs and feelings clearly",
    "Maintains personal hygiene",
  ],
};

// Rating column order — must match left-to-right order in the template table
const RATING_COLUMNS = ["Excellent", "Very Good", "Good", "Needs Improvement"];

// ─── Helper: inject ✔ ticks into the activities table XML ────────────────────
//
// Strategy: the templates have hardcoded activity names in column 1 and empty
// cells in columns 2-5 (Excellent / Very Good / Good / Needs Improvement).
// We find each activity row by its text, then inject a bold ✔ run into the
// correct rating column cell.
//
const injectTicksIntoXml = (xmlString, ticks, className) => {
  const activities = ACTIVITIES[className.trim().toLowerCase()] || [];
  let xml = xmlString;

  // Pre-collect all rows from the XML once
  const rowRegex = /<w:tr\b[\s\S]*?<\/w:tr>/g;
  const allRows = [...xml.matchAll(rowRegex)].map((m) => m[0]);

  for (const activity of activities) {
    const rating = ticks[activity]; // e.g. "Very Good" or undefined
    if (!rating) continue;

    const colIndex = RATING_COLUMNS.indexOf(rating); // 0-based, maps to 2nd-5th cell
    if (colIndex === -1) continue;

    // ── Find the <w:tr> that contains this activity text ──────────────────────
    // Strip all XML tags from each row to get plain text, then match by activity name.
    // This handles cases where Word splits text across multiple <w:r> runs.
    const originalRow = allRows.find((row) => {
      const plainText = row.replace(/<[^>]+>/g, "");
      return plainText.includes(activity);
    });

    if (!originalRow) {
      console.warn(`⚠️  Could not find row for activity: "${activity}"`);
      continue;
    }

    // Split the row into its <w:tc> cells
    const cellRegex = /<w:tc\b[\s\S]*?<\/w:tc>/g;
    const cells = [...originalRow.matchAll(cellRegex)].map((m) => m[0]);

    if (cells.length < RATING_COLUMNS.length + 1) {
      console.warn(`⚠️  Row for "${activity}" has fewer cells than expected`);
      continue;
    }

    // The tick goes into cells[colIndex + 1] (0 = activity name, 1-4 = ratings)
    const targetCellIndex = colIndex + 1;
    const targetCell = cells[targetCellIndex];

    // Build a bold ✔ run with the same font size as the rest of the table (26)
const tickRun = `
  <w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r>
    <w:rPr><w:b/><w:bCs/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
    <w:t>&#x2714;</w:t>
  </w:r>`;

const tickedCell = targetCell.replace(/<\/w:p>/, `${tickRun}</w:p>`);

    // Rebuild the row with the ticked cell substituted in
    let cellCount = 0;
    const modifiedRow = originalRow.replace(cellRegex, (match) => {
      const result = cellCount === targetCellIndex ? tickedCell : match;
      cellCount++;
      return result;
    });

    xml = xml.replace(originalRow, modifiedRow);
  }

  return xml;
};
// ─── Helper: generate one early-years .docx buffer for a student ─────────────
const generateEarlyYearsDocx = async (
  templateBuffer,
  student,
  ticks,
  term,
  classInfo,
  nextTermDate,
  nextTermFees
) => {
  // 1. Run Docxtemplater for the simple text placeholders
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const presentDays = await Attendance.countDocuments({
    studentId: student._id,
    termId: term._id,
    present: true,
  });

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

  const totalSchoolDays = getWeekdays(
    new Date(term.startDate),
    new Date(term.endDate)
  );

const conductOptions = [
  "Excellent",
  "Satisfactory",
  "Very obedient",
  "Well-behaved",
  "Cooperative",
  "Respectful",
  "Cheerful and friendly",
  "Attentive",
  "Hardworking",
  "Polite and courteous",
  "Shows great enthusiasm",
  "Kind to others",
];
const conduct = conductOptions[Math.floor(Math.random() * conductOptions.length)];

  const isTermThree = term.termName?.trim().toLowerCase() === "term 3";
  const promotedTo = isTermThree ? getNextClass(classInfo.className) : "N/A";

  // Determine overall remark based on how many "Excellent" / "Very Good" ticks
  const tickValues = Object.values(ticks);
  const total = tickValues.length;
  const excellentCount = tickValues.filter((v) => v === "Excellent").length;
  const veryGoodCount = tickValues.filter((v) => v === "Very Good").length;
  const goodCount = tickValues.filter((v) => v === "Good").length;
  const topRatio = total > 0 ? (excellentCount + veryGoodCount) / total : 0;

  const remarksMap = {
  excellent: [
    "An excellent performance. Keep it up!",
    "Outstanding effort this term. We are very proud!",
    "A brilliant performance. Continue to shine!",
    "Exceptional work this term. Well done!",
  ],
  veryGood: [
    "Very good work done. Keep pushing forward!",
    "A commendable performance. You are doing great!",
    "Very impressive effort this term. Keep it up!",
    "Great work shown this term. We are pleased with your progress!",
  ],
  good: [
    "Good effort. Keep it up!",
    "A solid performance. There is room to grow even further!",
    "Good work this term. With more effort, you can do even better!",
    "A decent showing. We believe you can achieve more!",
  ],
  needsImprovement: [
    "More room for improvement. We encourage greater effort next term.",
    "We know you can do better. Let us work harder next term!",
    "Keep trying — improvement comes with practice and dedication.",
    "With more focus and effort, great things are possible next term.",
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

let classTeacherRemark;
if (topRatio >= 0.8)       classTeacherRemark = pick(remarksMap.excellent);
else if (topRatio >= 0.6)  classTeacherRemark = pick(remarksMap.veryGood);
else if (topRatio >= 0.4 || goodCount / total >= 0.5)
                           classTeacherRemark = pick(remarksMap.good);
else                       classTeacherRemark = pick(remarksMap.needsImprovement);

  let arrears = 0;
  const yearRecord = student.academicRecords?.find(
    (y) => y.yearLabel === term.yearLabel
  );
  const termRecord = yearRecord?.terms?.find(
    (t) => t.termName === term.termName
  );
  if (termRecord?.fees) arrears = termRecord.fees.balance || 0;

  const feesNextTerm = parseFloat(nextTermFees) || 0;
  const totalFeesDue = arrears + feesNextTerm;

  // NAME field: Creche template uses {name} without "NAME:" prefix
  doc.setData({
    name: student.name,
    yearLabel: term.yearLabel,
    termName: term.termName,
    vacationDate: formatDate(term.endDate),
    nextTermBegins: nextTermDate ? formatDate(nextTermDate) : "N/A",
    arrears,
    feesNextTerm,
    totalFeesDue,
    present: presentDays,
    total: totalSchoolDays,
    roll: classInfo.students?.length || 0,
    conduct,
    classTeacherRemark,
    promotedTo,
  });

  try {
    doc.render();
  } catch (err) {
    console.error(`⚠️  Docxtemplater render error for ${student.name}:`, err);
    throw err;
  }

  // 2. Get the rendered XML, inject ticks, repack
  const renderedZip = doc.getZip();

  // Get the document.xml string from the rendered zip
  let documentXml = renderedZip.files["word/document.xml"].asText();

  // Inject the tick marks directly into the XML
  documentXml = injectTicksIntoXml(documentXml, ticks, classInfo.className);

  // Write modified XML back into the zip
  renderedZip.file("word/document.xml", documentXml);

  return renderedZip.generate({ type: "nodebuffer" });
};

// ─── generateClassReports ─────────────────────────────────────────────────────

export const generateClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!classId || !termId) {
      return res
        .status(400)
        .json({ message: "classId and termId are required." });
    }

    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found." });

    const isTermThree = term.termName?.trim().toLowerCase() === "term 3";

    const classInfo = await Class.findById(classId).populate({
      path: "students",
      model: "students",
    });
    if (!classInfo) return res.status(404).json({ message: "Class not found." });

    const template = await ReportTemplate.findOne({ classIds: classId });
    if (!template)
      return res
        .status(404)
        .json({ message: "No report template found for this class." });

    const cloudResponse = await axios.get(template.templatePath, {
      responseType: "arraybuffer",
    });
    const templateBuffer = Buffer.from(cloudResponse.data, "binary");

    const reportsDir = path.resolve("generatedReports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const numberOnRoll = classInfo.students.length;

    // ── Route: Early Years (Creche / Nursery 1) ───────────────────────────────
    if (isEarlyYearsClass(classInfo.className)) {
      console.log(`🌱 Generating early-years reports for ${classInfo.className}`);

      const studentBuffers = [];

      for (const student of classInfo.students) {
        // Fetch saved ticks for this student
        const reportDoc = await EarlyYearsReport.findOne({
          studentId: student._id,
          classId,
          termId,
        });

        const ticks = reportDoc
          ? Object.fromEntries(reportDoc.ticks)
          : {};

        if (Object.keys(ticks).length === 0) {
          console.warn(
            `⚠️  No ticks found for ${student.name} — generating blank report`
          );
        }

        let buffer;
        try {
          buffer = await generateEarlyYearsDocx(
            templateBuffer,
            student,
            ticks,
            term,
            classInfo,
            nextTermDate,
            nextTermFees
          );
        } catch (err) {
          console.error(`❌ Skipping ${student.name}:`, err.message);
          continue;
        }

        studentBuffers.push(buffer);
        console.log(`✅ Generated early-years report for ${student.name}`);
      }

      if (studentBuffers.length === 0) {
        return res
          .status(404)
          .json({ message: "No reports could be generated for this class." });
      }

      const docxMerger = new DocxMerger({}, studentBuffers);
      const mergedBuffer = await new Promise((resolve) => {
        docxMerger.save("nodebuffer", (data) => resolve(data));
      });

      const mergedFileName = `class-${classId}-reports.docx`;
      const mergedPath = path.join(reportsDir, mergedFileName);
      fs.writeFileSync(mergedPath, mergedBuffer);

      return res.download(
        mergedPath,
        `report_cards_class_${classId}.docx`,
        () => {
          fs.rmSync(mergedPath);
        }
      );
    }

    // ── Route: Regular classes (Nursery 2, KG, Primary, JHS) ─────────────────
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

    const studentBuffers = [];

    for (const student of classInfo.students) {
      const grades = await GradeEntry.find({
        studentId: student._id,
        termId,
      }).populate("subjectId");

      const subjectData = grades.map((g) => ({
        name: g.subjectId.name || "Unknown Subject",
        classScore:
          g.scores.test1 + g.scores.test2 + g.scores.test3 + g.scores.test4,
        examScore: g.scores.exam,
        total: g.scores.total,
        grade: computeGrade(g.scores.total),
        position: g.scores.position || "",
        remark: getRemark(g.scores.total),
      }));

      const coreSubjects = [
        "English Language",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
      ];
      const coreGrades = subjectData
        .filter((s) => coreSubjects.includes(s.name))
        .map((s) => parseInt(s.grade, 10))
        .filter((g) => !isNaN(g));
      const electiveGrades = subjectData
        .filter((s) => !coreSubjects.includes(s.name))
        .map((s) => ({ grade: parseInt(s.grade, 10), name: s.name }))
        .filter((s) => !isNaN(s.grade));
      electiveGrades.sort((a, b) => a.grade - b.grade);
      const bestElectives = electiveGrades.slice(0, 2).map((e) => e.grade);
      const aggregate = [...coreGrades, ...bestElectives].reduce(
        (sum, g) => sum + g,
        0
      );

      const studentTotalMarks = subjectData.reduce((sum, s) => sum + s.total, 0);
      const maxTotalMarks = subjectData.length * 100;

      const rankData = rankedScores.find(
        (r) => r.studentId === student._id.toString()
      );
      const cc = rankData?.position || "";

      const presentDays = await Attendance.countDocuments({
        studentId: student._id,
        termId,
        present: true,
      });
      const totalSchoolDays = getWeekdays(
        new Date(term.startDate),
        new Date(term.endDate)
      );

      // Expanded conduct options
      const conductOptions = [
        "Excellent",
        "Satisfactory",
        "Very obedient",
        "Well-behaved",
        "Very respectful",
        "Very hardworking",
        "Very polite",
        "Very attentive in class",
        "Very disciplined",
      ];

      const conduct =
        conductOptions[Math.floor(Math.random() * conductOptions.length)];

      // Highest scoring subjects
      const highestScore = Math.max(...subjectData.map((s) => s.total));
      const interestSubjects = subjectData
        .filter((s) => s.total === highestScore)
        .map((s) => s.name)
        .slice(0, 2);
      const interest = interestSubjects.join(", ");

      // Percentage calculation
      const percentage = (studentTotalMarks / (maxTotalMarks || 1)) * 100;

      // Remarks pool by percentile range
      const remarkOptions = {
        excellent: [
          "An excellent performance.",
          "Outstanding work, keep it up.",
          "Truly impressive results.",
          "Exceptional achievement this term.",
        ],
        veryGood: [
          "Very good work done.",
          "Strong performance overall.",
          "Well done, keep striving higher.",
          "Consistently good effort.",
        ],
        good: [
          "Good effort. Keep it up.",
          "Solid progress made.",
          "Shows promise, continue working hard.",
          "A commendable performance.",
        ],
        satisfactory: [
          "Satisfactory.",
          "Adequate progress, but can improve.",
          "Fair effort, more consistency needed.",
          "Room for improvement.",
        ],
        needsImprovement: [
          "Needs to put in more effort.",
          "Work harder next term.",
          "Performance below expectations.",
          "Greater dedication required.",
        ],
      };

      // Pick remark based on percentage
      let classTeacherRemark;
      if (percentage >= 80) {
        classTeacherRemark =
          remarkOptions.excellent[
            Math.floor(Math.random() * remarkOptions.excellent.length)
          ];
      } else if (percentage >= 70) {
        classTeacherRemark =
          remarkOptions.veryGood[
            Math.floor(Math.random() * remarkOptions.veryGood.length)
          ];
      } else if (percentage >= 60) {
        classTeacherRemark =
          remarkOptions.good[
            Math.floor(Math.random() * remarkOptions.good.length)
          ];
      } else if (percentage >= 50) {
        classTeacherRemark =
          remarkOptions.satisfactory[
            Math.floor(Math.random() * remarkOptions.satisfactory.length)
          ];
      } else {
        classTeacherRemark =
          remarkOptions.needsImprovement[
            Math.floor(Math.random() * remarkOptions.needsImprovement.length)
          ];
      }

      let arrears = 0;
      const yearRecord = student.academicRecords.find(
        (y) => y.yearLabel === term.yearLabel
      );
      const termRecord = yearRecord?.terms?.find(
        (t) => t.termName === term.termName
      );
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

      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      console.log(`📄 ${student.name} - Aggregate:`, aggregate);
      doc.setData(studentData);

      try {
        doc.render();
      } catch (err) {
        console.error(`⚠️ Error rendering report for ${student.name}:`, err);
        continue;
      }

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      studentBuffers.push(buffer);
    }

    if (studentBuffers.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports could be generated for this class." });
    }

    const docxMerger = new DocxMerger({}, studentBuffers);
    const mergedBuffer = await new Promise((resolve) => {
      docxMerger.save("nodebuffer", (data) => resolve(data));
    });

    const mergedFileName = `class-${classId}-reports.docx`;
    const mergedPath = path.join(reportsDir, mergedFileName);
    fs.writeFileSync(mergedPath, mergedBuffer);

    return res.download(
      mergedPath,
      `report_cards_class_${classId}.docx`,
      () => {
        fs.rmSync(mergedPath);
      }
    );
  } catch (error) {
    console.error("❌ Error generating reports:", error);
    res
      .status(500)
      .json({ message: "Error generating reports", error: error.message });
  }
};

// ─── generateStudentReport ────────────────────────────────────────────────────

export const generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId, classId, nextTermDate, nextTermFees = 0 } = req.query;

    if (!studentId || !termId || !classId) {
      return res
        .status(400)
        .json({ message: "studentId, termId and classId are required." });
    }

    const [term, student, classInfo, template] = await Promise.all([
      TermSession.findById(termId),
      Students.findById(studentId),
      Class.findById(classId),
      ReportTemplate.findOne({ classIds: classId }),
    ]);

    if (!term || !student || !classInfo || !template) {
      return res
        .status(404)
        .json({ message: "Missing term, student, class, or template info." });
    }

    const cloudResponse = await axios.get(template.templatePath, {
      responseType: "arraybuffer",
    });
    const templateBuffer = Buffer.from(cloudResponse.data, "binary");

    // ── Route: Early Years ────────────────────────────────────────────────────
    if (isEarlyYearsClass(classInfo.className)) {
      console.log(`🌱 Generating early-years report for ${student.name}`);

      const reportDoc = await EarlyYearsReport.findOne({
        studentId,
        classId,
        termId,
      });
      const ticks = reportDoc ? Object.fromEntries(reportDoc.ticks) : {};

      let buffer;
      try {
        buffer = await generateEarlyYearsDocx(
          templateBuffer,
          student,
          ticks,
          term,
          classInfo,
          nextTermDate,
          nextTermFees
        );
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Error generating report", error: err.message });
      }

      const fileName = `${student.name.replace(/\s+/g, "_")}_report.docx`;
      const reportPath = `generatedReports/${fileName}`;
      fs.writeFileSync(reportPath, buffer);

      return res.download(reportPath, fileName, () => {
        fs.unlinkSync(reportPath);
      });
    }

    // ── Route: Regular classes ────────────────────────────────────────────────
    const grades = await GradeEntry.find({ studentId, termId }).populate(
      "subjectId"
    );

    const subjectData = grades.map((g) => ({
      name: g.subjectId.name || "Unknown Subject",
      classScore:
        g.scores.test1 + g.scores.test2 + g.scores.test3 + g.scores.test4,
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

    const presentDays = await Attendance.countDocuments({
      studentId,
      termId,
      present: true,
    });
    const totalSchoolDays = getWeekdays(
      new Date(term.startDate),
      new Date(term.endDate)
    );

    const conductOptions = [
      "Excellent",
      "Satisfactory",
      "Very obedient",
      "Well-behaved",
      "Needs improvement",
    ];
    const conduct =
      conductOptions[Math.floor(Math.random() * conductOptions.length)];

    const highestScore = Math.max(...subjectData.map((s) => s.total));
    const interest = subjectData
      .filter((s) => s.total === highestScore)
      .map((s) => s.name)
      .join(" and ");

    const percentage = (studentTotalMarks / (maxTotalMarks || 1)) * 100;
    let classTeacherRemark = "More room for improvement.";
    if (percentage >= 80) classTeacherRemark = "An excellent performance.";
    else if (percentage >= 70) classTeacherRemark = "Very good work done.";
    else if (percentage >= 60) classTeacherRemark = "Good effort. Keep it up.";
    else if (percentage >= 50) classTeacherRemark = "Satisfactory";

    let arrears = 0;
    const yearRecord = student.academicRecords.find(
      (y) => y.yearLabel === term.yearLabel
    );
    const termRecord = yearRecord?.terms?.find(
      (t) => t.termName === term.termName
    );
    if (termRecord?.fees) arrears = termRecord.fees.balance || 0;

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
      totalFeesDue,
    };

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    doc.setData(studentData);

    try {
      doc.render();
    } catch (err) {
      console.error("⚠️ Error rendering report:", err);
      return res
        .status(500)
        .json({ message: "Error generating report", error: err.message });
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  "JHS 3",
];

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
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const cleanupInvalidGrades = async (req, res) => {
  try {
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ message: "Class ID is required" });

    const classDoc = await Class.findById(classId).populate("subjects.subject");
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const allowedSubjectIds = classDoc.subjects.map((subj) =>
      subj.subject._id.toString()
    );
    const invalidGrades = await GradeEntry.find({ classId });

    let removedCount = 0;
    for (let grade of invalidGrades) {
      if (!allowedSubjectIds.includes(grade.subjectId.toString())) {
        await GradeEntry.deleteOne({ _id: grade._id });
        removedCount++;
        console.log(`🗑 Removed grade for invalid subject: ${grade.subjectId}`);
      }
    }

    res
      .status(200)
      .json({ message: `✅ Cleanup complete. Removed ${removedCount} invalid grades.` });
  } catch (error) {
    console.error("🚨 Error cleaning up invalid grades:", error);
    res.status(500).json({ message: "Failed to clean grades", error });
  }
};
