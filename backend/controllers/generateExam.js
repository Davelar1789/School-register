// backend/controllers/examController.js
import ollama from 'ollama';
import fs from 'fs';
import path from 'path';
import Subject from '../models/subject.model.js';

export const generateExam = async (req, res) => {
  const {
    classId,
    subjectId,
    term,
    examType,        // e.g. "objective only", "objective and subjective", etc.
    level,           // beginner, easy, hard, difficult
    numObjective = 0,
    numSubjective = 0,
    numPractical = 0,
  } = req.body;

  const startTime = Date.now();

  const clampCount = (n) => Math.max(0, Math.min(Number(n) || 0, 50));
  if (!classId || !subjectId) {
    return res.status(400).json({ error: 'Class and subject are required.' });
  }

  // Build the curriculum text from the topics the admin entered for this class & term
  let curriculumText = '';
  let subjectName = '';
  try {
    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });
    subjectName = subject.name;
    const material = (subject.courseMaterials || []).find(
      (m) => String(m.classId) === String(classId) && m.term === term
    );
    curriculumText = (material?.topics || [])
      .map((t) => `${t.title}: ${String(t.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}`)
      .join('\n');
  } catch (err) {
    console.error('Could not load curriculum for exam:', err.message);
  }
  if (!curriculumText) {
    return res.status(400).json({
      error: `No topics have been added for ${subjectName || 'this subject'} in ${term}. Add topics under Classes → Subjects first.`,
    });
  }

  // Build the flexible prompt
  const prompt = `
You are an exam generator for schools. Based on the curriculum content below, generate an EXAM following these rules:
- examType: ${examType}
- level: ${level}
- #objective: ${clampCount(numObjective)}, #subjective: ${clampCount(numSubjective)}, #practical: ${clampCount(numPractical)}
- Objective questions: multiple choice. At beginner level use 2 options, easy = 3, hard/difficult = 4.
- Subjective: based on the level complexity.
- Practical: For science, include ${numPractical} diagrams labeled "Fig 1", "Fig 2", etc., each followed by 2–3 questions.
Output RAW JSON with this schema:
{
  "exam": {
    "objective": [{ question, options: [], correct }],
    "subjective": [{ question }],
    "practical": [{ figureUrl: string, questions: [string] }]
  }
}
Curriculum:
"""
${curriculumText}
"""`;

  try {
    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [
        { role: 'system', content: 'You are a serious exam question generator. Always output exactly raw JSON.' },
        { role: 'user', content: prompt }
      ],
      format: 'json',
      stream: false,
    });

    const examData = JSON.parse(response.message.content);

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    // Optionally create a file
    const fileName = `exam-${subjectId}-${Date.now()}.json`;
    const dir = path.join(process.cwd(), 'generated-exams');
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(examData, null, 2));

    res.json({ 
      exam: examData.exam,
      timeTaken,
      fileUrl: `/generated-exams/${fileName}` 
    });
  } catch (err) {
    console.error('❌ Exam generation failed:', err);
    res.status(500).json({ error: 'Exam generation failed' });
  }
};
