import { useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";

const BLANK = { fullName: "", email: "", password: "", confirmPassword: "" };

export default function AddAdmin() {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.fullName.trim()) v.fullName = "Enter the administrator's name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) v.email = "Enter a valid email address";
    if (form.password.length < 8) v.password = "Use at least 8 characters";
    if (form.confirmPassword !== form.password) v.confirmPassword = "Passwords don't match";
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await api.post("/api/users/register", { fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), password: form.password });
      toast.success(`${form.fullName.trim()} can now sign in`);
      setForm(BLANK);
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't create the account"); } finally { setBusy(false); }
  };

  return (
    <div className="page page-narrow">
      <PageHeader title="Add an administrator" subtitle="Creates a login. Link it to a school afterwards from “Add school”." />
      <form className="card" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="field"><label htmlFor="fullName">Full name *</label><input id="fullName" className={`input ${errors.fullName ? "is-invalid" : ""}`} value={form.fullName} onChange={set("fullName")} autoComplete="name" />{errors.fullName && <span className="error">{errors.fullName}</span>}</div>
          <div className="field"><label htmlFor="email">Email *</label><input id="email" type="email" className={`input ${errors.email ? "is-invalid" : ""}`} value={form.email} onChange={set("email")} autoComplete="email" />{errors.email && <span className="error">{errors.email}</span>}</div>
          <div className="field"><label htmlFor="pw">Password *</label>
            <div className="search-input-wrap" style={{ flex: "none" }}><input id="pw" type={show ? "text" : "password"} className={`input ${errors.password ? "is-invalid" : ""}`} value={form.password} onChange={set("password")} autoComplete="new-password" style={{ paddingLeft: ".9rem" }} />
              <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} style={{ position: "absolute", right: 4, top: 4 }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            {errors.password && <span className="error">{errors.password}</span>}</div>
          <div className="field"><label htmlFor="pw2">Confirm password *</label><input id="pw2" type={show ? "text" : "password"} className={`input ${errors.confirmPassword ? "is-invalid" : ""}`} value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />{errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}</div>
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn" disabled={busy}><UserPlus size={16} /> {busy ? "Creating…" : "Create administrator"}</button></div>
      </form>
    </div>
  );
}
