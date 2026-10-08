/** Friendly zero-data panel. */
export default function EmptyState({ emoji = "📭", title, children, action }) {
  return (
    <div className="empty-state">
      <span className="emoji" aria-hidden="true">{emoji}</span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
