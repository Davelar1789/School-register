import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronsUp, Download, GraduationCap, Pencil, Plus, Search, Trash2,
} from "lucide-react";
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

const BLANK = { name: "", class: "", dob: "", gender: "male", phone: "", address: "" };
const today = () => new Date().toISOString().slice(0, 10);

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Enter the student's full name";
  else if (f.name.trim().length < 2) e.name = "Name is too short";
  if (!f.class) e.class = "Choose a class";
  if (!f.dob) e.dob = "Enter the date of birth";
  else if (f.dob > today()) e.dob = "Date of birth can't be in the future";
  if (f.phone && !/^[0-9+()\-\s]{7,20}$/.test(f.phone.trim())) e.phone = "Enter a valid phone number";
  return e;
}

const className = (s) => s.classes?.[0]?.className || "Unassigned";

export default function Students() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const decoded = useMemo(() => decodeToken(), []);
  const schoolId = decoded?.schoolId;

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState(params.get("q") || "");
  const q = useDebounce(search, 200);
  const [classFilter, setClassFilter] = useState("");
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null); // student | "new" | null
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [{ data: list }, school] = await Promise.all([
        api.get("/api/student"),
        JSON.parse(localStorage.getItem("schoolData") || "null") || fetchSchoolData(),
      ]);
      setStudents(Array.isArray(list) ? list : []);
      const sid = school?._id;
      if (sid) {
        const { data: cls } = await api.get(`/api/classes/school/${sid}`);
        setClasses(Array.isArray(cls) ? cls : []);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Couldn't load students");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, classFilter, pageSize]);

  /* keep ?q= in the URL so the top-bar search and back button work */
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = students.filter((s) => {
      const hit = !term || s.name?.toLowerCase().includes(term) || s.idno?.toLowerCase().includes(term);
      const cls = !classFilter || s.classes?.[0]?._id === classFilter;
      return hit && cls;
    });
    const val = { name: (s) => s.name?.toLowerCase(), class: (s) => className(s).toLowerCase(), idno: (s) => s.idno, dob: (s) => s.dob || "" };
    const get = val[sort.key] || val.name;
    list.sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0) * (sort.dir === "asc" ? 1 : -1));
    return list;
  }, [students, q, classFilter, sort]);

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const SortIcon = ({ k }) => (sort.key !== k ? <ArrowUpDown size={13} opacity={.4} /> : sort.dir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />);
  const Th = ({ k, children }) => (
    <th aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="sort-btn" onClick={() => toggleSort(k)}>{children} <SortIcon k={k} /></button>
    </th>
  );

  const openNew = () => { setForm({ ...BLANK, class: classFilter }); setErrors({}); setEditing("new"); };
  const openEdit = (s) => {
    setForm({
      name: s.name || "", class: s.classes?.[0]?._id || "", dob: (s.dob || "").slice(0, 10),
      gender: s.gender || "male", phone: s.phone || "", address: s.address || "",
    });
    setErrors({}); setEditing(s);
  };
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      if (editing === "new") {
        const { data: created } = await api.post("/api/student", {
          name: form.name.trim(), dob: form.dob, gender: form.gender, phone: form.phone.trim(), address: form.address.trim(),
          schoolId, classes: [form.class],
        });
        await api.post("/api/classes/assign-student", { studentId: created._id, classId: form.class });
        toast.success(`${form.name.trim()} was admitted`);
        fetchSchoolData();
      } else {
        await api.put(`/api/student/${editing._id}`, {
          name: form.name.trim(), dob: form.dob, gender: form.gender, phone: form.phone.trim(), address: form.address.trim(),
          schoolId, class: form.class, classes: [form.class],
        });
        toast.success("Student updated");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save the student");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/student/${toDelete._id}`);
      setStudents((p) => p.filter((s) => s._id !== toDelete._id));
      toast.success("Student removed");
      fetchSchoolData();
      setToDelete(null);
    } catch { toast.error("Couldn't delete the student"); } finally { setBusy(false); }
  };

  const promote = async () => {
    if (!schoolId) { toast.error("School not found — sign in again"); return; }
    setBusy(true);
    try {
      await api.post(`/api/student/students/promote/${schoolId}`);
      toast.success("All students were promoted");
      setPromoteOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Promotion failed");
    } finally { setBusy(false); }
  };

  const exportCsv = () => {
    downloadCSV(`students-${today()}.csv`, rows, [
      { label: "ID", key: "idno" }, { label: "Name", key: "name" },
      { label: "Class", get: className }, { label: "Gender", key: "gender" },
      { label: "Date of birth", key: "dob" }, { label: "Phone", key: "phone" }, { label: "Address", key: "address" },
    ]);
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Students & Teachers", to: "/students-teachers" }, { label: "Students" }]}
        title="Students"
        subtitle={loading ? "Loading records…" : `${students.length} enrolled across ${classes.length} classes`}
        actions={(
          <>
            <button className="btn btn-outline" onClick={() => setPromoteOpen(true)} disabled={!students.length}><ChevronsUp size={16} /> Promote all</button>
            <button className="btn btn-outline" onClick={exportCsv} disabled={!rows.length}><Download size={16} /> Export</button>
            <button className="btn" onClick={openNew}><Plus size={16} /> Add student</button>
          </>
        )}
      />

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input className="input" placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
        </div>
        <select className="select" style={{ width: "auto", minWidth: 190 }} value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label="Filter by class">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </select>
        {(search || classFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setClassFilter(""); }}>Clear filters</button>
        )}
      </div>

      {loading ? <TableSkeleton rows={8} cols={5} /> : error ? (
        <div className="card"><EmptyState emoji="📡" title="We couldn't reach the server" action={<button className="btn" onClick={load}>Try again</button>}>Check your connection and try again.</EmptyState></div>
      ) : rows.length === 0 ? (
        <div className="card">
          <EmptyState emoji="🎓" title={students.length ? "No students match your filters" : "No students yet"}
            action={!students.length && <button className="btn" onClick={openNew}><Plus size={16} /> Admit the first student</button>}>
            {students.length ? "Try a different name, ID or class." : "Admit your first student to start tracking attendance, fees and grades."}
          </EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <Th k="name">Student</Th><Th k="class">Class</Th><Th k="idno">ID</Th><Th k="dob">Date of birth</Th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s._id} className="row-link" onClick={() => navigate(`/student/${s._id}`)}>
                  <td>
                    <div className="cell-person">
                      <span className="avatar">{initials(s.name)}</span>
                      <div><strong>{s.name}</strong><small style={{ textTransform: "capitalize" }}>{s.gender}</small></div>
                    </div>
                  </td>
                  <td><span className={`badge-pill ${s.classes?.length ? "" : "gray"}`}>{className(s)}</span></td>
                  <td><code>{s.idno}</code></td>
                  <td>{s.dob ? new Date(s.dob).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <span className="icon-actions">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`} title="Edit"><Pencil size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--danger)" }} onClick={() => setToDelete(s)} aria-label={`Delete ${s.name}`} title="Delete"><Trash2 size={16} /></button>
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
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Admit a student" : "Edit student"}
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="student-form" className="btn" disabled={saving}>{saving ? "Saving…" : editing === "new" ? "Admit student" : "Save changes"}</button>
          </>
        )}
      >
        <form id="student-form" onSubmit={save} noValidate>
          <div className="field">
            <label htmlFor="st-name">Full name *</label>
            <input id="st-name" className={`input ${errors.name ? "is-invalid" : ""}`} value={form.name} onChange={set("name")} autoComplete="off" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="st-class">Class *</label>
              <select id="st-class" className={`select ${errors.class ? "is-invalid" : ""}`} value={form.class} onChange={set("class")}>
                <option value="">Select class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
              </select>
              {errors.class && <span className="error">{errors.class}</span>}
            </div>
            <div className="field">
              <label htmlFor="st-gender">Gender</label>
              <select id="st-gender" className="select" value={form.gender} onChange={set("gender")}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="st-dob">Date of birth *</label>
              <input id="st-dob" type="date" max={today()} className={`input ${errors.dob ? "is-invalid" : ""}`} value={form.dob} onChange={set("dob")} />
              {errors.dob && <span className="error">{errors.dob}</span>}
            </div>
            <div className="field">
              <label htmlFor="st-phone">Guardian phone</label>
              <input id="st-phone" type="tel" className={`input ${errors.phone ? "is-invalid" : ""}`} value={form.phone} onChange={set("phone")} placeholder="Optional" />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="st-address">Address</label>
            <input id="st-address" className="input" value={form.address} onChange={set("address")} placeholder="Optional" />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete} danger busy={busy} title="Delete student?"
        message={toDelete ? `${toDelete.name} and all of their records (attendance, fees, grades) will be permanently removed.` : ""}
        confirmLabel="Delete student" onConfirm={remove} onCancel={() => setToDelete(null)}
      />
      <ConfirmDialog
        open={promoteOpen} busy={busy} title="Promote every student?"
        message="This moves every student to the next class and cannot be undone. Only do this at the end of the academic year."
        confirmLabel="Yes, promote all" onConfirm={promote} onCancel={() => setPromoteOpen(false)}
      />
    </div>
  );
}
