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

export const generateClassReports = async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId } = req.query;

    if (!classId || !termId) {
      return res.status(400).json({ message: "classId and termId are required." });
    }

    const term = await TermSession.findById(termId);
    if (!term) return res.status(404).json({ message: "Term not found." });

    const classInfo = await Class.findById(classId).populate({ path: "students", model: "students" }); 
    if (!classInfo) return res.status(404).json({ message: "Class not found." });

    const template = await ReportTemplate.findOne({ classIds: classId });
    if (!template) return res.status(404).json({ message: "No report template found for this class." });

    const templateBuffer = fs.readFileSync(path.resolve(template.templatePath));

    const zipPath = path.resolve(`generatedReports/class-${classId}-reports.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");

    archive.pipe(output);

    for (const student of classInfo.students) {
      // 🧠 Fetch grade entries
      const grades = await GradeEntry.find({ studentId: student._id, termId });

      const subjectData = grades.map(g => ({
        name: g.subjectId.toString(), // you can populate subjectId if needed
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
        subjects: subjectData,
        attendance: {
          present: 0, // Fetch from student.academicRecords if needed
          total: 0
        },
        conduct: "Excellent",
        promotedTo: "JHS 2" // Optional logic
      };

      // 📝 Fill template
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.setData(studentData);

      try {
        doc.render();
      } catch (err) {
        console.error("Template rendering error for student:", student.name, err);
        continue;
      }

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const reportFileName = `${student.name.replace(/\s+/g, "_")}_report.docx`;

      // Temporarily write the report to disk before zipping
      const reportPath = `generatedReports/${reportFileName}`;
      fs.writeFileSync(reportPath, buffer);

      archive.append(fs.createReadStream(reportPath), { name: reportFileName });
    }

    await archive.finalize();

    // Stream zip back to client
    output.on("close", () => {
      res.download(zipPath, `report_cards_class_${classId}.zip`, () => {
        // optional: clean up files after download
        fs.rmSync(zipPath);
      });
    });

  } catch (error) {
    console.error("Error generating reports:", error);
    res.status(500).json({ message: "Error generating reports", error: error.message });
  }
};

// Simple grade logic (customize later)
const computeGrade = (score) => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
};

const getRemark = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Pass";
  return "Fail";
};
