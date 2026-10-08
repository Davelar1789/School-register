import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import api from "../../../api/axios";
import { decodeToken } from "../../../utils/auth";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

export default function MySubjects() {
  const teacherId = useMemo(() => decodeToken()?.id, []);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState([]);

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    api.get(`/api/teachers/${teacherId}/subjects`).then(({ data }) => {
      const g = {};
      (data.subjects || []).forEach((item) => { (g[item.subjectName] ||= []).push(item); });
      setGroups(g);
      setOpen(Object.keys(g).slice(0, 1));
    }).catch(() => setFailed(true)).finally(() => setLoading(false));
  }, [teacherId]);

  const toggle = (name) => setOpen((o) => (o.includes(name) ? o.filter((x) => x !== name) : [...o, name]));
  const entries = Object.entries(groups);

  return (
    <div className="page page-narrow">
      <PageHeader title="My subjects" subtitle={entries.length ? `${entries.length} subject${entries.length === 1 ? "" : "s"} across your classes.` : ""} />
      {loading ? <Loading /> : entries.length === 0 ? (
        <div className="card"><EmptyState emoji="📚" title={failed ? "Couldn't load your subjects" : "No subjects assigned yet"}>
          {failed ? "Check your connection and try again." : "Ask your school admin to assign subjects to you."}</EmptyState></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
          {entries.map(([name, items]) => {
            const isOpen = open.includes(name);
            return (
              <section key={name} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <button type="button" onClick={() => toggle(name)} aria-expanded={isOpen}
                  style={{ all: "unset", boxSizing: "border-box", width: "100%", display: "flex", alignItems: "center", gap: ".9rem", padding: "1rem 1.2rem", cursor: "pointer" }}>
                  <span className="avatar" style={{ width: 42, height: 42, borderRadius: 12, background: "var(--blue-light)", color: "var(--blue)" }}><BookOpen size={19} /></span>
                  <strong style={{ flex: 1, fontSize: "1.05rem", color: "var(--dark)" }}>{name}</strong>
                  <span className="badge-pill">{items.length} class{items.length === 1 ? "" : "es"}</span>
                  <ChevronDown size={18} style={{ transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none", color: "var(--muted)" }} />
                </button>
                {isOpen && (
                  <div className="row" style={{ padding: "0 1.2rem 1.2rem" }}>
                    {items.map((it, i) => <span key={i} className="badge-pill blue">{it.className}</span>)}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
