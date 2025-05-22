import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";

const GenerateClassReports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [termId, setTermId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;
  const token = localStorage.getItem("token");

  // Fetch classes
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

  // Fetch latest term
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

  useEffect(() => {
    fetchClasses();
    fetchLatestTerm();
  }, []);

  const handleGenerate = async () => {
    if (!selectedClass || !termId) {
      toast.error("Please select a class and ensure term is loaded.");
      return;
    }

    setGenerating(true);
    setDownloadLink("");

    try {
      const res = await axios.get(
        `/api/reports/generate/class/${selectedClass}?termId=${termId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Needed to handle zip download
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
      <div style={{ marginLeft: "250px", padding: "2rem" }}>
        <h2>Generate Report Cards</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ marginLeft: "1rem", padding: "0.5rem", fontSize: "1rem" }}
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? "Generating..." : "Generate Report Cards"}
        </button>

        {downloadLink && (
          <div style={{ marginTop: "2rem" }}>
            <p>✅ Reports are ready!</p>
            <a
              href={downloadLink}
              download="class_reports.zip"
              style={{
                textDecoration: "none",
                background: "#28a745",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
              }}
            >
              Click here to download ZIP
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateClassReports;
