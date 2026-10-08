import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/** Title row used at the top of every page. `crumbs` = [{label, to?}] */
export default function PageHeader({ title, subtitle, crumbs, actions, children }) {
  return (
    <div className="page-head">
      <div>
        {crumbs?.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: ".4rem" }}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight size={13} />}
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
