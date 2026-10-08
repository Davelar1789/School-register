import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Building2, Globe, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import Loading from "../../../components/ui/Loading";
import EmptyState from "../../../components/ui/EmptyState";
import { decodeToken } from "../../../utils/auth";

const FIELDS = [
  { key: "name", label: "School name", icon: Building2, required: true },
  { key: "headmaster", label: "Head of school", icon: UserRound, required: true },
  { key: "phone", label: "Phone", icon: Phone, type: "tel", required: true },
  { key: "address", label: "Street address", icon: MapPin, required: true },
  { key: "city", label: "City / town", icon: MapPin },
  { key: "state", label: "Region / state", icon: MapPin },
  { key: "country", label: "Country", icon: Globe },
  { key: "website", label: "Website", icon: Globe, type: "url", placeholder: "https://" },
  { key: "establishedYear", label: "Year established", icon: Building2, type: "number" },
];

const pick = (s) => Object.fromEntries(FIELDS.map((f) => [f.key, s?.[f.key] ?? ""]));

export default function AdminSettings() {
  const userId = useMemo(() => decodeToken()?.id, []);
  const [school, setSchool] = useState(() => { try { return JSON.parse(localStorage.getItem("schoolData")); } catch { return null; } });
  const [form, setForm] = useState(() => pick(school));
  const [loading, setLoading] = useState(!school);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (school || !userId) { setLoading(false); return; }
    api.get(`/api/schools/user/${userId}`).then(({ data }) => {
      const s = data?.school || data;
      localStorage.setItem("schoolData", JSON.stringify(s));
      setSchool(s); setForm(pick(s));
    }).catch(() => toast.error("Couldn't load school details")).finally(() => setLoading(false));
  }, [school, userId]);

  const dirty = school && FIELDS.some((f) => String(form[f.key] ?? "") !== String(school[f.key] ?? ""));
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    const v = {};
    FIELDS.forEach((f) => { if (f.required && !String(form[f.key]).trim()) v[f.key] = "This field is required"; });
    if (form.website && !/^https?:\/\/\S+\.\S+/.test(form.website.trim())) v.website = "Start with http:// or https://";
    if (form.establishedYear && !/^\d{4}$/.test(String(form.establishedYear))) v.establishedYear = "Enter a 4-digit year";
    if (form.phone && !/^[0-9+()\-\s]{7,20}$/.test(form.phone.trim())) v.phone = "Enter a valid phone number";
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([k, val]) => [k, typeof val === "string" ? val.trim() : val]));
      const { data } = await api.put(`/api/schools/${school._id}`, body);
      const next = { ...school, ...(data?.school || data) };
      localStorage.setItem("schoolData", JSON.stringify(next));
      window.dispatchEvent(new Event("schoolDataUpdated"));
      setSchool(next); setForm(pick(next));
      toast.success("School details saved");
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't save your changes"); } finally { setSaving(false); }
  };

  if (loading) return <div className="page"><Loading /></div>;
  if (!school) return <div className="page"><div className="card"><EmptyState emoji="🏫" title="No school found for this account" /></div></div>;

  return (
    <div className="page page-narrow">
      <PageHeader title="School settings" subtitle="These details appear on report cards, receipts and your dashboard." />
      <form className="card" onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="s-email">Email <span className="muted">(used to sign in — can't be changed here)</span></label>
          <div className="search-input-wrap" style={{ flex: "none" }}><Mail size={16} /><input id="s-email" className="input" value={school.email || ""} disabled /></div>
        </div>
        <div className="form-grid">
          {FIELDS.map(({ key, label, icon: Icon, type = "text", required, placeholder }) => (
            <div className="field" key={key}>
              <label htmlFor={`s-${key}`}>{label}{required && " *"}</label>
              <div className="search-input-wrap" style={{ flex: "none" }}><Icon size={16} />
                <input id={`s-${key}`} type={type} className={`input ${errors[key] ? "is-invalid" : ""}`} value={form[key]} onChange={set(key)} placeholder={placeholder} /></div>
              {errors[key] && <span className="error">{errors[key]}</span>}
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: "flex-end", marginTop: ".5rem" }}>
          {dirty && <button type="button" className="btn btn-ghost" onClick={() => { setForm(pick(school)); setErrors({}); }}>Discard changes</button>}
          <button className="btn" disabled={!dirty || saving}><Save size={16} /> {saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}
