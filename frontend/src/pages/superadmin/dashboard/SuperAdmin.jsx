import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Building2, Check, Clock, Plus, Users, X } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

const when = (d) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function SuperAdminDashboard() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [toReject, setToReject] = useState(null);

  const load = useCallback(async () => {
    const [p, a, u] = await Promise.all([
      api.get("/api/superschool/pending").then((r) => r.data).catch(() => []),
      api.get("/api/superschool/approved").then((r) => r.data).catch(() => []),
      api.get("/api/superschool/users/count").then((r) => r.data?.count).catch(() => 0),
    ]);
    setPending(Array.isArray(p) ? p : []); setApproved(Array.isArray(a) ? a : []); setUsers(u || 0);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const approve = async (s) => {
    setBusy(s._id);
    try { await api.put(`/api/superschool/approve/${s._id}`); toast.success(`${s.name} approved`); await load(); }
    catch { toast.error("Couldn't approve that school"); } finally { setBusy(null); }
  };
  const reject = async () => {
    setBusy(toReject._id);
    try { await api.delete(`/api/superschool/reject/${toReject._id}`); toast.success("Application rejected"); setToReject(null); await load(); }
    catch { toast.error("Couldn't reject that application"); } finally { setBusy(null); }
  };

  if (loading) return <div className="page"><Loading /></div>;

  return (
    <div className="page">
      <PageHeader title="Platform overview" subtitle="Approve new schools and keep an eye on growth."
        actions={<Link to="/add-school" className="btn"><Plus size={16} /> Add school</Link>} />

      <div className="stat-grid">
        <div className="stat-tile"><span className="ico green"><Building2 size={20} /></span><div><div className="val">{approved.length}</div><div className="lbl">Active schools</div></div></div>
        <div className="stat-tile"><span className="ico amber"><Clock size={20} /></span><div><div className="val">{pending.length}</div><div className="lbl">Awaiting approval</div></div></div>
        <div className="stat-tile"><span className="ico purple"><Users size={20} /></span><div><div className="val">{users}</div><div className="lbl">Registered users</div></div></div>
      </div>

      <section className="card" style={{ marginBottom: "1.2rem" }}>
        <div className="card-head"><h2>Pending approvals</h2>{pending.length > 0 && <span className="badge-pill amber">{pending.length}</span>}</div>
        {pending.length === 0 ? <EmptyState emoji="✅" title="You're all caught up">New school applications will appear here.</EmptyState> : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: ".7rem" }}>
            {pending.map((s) => (
              <li key={s._id} className="row" style={{ justifyContent: "space-between", padding: ".9rem 1rem", border: "1px solid var(--border)", borderRadius: 14, background: "var(--teal-50)" }}>
                <div style={{ minWidth: 0 }}><strong style={{ color: "var(--dark)" }}>{s.name}</strong><br /><small className="muted">{s.headmaster} · {s.email} · applied {when(s.createdAt)}</small></div>
                <div className="row">
                  <button className="btn btn-sm" onClick={() => approve(s)} disabled={busy === s._id}><Check size={15} /> Approve</button>
                  <button className="btn btn-danger-soft btn-sm" onClick={() => setToReject(s)} disabled={busy === s._id}><X size={15} /> Reject</button>
                </div>
              </li>))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-head"><h2>Recently approved</h2><Link to="/all-schools" className="btn btn-ghost btn-sm">View all</Link></div>
        {approved.length === 0 ? <p className="muted">No approved schools yet.</p> : (
          <div className="table-wrap" style={{ boxShadow: "none" }}><table className="data-table">
            <thead><tr><th>School</th><th>Head</th><th>Email</th></tr></thead>
            <tbody>{approved.slice(0, 6).map((s) => <tr key={s._id}><td><strong>{s.name}</strong></td><td>{s.headmaster}</td><td>{s.email}</td></tr>)}</tbody>
          </table></div>
        )}
      </section>

      <ConfirmDialog open={!!toReject} danger busy={busy === toReject?._id} title="Reject this application?"
        message={toReject ? `${toReject.name} will be removed. The applicant will have to register again.` : ""} confirmLabel="Reject" onConfirm={reject} onCancel={() => setToReject(null)} />
    </div>
  );
}
