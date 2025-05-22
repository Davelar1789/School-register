import ReportTemplate from "../models/ReportTemplate.model.js";

export const uploadTemplate = async (req, res) => {
  try {
    console.log("🔥 Upload process started...");

    // Ensure req.body is correctly parsed
    console.log("Received body:", req.body);

    // Explicitly extract values
    const schoolId = req.body.schoolId;
    const classIdsString = req.body.classIds; // It's coming as a stringified array

    if (!req.file) {
      console.error("❌ No file uploaded.");
      return res.status(400).json({ message: "No file uploaded." });
    }

    console.log("✅ File received:", {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      savedPath: req.file.path,
    });

    // Validate `schoolId` presence
    if (!schoolId) {
      console.error("❌ Missing schoolId in request.");
      return res.status(400).json({ message: "schoolId is required." });
    }

    // Safely parse classIds
    let parsedClassIds;
    try {
      parsedClassIds = JSON.parse(classIdsString);
      console.log("✅ Parsed classIds:", parsedClassIds);
    } catch (error) {
      console.error("❌ Error parsing classIds:", error.message);
      return res.status(400).json({ message: "Invalid classIds format." });
    }

    // Save report template
    const newTemplate = new ReportTemplate({
      schoolId,
      classIds: parsedClassIds, // Should be an array
      templatePath: req.file.path,
      originalFileName: req.file.originalname,
    });

    await newTemplate.save();
    console.log("✅ Template successfully saved in database:", newTemplate);

    res.status(200).json({ message: "Template uploaded", template: newTemplate });

  } catch (err) {
    console.error("🚨 Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};