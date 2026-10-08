import { ChevronLeft, ChevronRight } from "lucide-react";

/** Footer for client-side paginated tables. */
export default function Pagination({ page, pageSize, total, onPage, onPageSize, sizes = [10, 15, 25, 50] }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pager">
      <span className="pager-info">Showing <b>{from}–{to}</b> of <b>{total}</b></span>
      <div className="pager-ctrl">
        {onPageSize && (
          <select className="select" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} aria-label="Rows per page" style={{ width: "auto", minHeight: 34, padding: ".2rem .6rem" }}>
            {sizes.map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>
        )}
        <button className="btn btn-outline btn-sm btn-icon" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
        <span className="pager-num">{page} / {pages}</span>
        <button className="btn btn-outline btn-sm btn-icon" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
