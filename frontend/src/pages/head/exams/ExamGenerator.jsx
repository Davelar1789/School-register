import React, { useState } from 'react';
import axios from '../../../api/axios';
import './ExamGenerator.modules.css';

const ExamGenerator = () => {
  const [form, setForm] = useState({
    classId: '', subjectId: '', term: 'Term 1',
    examType: 'objective only', level: 'beginner',
    numObjective: 0, numSubjective: 0, numPractical: 0,
    curriculumText: '',
  });
  const [loading, setLoading] = useState(false);
  const [timeTaken, setTimeTaken] = useState(null);
  const [exam, setExam] = useState(null);

  const handleInput = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const generate = async () => {
    setLoading(true);
    setTimeTaken(null);
    setExam(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/exams/generate', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeTaken(res.data.timeTaken);
      setExam(res.data.exam);
    } catch (err) {
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-gen">
      <h2>Generate Exam</h2>
      {/* Inputs for classId, subjectId, term, examType, level, counts */}
      <textarea name="curriculumText" placeholder="Paste curriculum notes" rows={6}
        value={form.curriculumText} onChange={handleInput} />
      <button onClick={generate} disabled={loading}>
        {loading ? <span className="spinner" /> : 'Generate'}
      </button>

      {timeTaken && <p>Generated in {timeTaken}s</p>}
      {exam && (
        <div className="exam-output">
          <h3>Objective:</h3>
          {exam.objective.map((o,i) => (
            <div key={i}>
              <p>{i+1}. {o.question}</p>
              <ul>{o.options.map((opt,j) => <li key={j}>{opt}</li>)}</ul>
            </div>
          ))}
          <h3>Subjective:</h3>
          {exam.subjective.map((s,i)=> <p key={i}>{i+1}. {s.question}</p>)}
          <h3>Practical:</h3>
          {exam.practical.map((p,i)=> (
            <div key={i}>
              <img src={p.figureUrl} alt={`Fig ${i+1}`} />
              {p.questions.map((q,j)=><p key={j}>{i+1}.{j+1} {q}</p>)}
            </div>
          ))}
          <a href={exam.fileUrl} download>Download JSON</a>
        </div>
      )}
    </div>
  );
};

export default ExamGenerator;
