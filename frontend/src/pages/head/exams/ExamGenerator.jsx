import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Download, Printer, Sparkles, Wand2 } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import "./ExamGenerator.css";

const TYPES = [
  ["objective only", "Objective only"],
  ["subjective only", "Subjective only"],
  ["objective and subjective", "Objective + Subjective"],
  ["objective, practicals and subjective", "Objective + Practical + Subjective"],
];
const LEVELS = [["beginner", "Beginner"], ["easy", "Easy"], ["hard", "Hard"], ["difficult", "Difficult"]];

export default function ExamGenerator() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [form, setForm] = useState({ classId: "", subjectId: "", term: "Term 1", examType: "objective only", level: "beginner", numObjective: 10, numSubjective: 5, numPractical: 2 });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!schoolId) return;
    Promise.all([api.get(`/api/classes/school/${schoolId}`), api.get(`/api/subjects/school/${schoolId}`)])
      .then(([c, s]) => { setClasses(Array.isArray(c.data) ? c.data : []); setSubjects(Array.isArray(s.data) ? s.data : []); })
      .catch(() => toast.error("Couldn't load classes and subjects"));
  }, [schoolId]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "classId" ? { subjectId: "" } : {}) })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const subjectOptions = subjects.filter((s) => !form.classId || (s.classes || []).some((c) => (c._id || c) === form.classId));
  const has = (w) => form.examType.includes(w);

  const generate = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.classId) v.classId = "Choose a class";
    if (!form.subjectId) v.subjectId = "Choose a subject";
    if (has("objective") && !(Number(form.numObjective) > 0)) v.numObjective = "At least 1";
    if (has("subjective") && !(Number(form.numSubjective) > 0)) v.numSubjective = "At least 1";
    if (has("practical") && !(Number(form.numPractical) > 0)) v.numPractical = "At least 1";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true); setResult(null);
    try {
      const body = { ...form, numObjective: has("objective") ? Number(form.numObjective) : 0, numSubjective: has("subjective") ? Number(form.numSubjective) : 0, numPractical: has("practical") ? Number(form.numPractical) : 0 };
      const { data } = await api.post("/api/exams/generate", body);
      setResult({ ...data, subject: subjects.find((s) => s._id === form.subjectId)?.name, cls: classes.find((c) => c._id === form.classId)?.className });
      toast.success("Exam generated");
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Generation failed — try again");
    } finally { setBusy(false); }
  };

  const fileHref = result?.fileUrl ? `${api.defaults.baseURL}${result.fileUrl}` : null;
  const exam = result?.exam;

  return (
    <div className="page">
      <PageHeader title="Exam generator" subtitle="Draft exam questions from the topics you've added for a class and term."
        actions={<span className="badge-pill purple"><Sparkles size={13} /> AI assisted</span>} />
      <div className="exg">
        <form className="card exg-form" onSubmit={generate} noValidate>
          <div className="field"><label htmlFor="x-class">Class *</label>
            <select id="x-class" className={`select ${errors.classId ? "is-invalid" : ""}`} value={form.classId} onChange={set("classId")}><option value="">Select class</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}</select>
            {errors.classId && <span className="error">{errors.classId}</span>}</div>
          <div className="field"><label htmlFor="x-sub">Subject *</label>
            <select id="x-sub" className={`select ${errors.subjectId ? "is-invalid" : ""}`} value={form.subjectId} onChange={set("subjectId")}><option value="">{form.classId && !subjectOptions.length ? "No subjects in this class" : "Select subject"}</option>{subjectOptions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
            {errors.subjectId && <span className="error">{errors.subjectId}</span>}</div>
          <div className="form-grid">
            <div className="field"><label htmlFor="x-term">Term</label><select id="x-term" className="select" value={form.term} onChange={set("term")}>{["Term 1", "Term 2", "Term 3"].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label htmlFor="x-level">Difficulty</label><select id="x-level" className="select" value={form.level} onChange={set("level")}>{LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          </div>
          <div className="field"><label htmlFor="x-type">Exam type</label><select id="x-type" className="select" value={form.examType} onChange={set("examType")}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="form-grid">
            {has("objective") && <div className="field"><label htmlFor="x-o">Objective</label><input id="x-o" type="number" min="1" max="50" className={`input ${errors.numObjective ? "is-invalid" : ""}`} value={form.numObjective} onChange={set("numObjective")} />{errors.numObjective && <span className="error">{errors.numObjective}</span>}</div>}
            {has("subjective") && <div className="field"><label htmlFor="x-s">Subjective</label><input id="x-s" type="number" min="1" max="50" className={`input ${errors.numSubjective ? "is-invalid" : ""}`} value={form.numSubjective} onChange={set("numSubjective")} />{errors.numSubjective && <span className="error">{errors.numSubjective}</span>}</div>}
            {has("practical") && <div className="field"><label htmlFor="x-p">Practical</label><input id="x-p" type="number" min="1" max="50" className={`input ${errors.numPractical ? "is-invalid" : ""}`} value={form.numPractical} onChange={set("numPractical")} />{errors.numPractical && <span className="error">{errors.numPractical}</span>}</div>}
          </div>
          <button className="btn btn-lg btn-block" disabled={busy}><Wand2 size={18} /> {busy ? "Writing your exam…" : "Generate exam"}</button>
          {busy && <p className="muted" style={{ margin: 0, fontSize: ".84rem" }}>This usually takes under a minute. Please keep this page open.</p>}
        </form>

        <section className="exg-out">
          {!exam && !busy && <div className="card exg-empty"><span>📝</span><h3>Your exam will appear here</h3><p>Pick a class and subject, then press Generate. Questions are based on the topics you entered for that term.</p></div>}
          {busy && <div className="card exg-empty"><span className="spinner spinner-lg" /><h3>Thinking up questions…</h3></div>}
          {exam && (
            <article className="card exg-paper">
              <header className="no-print">
                <div><h2>{result.subject} · {result.cls}</h2><small className="muted">{form.term} · {form.level} · generated in {result.timeTaken}s</small></div>
                <div className="row"><button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={15} /> Print</button>
                  {fileHref && <a className="btn btn-outline btn-sm" href={fileHref} target="_blank" rel="noopener noreferrer" download><Download size={15} /> JSON</a>}</div>
              </header>
              <h1 className="exg-title print-only-title">{result.subject} — {form.term} Examination ({result.cls})</h1>
              {exam.objective?.length > 0 && <><h3>Section A · Objective</h3><ol>{exam.objective.map((q, i) => (
                <li key={i}><p>{q.question}</p><ul className="exg-opts">{(q.options || []).map((o, j) => <li key={j}><b>{String.fromCharCode(65 + j)}.</b> {o}</li>)}</ul></li>))}</ol></>}
              {exam.subjective?.length > 0 && <><h3>Section B · Subjective</h3><ol>{exam.subjective.map((q, i) => <li key={i}><p>{q.question}</p></li>)}</ol></>}
              {exam.practical?.length > 0 && <><h3>Section C · Practical</h3>{exam.practical.map((p, i) => (
                <div key={i} className="exg-fig">{p.figureUrl && <img src={p.figureUrl} alt={`Figure ${i + 1}`} />}<ol>{(p.questions || []).map((q, j) => <li key={j}><p>{q}</p></li>)}</ol></div>))}</>}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
