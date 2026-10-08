import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Download, Settings2, Table2, Utensils, Users, Wallet } from "lucide-react";
import api from "../../../api/axios";
import { cedi } from "../../../utils/fees";
import { downloadCSV } from "../../../utils/csv";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Modal from "../../../components/ui/Modal";
import { TableSkeleton } from "../../../components/ui/Loading";

const VIEWS = [["today", "Today"], ["week", "This week"], ["month", "This month"], ["term", "This term"]];

export default function FeedingFee() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("all");
  const [viewBy, setViewBy] = useState("term");
  const [display, setDisplay] = useState("table");
  const [rows, setRows] = useState([]);
  const [schoolTotal, setSchoolTotal] = useState(0);
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);

  const [feesOpen, setFeesOpen] = useState(false);
  const [fees, setFees] = useState({});
  const [savingFees, setSavingFees] = useState(false);

  const loadClasses = useCallback(async () => {
    if (!schoolId) return;
    try {
      const { data } = await api.get(`/api/classes/school/${schoolId}`);
      setClasses(Array.isArray(data) ? data : []);
    } catch { toast.error("Couldn't load classes"); }
  }, [schoolId]);
  useEffect(() => { loadClasses(); }, [loadClasses]);

  const load = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data: latest } = await api.get("/api/terms/latest");
      if (!latest?._id) { setTerm(null); setRows([]); return; }
      setTerm(latest);
      const [att, total] = await Promise.all([
        api.get("/api/attendance/student-total", { params: { termId: latest._id, classId, viewBy } }).then((r) => r.data).catch((e) => (e.response?.status === 404 ? [] : Promise.reject(e))),
        api.get(`/api/attendance/feeding-total/school/${schoolId}`, { params: { termId: latest._id, viewBy } }).then((r) => r.data?.totalSchoolPaid || 0).catch(() => 0),
      ]);
      const list = (Array.isArray(att) ? att : []).map((s) => ({ ...s, days: s.totalPresentDays || 0, fee: s.feedingFee || 0, amount: (s.feedingFee || 0) * (s.totalPresentDays || 0) }));
      setRows(list);
      setSchoolTotal(total);
      if (classId !== "all" && viewBy === "term") {
        api.put(`/api/classes/update-feeding-total/${classId}`, { totalFeedingPaid: list.reduce((n, s) => n + s.amount, 0) }).catch(() => {});
      }
    } catch { toast.error("Couldn't load feeding fees"); } finally { setLoading(false); }
  }, [schoolId, classId, viewBy]);
  useEffect(() => { load(); }, [load]);

  const total = rows.reduce((n, s) => n + s.amount, 0);
  const className = classId === "all" ? "All classes" : classes.find((c) => c._id === classId)?.className;

  const openFees = () => { setFees(Object.fromEntries(classes.map((c) => [c._id, c.feedingFee ?? 0]))); setFeesOpen(true); };
  const saveFees = async (e) => {
    e.preventDefault();
    if (Object.values(fees).some((v) => v === "" || Number(v) < 0 || Number.isNaN(Number(v)))) { toast.error("Fees must be zero or more"); return; }
    setSavingFees(true);
    try {
      await api.post("/api/fees/set-feeding-fee", { feedingFees: Object.fromEntries(Object.entries(fees).map(([k, v]) => [k, Number(v)])) });
      toast.success("Daily feeding fees updated");
      setFeesOpen(false);
      loadClasses();
      load();
    } catch { toast.error("Couldn't update feeding fees"); } finally { setSavingFees(false); }
  };

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "Fees", to: "/fees" }, { label: "Feeding fee" }]} title="Feeding fee"
        subtitle={term ? `${term.yearLabel} · ${term.termName} — paid per day attended` : "Paid per day attended"}
        actions={(<>
          <button className="btn btn-outline" onClick={openFees} disabled={!classes.length}><Settings2 size={16} /> Set daily fees</button>
          <button className="btn btn-outline" disabled={!rows.length} onClick={() => downloadCSV(`feeding-${viewBy}.csv`, rows, [
            { label: "Student", key: "name" }, { label: "ID", key: "idno" }, { label: "Daily fee", key: "fee" }, { label: "Days present", key: "days" }, { label: "Amount", key: "amount" }])}>
            <Download size={16} /> Export</button></>)} />

      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Period">
          {VIEWS.map(([k, l]) => <button key={k} role="tab" aria-selected={viewBy === k} className={`tab ${viewBy === k ? "active" : ""}`} onClick={() => setViewBy(k)}>{l}</button>)}
        </div>
        <select className="select" style={{ width: "auto", minWidth: 190 }} value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class">
          <option value="all">All classes</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}</select>
        <div className="tabs" role="group" aria-label="Display" style={{ marginLeft: "auto" }}>
          <button className={`tab ${display === "table" ? "active" : ""}`} onClick={() => setDisplay("table")} aria-label="Table view"><Table2 size={15} /></button>
          <button className={`tab ${display === "chart" ? "active" : ""}`} onClick={() => setDisplay("chart")} aria-label="Chart view"><BarChart3 size={15} /></button>
        </div>
      </div>

      {loading ? <TableSkeleton rows={7} cols={5} /> : !term ? (
        <div className="card"><EmptyState emoji="🗓️" title="No term set up yet">Create a term in Termly Details to start tracking feeding fees.</EmptyState></div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile"><span className="ico amber"><Utensils size={20} /></span><div><div className="val">{cedi(total)}</div><div className="lbl">{className} · {VIEWS.find(([k]) => k === viewBy)[1].toLowerCase()}</div></div></div>
            <div className="stat-tile"><span className="ico green"><Wallet size={20} /></span><div><div className="val">{cedi(schoolTotal)}</div><div className="lbl">Whole school · same period</div></div></div>
            <div className="stat-tile"><span className="ico"><Users size={20} /></span><div><div className="val">{rows.length}</div><div className="lbl">Students</div></div></div>
          </div>
          {rows.length === 0 ? (
            <div className="card"><EmptyState emoji="🍽️" title="No attendance recorded for this selection">Feeding fees are calculated from days marked present.</EmptyState></div>
          ) : display === "chart" ? (
            <div className="card" style={{ height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...rows].sort((a, b) => b.amount - a.amount).slice(0, 25)} margin={{ top: 10, right: 16, left: 0, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,140,122,.15)" />
                  <XAxis dataKey="name" angle={-40} textAnchor="end" interval={0} height={80} tick={{ fontSize: 11, fill: "#5a7a76" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5a7a76" }} />
                  <Tooltip formatter={(v) => cedi(v)} cursor={{ fill: "rgba(26,140,122,.06)" }} />
                  <Bar dataKey="amount" name="Amount" fill="#1a8c7a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="table-wrap"><table className="data-table">
              <thead><tr><th>Student</th><th className="num">Daily fee</th><th className="num">Days present</th><th className="num">Amount</th></tr></thead>
              <tbody>{rows.map((s) => (<tr key={s._id}><td><strong>{s.name}</strong><br /><small className="muted">{s.idno}</small></td><td className="num">{cedi(s.fee)}</td><td className="num">{s.days}</td><td className="num"><b>{cedi(s.amount)}</b></td></tr>))}</tbody>
              <tfoot><tr><td colSpan={3} style={{ padding: ".8rem 1rem", fontWeight: 800 }}>Total</td><td className="num" style={{ padding: ".8rem 1rem", fontWeight: 800 }}>{cedi(total)}</td></tr></tfoot>
            </table></div>
          )}
        </>
      )}

      <Modal open={feesOpen} onClose={() => setFeesOpen(false)} title="Daily feeding fee per class"
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setFeesOpen(false)}>Cancel</button>
          <button type="submit" form="feeding-form" className="btn" disabled={savingFees}>{savingFees ? "Saving…" : "Save fees"}</button></>)}>
        <form id="feeding-form" onSubmit={saveFees}>
          <p className="muted" style={{ marginTop: 0 }}>Amount a student pays for each day they attend (GH₵).</p>
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {classes.map((c) => (
              <div key={c._id} className="row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
                <label htmlFor={`ff-${c._id}`} style={{ fontWeight: 700 }}>{c.className}</label>
                <input id={`ff-${c._id}`} type="number" min="0" step="0.5" inputMode="decimal" className="input" style={{ width: 130 }} value={fees[c._id] ?? ""} onChange={(e) => setFees({ ...fees, [c._id]: e.target.value })} />
              </div>))}
          </div>
        </form>
      </Modal>
    </div>
  );
}
