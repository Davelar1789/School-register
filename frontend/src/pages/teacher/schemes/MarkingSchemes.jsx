import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ChevronRight, Download, Eye, Lock, School } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

const fmt = (d) => new Date(d).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function MarkingSchemes() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api.get("/api/marking-schemes/teacher/my-scope")
      .then(({ data }) => setClasses(data.classes || []))
      .catch(() => toast.error("Couldn't load marking schemes"))
      .finally(() => setLoading(false));
  }, []);

  const access = async (subj, mode) => {
    setBusy(`${subj.schemeId}:${mode}`);
    try {
      const { data } = await api.get(`/api/marking-schemes/teacher/access/${subj.schemeId}`);
      if (mode === "open") window.open(data.fileUrl, "_blank", "noopener,noreferrer");
      else {
        const a = document.createElement("a");
        a.href = data.fileUrl;
        a.download = `${selected.className}_${subj.subjectName}_${data.title || "marking-scheme"}`.replace(/\s+/g, "_");
        a.target = "_blank"; a.rel = "noopener noreferrer";
        document.body.appendChild(a); a.click(); a.remove();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Unable to open this marking scheme"); } finally { setBusy(null); }
  };

  return (
    <div className="page page-narrow">
      <PageHeader crumbs={selected ? [{ label: "Marking schemes", to: "/marking-schemes" }, { label: selected.className }] : undefined}
        title={selected ? selected.className : "Marking schemes"} subtitle={selected ? "Schemes unlock automatically at the time set by your admin." : "End-of-term marking schemes for the classes you teach."} />
      {loading ? <Loading /> : classes.length === 0 ? (
        <div className="card"><EmptyState emoji="📝" title="Nothing here yet">No marking schemes have been shared for your classes and subjects.</EmptyState></div>
      ) : !selected ? (
        <div className="grid-cards">
          {classes.map((c) => (
            <button key={c.classId} className="cur-card card-hover" onClick={() => setSelected(c)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: ".9rem", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "1.1rem 1.2rem", boxShadow: "var(--shadow-sm)" }}>
              <span className="avatar"><School size={20} /></span>
              <span style={{ flex: 1 }}><strong style={{ display: "block", color: "var(--dark)" }}>{c.className}</strong><small className="muted">{c.subjects.length} subject{c.subjects.length === 1 ? "" : "s"}</small></span>
              <ChevronRight size={18} color="var(--subtle)" />
            </button>))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setSelected(null)}>← All classes</button>
          {selected.subjects.map((s) => (
            <article key={s.subjectId} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", opacity: s.isUnlocked ? 1 : .85 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong style={{ color: "var(--dark)", fontSize: "1.02rem" }}>{s.subjectName}</strong><br />
                <small className="muted">{s.term} · {s.academicYear}</small>
                {!s.isUnlocked && <div style={{ marginTop: ".4rem" }}><span className="badge-pill amber"><Lock size={12} /> Unlocks {fmt(s.availableFrom)}</span></div>}
              </div>
              <div className="row">
                <button className="btn btn-outline btn-sm" disabled={!s.isUnlocked || busy === `${s.schemeId}:open`} onClick={() => access(s, "open")}><Eye size={15} /> View</button>
                <button className="btn btn-sm" disabled={!s.isUnlocked || busy === `${s.schemeId}:download`} onClick={() => access(s, "download")}><Download size={15} /> Download</button>
              </div>
            </article>))}
        </div>
      )}
    </div>
  );
}
