import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BookOpen, ChevronRight, ListChecks } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

export default function ClassSubjectsPage() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, c] = await Promise.all([api.get(`/api/subjects/class/${classId}`), api.get(`/api/classes/${classId}`)]);
        if (!alive) return;
        setSubjects(Array.isArray(s.data) ? s.data : []);
        setClassName(c.data?.className || "Class");
      } catch { toast.error("Couldn't load this class's subjects"); } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [classId]);

  return (
    <div className="page page-narrow">
      <PageHeader crumbs={[{ label: "Classes", to: "/classes" }, { label: className || "…" }]} title={`${className || "Class"} subjects`}
        subtitle="Pick a subject to plan its topics for each term." />
      {loading ? <Loading /> : subjects.length === 0 ? (
        <div className="card"><EmptyState emoji="📘" title="No subjects for this class yet" action={<Link to="/subjects" className="btn">Manage subjects</Link>}>Add subjects and tick this class to see them here.</EmptyState></div>
      ) : (
        <div className="grid-cards">
          {subjects.map((s) => (
            <Link key={s._id} to={`/classes/${classId}/subjects/${s._id}/topics?classId=${classId}`} className="card card-hover" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: ".9rem" }}>
              <span className="avatar" style={{ width: 46, height: 46, borderRadius: 14, background: "var(--blue-light)", color: "var(--blue)" }}><BookOpen size={20} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><strong style={{ color: "var(--dark)", display: "block" }}>{s.name}</strong>
                <small className="muted" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><ListChecks size={13} /> Edit topics</small></div>
              <ChevronRight size={18} color="var(--subtle)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
