import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  ArrowRight, Bell, BookOpenCheck, CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, Library, School, Sparkles, Users, Clock3,
} from "lucide-react";
import api from "../../../api/axios";
import { decodeToken, readJSON } from "../../../utils/auth";
import "../../../styles/dashboard.css";

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const ago = (iso) => {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};

const QUICK = [
  { label: "Mark attendance", to: "/attendance", icon: ClipboardCheck, tone: "teal" },
  { label: "Gradebook", to: "/gradebook", icon: BookOpenCheck, tone: "amber" },
  { label: "Curriculum", to: "/curriculum", icon: Library, tone: "purple" },
  { label: "Marking schemes", to: "/marking-schemes", icon: FileCheck2, tone: "coral" },
];

export default function TeacherDashboard() {
  const decoded = useMemo(() => decodeToken(), []);
  const teacher = useMemo(() => readJSON("teacher", {}), []);
  const firstName = (decoded?.fullName || teacher?.fullName || teacher?.name || "Teacher").split(" ")[0];

  const [online, setOnline] = useState(navigator.onLine);
  const [snap, setSnap] = useState(null);
  const [classes, setClasses] = useState(() => readJSON("offlineClasses", []));
  const [events, setEvents] = useState({});
  const [notes, setNotes] = useState([]);
  const [schemesOpen, setSchemesOpen] = useState(0);
  const [selected, setSelected] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    if (!online) { setLoading(false); return; }
    let alive = true;
    const settle = (p) => p.then((r) => r.data).catch(() => null);
    (async () => {
      const [today, cls, ev, nt, sc] = await Promise.all([
        settle(api.get("/api/attendance/my-today")),
        settle(api.get("/api/teachers/teacher/teacher-classes")),
        settle(api.get("/api/events/my-school")),
        decoded?.id ? settle(api.get(`/api/notification/teacher/${decoded.id}`)) : null,
        settle(api.get("/api/marking-schemes/teacher/my-scope")),
      ]);
      if (!alive) return;
      setSnap(today);
      if (cls?.classes) { setClasses(cls.classes); localStorage.setItem("offlineClasses", JSON.stringify(cls.classes)); }
      const map = {};
      (ev?.events || []).forEach((e) => { map[dayKey(e.date)] = { type: e.type, title: e.title, description: e.description }; });
      setEvents(map);
      setNotes(Array.isArray(nt) ? nt.slice(0, 4) : []);
      setSchemesOpen((sc?.classes || []).reduce((n, c) => n + c.subjects.filter((s) => s.isUnlocked).length, 0));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [online, decoded?.id]);

  const total = snap?.classesTotal ?? classes.length;
  const marked = snap?.classesMarked ?? 0;
  const pct = total ? Math.round((marked / total) * 100) : 0;
  const type = teacher?.teacherType || decoded?.teacherType;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const selectedEvent = events[dayKey(selected)];
  const today = dayKey(new Date());
  const upcoming = Object.entries(events).filter(([k]) => k >= today).sort(([a], [b]) => a.localeCompare(b)).slice(0, 4);
  const perClass = snap?.classes || classes.map((c) => ({ _id: c._id, className: c.className, marked: false }));

  return (
    <div className="page dash">
      <section className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-chip"><Sparkles size={13} /> {type || "Teacher"}</span>
          <h1>{greeting}, {firstName} 👋</h1>
          <p>{!online ? "You're offline — attendance you mark is saved on this device and syncs later." : total ? `You teach ${total} class${total === 1 ? "" : "es"}. Here's today at a glance.` : "Here's what's happening today."}</p>
          <div className="dash-hero-cta">
            <Link to="/attendance" className="btn btn-warn"><ClipboardCheck size={16} /> Mark attendance</Link>
            <Link to="/gradebook" className="btn dash-ghost"><BookOpenCheck size={16} /> Open gradebook</Link>
          </div>
        </div>
        <div className="dash-hero-date"><CalendarDays size={16} />{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
      </section>

      {schemesOpen > 0 && (
        <div className="dash-banner">
          <FileCheck2 size={22} color="#b97800" />
          <div><strong>{schemesOpen} marking scheme{schemesOpen === 1 ? " is" : "s are"} available</strong><small>View and download the official schemes for your exams.</small></div>
          <Link to="/marking-schemes" className="btn btn-warn btn-sm">View schemes <ArrowRight size={15} /></Link>
        </div>
      )}

      <section className="dash-stats">
        <Link to="/my-classes" className="dash-stat tone-teal"><span className="dash-stat-ico"><School size={22} /></span><span className="dash-stat-body"><strong>{total}</strong><small>My classes</small></span></Link>
        <Link to="/attendance" className="dash-stat tone-amber"><span className="dash-stat-ico"><ClipboardCheck size={22} /></span><span className="dash-stat-body"><strong>{marked}/{total}</strong><small>Marked today</small></span></Link>
        <Link to="/attendance" className="dash-stat tone-purple"><span className="dash-stat-ico"><Users size={22} /></span><span className="dash-stat-body"><strong>{snap?.present ?? "—"}</strong><small>Students present</small></span></Link>
        <Link to="/notifications2" className="dash-stat tone-coral"><span className="dash-stat-ico"><Bell size={22} /></span><span className="dash-stat-body"><strong>{notes.length}</strong><small>Recent notices</small></span></Link>
      </section>

      <section className="dash-grid">
        <div className="card dash-card">
          <div className="card-head"><h2><ClipboardCheck size={18} /> Attendance today</h2>{snap?.isWeekend ? <span className="badge-pill">Weekend</span> : <span className="badge-pill">{pct}%</span>}</div>
          {snap?.isWeekend ? <p className="dash-note">It's the weekend — no attendance is taken.</p> : (
            <>
              <div className="dash-progress"><div><span>Classes marked</span><b>{marked} / {total}</b></div><progress value={marked} max={Math.max(total, 1)} /></div>
              {perClass.length ? (
                <ul className="dash-classlist" style={{ marginTop: "1rem" }}>
                  {perClass.map((c) => (
                    <li key={c._id}><School size={16} />{c.className}
                      {!online ? <span className="st todo"><Clock3 size={14} /> Offline</span> : c.marked ? <span className="st ok"><CheckCircle2 size={14} /> Marked</span> : <span className="st todo"><Clock3 size={14} /> To do</span>}</li>))}
                </ul>
              ) : <p className="dash-note">{loading ? "Loading…" : "No classes are assigned to you yet. Ask your admin to assign you."}</p>}
            </>
          )}
          <Link to="/attendance" className="dash-link">Go to attendance <ArrowRight size={14} /></Link>
        </div>

        <div className="card dash-card">
          <div className="card-head"><h2><Sparkles size={18} /> Quick actions</h2></div>
          <div className="dash-qa" style={{ gridTemplateColumns: "1fr" }}>
            {QUICK.map(({ label, to, icon: Icon, tone }) => (
              <Link key={to} to={to} className={`dash-qa-item tone-${tone}`}><span><Icon size={18} /></span>{label}<ArrowRight size={14} /></Link>))}
          </div>
        </div>

        <div className="card dash-card">
          <div className="card-head"><h2><Bell size={18} /> Latest notices</h2></div>
          {notes.length ? (
            <ul className="dash-notices">{notes.map((n) => (<li key={n._id} className={`type-${n.type}`}><b>{n.title}</b><p>{n.message}</p><small>{ago(n.createdAt)}</small></li>))}</ul>
          ) : <p className="dash-note">{loading ? "Loading…" : "No notices yet."}</p>}
          <Link to="/notifications2" className="dash-link">All notifications <ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="dash-bottom">
        <div className="card dash-card dash-cal">
          <div className="card-head"><h2><CalendarDays size={18} /> School calendar</h2></div>
          <Calendar onChange={setSelected} value={selected}
            tileContent={({ date, view }) => { if (view !== "month") return null; const ev = events[dayKey(date)]; return ev ? <span className={`dash-dot ${ev.type === "holiday" ? "holiday" : ""}`} title={ev.title} /> : null; }} />
          <div className="dash-day">
            <p>{selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            {selectedEvent ? (
              <div className="dash-day-event"><span className={`badge-pill ${selectedEvent.type === "holiday" ? "coral" : ""}`}>{selectedEvent.type === "holiday" ? "🏖️ Holiday" : "📅 Event"}</span><strong>{selectedEvent.title}</strong>{selectedEvent.description && <small>{selectedEvent.description}</small>}</div>
            ) : <small className="muted">Nothing scheduled.</small>}
          </div>
        </div>
        <div className="card dash-card">
          <div className="card-head"><h2><CalendarDays size={18} /> Coming up</h2></div>
          {upcoming.length ? (
            <ul className="dash-upcoming">{upcoming.map(([k, ev]) => (
              <li key={k}><time className={ev.type === "holiday" ? "holiday" : ""}><b>{new Date(k + "T00:00").getDate()}</b>{new Date(k + "T00:00").toLocaleDateString(undefined, { month: "short" })}</time>
                <div><strong>{ev.title}</strong><small>{ev.type === "holiday" ? "School holiday" : "Event"}</small></div></li>))}</ul>
          ) : <p className="dash-note">No upcoming events.</p>}
        </div>
      </section>
    </div>
  );
}
