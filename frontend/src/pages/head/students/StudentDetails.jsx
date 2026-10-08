import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CalendarDays, Hash, Home, Pencil, Phone, Printer, School, User, Wallet } from "lucide-react";
import api from "../../../api/axios";
import { initials } from "../../../utils/auth";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import "./StudentDetails.css";

const cedi = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "—");

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="sd-fact">
      <span className="sd-fact-ico"><Icon size={17} /></span>
      <div><small>{label}</small><strong>{value || "—"}</strong></div>
    </div>
  );
}

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);

  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    try {
      const [{ data }, cls] = await Promise.all([
        api.get(`/api/student/free/${id}`),
        schoolId ? api.get(`/api/classes/school/${schoolId}`).then((r) => r.data).catch(() => []) : [],
      ]);
      setStudent(data);
      setClasses(Array.isArray(cls) ? cls : []);
    } catch (err) {
      if (err.response?.status === 404) setMissing(true);
      else toast.error("Couldn't load this student");
    } finally { setLoading(false); }
  }, [id, schoolId]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const records = student?.academicRecords || [];
  const latestYear = records[records.length - 1];
  const latestTerm = latestYear?.terms?.[latestYear.terms.length - 1];
  const fees = latestTerm?.fees;
  const payments = useMemo(() => [...(fees?.paymentHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date)), [fees]);
  const paidPct = fees?.totalFees ? Math.min(100, Math.round((fees.amountPaid / fees.totalFees) * 100)) : 0;

  const openEdit = () => {
    setForm({
      name: student.name || "", class: student.classes?.[0]?._id || "", gender: student.gender || "male",
      dob: (student.dob || "").slice(0, 10), phone: student.phone || "", address: student.address || "",
    });
    setErrors({}); setEditing(true);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.name.trim()) v.name = "Name is required";
    if (!form.dob) v.dob = "Date of birth is required";
    else if (form.dob > new Date().toISOString().slice(0, 10)) v.dob = "Can't be in the future";
    if (form.phone && !/^[0-9+()\-\s]{7,20}$/.test(form.phone.trim())) v.phone = "Enter a valid phone number";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await api.put(`/api/student/${id}`, {
        name: form.name.trim(), dob: form.dob, gender: form.gender, phone: form.phone.trim(), address: form.address.trim(),
        schoolId, ...(form.class ? { class: form.class, classes: [form.class] } : {}),
      });
      toast.success("Profile updated");
      setEditing(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update the profile");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page"><Loading label="Loading student…" /></div>;
  if (missing || !student) {
    return (
      <div className="page">
        <div className="card"><EmptyState emoji="🔍" title="Student not found" action={<button className="btn" onClick={() => navigate("/students")}>Back to students</button>}>
          This student may have been removed.</EmptyState></div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        crumbs={[{ label: "Students", to: "/students" }, { label: student.name }]}
        title="Student profile"
        actions={(
          <>
            <button className="btn btn-outline no-print" onClick={() => window.print()}><Printer size={16} /> Print</button>
            <button className="btn no-print" onClick={openEdit}><Pencil size={16} /> Edit profile</button>
          </>
        )}
      />

      <div className="sd-layout">
        <aside className="card sd-side">
          <div className="sd-avatar">{initials(student.name)}</div>
          <h2>{student.name}</h2>
          <div className="sd-chips">
            <span className="badge-pill">{student.classes?.[0]?.className || "No class"}</span>
            <span className="badge-pill purple">{cap(student.gender)}</span>
          </div>
          <div className="sd-facts">
            <Fact icon={Hash} label="Student ID" value={student.idno} />
            <Fact icon={CalendarDays} label="Date of birth" value={fmtDate(student.dob)} />
            <Fact icon={Phone} label="Guardian phone" value={student.phone} />
            <Fact icon={Home} label="Address" value={student.address} />
          </div>
        </aside>

        <section className="sd-main">
          <div className="tabs no-print" role="tablist">
            {[["overview", "Overview"], ["fees", "Fees"], ["academics", "Academic record"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="sd-grid">
              <div className="stat-tile"><span className="ico"><School size={20} /></span><div><div className="val" style={{ fontSize: "1.2rem" }}>{student.classes?.[0]?.className || "—"}</div><div className="lbl">Current class</div></div></div>
              <div className="stat-tile"><span className="ico amber"><Wallet size={20} /></span><div><div className="val" style={{ fontSize: "1.2rem" }}>{fees ? cedi(fees.balance) : "—"}</div><div className="lbl">Fee balance{latestTerm ? ` · ${latestTerm.termName}` : ""}</div></div></div>
              <div className="stat-tile"><span className="ico purple"><User size={20} /></span><div><div className="val" style={{ fontSize: "1.2rem" }}>{records.length}</div><div className="lbl">Academic year{records.length === 1 ? "" : "s"} on record</div></div></div>
              <div className="card sd-wide">
                <div className="card-head"><h3>Latest term</h3>{latestTerm && <span className="badge-pill">{latestYear.yearLabel} · {latestTerm.termName}</span>}</div>
                {latestTerm ? (
                  <ul className="sd-list">
                    <li><span>Subjects recorded</span><b>{latestTerm.subjects?.length || 0}</b></li>
                    <li><span>Days present</span><b>{latestTerm.totalAttendance ?? 0}</b></li>
                    <li><span>Term dates</span><b>{fmtDate(latestTerm.startDate)} – {fmtDate(latestTerm.endDate)}</b></li>
                  </ul>
                ) : <p className="muted">No term has been recorded for this student yet.</p>}
              </div>
            </div>
          )}

          {tab === "fees" && (
            fees ? (
              <div className="card">
                <div className="card-head"><h3>{latestYear.yearLabel} · {latestTerm.termName}</h3><span className={`badge-pill ${fees.balance <= 0 ? "green" : "amber"}`}>{fees.balance <= 0 ? "Fully paid" : "Outstanding"}</span></div>
                <div className="sd-fee-bar" role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${paidPct}%` }} /></div>
                <p className="muted" style={{ margin: ".4rem 0 1.2rem" }}>{paidPct}% of this term's fees paid</p>
                <div className="sd-fees">
                  <div><small>Total fees</small><strong>{cedi(fees.totalFees)}</strong></div>
                  <div><small>Paid</small><strong className="pos">{cedi(fees.amountPaid)}</strong></div>
                  <div><small>Arrears</small><strong>{cedi(fees.arrears)}</strong></div>
                  <div><small>Balance</small><strong className={fees.balance > 0 ? "neg" : "pos"}>{cedi(fees.balance)}</strong></div>
                </div>
                <h3 style={{ margin: "1.5rem 0 .6rem" }}>Payment history</h3>
                {payments.length ? (
                  <div className="table-wrap"><table className="data-table">
                    <thead><tr><th>Date</th><th>Method</th><th>Note</th><th className="num">Amount</th></tr></thead>
                    <tbody>{payments.map((p, i) => (
                      <tr key={p._id || i}><td>{fmtDate(p.date)}</td><td>{p.method || "—"}</td><td>{p.note || "—"}</td><td className="num"><b>{cedi(p.amount)}</b></td></tr>
                    ))}</tbody>
                  </table></div>
                ) : <p className="muted">No payments have been recorded this term.</p>}
              </div>
            ) : <div className="card"><EmptyState emoji="💳" title="No fee information">Fees are created when a term is set up for the school.</EmptyState></div>
          )}

          {tab === "academics" && (
            records.length ? records.slice().reverse().map((yr) => (
              <div className="card sd-year" key={yr._id || yr.yearLabel}>
                <div className="card-head"><h3>{yr.yearLabel}</h3></div>
                {yr.terms?.slice().reverse().map((t) => (
                  <details key={t._id || t.termName} open={t === latestTerm} className="sd-term">
                    <summary><b>{t.termName}</b><span className="muted">{t.subjects?.length || 0} subjects</span></summary>
                    {t.subjects?.length ? (
                      <div className="table-wrap"><table className="data-table">
                        <thead><tr><th>Subject</th><th className="num">Class score</th><th className="num">Exam</th><th className="num">Total</th><th className="num">Position</th></tr></thead>
                        <tbody>{t.subjects.map((s, i) => (
                          <tr key={s._id || i}><td>{s.name}</td><td className="num">{s.classScore ?? "—"}</td><td className="num">{s.examScore ?? "—"}</td><td className="num"><b>{s.totalScore ?? "—"}</b></td><td className="num">{s.position ?? "—"}</td></tr>
                        ))}</tbody>
                      </table></div>
                    ) : <p className="muted" style={{ padding: ".5rem 0" }}>No grades entered yet.</p>}
                  </details>
                ))}
              </div>
            )) : <div className="card"><EmptyState emoji="📚" title="No academic records yet">Grades appear here once teachers enter them.</EmptyState></div>
          )}
        </section>
      </div>

      <Modal
        open={editing} onClose={() => setEditing(false)} title="Edit profile"
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          <button type="submit" form="sd-form" className="btn" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></>)}
      >
        <form id="sd-form" onSubmit={save} noValidate>
          <div className="field"><label htmlFor="sd-name">Full name *</label>
            <input id="sd-name" className={`input ${errors.name ? "is-invalid" : ""}`} value={form.name || ""} onChange={set("name")} />
            {errors.name && <span className="error">{errors.name}</span>}</div>
          <div className="form-grid">
            <div className="field"><label htmlFor="sd-class">Class</label>
              <select id="sd-class" className="select" value={form.class || ""} onChange={set("class")}>
                <option value="">Select class</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
              </select></div>
            <div className="field"><label htmlFor="sd-gender">Gender</label>
              <select id="sd-gender" className="select" value={form.gender || "male"} onChange={set("gender")}><option value="male">Male</option><option value="female">Female</option></select></div>
            <div className="field"><label htmlFor="sd-dob">Date of birth *</label>
              <input id="sd-dob" type="date" className={`input ${errors.dob ? "is-invalid" : ""}`} value={form.dob || ""} onChange={set("dob")} />
              {errors.dob && <span className="error">{errors.dob}</span>}</div>
            <div className="field"><label htmlFor="sd-phone">Guardian phone</label>
              <input id="sd-phone" type="tel" className={`input ${errors.phone ? "is-invalid" : ""}`} value={form.phone || ""} onChange={set("phone")} />
              {errors.phone && <span className="error">{errors.phone}</span>}</div>
          </div>
          <div className="field"><label htmlFor="sd-address">Address</label>
            <input id="sd-address" className="input" value={form.address || ""} onChange={set("address")} /></div>
        </form>
      </Modal>
    </div>
  );
}
