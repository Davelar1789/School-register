import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
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
  const [previewing, setPreviewing] = useState(false);


  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [nextTermDate, setNextTermDate] = useState(null);
  const [nextTermFees, setNextTermFees] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!schoolId) return;
    fetchAcademicYears();
    fetchClasses();
  }, [schoolId]);

  /* ================= FETCHERS ================= */

  const fetchAcademicYears = async () => {
    try {
      const { data } = await api.get(`/api/terms/years/${schoolId}`);
      setAcademicYears(data);

      if (data.length > 0) {
        // Automatically select latest year
        handleYearSelect(data[data.length - 1]);
      }
    } catch {
      toast.error("Failed to fetch academic years.");
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get(`/api/classes/school/${schoolId}`);
      setClasses(data);
    } catch {
      toast.error("Failed to fetch classes.");
    }
  };

const handlePreview = async () => {
  if (!selectedClass || !selectedTerm) {
    toast.error("Select class and term first");
    return;
  }

  // Open tab immediately (VERY IMPORTANT)
  const previewWindow = window.open("", "_blank");

  setPreviewing(true);
  toast.loading("Generating preview reports...", { id: "preview" });

  try {
    const res = await api.get(
      `/api/reports/reports/preview/class/${selectedClass}?termId=${selectedTerm._id}&nextTermDate=${nextTermDate?.toISOString()}&nextTermFees=${nextTermFees}`,
      {
        responseType: "blob",
      }
    );

    const pdfBlob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(pdfBlob);

    // Redirect the already-opened tab to the PDF
    previewWindow.location.href = url;

    toast.success("Preview ready", { id: "preview" });
  } catch (err) {
    console.error(err);
    toast.error("Failed to load preview", { id: "preview" });
    previewWindow.close();
  } finally {
    setPreviewing(false);
  }
};


  /* ================= YEAR → TERMS ================= */

  const handleYearSelect = async (year) => {
    setSelectedYear(year);
    setSelectedTerm(null);
    setTerms([]);

    try {
      const encodedYear = encodeURIComponent(year);
      const { data } = await api.get(
        `/api/terms/${schoolId}/${encodedYear}`
      );

      setTerms(data);

      const currentTerm = data.find((t) => t.isCurrent);
      setSelectedTerm(currentTerm || data[0] || null);
    } catch (error) {
      toast.error("Failed to fetch terms for the selected year.");
    }
  };

  /* ================= GENERATE REPORTS ================= */

  const handleGenerate = async () => {
    if (!selectedClass || !selectedTerm || !nextTermDate || !nextTermFees) {
      toast.error("Please complete all fields.");
      return;
    }

    setGenerating(true);
    setDownloadLink("");

    try {
      const res = await api.get(
        `/api/reports/generate/class/${selectedClass}?termId=${selectedTerm._id}&nextTermDate=${nextTermDate.toISOString()}&nextTermFees=${nextTermFees}`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      setDownloadLink(url);

      toast.success("Report cards generated successfully.");
    } catch {
      toast.error("Failed to generate reports.");
    } finally {
      setGenerating(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <Header />
      <Sidebar />

      <div className="reports-page">
        <div className="reports-card">
          <h2>Generate Report Cards</h2>

          {/* Academic Years */}
          <div className="year-selector">
            {academicYears.map((year) => (
              <button
                key={year}
                className={year === selectedYear ? "active" : ""}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Terms */}
          <div className="term-selector">
            {terms.map((term) => (
              <button
                key={term._id}
                className={selectedTerm?._id === term._id ? "active" : ""}
                onClick={() => setSelectedTerm(term)}
              >
                {term.termName}
                {term.isCurrent && (
                  <span className="current-badge">Current</span>
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="form-grid">
           <div className="form-field">
            <label>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>
            <div className="form-field">
              <label>Next Term Begins</label>
              <DatePicker
                selected={nextTermDate}
                onChange={setNextTermDate}
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className="form-field">
              <label>Next Term Fees (GHS)</label>
              <input
                type="number"
                value={nextTermFees}
                onChange={(e) => setNextTermFees(e.target.value)}
              />
            </div>
          </div>

          <button
            className="generate-btn"
            disabled={generating}
            onClick={handleGenerate}
          >
            {generating ? "Generating..." : "Generate Reports"}
          </button>

        <button
          className="preview-btn"
          onClick={handlePreview}
          disabled={previewing}
        >
          {previewing ? "Generating Preview..." : "Preview Reports"}
        </button>

          {downloadLink && (
            <div className="download-box">
              <a href={downloadLink} download="class_reports.zip">
                Download ZIP
              </a>
            </div>
          )}
<p className="preview-warning">
  <strong>Note:</strong> The preview is provided for quick review purposes only.
  It may not fully reflect the final report format, layout, or all computed values.
  For accurate and complete student reports, please use the generated report files.
</p>


        </div>
      </div>
    </>
  );
};

export default GenerateClassReports;
