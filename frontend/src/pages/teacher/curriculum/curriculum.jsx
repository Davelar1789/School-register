import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../api/axios";
import curriculumData from "./curriculumData"; // adjust path if needed
import { ChevronRight, GraduationCap, BookOpen, Search } from "lucide-react";
import { decodeToken } from "../../../utils/auth";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import Loading from "../../../components/ui/Loading";
import "./Curriculum.css";

const TERMS = [1, 2, 3];

const Curriculum = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTerm, setActiveTerm] = useState(1);
  const [step, setStep] = useState("classes"); // "classes" | "subjects" | "curriculum"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("");
  const teacherId = decodeToken()?.id;

  // ── Step 1: Fetch classes ────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/teachers/teacher/teacher-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(data.classes || []);
    } catch {
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // ── Step 2: Fetch subjects for selected class ────────────────────────────
  const handleClassClick = async (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);
    setActiveTerm(1);
    setStep("subjects");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`/api/teachers/${teacherId}/subjects2`, {
        params: { classId: cls._id },
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = (data.subjects || []).filter(
        (s) => s.classId === cls._id || s.className === cls.className
      );
      setSubjects(filtered.length > 0 ? filtered : data.subjects || []);
    } catch {
      setError("Failed to load subjects for this class.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Show curriculum (from hardcoded data) ───────────────────────
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setActiveTerm(1);
    setStep("curriculum");
    setError("");
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const goBack = () => {
    if (step === "curriculum") {
      setStep("subjects");
      setSelectedSubject(null);
    } else if (step === "subjects") {
      setStep("classes");
      setSelectedClass(null);
      setSubjects([]);
    }
    setError("");
  };

  const goToClasses = () => {
    setStep("classes");
    setSelectedClass(null);
    setSelectedSubject(null);
    setSubjects([]);
    setError("");
  };

  const goToSubjects = () => {
    if (step === "curriculum") {
      setStep("subjects");
      setSelectedSubject(null);
    }
  };

  // ── Resolve class name to curriculumData key ─────────────────────────────
  // Handles cases like "Basic 7A" → "Basic 7", "Basic 7" → "Basic 7"
  const resolveCurriculumKey = (className) => {
    if (!className) return null;
    if (curriculumData[className]) return className;
    // Strip trailing letter suffix: "Basic 7A" → "Basic 7"
    const stripped = className.replace(/\s*[A-Za-z]+$/, "").trim();
    if (curriculumData[stripped]) return stripped;
    // Match "Basic N" anywhere in string
    const match = className.match(/Basic\s*(\d)/i);
    if (match) {
      const key = `Basic ${match[1]}`;
      if (curriculumData[key]) return key;
    }
    return null;
  };

  const getCurriculumRows = () => {
    if (!selectedClass || !selectedSubject) return [];
    const classKey = resolveCurriculumKey(selectedClass.className);
    if (!classKey) return [];
    const subjectData = curriculumData[classKey]?.[selectedSubject.subjectName];
    if (!subjectData) return [];
    return subjectData[activeTerm] || [];
  };

  const curriculumRows = getCurriculumRows();

  const q = filter.trim().toLowerCase();
  const shownRows = !q ? curriculumRows : curriculumRows.filter((r) =>
    `${r.week} ${r.subStrand} ${r.contentStandards} ${[].concat(r.indicators || []).join(" ")}`.toLowerCase().includes(q));

  const title = step === "classes" ? "Curriculum" : step === "subjects" ? selectedClass?.className : selectedSubject?.subjectName;

  return (
    <div className="page">
      <PageHeader title={title} subtitle={step === "classes" ? "Pick a class to browse its scheme of work." : step === "subjects" ? "Choose a subject." : `${selectedClass?.className} · weekly scheme of work`} />

      <nav className="cur-crumbs" aria-label="Breadcrumb">
        <button className={step === "classes" ? "on" : ""} onClick={goToClasses}>Classes</button>
        {selectedClass && <><ChevronRight size={14} /><button className={step === "subjects" ? "on" : ""} onClick={goToSubjects} disabled={step === "subjects"}>{selectedClass.className}</button></>}
        {selectedSubject && <><ChevronRight size={14} /><span className="on">{selectedSubject.subjectName}</span></>}
        {step !== "classes" && <button className="cur-back" onClick={goBack}>← Back</button>}
      </nav>

      {error && <p className="alert error" role="alert">{error}</p>}
      {loading && <Loading />}

      {!loading && step === "classes" && (classes.length === 0 ? (
        <div className="card"><EmptyState emoji="🏫" title="No classes assigned to you">Ask your admin to assign you to a class.</EmptyState></div>
      ) : (
        <div className="grid-cards">
          {classes.map((cls) => (
            <button key={cls._id} className="card card-hover cur-card" onClick={() => handleClassClick(cls)}>
              <span className="avatar"><GraduationCap size={20} /></span><span><strong>{cls.className}</strong><small>{cls.level}</small></span><ChevronRight size={18} />
            </button>))}
        </div>
      ))}

      {!loading && step === "subjects" && (subjects.length === 0 ? (
        <div className="card"><EmptyState emoji="📚" title="No subjects found for this class" /></div>
      ) : (
        <div className="grid-cards">
          {subjects.map((sub, idx) => (
            <button key={sub.subjectId || idx} className="card card-hover cur-card" onClick={() => handleSubjectClick(sub)}>
              <span className="avatar" style={{ background: "var(--blue-light)", color: "var(--blue)" }}><BookOpen size={20} /></span><span><strong>{sub.subjectName}</strong><small>View scheme of work</small></span><ChevronRight size={18} />
            </button>))}
        </div>
      ))}

      {!loading && step === "curriculum" && (
        <>
          <div className="toolbar">
            <div className="tabs" role="tablist" aria-label="Term">
              {TERMS.map((t) => <button key={t} role="tab" aria-selected={activeTerm === t} className={`tab ${activeTerm === t ? "active" : ""}`} onClick={() => setActiveTerm(t)}>Term {t}</button>)}
            </div>
            {curriculumRows.length > 4 && <div className="search-input-wrap"><Search size={16} /><input className="input" placeholder="Search this term…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search curriculum" /></div>}
          </div>
          {curriculumRows.length === 0 ? (
            <div className="card"><EmptyState emoji="📄" title={`No curriculum for Term ${activeTerm} yet`}>
              We don't have a scheme of work for <b>{selectedSubject?.subjectName}</b> in <b>{selectedClass?.className}</b> for this term.</EmptyState></div>
          ) : shownRows.length === 0 ? (
            <div className="card"><EmptyState emoji="🔍" title="Nothing matches your search" /></div>
          ) : (
            <div className="table-wrap"><table className="data-table cur-table">
              <thead><tr><th style={{ width: 80 }}>Week</th><th>Sub-strand</th><th>Content standard</th><th>Indicators</th></tr></thead>
              <tbody>{shownRows.map((row, idx) => (
                <tr key={idx}>
                  <td><span className="badge-pill">Wk {row.week}</span></td>
                  <td><strong>{row.subStrand}</strong></td>
                  <td>{row.contentStandards}</td>
                  <td>{Array.isArray(row.indicators) ? <ul className="cur-ind">{row.indicators.map((ind, i) => <li key={i}>{ind}</li>)}</ul> : row.indicators}</td>
                </tr>))}</tbody>
            </table></div>
          )}
        </>
      )}
    </div>
  );
};

export default Curriculum;
