// controllers/topicController.js
import Subject from "../models/subject.model.js";

export const addTopic = async (req, res) => {
  const { subjectId } = req.params;
  const { classId, term, title, description } = req.body;

  if (!subjectId || !classId || !term || !title || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

let courseMaterial = subject.courseMaterials.find(
  mat => mat.term === term && mat.classId.toString() === classId
);
   if (!courseMaterial) {
  courseMaterial = { term, classId, topics: [] };
  subject.courseMaterials.push(courseMaterial);
}

    courseMaterial.topics.push({ classId, title, description });
    await subject.save();

    res.status(201).json({ message: "Topic added" });
  } catch (err) {
    console.error(err);
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

