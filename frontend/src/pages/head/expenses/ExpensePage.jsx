import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Download, Plus, Receipt, Search, Tag, Trash2, TrendingDown } from "lucide-react";
import api from "../../../api/axios";
import { cedi } from "../../../utils/fees";
import { downloadCSV } from "../../../utils/csv";
import useDebounce from "../../../hooks/useDebounce";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import { TableSkeleton } from "../../../components/ui/Loading";
import "./Expense.css";

export const CATEGORIES = ["Salaries", "Utilities", "Postage", "Telephone", "Stationery", "Cleaning and Sanitation", "Depreciation", "Transport", "Feeding cost", "Maintenance", "Other"];
const today = () => new Date().toISOString().slice(0, 10);
const BLANK = { date: today(), description: "", category: "", amount: "" };

export default function ExpensesPage() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 200);
  const [category, setCategory] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    if (!schoolId) { setLoading(false); setError(true); return; }
    setLoading(true); setError(false);
    try {
      const { data } = await api.get(`/api/expenses/${schoolId}`);
      setExpenses(Array.isArray(data) ? data : []);
    } catch { setError(true); } finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [q, category, range, pageSize]);

  const rows = useMemo(() => expenses.filter((e) => {
    const d = e.date.slice(0, 10);
    return (!q || `${e.description} ${e.category}`.toLowerCase().includes(q.toLowerCase())) &&
      (!category || e.category === category) && (!range.from || d >= range.from) && (!range.to || d <= range.to);
  }), [expenses, q, category, range]);

  const total = rows.reduce((n, e) => n + e.amount, 0);
  const thisMonthKey = today().slice(0, 7);
  const thisMonth = expenses.filter((e) => e.date.startsWith(thisMonthKey)).reduce((n, e) => n + e.amount, 0);
  const byCat = useMemo(() => {
    const m = {};
    rows.forEach((e) => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const maxCat = byCat[0]?.[1] || 1;

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.date) v.date = "Choose the date";
    if (!form.description.trim()) v.description = "Describe what was bought or paid for";
    if (!form.category) v.category = "Choose a category";
    if (!(Number(form.amount) > 0)) v.amount = "Enter an amount greater than zero";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const { data } = await api.post("/api/expenses/create", { ...form, description: form.description.trim(), amount: Number(form.amount) });
      setExpenses((p) => [data, ...p].sort((a, b) => new Date(b.date) - new Date(a.date)));
      toast.success("Expense recorded");
      setOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't save the expense"); } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(`/api/expenses/${toDelete._id}`);
      setExpenses((p) => p.filter((e) => e._id !== toDelete._id));
      toast.success("Expense deleted");
      setToDelete(null);
    } catch { toast.error("Couldn't delete the expense"); } finally { setSaving(false); }
  };

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const filtered = category || q || range.from || range.to;

  return (
    <div className="page">
      <PageHeader title="Accounts & expenses" subtitle="Everything the school spends, in one place."
        actions={(<>
          <button className="btn btn-outline" disabled={!rows.length} onClick={() => downloadCSV(`expenses-${today()}.csv`, rows, [
            { label: "Date", get: (e) => e.date.slice(0, 10) }, { label: "Description", key: "description" }, { label: "Category", key: "category" }, { label: "Amount", key: "amount" }])}><Download size={16} /> Export</button>
          <button className="btn" onClick={() => { setForm({ ...BLANK, date: today() }); setErrors({}); setOpen(true); }}><Plus size={16} /> Add expense</button></>)} />

      <div className="stat-grid">
        <div className="stat-tile"><span className="ico coral"><TrendingDown size={20} /></span><div><div className="val">{cedi(total)}</div><div className="lbl">{filtered ? "Filtered total" : "Total spent"}</div></div></div>
        <div className="stat-tile"><span className="ico amber"><Receipt size={20} /></span><div><div className="val">{cedi(thisMonth)}</div><div className="lbl">This month</div></div></div>
        <div className="stat-tile"><span className="ico purple"><Tag size={20} /></span><div><div className="val" style={{ fontSize: "1.1rem" }}>{byCat[0]?.[0] || "—"}</div><div className="lbl">Biggest category</div></div></div>
      </div>

      {byCat.length > 0 && (
        <div className="card exp-cats">
          <div className="card-head"><h3>Spending by category</h3></div>
          {byCat.slice(0, 6).map(([name, amt]) => (
            <button key={name} className={`exp-cat ${category === name ? "on" : ""}`} onClick={() => setCategory(category === name ? "" : name)} title="Filter by this category">
              <span>{name}</span><div className="track"><i style={{ width: `${(amt / maxCat) * 100}%` }} /></div><b>{cedi(amt)}</b>
            </button>))}
        </div>
      )}

      <div className="toolbar" style={{ marginTop: "1.2rem" }}>
        <div className="search-input-wrap"><Search size={16} /><input className="input" placeholder="Search expenses…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search expenses" /></div>
        <select className="select" style={{ width: "auto", minWidth: 190 }} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="exp-date">From <input type="date" className="input" value={range.from} max={range.to || undefined} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
        <label className="exp-date">To <input type="date" className="input" value={range.to} min={range.from || undefined} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
        {filtered && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setCategory(""); setRange({ from: "", to: "" }); }}>Clear</button>}
      </div>

      {loading ? <TableSkeleton rows={6} cols={5} /> : error ? (
        <div className="card"><EmptyState emoji="📡" title="Couldn't load expenses" action={<button className="btn" onClick={load}>Try again</button>} /></div>
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState emoji="🧾" title={expenses.length ? "No expenses match your filters" : "No expenses recorded"} action={!expenses.length && <button className="btn" onClick={() => setOpen(true)}><Plus size={16} /> Record the first expense</button>}>
          {expenses.length ? "Try widening the date range or clearing the category." : "Track salaries, utilities and more so your income statement stays accurate."}</EmptyState></div>
      ) : (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th className="num">Amount</th><th className="actions" /></tr></thead>
          <tbody>{pageRows.map((e) => (
            <tr key={e._id}><td>{new Date(e.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</td>
              <td>{e.description}</td><td><span className="badge-pill purple">{e.category}</span></td><td className="num"><b>{cedi(e.amount)}</b></td>
              <td className="actions"><button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--danger)" }} onClick={() => setToDelete(e)} aria-label="Delete expense"><Trash2 size={16} /></button></td></tr>))}</tbody>
        </table><Pagination page={page} pageSize={pageSize} total={rows.length} onPage={setPage} onPageSize={setPageSize} /></div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add an expense"
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button><button type="submit" form="exp-form" className="btn" disabled={saving}>{saving ? "Saving…" : "Save expense"}</button></>)}>
        <form id="exp-form" onSubmit={save} noValidate>
          <div className="form-grid">
            <div className="field"><label htmlFor="e-date">Date *</label><input id="e-date" type="date" max={today()} className={`input ${errors.date ? "is-invalid" : ""}`} value={form.date} onChange={set("date")} />{errors.date && <span className="error">{errors.date}</span>}</div>
            <div className="field"><label htmlFor="e-amt">Amount (GH₵) *</label><input id="e-amt" type="number" min="0" step="0.01" inputMode="decimal" className={`input ${errors.amount ? "is-invalid" : ""}`} value={form.amount} onChange={set("amount")} />{errors.amount && <span className="error">{errors.amount}</span>}</div>
          </div>
          <div className="field"><label htmlFor="e-cat">Category *</label><select id="e-cat" className={`select ${errors.category ? "is-invalid" : ""}`} value={form.category} onChange={set("category")}><option value="">Select category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>{errors.category && <span className="error">{errors.category}</span>}</div>
          <div className="field"><label htmlFor="e-desc">Description *</label><input id="e-desc" className={`input ${errors.description ? "is-invalid" : ""}`} value={form.description} onChange={set("description")} placeholder="e.g. ECG bill for September" />{errors.description && <span className="error">{errors.description}</span>}</div>
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} danger busy={saving} title="Delete this expense?" message={toDelete ? `${toDelete.description} (${cedi(toDelete.amount)}) will be removed from your accounts.` : ""} confirmLabel="Delete" onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
