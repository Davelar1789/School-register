import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { CalendarDays, CalendarPlus, Coins, Pencil, Plus, Sparkles } from "lucide-react";
import api from "../../../api/axios";
import { cedi } from "../../../utils/fees";
import PageHeader from "../../../components/ui/PageHeader";
import Modal from "../../../components/ui/Modal";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import "./TermlyDetails.css";

const TERM_NAMES = ["Term 1", "Term 2", "Term 3"];
const dayOnly = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");

function termState(t) {
  if (!t) return { label: "Not created", tone: "gray" };
  const s = dayOnly(t.startDate), e = dayOnly(t.endDate), today = new Date().toISOString().slice(0, 10);
  if (s === e) return { label: "Dates not set", tone: "amber" };
  if (today < s) return { label: "Upcoming", tone: "blue" };
  if (today > e) return { label: "Completed", tone: "gray" };
  return { label: "In session", tone: "green" };
}

export default function TermlyDetails() {
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);

  const [years, setYears] = useState([]);
  const [year, setYear] = useState("");
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(false);

  const [yearModal, setYearModal] = useState(false);
  const [yearLabel, setYearLabel] = useState("");
  const [yearError, setYearError] = useState("");

  const [datesFor, setDatesFor] = useState(null);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [feesFor, setFeesFor] = useState(null); // existing term | { termName, isNew }
  const [fees, setFees] = useState([]);
  const [newDates, setNewDates] = useState({ start: "", end: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadTerms = useCallback(async (label) => {
    if (!label) return;
    setTermsLoading(true);
    try {
      const { data } = await api.get(`/api/terms/${schoolId}/${encodeURIComponent(label)}`);
      setTerms(Array.isArray(data) ? data : []);
    } catch { toast.error("Couldn't load the terms for that year"); } finally { setTermsLoading(false); }
  }, [schoolId]);

  const loadYears = useCallback(async (select) => {
    try {
      const { data } = await api.get(`/api/terms/years/${schoolId}`);
      const list = (Array.isArray(data) ? data : []).sort().reverse();
      setYears(list);
      const pick = select || list[0] || "";
      setYear(pick);
      if (pick) await loadTerms(pick);
    } catch { toast.error("Couldn't load academic years"); } finally { setLoading(false); }
  }, [schoolId, loadTerms]);

  useEffect(() => {
    if (!schoolId) { setLoading(false); return; }
    loadYears();
    api.get(`/api/classes/school/${schoolId}`).then(({ data }) => setClasses(Array.isArray(data) ? data : [])).catch(() => {});
  }, [schoolId, loadYears]);

  const byName = Object.fromEntries(terms.map((t) => [t.termName, t]));

  /* ── academic year ── */
  const suggested = useMemo(() => {
    const y = new Date().getFullYear();
    return [`${y - 1}/${y}`, `${y}/${y + 1}`, `${y + 1}/${y + 2}`].filter((l) => !years.includes(l));
  }, [years]);

  const addYear = async (e) => {
    e.preventDefault();
    const m = yearLabel.trim().match(/^(\d{4})\s*[/-]\s*(\d{4})$/);
    if (!m || Number(m[2]) !== Number(m[1]) + 1) { setYearError("Use two consecutive years, e.g. 2025/2026"); return; }
    const label = `${m[1]}/${m[2]}`;
    if (years.includes(label)) { setYearError("That academic year already exists"); return; }
    setSaving(true);
    try {
      await api.post("/api/terms/add-academic-year", { schoolId, yearLabel: label });
      toast.success(`${label} created — now set the dates and fees for each term`);
      setYearModal(false); setYearLabel(""); setYearError("");
      await loadYears(label);
    } catch (err) { setYearError(err.response?.data?.message || "Couldn't add the year"); } finally { setSaving(false); }
  };

  /* ── dates ── */
  const openDates = (t) => { setDatesFor(t); setDates({ start: dayOnly(t.startDate), end: dayOnly(t.endDate) }); setFormError(""); };
  const saveDates = async (e) => {
    e.preventDefault();
    if (!dates.start || !dates.end) { setFormError("Choose both dates"); return; }
    if (dates.end <= dates.start) { setFormError("The end date must come after the start date"); return; }
    setSaving(true);
    try {
      await api.patch(`/api/terms/update-term-dates/${datesFor._id}`, { startDate: dates.start, endDate: dates.end });
      toast.success("Term dates saved");
      setDatesFor(null);
      loadTerms(year);
    } catch (err) { setFormError(err.response?.data?.message || "Couldn't save the dates"); } finally { setSaving(false); }
  };

  /* ── fees ── */
  const openFees = (t, termName) => {
    if (t) {
      const base = classes.map((c) => ({ classId: c._id, className: c.className, totalFees: t.classFees?.find((f) => f.classId === c._id)?.totalFees ?? 0 }));
      setFees(base);
      setFeesFor(t);
    } else {
      setFees(classes.map((c) => ({ classId: c._id, className: c.className, totalFees: 0 })));
      setNewDates({ start: "", end: "" });
      setFeesFor({ termName, isNew: true });
    }
    setFormError("");
  };
  const setFee = (i, v) => setFees((f) => f.map((x, j) => (j === i ? { ...x, totalFees: v } : x)));
  const applyToAll = () => { const v = fees.find((f) => Number(f.totalFees) > 0)?.totalFees; if (v) setFees((f) => f.map((x) => ({ ...x, totalFees: v }))); };

  const saveFees = async (e) => {
    e.preventDefault();
    if (fees.some((f) => f.totalFees === "" || Number(f.totalFees) < 0 || Number.isNaN(Number(f.totalFees)))) { setFormError("Fees must be zero or more"); return; }
    const classFees = fees.map((f) => ({ ...f, totalFees: Number(f.totalFees) }));
    setSaving(true);
    try {
      if (feesFor.isNew) {
        if (!newDates.start || !newDates.end || newDates.end <= newDates.start) { setFormError("Enter a start date and a later end date"); setSaving(false); return; }
        await api.post("/api/terms/create-term", { schoolId, yearLabel: year, termName: feesFor.termName, startDate: newDates.start, endDate: newDates.end, classFees });
        const created = await api.get(`/api/terms/${schoolId}/${encodeURIComponent(year)}`);
        const t = created.data.find((x) => x.termName === feesFor.termName);
        if (t) await api.post(`/api/terms/upsert-term/${t._id}`, { classFees });
      } else {
        await api.post(`/api/terms/upsert-term/${feesFor._id}`, { classFees });
      }
      toast.success("Fees saved — student balances were updated");
      setFeesFor(null);
      loadTerms(year);
    } catch (err) { setFormError(err.response?.data?.message || "Couldn't save the fees"); } finally { setSaving(false); }
  };

  const expected = (t) => (t?.classFees || []).reduce((n, f) => n + (Number(f.totalFees) || 0) * (classes.find((c) => c._id === f.classId)?.students?.length || 0), 0);

  if (loading) return <div className="page"><Loading /></div>;

  return (
    <div className="page">
      <PageHeader title="Termly details" subtitle="Set up each term's dates and the fees every class pays."
        actions={<button className="btn" onClick={() => { setYearLabel(suggested[0] || ""); setYearError(""); setYearModal(true); }}><Plus size={16} /> Add academic year</button>} />

      {years.length === 0 ? (
        <div className="card"><EmptyState emoji="📅" title="No academic year yet"
          action={<button className="btn" onClick={() => { setYearLabel(suggested[0] || ""); setYearModal(true); }}><Plus size={16} /> Add your first academic year</button>}>
          An academic year creates Term 1–3 and sets up fee records for every student.</EmptyState></div>
      ) : (
        <>
          <div className="tabs" role="tablist" aria-label="Academic year" style={{ marginBottom: "1.4rem" }}>
            {years.map((y) => <button key={y} role="tab" aria-selected={year === y} className={`tab ${year === y ? "active" : ""}`} onClick={() => { setYear(y); loadTerms(y); }}>{y}</button>)}
          </div>

          {termsLoading ? <Loading /> : (
            <div className="term-grid">
              {TERM_NAMES.map((name) => {
                const t = byName[name];
                const st = termState(t);
                return (
                  <article key={name} className={`card term-card ${st.label === "In session" ? "current" : ""}`}>
                    <header><h3>{name}</h3><span className={`badge-pill ${st.tone}`}>{st.label}</span></header>
                    {t ? (
                      <>
                        <dl>
                          <div><dt>Starts</dt><dd>{fmt(t.startDate)}</dd></div>
                          <div><dt>Ends</dt><dd>{fmt(t.endDate)}</dd></div>
                          <div><dt>Expected fees</dt><dd><b>{cedi(expected(t))}</b></dd></div>
                        </dl>
                        {st.label === "Dates not set" && <p className="alert warn" style={{ margin: 0 }}><Sparkles size={16} /> Set the dates — attendance and the “current term” depend on them.</p>}
                        <div className="term-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => openDates(t)}><CalendarDays size={15} /> Dates</button>
                          <button className="btn btn-sm" onClick={() => openFees(t)}><Coins size={15} /> Fees</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="muted" style={{ margin: 0 }}>This term hasn't been created yet.</p>
                        <button className="btn btn-secondary btn-block" onClick={() => openFees(null, name)} disabled={!classes.length}><CalendarPlus size={16} /> Create {name}</button>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal open={yearModal} onClose={() => setYearModal(false)} title="Add academic year"
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setYearModal(false)}>Cancel</button>
          <button type="submit" form="year-form" className="btn" disabled={saving}>{saving ? "Adding…" : "Add year"}</button></>)}>
        <form id="year-form" onSubmit={addYear} noValidate>
          <div className="field"><label htmlFor="yr">Academic year *</label>
            <input id="yr" className={`input ${yearError ? "is-invalid" : ""}`} value={yearLabel} onChange={(e) => { setYearLabel(e.target.value); setYearError(""); }} placeholder="2025/2026" />
            {yearError && <span className="error">{yearError}</span>}</div>
          {suggested.length > 0 && <div className="row">{suggested.map((s) => <button type="button" key={s} className="badge-pill" style={{ border: 0, cursor: "pointer" }} onClick={() => { setYearLabel(s); setYearError(""); }}>{s}</button>)}</div>}
          <p className="muted" style={{ fontSize: ".85rem" }}>Creates Term 1, 2 and 3 and adds the year to every student's record. You need at least one class first.</p>
        </form>
      </Modal>

      <Modal open={!!datesFor} onClose={() => setDatesFor(null)} title={`${datesFor?.termName || ""} dates`}
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setDatesFor(null)}>Cancel</button>
          <button type="submit" form="dates-form" className="btn" disabled={saving}>{saving ? "Saving…" : "Save dates"}</button></>)}>
        <form id="dates-form" onSubmit={saveDates} noValidate>
          <div className="form-grid">
            <div className="field"><label htmlFor="d-start">Start date</label><input id="d-start" type="date" className="input" value={dates.start} onChange={(e) => setDates({ ...dates, start: e.target.value })} /></div>
            <div className="field"><label htmlFor="d-end">End date</label><input id="d-end" type="date" className="input" min={dates.start} value={dates.end} onChange={(e) => setDates({ ...dates, end: e.target.value })} /></div>
          </div>
          {formError && <p className="alert error" role="alert">{formError}</p>}
        </form>
      </Modal>

      <Modal open={!!feesFor} onClose={() => setFeesFor(null)} size="lg" title={feesFor?.isNew ? `Create ${feesFor.termName}` : `${feesFor?.termName || ""} fees`}
        footer={(<><button type="button" className="btn btn-outline" onClick={() => setFeesFor(null)}>Cancel</button>
          <button type="submit" form="fees-form" className="btn" disabled={saving}>{saving ? "Saving…" : feesFor?.isNew ? "Create term" : "Save fees"}</button></>)}>
        <form id="fees-form" onSubmit={saveFees} noValidate>
          {feesFor?.isNew && (
            <div className="form-grid">
              <div className="field"><label htmlFor="n-start">Start date *</label><input id="n-start" type="date" className="input" value={newDates.start} onChange={(e) => setNewDates({ ...newDates, start: e.target.value })} /></div>
              <div className="field"><label htmlFor="n-end">End date *</label><input id="n-end" type="date" className="input" min={newDates.start} value={newDates.end} onChange={(e) => setNewDates({ ...newDates, end: e.target.value })} /></div>
            </div>
          )}
          <div className="card-head"><h3 style={{ fontSize: "1rem" }}>Fees per class (GH₵)</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={applyToAll}>Copy first amount to all</button></div>
          <div className="fee-grid">
            {fees.map((f, i) => (
              <div key={f.classId} className="fee-line"><label htmlFor={`f-${f.classId}`}>{f.className}</label>
                <input id={`f-${f.classId}`} type="number" min="0" step="0.01" inputMode="decimal" className="input" value={f.totalFees} onChange={(e) => setFee(i, e.target.value)} onWheel={(e) => e.target.blur()} /></div>
            ))}
          </div>
          {!feesFor?.isNew && <p className="muted" style={{ fontSize: ".85rem" }}>Saving recalculates every student's balance for this term. Existing payments are kept.</p>}
          {formError && <p className="alert error" role="alert">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
