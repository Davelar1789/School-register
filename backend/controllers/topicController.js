// controllers/topicController.js
import Subject from "../models/Subject.js";

export const addTopic = async (req, res) => {
  const { subjectId } = req.params;
  const { classId, term, title, description } = req.body;

  if (!classId || !term || !title || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    subject.topics.push({ classId, term, title, description });
    await subject.save();

    res.status(201).json({ message: "Topic added", topic: subject.topics.slice(-1)[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to add topic" });
  }
};

export const getTopics = async (req, res) => {
  const { subjectId } = req.params;
  const { classId, term } = req.query;

  if (!classId || !term) {
    return res.status(400).json({ error: "classId and term are required" });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const filtered = subject.topics
      .filter(t => t.classId.equals(classId) && t.term === term)
      .map(({ _id, title, description, createdAt }) => ({ _id, title, description, createdAt }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};
