import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Bell, BellOff, CalendarClock, CheckCheck, CircleDollarSign, ClipboardCheck, Trash2 } from "lucide-react";
import api from "../../api/axios";
import getSocket from "../../lib/socket";
import { decodeToken } from "../../utils/auth";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import Loading from "./Loading";
import "./NotificationsView.css";

const TYPE = {
  attendance: { icon: ClipboardCheck, tone: "amber", label: "Attendance" },
  payment: { icon: CircleDollarSign, tone: "green", label: "Payment" },
  reminder: { icon: CalendarClock, tone: "blue", label: "Reminder" },
  general: { icon: Bell, tone: "", label: "General" },
};

const ago = (iso) => {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 604800) return `${Math.round(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/** Shared inbox for admins (userIds) and teachers (teacherIds). */
export default function NotificationsView({ role }) {
  const me = useMemo(() => decodeToken()?.id, []);
  const endpoint = role === "teacher" ? `/api/notification/teacher/${me}` : `/api/notification/user/${me}`;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    if (!me) { setLoading(false); return; }
    try {
      const { data } = await api.get(endpoint);
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error("Couldn't load notifications"); } finally { setLoading(false); }
  }, [endpoint, me]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const socket = getSocket();
    const onNew = (n) => setItems((p) => (p.some((x) => x._id === n._id) ? p : [n, ...p]));
    socket.on("new-notification", onNew);
    return () => { socket.off("new-notification", onNew); };
  }, []);

  const isRead = (n) => (n.readBy || []).includes(me);
  const unread = items.filter((n) => !isRead(n)).length;
  const shown = items.filter((n) => (filter === "unread" ? !isRead(n) : true));

  const markOne = async (n) => {
    if (isRead(n)) return;
    setItems((p) => p.map((x) => (x._id === n._id ? { ...x, readBy: [...(x.readBy || []), me] } : x)));
    api.put(`/api/notification/read/${n._id}`, {}).catch(() => {});
  };
  const markAll = async () => {
    setItems((p) => p.map((x) => ({ ...x, readBy: [...new Set([...(x.readBy || []), me])] })));
    try { await api.put(`/api/notification/mark-all-read/${me}`); toast.success("All caught up"); } catch { toast.error("Couldn't update — refresh to retry"); load(); }
  };
  const clearAll = async () => {
    try { await api.delete(`/api/notification/clear-all/${me}`); setItems([]); toast.success("Notifications cleared"); } catch { toast.error("Couldn't clear notifications"); }
    setConfirm(false);
  };

  return (
    <div className="page page-narrow">
      <PageHeader title="Notifications" subtitle={loading ? "" : unread ? `${unread} unread` : "You're all caught up"}
        actions={items.length > 0 && (<>
          <button className="btn btn-outline" onClick={markAll} disabled={!unread}><CheckCheck size={16} /> Mark all read</button>
          <button className="btn btn-danger-soft" onClick={() => setConfirm(true)}><Trash2 size={16} /> Clear all</button></>)} />

      {items.length > 0 && (
        <div className="tabs" role="tablist" style={{ marginBottom: "1.1rem" }}>
          <button role="tab" aria-selected={filter === "all"} className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({items.length})</button>
          <button role="tab" aria-selected={filter === "unread"} className={`tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>Unread ({unread})</button>
        </div>
      )}

      {loading ? <Loading /> : shown.length === 0 ? (
        <div className="card"><EmptyState emoji={items.length ? "🎉" : "🔕"} title={items.length ? "No unread notifications" : "No notifications yet"}>
          {items.length ? "Nice — everything has been read." : "Attendance alerts, payments and reminders will show up here in real time."}</EmptyState></div>
      ) : (
        <ul className="notif-list">
          {shown.map((n) => {
            const t = TYPE[n.type] || TYPE.general;
            const Icon = t.icon;
            const read = isRead(n);
            return (
              <li key={n._id}>
                <button className={`notif ${read ? "" : "unread"}`} onClick={() => markOne(n)} aria-label={`${n.title}${read ? "" : " (unread)"}`}>
                  <span className={`notif-ico tone-${t.tone || "teal"}`}><Icon size={18} /></span>
                  <span className="notif-body"><b>{n.title}</b><span>{n.message}</span><small>{t.label} · {ago(n.createdAt)}</small></span>
                  {!read && <i className="notif-dot" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {!loading && items.length === 0 && <p className="muted" style={{ textAlign: "center", marginTop: "1rem" }}><BellOff size={14} style={{ verticalAlign: "-2px" }} /> Notifications are kept private to you.</p>}

      <ConfirmDialog open={confirm} danger title="Clear all notifications?" message="This permanently removes every notification in your inbox." confirmLabel="Clear all" onConfirm={clearAll} onCancel={() => setConfirm(false)} />
    </div>
  );
}
