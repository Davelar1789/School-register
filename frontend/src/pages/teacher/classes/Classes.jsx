import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, GraduationCap } from "lucide-react";
import api from "../../../api/axios";
import { readJSON } from "../../../utils/auth";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";

export default function TeacherClasses() {
  const [classes, setClasses] = useState(() => readJSON("offlineClasses", []));
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get("/api/teachers/teacher/teacher-classes")
      .then(({ data }) => { setClasses(data.classes || []); localStorage.setItem("offlineClasses", JSON.stringify(data.classes || [])); })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PageHeader title="My classes" subtitle={classes.length ? `You teach ${classes.length} class${classes.length === 1 ? "" : "es"}.` : ""} />
      {loading && !classes.length ? <Loading /> : classes.length === 0 ? (
        <div className="card"><EmptyState emoji="🏫" title={failed ? "Couldn't load your classes" : "No classes assigned yet"}>
          {failed ? "Check your connection and try again." : "Ask your school admin to assign you to a class."}</EmptyState></div>
      ) : (
        <div className="grid-cards">
          {classes.map((c) => (
            <article key={c._id} className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
              <div className="row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
                <span className="avatar" style={{ width: 48, height: 48, borderRadius: 14 }}><GraduationCap size={22} /></span>
                <span className="badge-pill">{c.level}</span>
              </div>
              <div><h3 style={{ margin: 0, fontSize: "1.25rem" }}>{c.className}</h3>
                <small className="muted">{c.students?.length ?? 0} student{c.students?.length === 1 ? "" : "s"}</small></div>
              <div className="row" style={{ marginTop: "auto" }}>
                <Link to={`/class/${c._id}`} className="btn btn-secondary btn-sm">Students <ArrowRight size={14} /></Link>
                <Link to="/attendance" className="btn btn-ghost btn-sm"><ClipboardCheck size={14} /> Attendance</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
