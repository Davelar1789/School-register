// // controllers/BulkStudentUpload.controller.js
// import XLSX from "xlsx";
// import fs from "fs";
// import path from "path";
// import Students from "../models/Student.model.js";
// import School from "../models/School.model.js";
// import { generateUniqueId } from "../utils/generateUniqueId.js";

// export const uploadStudentsFromExcel = async (req, res) => {
//   try {
//     const file = req.file;
//     const schoolId = req.user?.schoolId || req.body.schoolId;

//     if (!file) return res.status(400).json({ message: "No file uploaded." });
//     if (!schoolId) return res.status(400).json({ message: "School ID is required." });

//     const workbook = XLSX.readFile(file.path);
//     const sheetName = workbook.SheetNames[0];
//     const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const requiredHeaders = ["name", "gender", "className", "dob", "phone", "guardianName"];
//     const fileHeaders = Object.keys(rows[0]);

//     const missing = requiredHeaders.filter(h => !fileHeaders.includes(h));
//     if (missing.length > 0) {
//       return res.status(400).json({ message: `Missing required headers: ${missing.join(", ")}` });
//     }

//     let added = 0, skipped = 0;
//     for (const row of rows) {
//       const exists = await Students.findOne({
//         name: row.name,
//         className: row.className,
//         schoolId
//       });

//       if (exists) {
//         skipped++;
//         continue;
//       }

//       const idno = await generateUniqueId();

//       const newStudent = new Students({
//         ...row,
//         idno,
//         schoolId
//       });

//       await newStudent.save();
//       added++;

//       await School.findByIdAndUpdate(schoolId, { $inc: { numberOfStudents: 1 } });
//     }

//     fs.unlinkSync(file.path); // Cleanup
//     res.status(200).json({ message: `Upload complete. ${added} added, ${skipped} skipped.` });

//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ message: "Error uploading students", error: error.message });
//   }
// };
