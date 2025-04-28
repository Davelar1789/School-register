import React, { useEffect, useState } from "react";
import "./TermlyDetails.modules.css";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import api from "../../../api/axios"; // Adjust if your api path is different
import { toast } from "react-hot-toast";

const TermlyDetails = () => {
  const [yearLabel, setYearLabel] = useState("");
  const [termName, setTermName] = useState("Term 1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFees, setClassFees] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const schoolData = JSON.parse(localStorage.getItem("schoolData"));
  const schoolId = schoolData ? schoolData._id : null;
  
  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);
  
  const fetchClasses = async () => {
    try {
      const { data } = await api.get(`/api/classes/school/${schoolId}`);
      setAllClasses(data);
      const initialFees = data.map(cls => ({
        classId: cls._id,
        className: cls.className,
        totalFees: 0,
      }));
      setClassFees(initialFees);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };
  
  const handleFeeChange = (index, value) => {
    const updatedFees = [...classFees];
    updatedFees[index].totalFees = value;
    setClassFees(updatedFees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!yearLabel || !termName || !startDate || !endDate) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/terms/create", {
        schoolId,
        yearLabel,
        termName,
        startDate,
        endDate,
        classFees,
      });
      toast.success("Term session created successfully!");
      setYearLabel("");
      setTermName("Term 1");
      setStartDate("");
      setEndDate("");
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create term session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="termly-details-container">
      <Sidebar />
      <div className="termly-details-content">
        <Header />
        <div className="termly-side">
        <h2>Set Up New Term Session</h2>
        <form className="termly-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Academic Year (e.g. 2024/2025)</label>
            <input 
              type="text" 
              value={yearLabel} 
              onChange={(e) => setYearLabel(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Term</label>
            <select value={termName} onChange={(e) => setTermName(e.target.value)}>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          <div className="form-group">
            <label>Term Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Term End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
            />
          </div>

          <h3>Set Fees for Each Class</h3>
          {classFees.map((cls, index) => (
            <div key={cls.classId} className="fee-row">
              <span>{cls.className}</span>
              <input
                type="number"
                value={cls.totalFees}
                onChange={(e) => handleFeeChange(index, Number(e.target.value))}
                placeholder="Enter total fees"
              />
            </div>
          ))}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Term Session"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default TermlyDetails;
