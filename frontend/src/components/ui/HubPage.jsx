import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "./PageHeader";
import "./HubPage.css";

/** Landing page that fans out to a few sub-sections as big, friendly cards. */
export default function HubPage({ title, subtitle, items }) {
  return (
    <div className="page">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="hub-grid">
        {items.map(({ to, label, text, icon: Icon, tone = "teal" }) => (
          <Link key={to} to={to} className={`hub-card hub-${tone} card-hover`}>
            <span className="hub-ico"><Icon size={26} /></span>
            <h2>{label}</h2>
            <p>{text}</p>
            <span className="hub-go">Open <ArrowUpRight size={16} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
