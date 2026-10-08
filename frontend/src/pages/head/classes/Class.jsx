import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BookOpen, GraduationCap, Pencil, Plus, Presentation, Search, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import "./Class.css";

const LEVELS = [
  { value: "Creche", label: "Creche", numbers: [] },
  { value: "Nursery", label: "Nursery", numbers: [1, 2] },
  { value: "Kindergaten", label: "Kindergarten", numbers: [1, 2] },
  { value: "Primary", label: "Primary", numbers: [1, 2, 3, 4, 5, 6] },
  { value: "Junior High", label: "Junior High", numbers: [1, 2, 3] },
  { value: "Senior High", label: "Senior High", numbers: [1, 2, 3] },
];
const LEVEL_TONE = { Creche: "coral", Nursery: "amber", Kindergaten: "amber", Primary: "", "Junior High": "purple", "Senior High": "blue" };
const LEVEL_ORDER = LEVELS.map((l) => l.value);

export default function Classes() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "new" | class | null
  const [form, setForm] = useState({ level: "", number: "", description: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    try {
      const { data } = await api.get(`/api/classes/school/${schoolId}`);
      setClasses(Array.isArray(data) ? data : []);
    } catch { toast.error("Couldn't load classes"); } finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = classes.filter((c) => !term || c.className.toLowerCase().includes(term) || c.level.toLowerCase().includes(term));
    const by = {};
    list.forEach((c) => { (by[c.level] ||= []).push(c); });
    Object.values(by).forEach((g) => g.sort((a, b) => (a.number || 0) - (b.number || 0)));
    return LEVEL_ORDER.filter((l) => by[l]).map((l) => ({ level: l, items: by[l] }));
  }, [classes, search]);

  const level = LEVELS.find((l) => l.value === form.level);
  const openNew = () => { setForm({ level: "", number: "", description: "" }); setErrors({}); setModal("new"); };
  const openEdit = (c) => { setForm({ level: c.level, number: c.number || "", description: c.description || "" }); setErrors({}); setModal(c); };

  const save = async (e) => {
    e.preventDefault();
    const v = {};
    if (modal === "new") {
      if (!form.level) v.level = "Choose a level";
      else if (level.numbers.length && !form.number) v.number = "Choose the class number";
    }
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      if (modal === "new") {
        await api.post("/api/classes", { school: schoolId, level: form.level, number: form.number || undefined, description: form.description.trim() });
        toast.success("Class created");
      } else {
        await api.patch(`/api/classes/${modal._id}/details`, { description: form.description.trim() });
        toast.success("Class updated");
      }
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't save the class"); } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(`/api/classes/${toDelete._id}`);
      toast.success("Class deleted");
      setToDelete(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't delete the class"); } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Classes & Subjects", to: "/classes-main" }, { label: "Classes" }]}
        title="Classes"
        subtitle={loading ? "Loading…" : `${classes.length} class${classes.length === 1 ? "" : "es"} · ${classes.reduce((n, c) => n + (c.students?.length || 0), 0)} students enrolled`}
        actions={<button className="btn" onClick={openNew}><Plus size={16} /> Add class</button>}
      />

      {classes.length > 4 && (
        <div className="toolbar"><div className="search-input-wrap"><Search size={16} />
          <input className="input" placeholder="Search classes…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search classes" /></div></div>
      )}

      {loading ? <Loading label="Loading classes…" /> : classes.length === 0 ? (
        <div className="card"><EmptyState emoji="🏫" title="No classes yet" action={<button className="btn" onClick={openNew}><Plus size={16} /> Create your first class</button>}>
          Classes hold your students, teachers and subjects.</EmptyState></div>
      ) : groups.length === 0 ? (
        <div className="card"><EmptyState emoji="🔍" title="No classes match your search" /></div>
      ) : groups.map((g) => (
        <section key={g.level} className="cls-group">
          <h2 className="cls-group-title">{LEVELS.find((l) => l.value === g.level)?.label}<span className="badge-pill gray">{g.items.length}</span></h2>
          <div className="grid-cards">
            {g.items.map((c) => (
              <article key={c._id} className="card card-hover cls-card">
                <header>
                  <div><h3>{c.className}</h3><span className={`badge-pill ${LEVEL_TONE[c.level] || ""}`}>{c.level}</span></div>
                  <span className="icon-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)} aria-label={`Edit ${c.className}`} title="Edit"><Pencil size={16} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--danger)" }} onClick={() => setToDelete(c)} aria-label={`Delete ${c.className}`} title="Delete"><Trash2 size={16} /></button>
                  </span>
                </header>
                {c.description && c.description !== "New class adding..." && <p className="cls-desc">{c.description}</p>}
                <ul className="cls-stats">
                  <li><GraduationCap size={16} /><b>{c.students?.length || 0}</b> students</li>
                  <li><Presentation size={16} /><b>{c.teachers?.length || 0}</b> teacher{c.teachers?.length === 1 ? "" : "s"}</li>
                </ul>
                {c.teachers?.length > 0 && <p className="cls-teachers">{c.teachers.map((t) => t.name).join(", ")}</p>}
                <Link to={`/classes/${c._id}/subjects`} className="btn btn-secondary btn-sm btn-block"><BookOpen size={15} /> Subjects & topics</Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      <Modal
        open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Create a class" : `Edit ${modal?.className || ""}`}
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
          <button type="submit" form="class-form" className="btn" disabled={saving}>{saving ? "Saving…" : modal === "new" ? "Create class" : "Save"}</button></>)}
      >
        <form id="class-form" onSubmit={save} noValidate>
          {modal === "new" && (
            <div className="form-grid">
              <div className="field"><label htmlFor="c-level">Level *</label>
                <select id="c-level" className={`select ${errors.level ? "is-invalid" : ""}`} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value, number: "" })}>
                  <option value="">Select level</option>{LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</select>
                {errors.level && <span className="error">{errors.level}</span>}</div>
              {level?.numbers.length > 0 && (
                <div className="field"><label htmlFor="c-num">Class number *</label>
                  <select id="c-num" className={`select ${errors.number ? "is-invalid" : ""}`} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}>
                    <option value="">Select</option>{level.numbers.map((n) => <option key={n} value={n}>{n}</option>)}</select>
                  {errors.number && <span className="error">{errors.number}</span>}</div>
              )}
            </div>
          )}
          <div className="field"><label htmlFor="c-desc">Description <span className="muted">(optional)</span></label>
            <textarea id="c-desc" className="textarea" rows={3} value={form.description === "New class adding..." ? "" : form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          {modal === "new" && form.level && (
            <p className="alert info" style={{ margin: 0 }}>This class will be named <b>{form.level === "Creche" ? "Creche" : form.number ? `${{ Nursery: "Nursery", Kindergaten: "KG", Primary: "Basic", "Junior High": "JHS", "Senior High": "SHS" }[form.level]} ${form.number}` : "…"}</b>.</p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete} danger busy={saving} title="Delete class?"
        message={toDelete ? (toDelete.students?.length ? `${toDelete.className} still has ${toDelete.students.length} student(s). Move them to another class before deleting.` : `${toDelete.className} will be removed permanently.`) : ""}
        confirmLabel="Delete class" onConfirm={remove} onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
