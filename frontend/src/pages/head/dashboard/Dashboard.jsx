import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Bell, CalendarDays, CalendarCheck, ChevronRight, ClipboardCheck, FileBarChart, GraduationCap,
  Landmark, Pencil, Plus, School, Settings, Sparkles, Trash2, TrendingUp, Users, Wallet, FileSignature, Presentation,
} from "lucide-react";
import api from "../../../api/axios";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { decodeToken, readJSON } from "../../../utils/auth";
import "../../../styles/dashboard.css";

/* local (not UTC) yyyy-mm-dd so events never slip a day in other time-zones */
const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const money = (n) => `GH₵ ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const timeAgo = (iso) => {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};

const QUICK = [
  { label: "Students",        to: "/students",        icon: GraduationCap, tone: "teal" },
  { label: "Teachers",        to: "/teachers",        icon: Presentation,  tone: "purple" },
  { label: "Report Cards",    to: "/view-reports",    icon: FileBarChart,  tone: "amber" },
  { label: "Record Fees",     to: "/school-fees",     icon: Wallet,        tone: "coral" },
  { label: "Marking Schemes", to: "/upload-scheme",   icon: FileSignature, tone: "blue" },
  { label: "School Settings", to: "/school-settings", icon: Settings,      tone: "green" },
];

function useCountUp(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      setV(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Stat({ icon: Icon, label, value, tone, to, prefix = "" }) {
  const n = useCountUp(Number(value) || 0);
  return (
    <Link to={to} className={`dash-stat tone-${tone}`}>
      <span className="dash-stat-ico"><Icon size={22} /></span>
      <span className="dash-stat-body">
        <strong>{prefix}{n.toLocaleString()}</strong>
        <small>{label}</small>
      </span>
      <ChevronRight size={16} className="dash-stat-go" />
    </Link>
  );
}

function Donut({ percent, size = 112, label, sub }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div className="dash-donut" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${label} ${percent}%`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--teal-light)" strokeWidth="11" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--teal)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(percent, 100) / 100)}
          transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="dash-donut-mid"><strong>{label}</strong><small>{sub}</small></div>
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const decoded = useMemo(() => decodeToken(), []);
  const firstName = (decoded?.fullName || readJSON("user", {})?.fullName || "Admin").split(" ")[0];

  const [school, setSchool] = useState(() => readJSON("schoolData", null));
  const [att, setAtt] = useState(null);
  const [money$, setMoney] = useState({ fees: 0, feeding: 0, expenses: 0 });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState({});
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selected, setSelected] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "custom", title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  /* ── load everything in parallel; each panel degrades independently ── */
  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const { data } = await api.get("/api/events/my-school");
      const map = {};
      (data?.events || []).forEach((ev) => {
        map[dayKey(ev.date)] = { id: ev._id, type: ev.type, title: ev.title, description: ev.description };
      });
      setEvents(map);
    } catch { /* calendar is optional */ } finally { setLoadingEvents(false); }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      let s = school;
      try {
        const { data } = await api.get(`/api/schools/user/${decoded?.id}`);
        s = data?.school || data;
        if (alive && s && !Array.isArray(s)) {
          setSchool(s);
          localStorage.setItem("schoolData", JSON.stringify(s));
          window.dispatchEvent(new Event("schoolDataUpdated"));
        }
      } catch { /* use cache */ }

      const sid = s?._id || decoded?.schoolId;
      const settle = (p) => p.then((r) => r.data).catch(() => null);
      const [today, fees, feeding, exp, notes] = await Promise.all([
        sid ? settle(api.get(`/api/attendance/school-today/${sid}`)) : null,
        sid ? settle(api.get(`/api/fees/total-paid/${sid}`)) : null,
        sid ? settle(api.get(`/api/classes/total-income/${sid}`)) : null,
        sid ? settle(api.get(`/api/expenses/category-totals/${sid}`)) : null,
        decoded?.id ? settle(api.get(`/api/notification/user/${decoded.id}`)) : null,
      ]);
      if (!alive) return;
      setAtt(today);
      setMoney({
        fees: fees?.totalFeesPaid || 0,
        feeding: feeding?.totalFeedingPaid || 0,
        expenses: exp && typeof exp === "object" ? Object.values(exp).reduce((a, b) => a + (Number(b) || 0), 0) : 0,
      });
      setNotices(Array.isArray(notes) ? notes.slice(0, 4) : []);
      setLoading(false);
    })();
    loadEvents();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── calendar ── */
  const openDay = (date) => {
    setSelected(date);
    const ev = events[dayKey(date)];
    setEditing(ev || null);
    setForm(ev
      ? { type: ev.type, title: ev.title === "Holiday" ? "" : ev.title, description: ev.description || "" }
      : { type: "custom", title: "", description: "" });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); };

  const save = async () => {
    if (form.type === "custom" && !form.title.trim()) { toast.error("Give the event a title"); return; }
    setSaving(true);
    try {
      const payload = {
        date: dayKey(selected), type: form.type,
        title: form.type === "holiday" ? "Holiday" : form.title.trim(), description: form.description.trim(),
      };
      if (editing) await api.put(`/api/events/${editing.id}`, payload);
      else await api.post("/api/events", payload);
      toast.success(editing ? "Event updated" : "Event added");
      await loadEvents();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save the event");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(`/api/events/${editing.id}`);
      toast.success("Event deleted");
      await loadEvents();
      setConfirmDel(false);
      closeModal();
    } catch { toast.error("Could not delete the event"); } finally { setSaving(false); }
  };

  const upcoming = useMemo(() => {
    const today = dayKey(new Date());
    return Object.entries(events).filter(([k]) => k >= today).sort(([a], [b]) => a.localeCompare(b)).slice(0, 5);
  }, [events]);
  const selectedEvent = events[dayKey(selected)];

  const students = school?.numberOfStudents || 0;
  const pct = att && att.recorded > 0 ? Math.round((att.present / att.recorded) * 100) : null;
  const net = money$.fees + money$.feeding - money$.expenses;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page dash">
      {/* ── welcome ── */}
      <section className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-chip"><Sparkles size={13} /> {school?.name || "Your school"}</span>
          <h1>{greeting}, {firstName} 👋</h1>
          <p>Here’s how your school is doing today.</p>
          <div className="dash-hero-cta">
            <button className="btn btn-warn" onClick={() => navigate("/students")}><Plus size={16} /> Admit a student</button>
            <button className="btn dash-ghost" onClick={() => navigate("/view-attendance")}><CalendarCheck size={16} /> View attendance</button>
          </div>
        </div>
        <div className="dash-hero-date">
          <CalendarDays size={16} />
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </section>

      {/* ── stats ── */}
      <section className="dash-stats">
        <Stat icon={GraduationCap} label="Students"   value={students}                        tone="teal"   to="/students" />
        <Stat icon={Presentation}  label="Teachers"   value={school?.numberOfTeachers || 0}   tone="purple" to="/teachers" />
        <Stat icon={School}        label="Classes"    value={school?.numberOfClasses || 0}    tone="amber"  to="/classes" />
        <Stat icon={Landmark}      label="Fees collected" value={money$.fees + money$.feeding} tone="coral" to="/fees" prefix="GH₵ " />
      </section>

      {/* ── middle ── */}
      <section className="dash-grid">
        <div className="card dash-card">
          <div className="card-head"><h2><ClipboardCheck size={18} /> Attendance today</h2>
            <span className="badge-pill">{att?.isWeekend ? "Weekend" : "Today"}</span></div>
          {loading ? <div className="skeleton" style={{ height: 130 }} /> : att && !att.isWeekend ? (
            <>
              <div className="dash-att">
                <Donut percent={pct ?? 0} label={pct === null ? "—" : `${pct}%`} sub="present" />
                <ul className="dash-legend">
                  <li><i style={{ background: "var(--teal)" }} /> Present <b>{att.present}</b></li>
                  <li><i style={{ background: "var(--coral)" }} /> Absent <b>{att.absent}</b></li>
                  <li><i style={{ background: "var(--amber)" }} /> Not yet marked <b>{Math.max(att.totalStudents - att.recorded, 0)}</b></li>
                </ul>
              </div>
              <div className="dash-progress" aria-label="Classes marked">
                <div><span>Classes marked</span><b>{att.classesMarked} / {att.classesTotal}</b></div>
                <progress value={att.classesMarked} max={Math.max(att.classesTotal, 1)} />
              </div>
            </>
          ) : (
            <p className="dash-note">{att?.isWeekend ? "It’s the weekend — no attendance is taken." : "Attendance data isn’t available right now."}</p>
          )}
          <Link to="/view-attendance" className="dash-link">Full attendance report <ChevronRight size={14} /></Link>
        </div>

        <div className="card dash-card">
          <div className="card-head"><h2><TrendingUp size={18} /> Finance snapshot</h2><span className="badge-pill green">All time</span></div>
          {loading ? <div className="skeleton" style={{ height: 130 }} /> : (
            <ul className="dash-fin">
              <li><span>School fees</span><b>{money(money$.fees)}</b></li>
              <li><span>Feeding fees</span><b>{money(money$.feeding)}</b></li>
              <li><span>Expenses</span><b className="neg">− {money(money$.expenses)}</b></li>
              <li className="net"><span>Net position</span><b className={net < 0 ? "neg" : "pos"}>{net < 0 ? "− " : ""}{money(Math.abs(net))}</b></li>
            </ul>
          )}
          <Link to="/income" className="dash-link">Income statement <ChevronRight size={14} /></Link>
        </div>

        <div className="card dash-card">
          <div className="card-head"><h2><Bell size={18} /> Latest notices</h2>
            {notices.length > 0 && <span className="badge-pill amber">{notices.length}</span>}</div>
          {loading ? <div className="skeleton" style={{ height: 130 }} /> : notices.length ? (
            <ul className="dash-notices">
              {notices.map((n) => (
                <li key={n._id} className={`type-${n.type}`}>
                  <b>{n.title}</b>
                  <p>{n.message}</p>
                  <small>{timeAgo(n.createdAt)}</small>
                </li>
              ))}
            </ul>
          ) : <p className="dash-note">You’re all caught up — no notices yet.</p>}
          <Link to="/notifications" className="dash-link">All notifications <ChevronRight size={14} /></Link>
        </div>
      </section>

      {/* ── bottom ── */}
      <section className="dash-bottom">
        <div className="card dash-card">
          <div className="card-head"><h2><Sparkles size={18} /> Quick actions</h2></div>
          <div className="dash-qa">
            {QUICK.map(({ label, to, icon: Icon, tone }) => (
              <Link key={to} to={to} className={`dash-qa-item tone-${tone}`}>
                <span><Icon size={18} /></span>{label}<ChevronRight size={14} />
              </Link>
            ))}
          </div>
          <div className="card-head" style={{ marginTop: "1.3rem" }}><h2><CalendarDays size={18} /> Upcoming</h2></div>
          {upcoming.length ? (
            <ul className="dash-upcoming">
              {upcoming.map(([k, ev]) => (
                <li key={k}>
                  <time className={ev.type === "holiday" ? "holiday" : ""}>
                    <b>{new Date(k + "T00:00").getDate()}</b>
                    {new Date(k + "T00:00").toLocaleDateString(undefined, { month: "short" })}
                  </time>
                  <div><strong>{ev.title}</strong><small>{ev.type === "holiday" ? "School holiday" : "Event"}</small></div>
                </li>
              ))}
            </ul>
          ) : <p className="dash-note">Nothing scheduled. Click a date on the calendar to add something.</p>}
        </div>

        <div className="card dash-card dash-cal">
          <div className="card-head"><h2><CalendarDays size={18} /> School calendar</h2>
            {loadingEvents && <span className="badge-pill gray">Syncing…</span>}</div>
          <Calendar
            onClickDay={openDay}
            value={selected}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const ev = events[dayKey(date)];
              return ev ? <span className={`dash-dot ${ev.type === "holiday" ? "holiday" : ""}`} title={ev.title} /> : null;
            }}
          />
          <div className="dash-day">
            <p>{selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            {selectedEvent ? (
              <div className="dash-day-event">
                <span className={`badge-pill ${selectedEvent.type === "holiday" ? "coral" : ""}`}>{selectedEvent.type === "holiday" ? "🏖️ Holiday" : "📅 Event"}</span>
                <strong>{selectedEvent.title}</strong>
                {selectedEvent.description && <small>{selectedEvent.description}</small>}
                <button className="btn btn-outline btn-sm" onClick={() => openDay(selected)}><Pencil size={13} /> Edit</button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => openDay(selected)}><Plus size={14} /> Add event</button>
            )}
          </div>
        </div>
      </section>

      {/* ── event modal ── */}
      <Modal
        open={modal}
        onClose={closeModal}
        title={editing ? "Edit event" : "Add event"}
        footer={(
          <>
            {editing && <button className="btn btn-danger-soft" style={{ marginRight: "auto" }} onClick={() => setConfirmDel(true)}><Trash2 size={15} /> Delete</button>}
            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add event"}</button>
          </>
        )}
      >
        <p className="muted" style={{ marginTop: 0 }}>
          {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <div className="tabs" style={{ marginBottom: "1rem" }} role="tablist">
          <button type="button" className={`tab ${form.type === "custom" ? "active" : ""}`} onClick={() => setForm({ ...form, type: "custom" })}>📅 Event</button>
          <button type="button" className={`tab ${form.type === "holiday" ? "active" : ""}`} onClick={() => setForm({ ...form, type: "holiday" })}>🏖️ Holiday</button>
        </div>
        {form.type === "custom" && (
          <div className="field">
            <label htmlFor="ev-title">Title</label>
            <input id="ev-title" className="input" placeholder="e.g. Parent–teacher meeting" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
        )}
        <div className="field">
          <label htmlFor="ev-desc">Description <span className="muted">(optional)</span></label>
          <textarea id="ev-desc" className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        danger
        busy={saving}
        title="Delete this event?"
        message="Teachers will no longer see it on their calendars."
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  );
};

export default Dashboard;
