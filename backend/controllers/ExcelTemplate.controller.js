// // controllers/ExcelTemplate.controller.js
// import ExcelJS from 'exceljs';
// import path from 'path';
// import fs from 'fs';

// export const downloadStudentTemplate = async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet('Students');

//   // Define headers
//   const headers = ["name", "gender", "className", "dob", "phone", "guardianName"];
//   sheet.addRow(headers);
//   sheet.getRow(1).font = { bold: true };

//   headers.forEach((_, i) => {
//     sheet.getColumn(i + 1).width = 20;
//   });

//   // Lock header row
//   sheet.protect('password123', { selectLockedCells: true });

//   const filePath = path.join("templates", "student_upload_template.xlsx");
//   await workbook.xlsx.writeFile(filePath);
//   res.download(filePath, () => {
//     fs.unlinkSync(filePath);
//   });
// };
