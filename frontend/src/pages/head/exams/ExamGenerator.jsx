import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import './ExamGenerator.modules.css';
import toast from 'react-hot-toast';

const ExamGenerator = () => {
  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    term: 'Term 1',
    examType: 'objective only',
    level: 'beginner',
    numObjective: 0,
    numSubjective: 0,
    numPractical: 0,
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeTaken, setTimeTaken] = useState(null);
  const [exam, setExam] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  // Fetch class & subject options
  useEffect(() => {
    const schoolId = localStorage.getItem("schoolId");
    const token = localStorage.getItem("token");

    const fetchOptions = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          axios.get(`/api/classes/school/${schoolId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/subjects/school/${schoolId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setClasses(classRes.data);
        setSubjects(subjectRes.data);
      } catch (err) {
        toast.error("Failed to fetch class/subject options");
      }
    };

    fetchOptions();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generate = async () => {
    if (!form.classId || !form.subjectId) {
      toast.error("Please select class and subject");
      return;
    }

    setLoading(true);
    setExam(null);
    setTimeTaken(null);
    setFileUrl("");

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/exams/generate', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExam(res.data.exam);
      setTimeTaken(res.data.timeTaken);
      setFileUrl(res.data.fileUrl);
    } catch (err) {
      toast.error("Generation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-gen">
      <h2>Generate Exam Questions</h2>
      <div className="form-box">
        <label>Class</label>
        <select name="classId" value={form.classId} onChange={handleInput}>
          <option value="">-- Select Class --</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className}
            </option>
          ))}
        </select>

        <label>Subject</label>
        <select name="subjectId" value={form.subjectId} onChange={handleInput}>
          <option value="">-- Select Subject --</option>
          {subjects.map((subj) => (
            <option key={subj._id} value={subj._id}>
              {subj.name}
            </option>
          ))}
        </select>

        <label>Term</label>
        <select name="term" value={form.term} onChange={handleInput}>
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>

        <label>Exam Type</label>
        <select name="examType" value={form.examType} onChange={handleInput}>
          <option value="objective only">Objective Only</option>
          <option value="subjective only">Subjective Only</option>
          <option value="objective and subjective">Objective + Subjective</option>
          <option value="objective, practicals and subjective">Objective + Practicals + Subjective</option>
        </select>

        <label>Level</label>
        <select name="level" value={form.level} onChange={handleInput}>
          <option>beginner</option>
          <option>easy</option>
          <option>hard</option>
          <option>difficult</option>
        </select>

        {form.examType.includes("objective") && (
          <label>Number of Objective Questions
            <input type="number" name="numObjective" value={form.numObjective} onChange={handleInput} />
          </label>
        )}

        {form.examType.includes("subjective") && (
          <label>Number of Subjective Questions
            <input type="number" name="numSubjective" value={form.numSubjective} onChange={handleInput} />
          </label>
        )}

        {form.examType.includes("practical") && (
          <label>Number of Practical Questions
            <input type="number" name="numPractical" value={form.numPractical} onChange={handleInput} />
          </label>
        )}

        <button onClick={generate} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Generate'}
        </button>
      </div>

      {timeTaken && <p className="time-taken">Generated in {timeTaken}s</p>}

      {exam && (
        <div className="exam-output">
          <h3>Objective Questions</h3>
          {exam.objective?.map((q, i) => (
            <div key={i}>
              <p>{i + 1}. {q.question}</p>
              <ul>
                {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
              </ul>
            </div>
          ))}

          <h3>Subjective Questions</h3>
          {exam.subjective?.map((q, i) => (
            <p key={i}>{i + 1}. {q.question}</p>
          ))}

          <h3>Practical Questions</h3>
          {exam.practical?.map((p, i) => (
            <div key={i}>
              <img src={p.figureUrl} alt={`Figure ${i + 1}`} />
              {p.questions.map((q, j) => (
                <p key={j}>{i + 1}.{j + 1} {q}</p>
              ))}
            </div>
          ))}

          {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" download className="download-btn">Download JSON</a>}
        </div>
      )}
    </div>
  );
};

export default ExamGenerator;
