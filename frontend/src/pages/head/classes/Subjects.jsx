import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import { TableSkeleton } from "../../../components/ui/Loading";
import { decodeToken } from "../../../utils/auth";

export default function Subjects() {
  const schoolId = useMemo(() => decodeToken()?.schoolId, []);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "new" | subject | null
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    try {
      const [s, c] = await Promise.all([api.get(`/api/subjects/school/${schoolId}`), api.get(`/api/classes/school/${schoolId}`)]);
      setSubjects(Array.isArray(s.data) ? s.data : []);
      setClasses(Array.isArray(c.data) ? c.data : []);
    } catch { toast.error("Couldn't load subjects"); } finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);

  const classNameOf = (c) => (typeof c === "string" ? classes.find((x) => x._id === c)?.className : c.className || classes.find((x) => x._id === c._id)?.className);
  const classId = (c) => (typeof c === "string" ? c : c._id);
  const rows = subjects.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()));

  const openNew = () => { setName(""); setSelected([]); setErrors({}); setModal("new"); };
  const openEdit = (s) => { setName(s.name); setSelected((s.classes || []).map(classId)); setErrors({}); setModal(s); };
  const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = async (e) => {
    e.preventDefault();
    const v = {};
    if (!name.trim()) v.name = "Enter a subject name";
    if (!selected.length) v.classes = "Select at least one class";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const payload = { name: name.trim(), school: schoolId, classes: selected };
      if (modal === "new") { await api.post("/api/subjects", payload); toast.success("Subject created"); }
      else { await api.patch(`/api/subjects/${modal._id}`, payload); toast.success("Subject updated"); }
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't save the subject"); } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try { await api.delete(`/api/subjects/${toDelete._id}`); toast.success("Subject deleted"); setToDelete(null); load(); }
    catch { toast.error("Couldn't delete the subject"); } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Classes & Subjects", to: "/classes-main" }, { label: "Subjects" }]}
        title="Subjects" subtitle={loading ? "Loading…" : `${subjects.length} subject${subjects.length === 1 ? "" : "s"} taught`}
        actions={<button className="btn" onClick={openNew} disabled={!classes.length}><Plus size={16} /> Add subject</button>}
      />
      {!loading && !classes.length && <p className="alert warn" style={{ marginBottom: "1rem" }}>Create at least one class before adding subjects.</p>}

      {subjects.length > 6 && (
        <div className="toolbar"><div className="search-input-wrap"><Search size={16} />
          <input className="input" placeholder="Search subjects…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search subjects" /></div></div>
      )}

      {loading ? <TableSkeleton rows={6} cols={3} /> : rows.length === 0 ? (
        <div className="card"><EmptyState emoji="📘" title={subjects.length ? "No subjects match" : "No subjects yet"}
          action={!subjects.length && classes.length > 0 && <button className="btn" onClick={openNew}><Plus size={16} /> Add a subject</button>}>
          {subjects.length ? "Try a different search." : "Subjects are assigned to classes and teachers."}</EmptyState></div>
      ) : (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Subject</th><th>Taught in</th><th className="actions">Actions</th></tr></thead>
          <tbody>{rows.map((s) => (
            <tr key={s._id}>
              <td><strong>{s.name}</strong></td>
              <td><div className="row" style={{ gap: ".35rem" }}>{(s.classes || []).length
                ? s.classes.map((c) => <span key={classId(c)} className="badge-pill">{classNameOf(c) || "—"}</span>) : <span className="muted">No classes</span>}</div></td>
              <td className="actions"><span className="icon-actions">
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}><Pencil size={16} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--danger)" }} onClick={() => setToDelete(s)} aria-label={`Delete ${s.name}`}><Trash2 size={16} /></button></span></td>
            </tr>))}</tbody>
        </table></div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Add a subject" : "Edit subject"}
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
          <button type="submit" form="subject-form" className="btn" disabled={saving}>{saving ? "Saving…" : modal === "new" ? "Add subject" : "Save changes"}</button></>)}>
        <form id="subject-form" onSubmit={save} noValidate>
          <div className="field"><label htmlFor="sub-name">Subject name *</label>
            <input id="sub-name" className={`input ${errors.name ? "is-invalid" : ""}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Integrated Science" />
            {errors.name && <span className="error">{errors.name}</span>}</div>
          <div className="field"><label>Taught in *</label>
            <div className="row" style={{ marginBottom: ".4rem" }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(classes.map((c) => c._id))}>Select all</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
            </div>
            <div className="row" role="group" aria-label="Classes">{classes.map((c) => (
              <label key={c._id} className={`tab ${selected.includes(c._id) ? "active" : ""}`} style={{ cursor: "pointer", border: "1.5px solid var(--border-strong)", display: "inline-flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={selected.includes(c._id)} onChange={() => toggle(c._id)} />{c.className}</label>))}</div>
            {errors.classes && <span className="error">{errors.classes}</span>}</div>
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} danger busy={saving} title="Delete subject?"
        message={toDelete ? `“${toDelete.name}” will be removed from every class.` : ""} confirmLabel="Delete subject" onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
