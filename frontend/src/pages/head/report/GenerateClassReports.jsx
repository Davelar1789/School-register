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
  const [selectedClass, setSelectedClass] = useState("");
  const [termId, setTermId] = useState(null);
  const [nextTermDate, setNextTermDate] = useState(null);
  const [nextTermFees, setNextTermFees] = useState("");
  const [generating, setGenerating] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClasses();
    fetchLatestTerm();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`/api/classes/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch classes.");
    }
  };

  const fetchLatestTerm = async () => {
    try {
      const res = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTermId(res.data?._id || null);
    } catch (error) {
      toast.error("Failed to fetch latest term.");
    }
  };

  const handlePrintAll = () => {
  const printSection = document.getElementById("print-section");
  const iframes = printSection.querySelectorAll("iframe");

  iframes.forEach((iframe, idx) => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, idx * 1000); // slight delay between prints
  });
};

  const handleGenerate = async () => {
    if (!selectedClass || !termId || !nextTermDate || !nextTermFees) {
      toast.error("Please complete all fields.");
      return;
    }

    setGenerating(true);
    setDownloadLink("");

    try {
      const res = await axios.get(
        `/api/reports/generate/class/${selectedClass}?termId=${termId}&nextTermDate=${nextTermDate.toISOString()}&nextTermFees=${nextTermFees}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      setDownloadLink(url);
      toast.success("Report generation complete.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate reports.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="generate-container">
        <div className="report-content">
          <h2>Generate Report Cards</h2>

          <div className="select-class">
            <label>Select Class:</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          <div className="select-date">
            <label>Next Term Begins:</label>
            <DatePicker
              selected={nextTermDate}
              onChange={(date) => setNextTermDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pick a date"
            />
          </div>

          <div className="select-fee">
            <label>Fees for Next Term (GHS):</label>
            <input
              type="number"
              value={nextTermFees}
              onChange={(e) => setNextTermFees(e.target.value)}
              placeholder="e.g. 450"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={
              generating || !selectedClass || !termId || !nextTermDate || !nextTermFees
            }
            className={`generate-button ${generating ? "disabled" : ""}`}
          >
            {generating ? "Generating..." : "Generate Report Cards"}
          </button>

          {downloadLink && (
            <div className="download-section">
              <p>✅ Reports are ready!</p>
              <a href={downloadLink} download="class_reports.zip" className="download-button">
                Click here to download ZIP
              </a>
            </div>
          )}
        </div>
        <button onClick={handlePrintAll}>Print All</button>
<div id="print-section" style={{ display: "none" }}>
  {pdfPreviews.map((url, idx) => (
    <iframe key={idx} src={url} width="0" height="0" />
  ))}
</div>
      </div>
    </div>
  );
};

export default GenerateClassReports;
