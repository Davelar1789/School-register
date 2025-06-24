// controllers/topicController.js
import Subject from "../models/subject.model.js";

export const addTopic = async (req, res) => {
  const { subjectId } = req.params;
  const { classId, term, title, description } = req.body;

  console.log("📥 Incoming request to add topic:", {
    subjectId,
    classId,
    term,
    title,
    description,
  });

  if (!subjectId || !classId || !term || !title || !description) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      console.warn("❌ Subject not found:", subjectId);
      return res.status(404).json({ error: "Subject not found" });
    }

    console.log("✅ Subject found:", subject.name || subject._id);

    let courseMaterial = subject.courseMaterials.find(
      (mat) => mat.term === term && mat.classId.toString() === classId
    );

    if (!courseMaterial) {
      console.log("📘 No existing course material found — creating new one");
      courseMaterial = { term, classId, topics: [] };
      subject.courseMaterials.push(courseMaterial);
    } else {
      console.log("📗 Found existing course material — adding topic");
    }

    courseMaterial.topics.push({ classId, title, description });
    console.log("📝 Topic added to course material:", { title, description });
    
    subject.markModified("courseMaterials");

    await subject.save();
    console.log("💾 Subject saved successfully");

    res.status(201).json({ message: "Topic added" });
  } catch (err) {
    console.error("🔥 Error saving topic:", err);
    res.status(500).json({ error: "Error saving topic" });
  }
};

export const getTopics = async (req, res) => {
  const { subjectId } = req.params;
  const { classId, term } = req.query;

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const courseMaterial = subject.courseMaterials.find(mat => mat.term === term);
    if (!courseMaterial) return res.json([]);

    const topics = courseMaterial.topics.filter(t => t.classId.toString() === classId);
    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching topics" });
  }
};

