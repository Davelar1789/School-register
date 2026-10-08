import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";

const BLANK = { schoolName: "", headmasterName: "", email: "", phone: "", address: "", password: "", confirmPassword: "" };

export default function AddSchool() {
  const navigate = useNavigate();
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const validate = () => {
    const v = {};
    if (!form.schoolName.trim()) v.schoolName = "Enter the school's name";
    if (!form.headmasterName.trim()) v.headmasterName = "Enter the head's name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) v.email = "Enter a valid email address";
    if (!/^[0-9+()\-\s]{7,20}$/.test(form.phone.trim())) v.phone = "Enter a valid phone number";
    if (!form.address.trim()) v.address = "Enter the address";
    if (form.password.length < 8) v.password = "Use at least 8 characters";
    if (form.confirmPassword !== form.password) v.confirmPassword = "Passwords don't match";
    setErrors(v);
    return !Object.keys(v).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const email = form.email.trim().toLowerCase();
    try {
      // 1. the school's administrator account (reused if it already exists)
      try {
        await api.post("/api/users/register", { fullName: form.headmasterName.trim(), email, password: form.password });
      } catch (err) {
        if (!/already in use by a system user/i.test(err.response?.data?.message || "")) throw err;
      }
      // 2. the school itself, linked to that administrator
      const { data } = await api.post("/api/schools/register", {
        name: form.schoolName.trim(), headmaster: form.headmasterName.trim(), email, phone: form.phone.trim(), address: form.address.trim(),
        numberOfStudents: 0, numberOfTeachers: 0, numberOfClasses: 0,
      });
      // 3. schools added by a super admin are trusted — approve straight away
      if (data?.school?._id) await api.put(`/api/superschool/approve/${data.school._id}`).catch(() => {});
      toast.success(`${form.schoolName.trim()} is ready to go 🎉`);
      navigate("/all-schools");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't add the school");
    } finally { setBusy(false); }
  };

  const Field = ({ id, label, type = "text", ...rest }) => (
    <div className="field"><label htmlFor={id}>{label} *</label>
      <input id={id} type={type} className={`input ${errors[id] ? "is-invalid" : ""}`} value={form[id]} onChange={set(id)} {...rest} />
      {errors[id] && <span className="error">{errors[id]}</span>}</div>
  );

  return (
    <div className="page page-narrow">
      <PageHeader crumbs={[{ label: "Schools", to: "/all-schools" }, { label: "Add school" }]} title="Add a school"
        subtitle="Creates the school and its administrator login in one step. The school is approved immediately." />
      <form className="card" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field id="schoolName" label="School name" autoComplete="organization" />
          <Field id="headmasterName" label="Head of school" autoComplete="name" />
          <Field id="email" label="Admin email" type="email" autoComplete="email" />
          <Field id="phone" label="Phone" type="tel" autoComplete="tel" />
        </div>
        <Field id="address" label="Address" autoComplete="street-address" />
        <div className="form-grid">
          <div className="field"><label htmlFor="password">Password *</label>
            <div className="search-input-wrap" style={{ flex: "none" }}>
              <input id="password" type={show ? "text" : "password"} className={`input ${errors.password ? "is-invalid" : ""}`} value={form.password} onChange={set("password")} autoComplete="new-password" style={{ paddingLeft: ".9rem" }} />
              <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} style={{ position: "absolute", right: 4, top: 4 }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}</div>
          <Field id="confirmPassword" label="Confirm password" type={show ? "text" : "password"} autoComplete="new-password" />
        </div>
        <p className="muted" style={{ fontSize: ".84rem" }}>If an administrator with this email already exists, they're linked to the new school and their password stays unchanged.</p>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <Link to="/all-schools" className="btn btn-outline">Cancel</Link>
          <button className="btn" disabled={busy}>{busy ? "Creating…" : "Create school"}</button>
        </div>
      </form>
    </div>
  );
}
