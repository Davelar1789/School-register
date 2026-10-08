import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";
import api from "../../../api/axios";
import { initials } from "../../../utils/auth";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

export default function ClassDetails() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ data: c }, list] = await Promise.all([
          api.get(`/api/classes/${id}`),
          api.get(`/api/student/class/${id}`).then((r) => (Array.isArray(r.data) ? r.data : r.data?.students || [])).catch(() => null),
        ]);
        if (!alive) return;
        setCls(c);
        setStudents(list || c.students || []);
      } catch { if (alive) toast.error("Couldn't load this class"); } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  const shown = useMemo(() => students
    .filter((s) => !search || s.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.name || "").localeCompare(b.name || "")), [students, search]);

  if (loading) return <div className="page"><Loading /></div>;
  if (!cls) return <div className="page"><div className="card"><EmptyState emoji="🔍" title="Class not found" action={<Link className="btn" to="/my-classes">Back to my classes</Link>} /></div></div>;

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "My classes", to: "/my-classes" }, { label: cls.className }]} title={cls.className}
        subtitle={`${cls.level} · ${students.length} student${students.length === 1 ? "" : "s"}`}
        actions={<Link to="/attendance" className="btn">Mark attendance</Link>} />
      {students.length > 8 && <div className="toolbar"><div className="search-input-wrap"><Search size={16} /><input className="input" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" /></div></div>}
      {shown.length === 0 ? (
        <div className="card"><EmptyState emoji="👩‍🎓" title={students.length ? "No student matches" : "No students in this class yet"} /></div>
      ) : (
        <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {shown.map((s, i) => (
            <div key={s._id} className="card" style={{ display: "flex", alignItems: "center", gap: ".8rem", padding: ".9rem 1rem" }}>
              <span className="avatar">{initials(s.name)}</span>
              <div style={{ minWidth: 0 }}><strong style={{ display: "block", color: "var(--dark)" }}>{s.name}</strong><small className="muted">#{i + 1}{s.idno ? ` · ${s.idno}` : ""}</small></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
