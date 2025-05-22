import ReportTemplate from "../models/ReportTemplate.model.js";

export const uploadTemplate = async (req, res) => {
  try {
    const { schoolId, classIds } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const newTemplate = new ReportTemplate({
      schoolId,
      classIds: JSON.parse(classIds), // pass this as stringified array from frontend
      templatePath: req.file.path,
      originalFileName: req.file.originalname,
    });

    await newTemplate.save();
    res.status(200).json({ message: "Template uploaded", template: newTemplate });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
