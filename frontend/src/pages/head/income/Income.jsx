import { useEffect, useMemo, useState } from "react";
import { Printer, Download, TrendingDown, TrendingUp } from "lucide-react";
import api from "../../../api/axios";
import { cedi } from "../../../utils/fees";
import { downloadCSV } from "../../../utils/csv";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import { CATEGORIES } from "../expenses/ExpensePage";
import "./Income.css";

export default function IncomeStatement() {
  const school = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData")); } catch { return null; } }, []);
  const schoolId = school?._id;
  const taxKey = `incomeTax:${schoolId}`;

  const [tuition, setTuition] = useState(0);
  const [feeding, setFeeding] = useState(0);
  const [expenses, setExpenses] = useState({});
  const [tax, setTax] = useState(() => { try { return localStorage.getItem(taxKey) || ""; } catch { return ""; } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!schoolId) { setError("We couldn't find your school. Please sign in again."); setLoading(false); return; }
    Promise.all([
      api.get(`/api/fees/total-paid/${schoolId}`),
      api.get(`/api/classes/total-income/${schoolId}`).catch((e) => (e.response?.status === 404 ? { data: { totalFeedingPaid: 0 } } : Promise.reject(e))),
      api.get(`/api/expenses/category-totals/${schoolId}`),
    ]).then(([t, f, x]) => {
      setTuition(t.data?.totalFeesPaid || 0);
      setFeeding(f.data?.totalFeedingPaid || 0);
      setExpenses(x.data || {});
    }).catch(() => setError("We couldn't load the income statement.")).finally(() => setLoading(false));
  }, [schoolId]);

  useEffect(() => { try { localStorage.setItem(taxKey, tax); } catch { /* ignore */ } }, [tax, taxKey]);

  if (loading) return <div className="page"><Loading label="Preparing statement…" /></div>;
  if (error) return <div className="page"><div className="card"><EmptyState emoji="📡" title={error} action={<button className="btn" onClick={() => window.location.reload()}>Retry</button>} /></div></div>;

  const income = [{ label: "Tuition fees", amount: tuition }, { label: "Feeding fees", amount: feeding }];
  const knownExpenses = CATEGORIES.map((c) => ({ label: c, amount: expenses[c] || 0 }));
  const extra = Object.keys(expenses).filter((k) => !CATEGORIES.includes(k)).map((k) => ({ label: k, amount: expenses[k] }));
  const spend = [...knownExpenses, ...extra].filter((r) => r.amount > 0);
  const totalIncome = income.reduce((n, r) => n + r.amount, 0);
  const totalSpend = spend.reduce((n, r) => n + r.amount, 0);
  const profit = totalIncome - totalSpend;
  const taxAmt = Math.max(Number(tax) || 0, 0);
  const net = profit - taxAmt;
  const margin = totalIncome ? Math.round((profit / totalIncome) * 100) : 0;
  const asAt = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  const exportCsv = () => downloadCSV("income-statement.csv", [
    ...income.map((r) => ({ section: "Revenue", ...r })), { section: "Revenue", label: "Total revenue", amount: totalIncome },
    ...spend.map((r) => ({ section: "Expenses", ...r })), { section: "Expenses", label: "Total expenses", amount: totalSpend },
    { section: "Result", label: "Profit before tax", amount: profit }, { section: "Result", label: "Tax", amount: taxAmt }, { section: "Result", label: "Profit after tax", amount: net },
  ], [{ label: "Section", key: "section" }, { label: "Item", key: "label" }, { label: "Amount (GHS)", key: "amount" }]);

  return (
    <div className="page page-narrow">
      <PageHeader title="Income statement" subtitle={`${school?.name || "School"} · as at ${asAt}`}
        actions={(<><button className="btn btn-outline" onClick={exportCsv}><Download size={16} /> Export</button><button className="btn" onClick={() => window.print()}><Printer size={16} /> Print</button></>)} />

      <div className="stat-grid">
        <div className="stat-tile"><span className="ico green"><TrendingUp size={20} /></span><div><div className="val">{cedi(totalIncome)}</div><div className="lbl">Revenue</div></div></div>
        <div className="stat-tile"><span className="ico coral"><TrendingDown size={20} /></span><div><div className="val">{cedi(totalSpend)}</div><div className="lbl">Expenses</div></div></div>
        <div className="stat-tile"><span className={`ico ${profit >= 0 ? "" : "coral"}`}>%</span><div><div className="val">{margin}%</div><div className="lbl">Profit margin</div></div></div>
      </div>

      <article className="card statement">
        <h2>Revenue</h2>
        {income.map((r) => <div className="st-row" key={r.label}><span>{r.label}</span><b>{cedi(r.amount)}</b></div>)}
        <div className="st-row total"><span>Total revenue</span><b>{cedi(totalIncome)}</b></div>

        <h2>Operating expenses</h2>
        {spend.length === 0 ? <p className="muted">No expenses recorded yet.</p> : spend.map((r) => <div className="st-row" key={r.label}><span>{r.label}</span><b>{cedi(r.amount)}</b></div>)}
        <div className="st-row total"><span>Total operating expenses</span><b>{cedi(totalSpend)}</b></div>

        <div className="st-row result"><span>Profit before tax</span><b className={profit >= 0 ? "pos" : "neg"}>{profit < 0 ? "− " : ""}{cedi(Math.abs(profit))}</b></div>
        <div className="st-row"><span>Tax <span className="no-print muted">(enter amount)</span></span>
          <b><input type="number" min="0" className="input no-print tax-input" value={tax} placeholder="0" onChange={(e) => setTax(e.target.value)} aria-label="Tax amount" /><span className="print-only">{cedi(taxAmt)}</span></b></div>
        <div className="st-row grand"><span>Profit after tax</span><b className={net >= 0 ? "pos" : "neg"}>{net < 0 ? "− " : ""}{cedi(Math.abs(net))}</b></div>
      </article>
      <p className="muted no-print" style={{ fontSize: ".82rem", marginTop: ".8rem" }}>Revenue is the total fees actually received (tuition and feeding). Expenses come from the Accounts page.</p>
    </div>
  );
}
