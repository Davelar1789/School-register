import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { Plus } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const plain = (html) => html.replace(/<[^>]*>/g, "").trim();

export default function TopicsEditorPage() {
  const { classId: routeClass, subjectId } = useParams();
  const [params] = useSearchParams();
  const classId = params.get("classId") || routeClass;

  const [term, setTerm] = useState("Term 1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [names, setNames] = useState({ cls: "", subject: "" });

  useEffect(() => {
    Promise.all([api.get(`/api/classes/${classId}`), api.get(`/api/subjects/${subjectId}`)])
      .then(([c, s]) => setNames({ cls: c.data?.className || "", subject: s.data?.name || "" })).catch(() => {});
  }, [classId, subjectId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/topics/subjects/${subjectId}/topics`, { params: { classId, term } });
      setTopics(Array.isArray(data) ? data : []);
    } catch { toast.error("Couldn't load topics"); } finally { setLoading(false); }
  }, [subjectId, classId, term]);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim() || !plain(description)) { toast.error("Add a title and a description"); return; }
    setSaving(true);
    try {
      await api.post(`/api/topics/subjects/${subjectId}/topics`, { classId, term, title: title.trim(), description });
      toast.success("Topic added");
      setTitle(""); setDescription("");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't save the topic"); } finally { setSaving(false); }
  };

  return (
    <div className="page page-narrow">
      <PageHeader crumbs={[{ label: "Classes", to: "/classes" }, { label: names.cls || "Class", to: `/classes/${classId}/subjects` }, { label: names.subject || "Subject" }]}
        title="Course topics" subtitle={`${names.subject} · ${names.cls}`.replace(/^ · | · $/g, "")} />

      <div className="tabs" role="tablist" style={{ marginBottom: "1.2rem" }}>
        {TERMS.map((t) => <button key={t} role="tab" aria-selected={term === t} className={`tab ${term === t ? "active" : ""}`} onClick={() => setTerm(t)}>{t}</button>)}
      </div>

      <form className="card" onSubmit={add} style={{ marginBottom: "1.5rem" }}>
        <div className="card-head"><h3>Add a topic to {term}</h3></div>
        <div className="field"><label htmlFor="tp-title">Title</label>
          <input id="tp-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fractions and decimals" /></div>
        <div className="field"><label>Description</label><ReactQuill theme="snow" value={description} onChange={setDescription} /></div>
        <button className="btn" disabled={saving}><Plus size={16} /> {saving ? "Saving…" : "Add topic"}</button>
      </form>

      <h2 style={{ marginBottom: ".8rem" }}>Topics in {term}</h2>
      {loading ? <Loading /> : topics.length === 0 ? (
        <div className="card"><EmptyState emoji="🗒️" title={`No topics for ${term} yet`}>Teachers see these in their curriculum view.</EmptyState></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
          {topics.map((t, i) => (
            <details key={t._id} className="card" style={{ padding: "1rem 1.2rem" }}>
              <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--dark)", display: "flex", gap: ".7rem", alignItems: "center" }}>
                <span className="badge-pill">{i + 1}</span>{t.title}</summary>
              <div style={{ marginTop: ".8rem", color: "var(--text)" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.description || "") }} />
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
