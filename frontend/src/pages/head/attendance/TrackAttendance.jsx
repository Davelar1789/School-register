import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { AlertTriangle, CalendarCheck, Download, Search, TrendingUp, Users } from "lucide-react";
import api from "../../../api/axios";
import { downloadCSV } from "../../../utils/csv";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { TableSkeleton } from "../../../components/ui/Loading";
import "./TrackAttendance.css";

const tone = (p) => (p >= 90 ? "green" : p >= 75 ? "amber" : "coral");

export default function TrackAttendance() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState(() => sessionStorage.getItem("attClass") || "");
  const [students, setStudents] = useState([]);
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [atRiskOnly, setAtRiskOnly] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    api.get(`/api/classes/school/${schoolId}`).then(({ data }) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Couldn't load classes"));
  }, [schoolId]);

  const loadClass = useCallback(async (id) => {
    if (!id) { setStudents([]); setLoaded(false); return; }
    setLoading(true);
    try {
      const { data: latest } = await api.get("/api/terms/latest");
      if (!latest?._id) { toast.error("Set up a term first (Termly Details)"); setStudents([]); return; }
      setTerm(latest);
      const { data } = await api.get("/api/attendance/student-total", { params: { termId: latest._id, classId: id } });
      setStudents(Array.isArray(data) ? data : []);
      setLoaded(true);
    } catch (err) {
      toast.error(err.response?.status === 401 ? "Please sign in again" : "Couldn't load attendance");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (classId) loadClass(classId); }, [classId, loadClass]);

  const pick = (id) => { setClassId(id); sessionStorage.setItem("attClass", id); };

  const rows = useMemo(() => students.map((s) => ({
    ...s, pct: s.totalSchoolDays ? Math.round((s.totalPresentDays / s.totalSchoolDays) * 100) : null,
  })), [students]);

  const visible = rows
    .filter((s) => (!search || `${s.name} ${s.idno}`.toLowerCase().includes(search.toLowerCase())) && (!atRiskOnly || (s.pct !== null && s.pct < 75)))
    .sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));

  const withData = rows.filter((s) => s.pct !== null);
  const avg = withData.length ? Math.round(withData.reduce((n, s) => n + s.pct, 0) / withData.length) : null;
  const atRisk = withData.filter((s) => s.pct < 75).length;
  const days = rows[0]?.totalSchoolDays ?? 0;
  const className = classes.find((c) => c._id === classId)?.className;

  return (
    <div className="page">
      <PageHeader title="Attendance" subtitle="See who is showing up, class by class."
        actions={<button className="btn btn-outline" disabled={!visible.length}
          onClick={() => downloadCSV(`attendance-${className || "class"}.csv`, visible, [
            { label: "Name", key: "name" }, { label: "ID", key: "idno" }, { label: "Days present", key: "totalPresentDays" },
            { label: "School days", key: "totalSchoolDays" }, { label: "Attendance %", get: (s) => (s.pct === null ? "" : s.pct) }])}>
          <Download size={16} /> Export</button>} />

      <div className="toolbar">
        <select className="select" style={{ width: "auto", minWidth: 220 }} value={classId} onChange={(e) => pick(e.target.value)} aria-label="Class">
          <option value="">Select a class…</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </select>
        {term && classId && <span className="badge-pill">{term.yearLabel} · {term.termName}</span>}
        {loaded && (
          <>
            <div className="search-input-wrap"><Search size={16} />
              <input className="input" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" /></div>
            <label className="att-toggle"><input type="checkbox" checked={atRiskOnly} onChange={(e) => setAtRiskOnly(e.target.checked)} /> Below 75% only</label>
          </>
        )}
      </div>

      {!classId ? (
        <div className="card"><EmptyState emoji="🗓️" title="Choose a class to begin">Pick a class above to see each student's attendance for the current term.</EmptyState></div>
      ) : loading ? <TableSkeleton rows={8} cols={4} /> : !rows.length ? (
        <div className="card"><EmptyState emoji="📭" title="No attendance records yet">Once teachers start marking attendance for {className || "this class"}, it appears here.</EmptyState></div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile"><span className="ico"><Users size={20} /></span><div><div className="val">{rows.length}</div><div className="lbl">Students</div></div></div>
            <div className="stat-tile"><span className="ico blue"><CalendarCheck size={20} /></span><div><div className="val">{days}</div><div className="lbl">School days so far</div></div></div>
            <div className="stat-tile"><span className="ico green"><TrendingUp size={20} /></span><div><div className="val">{avg === null ? "—" : `${avg}%`}</div><div className="lbl">Class average</div></div></div>
            <div className="stat-tile"><span className="ico coral"><AlertTriangle size={20} /></span><div><div className="val">{atRisk}</div><div className="lbl">Below 75%</div></div></div>
          </div>

          {visible.length === 0 ? <div className="card"><EmptyState emoji="🔍" title="No students match" /></div> : (
            <div className="table-wrap"><table className="data-table">
              <thead><tr><th>Student</th><th>ID</th><th className="num">Present</th><th className="num">Of</th><th style={{ minWidth: 180 }}>Attendance</th></tr></thead>
              <tbody>{visible.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.name}</strong></td><td><code>{s.idno}</code></td>
                  <td className="num">{s.totalPresentDays}</td><td className="num">{s.totalSchoolDays}</td>
                  <td>{s.pct === null ? <span className="muted">No data</span> : (
                    <div className="att-bar" title={`${s.pct}%`}><div className="track"><span className={`fill ${tone(s.pct)}`} style={{ width: `${s.pct}%` }} /></div><b>{s.pct}%</b></div>)}</td>
                </tr>))}</tbody>
            </table></div>
          )}
        </>
      )}
    </div>
  );
}
