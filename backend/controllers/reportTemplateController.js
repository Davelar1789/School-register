import ReportTemplate from "../models/ReportTemplate.model.js";

export const uploadTemplate = async (req, res) => {
  try {
    console.log("🔥 Upload process started...");

    const schoolId = req.body.schoolId;
    const classIdsString = req.body.classIds;

    if (!req.file) {
      console.error("❌ No file uploaded.");
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (!schoolId) {
      console.error("❌ Missing schoolId in request.");
      return res.status(400).json({ message: "schoolId is required." });
    }

    let parsedClassIds;
    try {
      parsedClassIds = JSON.parse(classIdsString);
      console.log("✅ Parsed classIds:", parsedClassIds);
    } catch (error) {
      console.error("❌ Error parsing classIds:", error.message);
      return res.status(400).json({ message: "Invalid classIds format." });
    }

    const newTemplate = new ReportTemplate({
      schoolId,
      classIds: parsedClassIds,
      templatePath: req.file.path, // Cloudinary secure URL
      originalFileName: req.file.originalname,
    });

    await newTemplate.save();
    console.log("✅ Template successfully saved:", newTemplate);

    res.status(200).json({ message: "Template uploaded", template: newTemplate });

  } catch (err) {
    console.error("🚨 Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};
