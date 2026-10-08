import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Mail, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import api from "../../../api/axios";
import fetchSchoolData from "../../../utils/fetchSchoolData";
import { downloadCSV } from "../../../utils/csv";
import { decodeToken, initials } from "../../../utils/auth";
import useDebounce from "../../../hooks/useDebounce";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import { TableSkeleton } from "../../../components/ui/Loading";

const STATUSES = ["Active", "On Leave", "Retired"];
const TYPES = ["Class Teacher", "Subject Teacher", "Both"];
const TYPE_LABEL = { "Class Teacher": "Class teacher", "Subject Teacher": "Subject teacher", Both: "Class & subject" };
const STATUS_TONE = { Active: "green", "On Leave": "amber", Retired: "gray" };
const today = () => new Date().toISOString().slice(0, 10);
const BLANK = { name: "", gender: "", phone: "", email: "", teacherType: "", joinedDate: today(), status: "Active" };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Enter the teacher's full name";
  if (!f.gender) e.gender = "Choose a gender";
  if (!f.phone.trim()) e.phone = "Enter a phone number";
  else if (!/^[0-9+()\-\s]{7,20}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number";
  if (!f.email.trim()) e.email = "Email is needed so the teacher can sign in";
  else if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email address";
  if (!f.teacherType) e.teacherType = "Choose what this teacher does";
  if (!f.joinedDate) e.joinedDate = "Enter the date joined";
  return e;
}

export default function Teachers() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const schoolId = useMemo(() => decodeToken()?.schoolId, []);

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState(params.get("q") || "");
  const q = useDebounce(search, 200);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [editing, setEditing] = useState(null); // teacher | "new" | null
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) { setLoading(false); setError(true); return; }
    setLoading(true); setError(false);
    try {
      const { data } = await api.get(`/api/teachers/school/${schoolId}`);
      setTeachers(Array.isArray(data) ? data : []);
    } catch { setError(true); toast.error("Couldn't load teachers"); } finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, status, pageSize]);
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = teachers.filter((t) =>
      (!term || `${t.name} ${t.staffId} ${t.email || ""}`.toLowerCase().includes(term)) && (!status || t.status === status));
    const val = { name: (t) => t.name?.toLowerCase(), staffId: (t) => t.staffId, joined: (t) => t.joinedDate || "", status: (t) => t.status };
    const get = val[sort.key] || val.name;
    list.sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0) * (sort.dir === "asc" ? 1 : -1));
    return list;
  }, [teachers, q, status, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const Th = ({ k, children }) => (
    <th aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="sort-btn" onClick={() => toggleSort(k)}>
        {children} {sort.key !== k ? <ArrowUpDown size={13} opacity={.4} /> : sort.dir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
      </button>
    </th>
  );

  const openNew = () => { setForm({ ...BLANK, joinedDate: today() }); setErrors({}); setEditing("new"); };
  const openEdit = (t) => {
    setForm({
      name: t.name || "", gender: t.gender || "", phone: t.phone || "", email: t.email || "",
      teacherType: t.teacherType || "", joinedDate: (t.joinedDate || "").slice(0, 10), status: t.status || "Active",
    });
    setErrors({}); setEditing(t);
  };
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const body = { ...form, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim().toLowerCase() };
      if (editing === "new") {
        await api.post("/api/teachers", { ...body, schoolId });
        toast.success(`${body.name} was added. They can now set up their account.`);
        fetchSchoolData();
      } else {
        await api.put(`/api/teachers/${editing._id}`, body);
        toast.success("Teacher updated");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save the teacher");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(`/api/teachers/${toDelete._id}`);
      setTeachers((p) => p.filter((t) => t._id !== toDelete._id));
      toast.success("Teacher removed");
      fetchSchoolData();
      setToDelete(null);
    } catch { toast.error("Couldn't delete the teacher"); } finally { setSaving(false); }
  };

  const exportCsv = () => downloadCSV(`teachers-${today()}.csv`, rows, [
    { label: "Staff ID", key: "staffId" }, { label: "Name", key: "name" }, { label: "Type", key: "teacherType" },
    { label: "Phone", key: "phone" }, { label: "Email", key: "email" }, { label: "Status", key: "status" },
    { label: "Joined", get: (t) => (t.joinedDate ? t.joinedDate.slice(0, 10) : "") },
  ]);

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const active = teachers.filter((t) => t.status === "Active").length;

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Students & Teachers", to: "/students-teachers" }, { label: "Teachers" }]}
        title="Teachers"
        subtitle={loading ? "Loading staff…" : `${teachers.length} staff · ${active} active`}
        actions={(
          <>
            <button className="btn btn-outline" onClick={exportCsv} disabled={!rows.length}><Download size={16} /> Export</button>
            <button className="btn" onClick={openNew}><Plus size={16} /> Add teacher</button>
          </>
        )}
      />

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input className="input" placeholder="Search by name, staff ID or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search teachers" />
        </div>
        <select className="select" style={{ width: "auto", minWidth: 170 }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(search || status) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</button>}
      </div>

      {loading ? <TableSkeleton rows={7} cols={5} /> : error ? (
        <div className="card"><EmptyState emoji="📡" title="We couldn't load your teachers" action={<button className="btn" onClick={load}>Try again</button>}>Check your connection and try again.</EmptyState></div>
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState emoji="👩‍🏫" title={teachers.length ? "No teachers match your filters" : "No teachers yet"}
          action={!teachers.length && <button className="btn" onClick={openNew}><Plus size={16} /> Add your first teacher</button>}>
          {teachers.length ? "Try a different name or status." : "Add teachers so they can mark attendance and enter grades."}</EmptyState></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><Th k="name">Teacher</Th><Th k="staffId">Staff ID</Th><th>Contact</th><Th k="joined">Joined</Th><Th k="status">Status</Th><th className="actions">Actions</th></tr></thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t._id} className="row-link" onClick={() => navigate(`/teachers/${t._id}`)}>
                  <td><div className="cell-person"><span className="avatar" style={{ background: "var(--purple-light)", color: "var(--purple)" }}>{initials(t.name)}</span>
                    <div><Link to={`/teachers/${t._id}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none" }}><strong>{t.name}</strong></Link><small>{TYPE_LABEL[t.teacherType] || t.teacherType}</small></div></div></td>
                  <td><code>{t.staffId}</code></td>
                  <td><div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: ".85rem" }}>
                    <span className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Phone size={13} />{t.phone || "—"}</span>
                    <span className="muted" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Mail size={13} />{t.email || "—"}</span></div></td>
                  <td>{t.joinedDate ? new Date(t.joinedDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                  <td><span className={`badge-pill ${STATUS_TONE[t.status] || "gray"}`}>{t.status}</span></td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <span className="icon-actions">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)} aria-label={`Edit ${t.name}`} title="Edit"><Pencil size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--danger)" }} onClick={() => setToDelete(t)} aria-label={`Delete ${t.name}`} title="Delete"><Trash2 size={16} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={setPageSize} />
        </div>
      )}

      <Modal
        open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add a teacher" : "Edit teacher"}
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
          <button type="submit" form="teacher-form" className="btn" disabled={saving}>{saving ? "Saving…" : editing === "new" ? "Add teacher" : "Save changes"}</button></>)}
      >
        <form id="teacher-form" onSubmit={save} noValidate>
          <div className="field"><label htmlFor="t-name">Full name *</label>
            <input id="t-name" className={`input ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={set("name")} />{errors.name && <span className="error">{errors.name}</span>}</div>
          <div className="form-grid">
            <div className="field"><label htmlFor="t-gender">Gender *</label>
              <select id="t-gender" className={`select ${errors.gender ? "is-invalid" : ""}`} value={form.gender} onChange={set("gender")}>
                <option value="">Select</option><option>Male</option><option>Female</option></select>{errors.gender && <span className="error">{errors.gender}</span>}</div>
            <div className="field"><label htmlFor="t-phone">Phone *</label>
              <input id="t-phone" type="tel" className={`input ${errors.phone ? "is-invalid" : ""}`} value={form.phone} onChange={set("phone")} />{errors.phone && <span className="error">{errors.phone}</span>}</div>
            <div className="field"><label htmlFor="t-email">Email *</label>
              <input id="t-email" type="email" className={`input ${errors.email ? "is-invalid" : ""}`} value={form.email} onChange={set("email")} />{errors.email && <span className="error">{errors.email}</span>}</div>
            <div className="field"><label htmlFor="t-type">Role *</label>
              <select id="t-type" className={`select ${errors.teacherType ? "is-invalid" : ""}`} value={form.teacherType} onChange={set("teacherType")}>
                <option value="">Select</option>{TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</select>{errors.teacherType && <span className="error">{errors.teacherType}</span>}</div>
            <div className="field"><label htmlFor="t-joined">Date joined *</label>
              <input id="t-joined" type="date" className={`input ${errors.joinedDate ? "is-invalid" : ""}`} value={form.joinedDate} onChange={set("joinedDate")} />{errors.joinedDate && <span className="error">{errors.joinedDate}</span>}</div>
            <div className="field"><label htmlFor="t-status">Status</label>
              <select id="t-status" className="select" value={form.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
          {editing === "new" && <p className="alert info" style={{ margin: 0 }}>A staff ID is generated automatically. The teacher signs in with their email and sets a password on first login.</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete} danger busy={saving} title="Remove teacher?"
        message={toDelete ? `${toDelete.name} will lose access immediately. Their class and subject assignments will be removed.` : ""}
        confirmLabel="Remove teacher" onConfirm={remove} onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
