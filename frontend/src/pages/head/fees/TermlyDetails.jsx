// pages/Admin/Fees/TermlyDetails.jsx
import React, { useEffect, useState } from "react";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import api from "../../../utils/api"; // Assuming you have an api.js file
import { toast } from "react-hot-toast";
import "./TermlyDetails.modules.css";

const TermlyDetails = () => {
  const [yearLabel, setYearLabel] = useState("");
  const [termName, setTermName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classes, setClasses] = useState([]);
  const [classFees, setClassFees] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/classes/school/${schoolId}"); // Adjust if needed
      setClasses(data);
      const initialFees = {};
      data.forEach((cls) => {
        initialFees[cls._id] = "";
      });
      setClassFees(initialFees);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleFeeChange = (classId, fee) => {
    setClassFees((prevFees) => ({
      ...prevFees,
      [classId]: fee,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!yearLabel || !termName || !startDate || !endDate) {
      toast.error("Please fill all term details.");
      return;
    }

    try {
      setLoading(true);

      for (const classId in classFees) {
        if (classFees[classId]) {
          await api.post("/api/fees/set-fees", {
            classId,
            yearLabel,
            termName,
            totalFees: parseFloat(classFees[classId]),
          });
        }
      }

      toast.success("Termly details and fees saved successfully!");
      // Optional: clear form after submit
    } catch (error) {
      console.error(error);
      toast.error("Failed to save term details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="termly-details-container">
      <Sidebar />
      <div className="termly-details-main">
        <Header />
        <div className="termly-details-content">
          <h2>Set Term Details and Class Fees</h2>

          <form onSubmit={handleSubmit} className="termly-details-form">
            <div className="termly-details-row">
              <label>Academic Year:</label>
              <input
                type="text"
                placeholder="e.g. 2024/2025"
                value={yearLabel}
                onChange={(e) => setYearLabel(e.target.value)}
              />
            </div>

            <div className="termly-details-row">
              <label>Term:</label>
              <select value={termName} onChange={(e) => setTermName(e.target.value)}>
                <option value="">Select Term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div className="termly-details-row">
              <label>Term Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="termly-details-row">
              <label>Term End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="termly-details-classes">
              <h3>Class Fees Setup</h3>
              {classes.map((cls) => (
                <div key={cls._id} className="termly-details-class-row">
                  <label>{cls.className}</label>
                  <input
                    type="number"
                    placeholder="Enter fee amount"
                    value={classFees[cls._id] || ""}
                    onChange={(e) => handleFeeChange(cls._id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="termly-details-submit">
              Save Term Details
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TermlyDetails;
