import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Globe, GraduationCap, Mail, MapPin, Phone, Plus, Search, UserRound } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

export default function AllSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/api/schools").then(({ data }) => setSchools(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Couldn't load schools")).finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => schools.filter((s) =>
    (!q || `${s.name} ${s.headmaster} ${s.email}`.toLowerCase().includes(q.toLowerCase())) && (!status || s.status === status)), [schools, q, status]);

  return (
    <div className="page">
      <PageHeader title="All schools" subtitle={loading ? "" : `${schools.length} school${schools.length === 1 ? "" : "s"} on the platform`}
        actions={<Link to="/add-school" className="btn"><Plus size={16} /> Add school</Link>} />
      <div className="toolbar">
        <div className="search-input-wrap"><Search size={16} /><input className="input" placeholder="Search by school, head or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search schools" /></div>
        <select className="select" style={{ width: "auto" }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="approved">Approved</option><option value="pending">Pending</option></select>
      </div>
      {loading ? <Loading /> : shown.length === 0 ? (
        <div className="card"><EmptyState emoji="🏫" title={schools.length ? "No schools match" : "No schools yet"} action={!schools.length && <Link to="/add-school" className="btn">Add the first school</Link>} /></div>
      ) : (
        <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {shown.map((s) => (
            <article key={s._id} className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
              <header className="row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
                <h3 style={{ margin: 0 }}>{s.name}</h3>
                <span className={`badge-pill ${s.status === "approved" ? "green" : "amber"}`}>{s.status === "approved" ? "Approved" : "Pending"}</span>
              </header>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".35rem", fontSize: ".88rem", color: "var(--muted)" }}>
                <li className="row" style={{ gap: ".5rem", flexWrap: "nowrap" }}><UserRound size={15} />{s.headmaster}</li>
                <li className="row" style={{ gap: ".5rem", flexWrap: "nowrap", wordBreak: "break-all" }}><Mail size={15} />{s.email}</li>
                <li className="row" style={{ gap: ".5rem", flexWrap: "nowrap" }}><Phone size={15} />{s.phone}</li>
                <li className="row" style={{ gap: ".5rem", flexWrap: "nowrap" }}><MapPin size={15} />{[s.address, s.city].filter((x) => x && x !== "N/A").join(", ") || "—"}</li>
                {s.website && s.website !== "N/A" && <li className="row" style={{ gap: ".5rem", flexWrap: "nowrap" }}><Globe size={15} />{s.website}</li>}
              </ul>
              <div className="row" style={{ borderTop: "1px dashed var(--border-strong)", paddingTop: ".7rem", marginTop: "auto", color: "var(--muted)", fontSize: ".82rem" }}>
                <span><GraduationCap size={14} style={{ verticalAlign: "-2px" }} /> <b style={{ color: "var(--dark)" }}>{s.numberOfStudents || 0}</b> students</span>
                <span><b style={{ color: "var(--dark)" }}>{s.numberOfTeachers || 0}</b> teachers</span>
                <span><b style={{ color: "var(--dark)" }}>{s.numberOfClasses || 0}</b> classes</span>
              </div>
            </article>))}
        </div>
      )}
    </div>
  );
}
