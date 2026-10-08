import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Banknote, CircleDollarSign, Download, HandCoins, History, MessageCircle, Plus, Search, Users } from "lucide-react";
import api from "../../../api/axios";
import { cedi, feeSummary } from "../../../utils/fees";
import { downloadCSV } from "../../../utils/csv";
import useDebounce from "../../../hooks/useDebounce";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import { TableSkeleton } from "../../../components/ui/Loading";
import "./SchoolFees.css";

const STATUS = { paid: ["Paid", "green"], partial: ["Part-paid", "amber"], unpaid: ["Unpaid", "coral"], none: ["No term", "gray"] };
const METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Cheque"];
const today = () => new Date().toISOString().slice(0, 10);

export default function SchoolFees() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 200);
  const [classId, setClassId] = useState("");
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [paying, setPaying] = useState(null);
  const [form, setForm] = useState({ amount: "", date: today(), method: "Cash", note: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState(null); // { student, payments }

  const load = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        api.get("/api/student"),
        schoolId ? api.get(`/api/classes/school/${schoolId}`) : { data: [] },
      ]);
      setStudents(Array.isArray(s.data) ? s.data : []);
      setClasses(Array.isArray(c.data) ? c.data : []);
    } catch { toast.error("Couldn't load fee records"); } finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, classId, state, pageSize]);

  const all = useMemo(() => students.map((s) => ({ s, f: feeSummary(s) })), [students]);
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter(({ s, f }) =>
        (!term || s.name.toLowerCase().includes(term) || (s.idno || "").toLowerCase().includes(term)) &&
        (!classId || s.classes?.[0]?._id === classId) && (!state || f.status === state))
      .sort((a, b) => b.f.balance - a.f.balance);
  }, [all, q, classId, state]);

  const totals = useMemo(() => rows.reduce((t, { f }) => ({
    owed: t.owed + f.total, paid: t.paid + f.paid, balance: t.balance + f.balance, debtors: t.debtors + (f.balance > 0 ? 1 : 0),
  }), { owed: 0, paid: 0, balance: 0, debtors: 0 }), [rows]);
  const pct = totals.owed ? Math.round((totals.paid / totals.owed) * 100) : 0;

  const openPay = (item) => { setPaying(item); setForm({ amount: "", date: today(), method: "Cash", note: "" }); setError(""); };

  const savePayment = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { setError("Enter an amount greater than zero"); return; }
    if (!form.date || form.date > today()) { setError("Pick today's date or earlier"); return; }
    if (!paying.f.hasTerm) { setError("This student has no term yet — set up the term first."); return; }
    setSaving(true);
    try {
      await api.post("/api/fees/make-payment", {
        studentId: paying.s._id, yearLabel: paying.f.yearLabel, termName: paying.f.term.termName,
        amount, method: form.method, note: form.note.trim(), date: form.date,
      });
      toast.success(`Recorded ${cedi(amount)} for ${paying.s.name}`);
      setPaying(null);
      load();
    } catch (err) { setError(err.response?.data?.message || "Couldn't record the payment"); } finally { setSaving(false); }
  };

  const openHistory = async (item) => {
    try {
      const { data } = await api.get(`/api/fees/recent-payments/${item.s._id}`);
      setHistory({ item, payments: data.payments || [] });
    } catch (err) {
      if (err.response?.status === 404) setHistory({ item, payments: [] });
      else toast.error("Couldn't load payments");
    }
  };

  const sendReceipt = async (p) => {
    const phone = history.item.s.phone;
    if (!phone) { toast.error("Add a guardian phone number to this student first"); return; }
    try {
      await api.post("/api/whatsapp/send-whatsapp-receipt", {
        phoneNumber: phone, studentName: history.item.s.name, amount: p.amount, date: new Date(p.date).toLocaleDateString(),
      });
      toast.success("Receipt sent on WhatsApp");
    } catch { toast.error("WhatsApp receipt failed"); }
  };

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "Fees", to: "/fees" }, { label: "School fees" }]} title="School fees"
        subtitle="Current-term balances for every student."
        actions={<button className="btn btn-outline" disabled={!rows.length}
          onClick={() => downloadCSV(`school-fees-${today()}.csv`, rows, [
            { label: "Student", get: ({ s }) => s.name }, { label: "ID", get: ({ s }) => s.idno },
            { label: "Class", get: ({ s }) => s.classes?.[0]?.className || "" },
            { label: "Fees", get: ({ f }) => f.total }, { label: "Paid", get: ({ f }) => f.paid }, { label: "Balance", get: ({ f }) => f.balance },
            { label: "Status", get: ({ f }) => STATUS[f.status][0] }])}><Download size={16} /> Export</button>} />

      <div className="stat-grid">
        <div className="stat-tile"><span className="ico blue"><Banknote size={20} /></span><div><div className="val">{cedi(totals.owed)}</div><div className="lbl">Total billed</div></div></div>
        <div className="stat-tile"><span className="ico green"><HandCoins size={20} /></span><div><div className="val">{cedi(totals.paid)}</div><div className="lbl">Collected · {pct}%</div></div></div>
        <div className="stat-tile"><span className="ico coral"><CircleDollarSign size={20} /></span><div><div className="val">{cedi(totals.balance)}</div><div className="lbl">Outstanding</div></div></div>
        <div className="stat-tile"><span className="ico amber"><Users size={20} /></span><div><div className="val">{totals.debtors}</div><div className="lbl">Students owing</div></div></div>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap"><Search size={16} /><input className="input" placeholder="Search by name or ID…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" /></div>
        <select className="select" style={{ width: "auto", minWidth: 170 }} value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class">
          <option value="">All classes</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}</select>
        <select className="select" style={{ width: "auto", minWidth: 150 }} value={state} onChange={(e) => setState(e.target.value)} aria-label="Payment status">
          <option value="">Any status</option><option value="unpaid">Unpaid</option><option value="partial">Part-paid</option><option value="paid">Paid</option></select>
      </div>

      {loading ? <TableSkeleton rows={8} cols={6} /> : rows.length === 0 ? (
        <div className="card"><EmptyState emoji="💳" title="No students found">Try changing the filters, or set up the term in Termly Details.</EmptyState></div>
      ) : (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Student</th><th className="num">Billed</th><th className="num">Paid</th><th className="num">Balance</th><th>Status</th><th className="actions">Actions</th></tr></thead>
          <tbody>{pageRows.map((item) => {
            const { s, f } = item; const [label, tone] = STATUS[f.status];
            return (
              <tr key={s._id}>
                <td><div className="cell-person"><div><strong>{s.name}</strong><small>{s.classes?.[0]?.className || "Unassigned"} · {s.idno}</small></div></div></td>
                <td className="num">{cedi(f.total)}</td><td className="num">{cedi(f.paid)}</td>
                <td className="num"><b style={{ color: f.balance > 0 ? "var(--danger)" : "var(--success)" }}>{cedi(f.balance)}</b></td>
                <td><span className={`badge-pill ${tone}`}>{label}</span></td>
                <td className="actions"><span className="icon-actions">
                  <button className="btn btn-sm" onClick={() => openPay(item)} disabled={!f.hasTerm}><Plus size={14} /> Payment</button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openHistory(item)} aria-label={`Payments for ${s.name}`} title="Recent payments"><History size={16} /></button></span></td>
              </tr>);
          })}</tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={setPageSize} /></div>
      )}

      <Modal open={!!paying} onClose={() => setPaying(null)} title="Record a payment"
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setPaying(null)}>Cancel</button>
          <button type="submit" form="pay-form" className="btn" disabled={saving}>{saving ? "Saving…" : "Save payment"}</button></>)}>
        {paying && (
          <form id="pay-form" onSubmit={savePayment} noValidate>
            <div className="pay-summary"><div><small>Student</small><strong>{paying.s.name}</strong></div>
              <div><small>Term</small><strong>{paying.f.term?.termName} · {paying.f.yearLabel}</strong></div>
              <div><small>Balance</small><strong style={{ color: "var(--danger)" }}>{cedi(paying.f.balance)}</strong></div></div>
            <div className="form-grid">
              <div className="field"><label htmlFor="pay-amt">Amount (GH₵) *</label>
                <input id="pay-amt" type="number" min="0" step="0.01" inputMode="decimal" className={`input ${error ? "is-invalid" : ""}`} value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(""); }} autoFocus />
                {paying.f.balance > 0 && <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setForm({ ...form, amount: String(paying.f.balance) })}>Pay full balance</button>}</div>
              <div className="field"><label htmlFor="pay-date">Date *</label><input id="pay-date" type="date" max={today()} className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="field"><label htmlFor="pay-method">Method</label>
                <select id="pay-method" className="select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
            </div>
            <div className="field"><label htmlFor="pay-note">Note <span className="muted">(optional)</span></label><input id="pay-note" className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. MTN MoMo ref 12345" /></div>
            {Number(form.amount) > paying.f.balance && paying.f.balance > 0 && <p className="alert warn">This is more than the outstanding balance — the extra will be recorded as arrears credit.</p>}
            {error && <p className="alert error" role="alert">{error}</p>}
          </form>
        )}
      </Modal>

      <Modal open={!!history} onClose={() => setHistory(null)} title="Recent payments">
        {history && (
          <>
            <p style={{ marginTop: 0 }}><b>{history.item.s.name}</b> <span className="muted">· {history.item.s.idno}</span></p>
            {history.payments.length === 0 ? <p className="muted">No payments recorded this term.</p> : (
              <ul className="pay-list">{history.payments.map((p, i) => (
                <li key={p._id || i}><div><strong>{cedi(p.amount)}</strong><small>{new Date(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} · {p.method || "—"}{p.note ? ` · ${p.note}` : ""}</small></div>
                  <button className="btn btn-outline btn-sm" onClick={() => sendReceipt(p)}><MessageCircle size={14} /> Receipt</button></li>))}</ul>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
