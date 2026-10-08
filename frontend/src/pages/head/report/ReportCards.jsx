import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Download, Eye, FileArchive, FileText, FileUp, Printer, Sparkles } from "lucide-react";
import api from "../../../api/axios";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import "./ReportCards.css";

const today = () => new Date().toISOString().slice(0, 10);

export default function ReportCards() {
  const { pathname } = useLocation();
  const schoolId = useMemo(() => { try { return JSON.parse(localStorage.getItem("schoolData"))?._id; } catch { return null; } }, []);

  const [mode, setMode] = useState(pathname === "/view-reports2" ? "pdf" : "zip");
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [year, setYear] = useState("");
  const [terms, setTerms] = useState([]);
  const [term, setTerm] = useState(null);
  const [classId, setClassId] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextFees, setNextFees] = useState("");
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState(null); // { url, kind, name }
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!schoolId) return;
    api.get(`/api/classes/school/${schoolId}`).then(({ data }) => setClasses(Array.isArray(data) ? data : [])).catch(() => toast.error("Couldn't load classes"));
    api.get(`/api/terms/years/${schoolId}`).then(({ data }) => {
      const list = (Array.isArray(data) ? data : []).sort();
      setYears(list);
      if (list.length) pickYear(list[list.length - 1]);
    }).catch(() => toast.error("Couldn't load academic years"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const pickYear = async (y) => {
    setYear(y); setTerm(null); setTerms([]); setResult(null);
    try {
      const { data } = await api.get(`/api/terms/${schoolId}/${encodeURIComponent(y)}`);
      const list = Array.isArray(data) ? data : [];
      setTerms(list);
      setTerm(list.find((t) => t.isActive) || list[0] || null);
    } catch { toast.error("Couldn't load the terms for that year"); }
  };

  const validate = (needFuture) => {
    const e = {};
    if (!classId) e.classId = "Choose a class";
    if (!term) e.term = "Choose a term";
    if (needFuture) {
      if (!nextDate) e.nextDate = "Enter when the next term begins";
      if (!(Number(nextFees) > 0)) e.nextFees = "Enter next term's fees";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const qs = () => new URLSearchParams({ termId: term._id, ...(nextDate ? { nextTermDate: new Date(nextDate).toISOString() } : {}), nextTermFees: nextFees || "0" }).toString();

  const generate = async () => {
    if (!validate(true)) return;
    setBusy("generate"); setResult(null);
    try {
      const path = mode === "zip" ? `/api/reports/generate/class/${classId}` : `/api/reports/generate2/class/${classId}`;
      const res = await api.get(`${path}?${qs()}`, { responseType: "blob" });
      const type = mode === "zip" ? "application/zip" : "application/pdf";
      const name = classes.find((c) => c._id === classId)?.className || "class";
      setResult({ url: URL.createObjectURL(new Blob([res.data], { type })), kind: mode, name: `${name}-${term.termName}-reports.${mode === "zip" ? "zip" : "pdf"}`.replace(/\s+/g, "-") });
      toast.success("Report cards are ready");
    } catch (err) {
      let msg = "Couldn't generate the reports";
      try { msg = JSON.parse(await err.response.data.text()).message || msg; } catch { /* keep default */ }
      toast.error(msg);
    } finally { setBusy(""); }
  };

  const preview = async () => {
    if (!validate(false)) return;
    const win = window.open("", "_blank");
    if (!win) { toast.error("Allow pop-ups to preview the reports"); return; }
    win.document.write("<p style='font-family:sans-serif;padding:2rem'>Preparing preview…</p>");
    setBusy("preview");
    try {
      const res = await api.get(`/api/reports/reports/preview/class/${classId}?${qs()}`, { responseType: "blob" });
      win.location.href = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    } catch { win.close(); toast.error("Couldn't build the preview"); } finally { setBusy(""); }
  };

  const printPdf = () => {
    const w = window.open(result.url);
    if (!w) { toast.error("Allow pop-ups to print"); return; }
    w.addEventListener("load", () => { w.focus(); w.print(); });
  };

  if (!years.length && schoolId) {
    return (
      <div className="page"><PageHeader title="Report cards" />
        <div className="card"><EmptyState emoji="📅" title="Set up an academic year first" action={<Link to="/termly-details" className="btn">Go to Termly Details</Link>}>
          Report cards are built from a term's grades, attendance and fees.</EmptyState></div></div>
    );
  }

  return (
    <div className="page page-narrow">
      <PageHeader title="Report cards" subtitle="Generate a whole class's reports in one go."
        actions={<Link to="/upload-report" className="btn btn-outline"><FileUp size={16} /> Manage templates</Link>} />

      <div className="tabs" role="tablist" style={{ marginBottom: "1.2rem" }}>
        <button role="tab" aria-selected={mode === "zip"} className={`tab ${mode === "zip" ? "active" : ""}`} onClick={() => { setMode("zip"); setResult(null); }}><FileArchive size={15} style={{ verticalAlign: "-2px" }} /> Word files (ZIP)</button>
        <button role="tab" aria-selected={mode === "pdf"} className={`tab ${mode === "pdf" ? "active" : ""}`} onClick={() => { setMode("pdf"); setResult(null); }}><FileText size={15} style={{ verticalAlign: "-2px" }} /> Print-ready PDF</button>
      </div>

      <section className="card rc-card">
        <div className="rc-step"><span>1</span> Choose the term</div>
        <div className="tabs" role="tablist" aria-label="Academic year">{years.map((y) => <button key={y} role="tab" aria-selected={year === y} className={`tab ${year === y ? "active" : ""}`} onClick={() => pickYear(y)}>{y}</button>)}</div>
        <div className="row" style={{ marginTop: ".8rem" }}>
          {terms.map((t) => (
            <button key={t._id} className={`rc-term ${term?._id === t._id ? "on" : ""}`} onClick={() => { setTerm(t); setResult(null); }}>
              {t.termName}{t.isActive && <span className="badge-pill green">Current</span>}</button>))}
        </div>
        {errors.term && <span className="error" style={{ color: "var(--danger)", fontSize: ".8rem" }}>{errors.term}</span>}

        <div className="rc-step"><span>2</span> Pick the class and next term details</div>
        <div className="form-grid">
          <div className="field"><label htmlFor="rc-class">Class *</label>
            <select id="rc-class" className={`select ${errors.classId ? "is-invalid" : ""}`} value={classId} onChange={(e) => { setClassId(e.target.value); setResult(null); }}>
              <option value="">Select class</option>{classes.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}</select>
            {errors.classId && <span className="error">{errors.classId}</span>}</div>
          <div className="field"><label htmlFor="rc-date">Next term begins *</label>
            <input id="rc-date" type="date" min={today()} className={`input ${errors.nextDate ? "is-invalid" : ""}`} value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            {errors.nextDate && <span className="error">{errors.nextDate}</span>}</div>
          <div className="field"><label htmlFor="rc-fees">Next term fees (GH₵) *</label>
            <input id="rc-fees" type="number" min="1" inputMode="decimal" className={`input ${errors.nextFees ? "is-invalid" : ""}`} value={nextFees} onChange={(e) => setNextFees(e.target.value)} placeholder="e.g. 450" />
            {errors.nextFees && <span className="error">{errors.nextFees}</span>}</div>
        </div>

        <div className="rc-actions">
          <button className="btn btn-lg" onClick={generate} disabled={!!busy}><Sparkles size={18} /> {busy === "generate" ? "Generating… this can take a minute" : "Generate report cards"}</button>
          {mode === "zip" && <button className="btn btn-outline btn-lg" onClick={preview} disabled={!!busy}><Eye size={18} /> {busy === "preview" ? "Preparing…" : "Preview"}</button>}
        </div>
        {busy === "generate" && <div className="rc-progress" role="status"><i /></div>}

        {result && (
          <div className="alert success rc-result" role="status">
            <div><strong>Your reports are ready</strong><br /><small>{result.name}</small></div>
            <div className="row">
              <a className="btn" href={result.url} download={result.name}><Download size={16} /> Download</a>
              {result.kind === "pdf" && <><a className="btn btn-outline" href={result.url} target="_blank" rel="noopener noreferrer"><Eye size={16} /> View</a>
                <button className="btn btn-outline" onClick={printPdf}><Printer size={16} /> Print all</button></>}
            </div>
          </div>
        )}
        {mode === "zip" && <p className="muted" style={{ fontSize: ".82rem", margin: ".8rem 0 0" }}><b>Note:</b> the preview is a quick look and may differ slightly from the final Word files.</p>}
      </section>
    </div>
  );
}
