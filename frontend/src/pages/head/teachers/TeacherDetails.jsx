import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BookOpen, CalendarDays, Mail, Phone, Plus, School, UserRound } from "lucide-react";
import api from "../../../api/axios";
import { initials } from "../../../utils/auth";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import "../students/StudentDetails.css";

const STATUS_TONE = { Active: "green", "On Leave": "amber", Retired: "gray" };

export default function TeacherDetails() {
  const { id } = useParams();
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [tab, setTab] = useState("classes");

  const [classPick, setClassPick] = useState("");
  const [subjectClass, setSubjectClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ data }, cls] = await Promise.all([
        api.get(`/api/teachers/${id}`),
        schoolId ? api.get(`/api/classes/school/${schoolId}`).then((r) => r.data).catch(() => []) : [],
      ]);
      setTeacher(data);
      setClasses(Array.isArray(cls) ? cls : []);
    } catch (err) {
      if (err.response?.status === 404) setMissing(true); else toast.error("Couldn't load this teacher");
    } finally { setLoading(false); }
  }, [id, schoolId]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const assigned = teacher?.classesAssigned || [];
  const specialisations = teacher?.subjectSpecialization || [];
  const unassigned = classes.filter((c) => !assigned.some((a) => a._id === c._id));
  const canClass = teacher && ["Class Teacher", "Both"].includes(teacher.teacherType);
  const canSubject = teacher && ["Subject Teacher", "Both"].includes(teacher.teacherType);

  const assignClass = async () => {
    if (!classPick) return;
    setBusy(true);
    try {
      await api.post("/api/classes/assign-teacher", { teacherId: id, classId: classPick });
      toast.success("Class assigned");
      setClassPick("");
      await load();
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't assign the class"); } finally { setBusy(false); }
  };

  const pickSubjectClass = async (classId) => {
    setSubjectClass(classId); setPicked([]); setSubjects([]);
    if (!classId) return;
    try {
      const { data } = await api.get(`/api/classes/${classId}/subjects`);
      setSubjects(Array.isArray(data) ? data : []);
    } catch { toast.error("Couldn't load that class's subjects"); }
  };

  const assignSubjects = async () => {
    if (!subjectClass || !picked.length) { toast.error("Choose a class and at least one subject"); return; }
    setBusy(true);
    try {
      await api.post("/api/classes/assign-subject-teacher2", { teacherId: id, classId: subjectClass, subjectIds: picked });
      toast.success("Subjects assigned");
      setSubjectClass(""); setSubjects([]); setPicked([]);
      await load();
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't assign subjects"); } finally { setBusy(false); }
  };

  if (loading) return <div className="page"><Loading label="Loading teacher…" /></div>;
  if (missing || !teacher) return <div className="page"><div className="card"><EmptyState emoji="🔍" title="Teacher not found">This teacher may have been removed.</EmptyState></div></div>;

  const Fact = ({ icon: Icon, label, value }) => (
    <div className="sd-fact"><span className="sd-fact-ico"><Icon size={17} /></span><div><small>{label}</small><strong>{value || "—"}</strong></div></div>
  );

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "Teachers", to: "/teachers" }, { label: teacher.name }]} title="Teacher profile" />
      <div className="sd-layout">
        <aside className="card sd-side">
          <div className="sd-avatar" style={{ background: "linear-gradient(135deg, var(--purple), #9b7fe0)", boxShadow: "0 10px 28px rgba(124,92,191,.35)" }}>{initials(teacher.name)}</div>
          <h2>{teacher.name}</h2>
          <div className="sd-chips">
            <span className="badge-pill purple">{teacher.teacherType}</span>
            <span className={`badge-pill ${STATUS_TONE[teacher.status] || "gray"}`}>{teacher.status}</span>
          </div>
          <div className="sd-facts">
            <Fact icon={UserRound} label="Staff ID" value={teacher.staffId} />
            <Fact icon={Mail} label="Email" value={teacher.email} />
            <Fact icon={Phone} label="Phone" value={teacher.phone} />
            <Fact icon={CalendarDays} label="Joined" value={teacher.joinedDate ? new Date(teacher.joinedDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : ""} />
          </div>
        </aside>

        <section className="sd-main">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "classes"} className={`tab ${tab === "classes" ? "active" : ""}`} onClick={() => setTab("classes")}>Classes ({assigned.length})</button>
            <button role="tab" aria-selected={tab === "subjects"} className={`tab ${tab === "subjects" ? "active" : ""}`} onClick={() => setTab("subjects")}>Subjects ({specialisations.length})</button>
          </div>

          {tab === "classes" && (
            <div className="card">
              <div className="card-head"><h3><School size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Class teacher of</h3></div>
              {assigned.length ? (
                <div className="row" style={{ marginBottom: "1.2rem" }}>{assigned.map((c) => <span key={c._id} className="badge-pill">{c.className}</span>)}</div>
              ) : <p className="muted" style={{ marginBottom: "1.2rem" }}>No classes assigned yet.</p>}
              {!canClass && <p className="alert warn">This teacher is registered as a <b>{teacher.teacherType}</b>. Change their role to “Class teacher” or “Both” to assign classes.</p>}
              <div className="row">
                <select className="select" style={{ flex: "1 1 220px", width: "auto" }} value={classPick} onChange={(e) => setClassPick(e.target.value)} disabled={!canClass} aria-label="Class to assign">
                  <option value="">{unassigned.length ? "Choose a class…" : "All classes are assigned"}</option>
                  {unassigned.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
                <button className="btn" onClick={assignClass} disabled={!classPick || busy || !canClass}><Plus size={16} /> Assign class</button>
              </div>
              <p className="muted" style={{ marginTop: ".8rem", fontSize: ".85rem" }}>A class teacher can mark attendance and see every subject for that class.</p>
            </div>
          )}

          {tab === "subjects" && (
            <div className="card">
              <div className="card-head"><h3><BookOpen size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />Subject specialisation</h3></div>
              {specialisations.length ? (
                <div className="row" style={{ marginBottom: "1.2rem" }}>{specialisations.map((s) => <span key={s._id} className="badge-pill blue">{s.name}</span>)}</div>
              ) : <p className="muted" style={{ marginBottom: "1.2rem" }}>No subjects assigned yet.</p>}
              {!canSubject && <p className="alert warn">This teacher is registered as a <b>{teacher.teacherType}</b>. Change their role to “Subject teacher” or “Both” to assign subjects.</p>}
              <div className="field">
                <label htmlFor="sub-class">Class</label>
                <select id="sub-class" className="select" value={subjectClass} onChange={(e) => pickSubjectClass(e.target.value)} disabled={!canSubject}>
                  <option value="">Choose a class…</option>
                  {classes.filter((c) => c.subjects?.length > 0).map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
                </select>
              </div>
              {subjects.length > 0 && (
                <>
                  <div className="row" style={{ marginBottom: "1rem" }}>
                    {subjects.map((s) => (
                      <label key={s._id} className={`tab ${picked.includes(s._id) ? "active" : ""}`} style={{ cursor: "pointer", border: "1.5px solid var(--border-strong)", display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" checked={picked.includes(s._id)} onChange={() => setPicked((p) => (p.includes(s._id) ? p.filter((x) => x !== s._id) : [...p, s._id]))} />
                        {s.name}
                      </label>
                    ))}
                  </div>
                  <button className="btn" onClick={assignSubjects} disabled={busy || !picked.length}>Assign {picked.length || ""} subject{picked.length === 1 ? "" : "s"}</button>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
