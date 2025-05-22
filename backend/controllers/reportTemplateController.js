import ReportTemplate from "../models/ReportTemplate.model.js";

export const uploadTemplate = async (req, res) => {
  try {
    console.log("🔥 Upload process started...");

    // Log request body
    console.log("Received body:", req.body);

    // Ensure file exists
    if (!req.file) {
      console.error("❌ No file uploaded.");
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Log uploaded file details
    console.log("✅ File received:", {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      savedPath: req.file.path,
    });

    // Validate schoolId & classIds presence
    if (!schoolId || !classIds) {
      console.error("❌ Missing schoolId or classIds in request.");
      return res.status(400).json({ message: "schoolId and classIds are required." });
    }

    // Parse classIds safely
    let parsedClassIds;
    try {
      parsedClassIds = JSON.parse(classIds);
    } catch (parseError) {
      console.error("❌ Error parsing classIds:", parseError.message);
      return res.status(400).json({ message: "Invalid classIds format." });
    }

    console.log("✅ Parsed classIds:", parsedClassIds);

    // Create and save report template
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