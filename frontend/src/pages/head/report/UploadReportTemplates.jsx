import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FileText, Plus, Trash2, UploadCloud } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import "./UploadReportTemplates.css";

const MAX = 4;
const MAX_MB = 10;
const blank = () => ({ id: Math.random().toString(36).slice(2), file: null, classIds: [] });

export default function UploadReportTemplates() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [classes, setClasses] = useState([]);
  const [slots, setSlots] = useState([blank()]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!schoolId) return;
    api.get(`/api/classes/school/${schoolId}`).then(({ data }) => setClasses(Array.isArray(data) ? data : [])).catch(() => toast.error("Couldn't load classes"));
  }, [schoolId]);

  const update = (id, patch) => setSlots((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const takenElsewhere = (id) => new Set(slots.filter((s) => s.id !== id).flatMap((s) => s.classIds));

  const chooseFile = (id, file) => {
    if (!file) return;
    if (!/\.docx$/i.test(file.name)) { toast.error("Templates must be Word (.docx) files"); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`That file is larger than ${MAX_MB} MB`); return; }
    update(id, { file });
    setErrors((e) => ({ ...e, [id]: undefined }));
  };

  const toggle = (slot, classId) =>
    update(slot.id, { classIds: slot.classIds.includes(classId) ? slot.classIds.filter((c) => c !== classId) : [...slot.classIds, classId] });

  const submit = async () => {
    const e = {};
    slots.forEach((s, i) => { if (!s.file || !s.classIds.length) e[s.id] = `Template ${i + 1} needs a .docx file and at least one class`; });
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    let done = 0;
    try {
      for (const s of slots) {
        const fd = new FormData();
        fd.append("file", s.file);
        fd.append("schoolId", schoolId);
        fd.append("classIds", JSON.stringify(s.classIds));
        await api.post("/api/report-template/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        done += 1;
      }
      toast.success(`${done} template${done === 1 ? "" : "s"} uploaded`);
      setSlots([blank()]);
    } catch (err) {
      toast.error(done ? `Uploaded ${done}, then something failed` : err.response?.data?.message || "Upload failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="page page-narrow">
      <PageHeader crumbs={[{ label: "Report cards", to: "/view-reports" }, { label: "Templates" }]} title="Report card templates"
        subtitle="Upload a Word template per group of classes — each class uses exactly one template." />

      <div className="tpl-list">
        {slots.map((slot, i) => {
          const taken = takenElsewhere(slot.id);
          return (
            <section className="card tpl" key={slot.id}>
              <div className="card-head"><h3>Template {i + 1}</h3>
                {slots.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setSlots((s) => s.filter((x) => x.id !== slot.id))}><Trash2 size={15} /> Remove</button>}</div>

              <label className={`tpl-drop ${slot.file ? "has" : ""}`}>
                <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => chooseFile(slot.id, e.target.files?.[0])} />
                {slot.file ? (<><FileText size={26} /><span><b>{slot.file.name}</b><small>{(slot.file.size / 1024).toFixed(0)} KB · click to replace</small></span></>)
                  : (<><UploadCloud size={26} /><span><b>Choose a .docx file</b><small>Max {MAX_MB} MB</small></span></>)}
              </label>

              <div className="field" style={{ marginTop: "1rem" }}>
                <label>Classes that use this template</label>
                <div className="row" role="group">
                  {classes.map((c) => {
                    const disabled = taken.has(c._id);
                    return (
                      <label key={c._id} className={`tab ${slot.classIds.includes(c._id) ? "active" : ""}`} style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .45 : 1, border: "1.5px solid var(--border-strong)", display: "inline-flex", gap: 8, alignItems: "center" }} title={disabled ? "Already used by another template" : ""}>
                        <input type="checkbox" disabled={disabled} checked={slot.classIds.includes(c._id)} onChange={() => toggle(slot, c._id)} />{c.className}</label>);
                  })}
                  {!classes.length && <span className="muted">Create classes first.</span>}
                </div>
              </div>
              {errors[slot.id] && <p className="alert error" role="alert" style={{ marginTop: ".8rem" }}>{errors[slot.id]}</p>}
            </section>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: "1.2rem" }}>
        {slots.length < MAX && <button className="btn btn-outline" onClick={() => setSlots((s) => [...s, blank()])}><Plus size={16} /> Add another template</button>}
        <button className="btn btn-lg" onClick={submit} disabled={busy}><UploadCloud size={18} /> {busy ? "Uploading…" : `Upload ${slots.length > 1 ? "templates" : "template"}`}</button>
      </div>
    </div>
  );
}
