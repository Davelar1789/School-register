import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FileText, Lock, LockOpen, Plus, Trash2, UploadCloud } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import "./AdminMarkingSchemes.css";

const TERMS = ["First Term", "Second Term", "Third Term"];
const MAX_MB = 15;
const BLANK = { classId: "", subjectId: "", term: "First Term", academicYear: "", title: "", availableFrom: "" };

export default function AdminMarkingSchemes() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [schemes, setSchemes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/marking-schemes/admin");
      setSchemes(Array.isArray(data?.schemes) ? data.schemes : []);
    } catch { toast.error("Couldn't load marking schemes"); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    if (!schoolId) return;
    Promise.all([
      api.get(`/api/classes/school/${schoolId}`), api.get(`/api/subjects/school/${schoolId}`), api.get(`/api/terms/years/${schoolId}`),
    ]).then(([c, s, y]) => {
      setClasses(Array.isArray(c.data) ? c.data : []);
      setSubjects(Array.isArray(s.data) ? s.data : []);
      setYears((Array.isArray(y.data) ? y.data : []).sort().reverse());
    }).catch(() => toast.error("Couldn't load classes and subjects"));
  }, [load, schoolId]);

  const subjectOptions = subjects.filter((s) => !form.classId || (s.classes || []).some((c) => (c._id || c) === form.classId));

  const openNew = () => { setForm({ ...BLANK, academicYear: years[0] || "" }); setFile(null); setErrors({}); setOpen(true); };
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "classId" ? { subjectId: "" } : {}) })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const pickFile = (f) => {
    if (!f) return;
    if (!/\.(pdf|docx?)$/i.test(f.name)) { toast.error("Upload a PDF or Word file"); return; }
    if (f.size > MAX_MB * 1024 * 1024) { toast.error(`Files can be at most ${MAX_MB} MB`); return; }
    setFile(f); setErrors((x) => ({ ...x, file: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.classId) v.classId = "Choose a class";
    if (!form.subjectId) v.subjectId = "Choose a subject";
    if (!form.academicYear.trim()) v.academicYear = "Enter the academic year";
    if (!form.availableFrom) v.availableFrom = "Choose when teachers can open it";
    if (!file) v.file = "Attach the marking scheme";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, val]) => fd.append(k, k === "availableFrom" ? new Date(val).toISOString() : val));
      fd.append("file", file);
      await api.post("/api/marking-schemes/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Marking scheme uploaded");
      setOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed"); } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try { await api.delete(`/api/marking-schemes/admin/${toDelete._id}`); toast.success("Marking scheme deleted"); setToDelete(null); load(); }
    catch { toast.error("Couldn't delete it"); } finally { setSaving(false); }
  };

  const now = Date.now();

  return (
    <div className="page page-narrow">
      <PageHeader title="Marking schemes" subtitle="Upload schemes and choose exactly when teachers can open them."
        actions={<button className="btn" onClick={openNew} disabled={!classes.length}><Plus size={16} /> Upload scheme</button>} />

      {loading ? <Loading /> : schemes.length === 0 ? (
        <div className="card"><EmptyState emoji="📝" title="No marking schemes yet" action={classes.length > 0 && <button className="btn" onClick={openNew}><UploadCloud size={16} /> Upload the first one</button>}>
          {classes.length ? "Schemes stay locked until the date you set, so exams stay fair." : "Create classes and subjects first."}</EmptyState></div>
      ) : (
        <div className="ams-list">
          {schemes.map((s) => {
            const unlocked = new Date(s.availableFrom).getTime() <= now;
            return (
              <article key={s._id} className="card ams-item">
                <span className={`ams-ico ${unlocked ? "open" : ""}`}><FileText size={20} /></span>
                <div className="ams-info">
                  <strong>{s.title}</strong>
                  <small>{s.class?.className || "—"} · {s.subject?.name || "—"} · {s.term} · {s.academicYear}</small>
                  <span className={`badge-pill ${unlocked ? "green" : "amber"}`}>{unlocked ? <LockOpen size={12} /> : <Lock size={12} />}
                    {unlocked ? "Open to teachers" : `Unlocks ${new Date(s.availableFrom).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`}</span>
                </div>
                <div className="icon-actions">
                  <a className="btn btn-outline btn-sm" href={s.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--danger)" }} onClick={() => setToDelete(s)} aria-label={`Delete ${s.title}`}><Trash2 size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} size="lg" title="Upload a marking scheme"
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button><button type="submit" form="ams-form" className="btn" disabled={saving}>{saving ? "Uploading…" : "Upload"}</button></>)}>
        <form id="ams-form" onSubmit={save} noValidate>
          <div className="form-grid">
            <div className="field"><label htmlFor="a-class">Class *</label><select id="a-class" className={`select ${errors.classId ? "is-invalid" : ""}`} value={form.classId} onChange={set("classId")}><option value="">Select class</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}</select>{errors.classId && <span className="error">{errors.classId}</span>}</div>
            <div className="field"><label htmlFor="a-sub">Subject *</label><select id="a-sub" className={`select ${errors.subjectId ? "is-invalid" : ""}`} value={form.subjectId} onChange={set("subjectId")}><option value="">{form.classId && !subjectOptions.length ? "No subjects in this class" : "Select subject"}</option>{subjectOptions.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select>{errors.subjectId && <span className="error">{errors.subjectId}</span>}</div>
            <div className="field"><label htmlFor="a-term">Term</label><select id="a-term" className="select" value={form.term} onChange={set("term")}>{TERMS.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="field"><label htmlFor="a-year">Academic year *</label>
              {years.length ? <select id="a-year" className={`select ${errors.academicYear ? "is-invalid" : ""}`} value={form.academicYear} onChange={set("academicYear")}>{years.map((y) => <option key={y}>{y}</option>)}</select>
                : <input id="a-year" className={`input ${errors.academicYear ? "is-invalid" : ""}`} value={form.academicYear} onChange={set("academicYear")} placeholder="2025/2026" />}
              {errors.academicYear && <span className="error">{errors.academicYear}</span>}</div>
            <div className="field"><label htmlFor="a-title">Title <span className="muted">(optional)</span></label><input id="a-title" className="input" value={form.title} onChange={set("title")} placeholder="End of term exam" /></div>
            <div className="field"><label htmlFor="a-from">Unlocks at *</label><input id="a-from" type="datetime-local" className={`input ${errors.availableFrom ? "is-invalid" : ""}`} value={form.availableFrom} onChange={set("availableFrom")} />{errors.availableFrom && <span className="error">{errors.availableFrom}</span>}</div>
          </div>
          <label className={`ams-drop ${file ? "has" : ""} ${errors.file ? "bad" : ""}`}>
            <UploadCloud size={22} /><span>{file ? <><b>{file.name}</b> · {(file.size / 1024).toFixed(0)} KB</> : <>Click to attach a <b>PDF or Word</b> file (max {MAX_MB} MB)</>}</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => pickFile(e.target.files?.[0])} />
          </label>
          {errors.file && <span className="error" style={{ color: "var(--danger)", fontSize: ".8rem" }}>{errors.file}</span>}
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} danger busy={saving} title="Delete marking scheme?" message={toDelete ? `“${toDelete.title}” will be removed and teachers will lose access.` : ""} confirmLabel="Delete" onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
