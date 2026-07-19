import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { Lock, Unlock, Download, Eye, ChevronLeft, BookOpenCheck, School } from "lucide-react";
import "./MarkingSchemes.modules.css";

const MarkingSchemes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessingId, setAccessingId] = useState(null);

  useEffect(() => {
    const fetchScope = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/marking-schemes/teacher/my-scope", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data.classes);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load marking schemes.");
      } finally {
        setLoading(false);
      }
    };
    fetchScope();
  }, []);

  const handleAccess = async (schemeId, mode) => {
    try {
      setAccessingId(schemeId);
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/marking-schemes/teacher/access/${schemeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { fileUrl, title } = res.data;

      if (mode === "open") {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", title || "marking-scheme");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to access this marking scheme.";
      toast.error(msg);
    } finally {
      setAccessingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "numeric", minute: "2-digit",
    });

  if (loading) {
    return <div className="ms-page"><p className="ms-loading">Loading marking schemes…</p></div>;
  }

  return (
    <div className="ms-page">
      <div className="ms-header">
        <button className="ms-back-btn" onClick={() => navigate("/teacher-dashboard")}>
          <ChevronLeft size={18} /> Back to Dashboard
        </button>
        <h1 className="ms-title">
          <BookOpenCheck size={22} /> End of Term Marking Schemes
        </h1>
      </div>

      {classes.length === 0 ? (
        <div className="ms-empty">
          <p>No marking schemes have been assigned to your classes yet.</p>
        </div>
      ) : !selectedClass ? (
        <div className="ms-class-grid">
          {classes.map((cls) => (
            <button
              key={cls.classId}
              className="ms-class-card"
              onClick={() => setSelectedClass(cls)}
            >
              <span className="ms-class-icon"><School size={22} /></span>
              <span className="ms-class-name">{cls.className}</span>
              <span className="ms-class-count">{cls.subjects.length} subject(s)</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="ms-subjects-section">
          <button className="ms-back-btn ms-back-inline" onClick={() => setSelectedClass(null)}>
            <ChevronLeft size={18} /> All Classes
          </button>
          <h2 className="ms-class-heading">{selectedClass.className}</h2>

          <div className="ms-subject-list">
            {selectedClass.subjects.map((subj) => (
              <div key={subj.subjectId} className={`ms-subject-card ${!subj.isUnlocked ? "locked" : ""}`}>
                <div className="ms-subject-info">
                  <span className="ms-subject-name">{subj.subjectName}</span>
                  <span className="ms-subject-meta">{subj.term} · {subj.academicYear}</span>
                  {!subj.isUnlocked && (
                    <span className="ms-lock-note">
                      <Lock size={13} /> Unlocks {formatDate(subj.availableFrom)}
                    </span>
                  )}
                </div>

                <div className="ms-subject-actions">
                  <button
                    disabled={!subj.isUnlocked || accessingId === subj.schemeId}
                    onClick={() => handleAccess(subj.schemeId, "open")}
                    className="ms-action-btn ms-open-btn"
                  >
                    {subj.isUnlocked ? <Unlock size={15} /> : <Lock size={15} />} Open
                  </button>
                  <button
                    disabled={!subj.isUnlocked || accessingId === subj.schemeId}
                    onClick={() => handleAccess(subj.schemeId, "download")}
                    className="ms-action-btn ms-download-btn"
                  >
                    <Download size={15} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkingSchemes;