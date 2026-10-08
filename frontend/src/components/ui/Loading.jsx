export default function Loading({ label = "Loading…" }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <span className="spinner spinner-lg" /> {label}
    </div>
  );
}

/** Table-shaped placeholder while rows load. */
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="table-wrap" aria-hidden="true">
      <table className="data-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((__, c) => (
                <td key={c}><div className="skeleton" style={{ height: 14, width: `${55 + ((r + c) * 13) % 40}%` }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
