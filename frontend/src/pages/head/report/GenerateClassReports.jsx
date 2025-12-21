import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./GenerateClassReports.modules.css";

const GenerateClassReports = () => {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [nextTermDate, setNextTermDate] = useState(null);
  const [nextTermFees, setNextTermFees] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClasses();
    fetchAcademicYearsAndCurrentTerm();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data || []);
    } catch {
      toast.error("Failed to fetch classes");
    }
  };

  const fetchAcademicYearsAndCurrentTerm = async () => {
    try {
      const res = await axios.get("/api/terms/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allTerms = res.data || [];
      const years = [...new Set(allTerms.map(t => t.academicYear))];

      const latest = allTerms.find(t => t.isCurrent);

      setAcademicYears(years);
      setSelectedYear(latest.academicYear);
      setTerms(allTerms.filter(t => t.academicYear === latest.academicYear));
      setSelectedTerm(latest);
    } catch {
      toast.error("Failed to load terms");
    }
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    const yearTerms = terms.filter(t => t.academicYear === year);
    setTerms(yearTerms);
    setSelectedTerm(yearTerms[0] || null);
  };

  const handleGenerate = async () => {
    if (!selectedClass || !selectedTerm || !nextTermDate || !nextTermFees) {
      toast.error("Please complete all fields.");
      return;
    }

    setGenerating(true);
    setDownloadLink("");

    try {
      const res = await axios.get(
        `/api/reports/generate/class/${selectedClass}?termId=${selectedTerm._id}&nextTermDate=${nextTermDate.toISOString()}&nextTermFees=${nextTermFees}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      setDownloadLink(URL.createObjectURL(blob));
      toast.success("Reports generated successfully");
    } catch {
      toast.error("Report generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Header />
      <Sidebar />

      <div className="reports-page">
        <div className="reports-card">

          <h2>Generate Report Cards</h2>

          {/* YEAR SELECTOR */}
          <div className="year-selector">
            {academicYears.map(year => (
              <button
                key={year}
                className={year === selectedYear ? "active" : ""}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </button>
            ))}
          </div>

          {/* TERM SELECTOR */}
          <div className="term-selector">
            {terms.map(term => (
              <button
                key={term._id}
                className={term._id === selectedTerm?._id ? "active" : ""}
                onClick={() => setSelectedTerm(term)}
              >
                {term.termName}
                {term.isCurrent && <span className="current-badge">Current</span>}
              </button>
            ))}
          </div>

          {/* FORM */}
          <div className="form-grid">
            <div>
              <label>Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.className}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Next Term Begins</label>
              <DatePicker
                selected={nextTermDate}
                onChange={setNextTermDate}
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <label>Next Term Fees (GHS)</label>
              <input
                type="number"
                value={nextTermFees}
                onChange={e => setNextTermFees(e.target.value)}
              />
            </div>
          </div>

          <button className="generate-btn" disabled={generating} onClick={handleGenerate}>
            {generating ? "Generating..." : "Generate Reports"}
          </button>

          {downloadLink && (
            <div className="download-box">
              <a href={downloadLink} download>Download ZIP</a>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default GenerateClassReports;
