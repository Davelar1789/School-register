import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import "./TermlyDetails.modules.css"; // Create and style accordingly

const TermSessionsManager = () => {
  const schoolData = JSON.parse(localStorage.getItem("schoolData"));
  const schoolId = schoolData ? schoolData._id : null;

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [terms, setTerms] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearLabel, setNewYearLabel] = useState("");
  const [editingTerm, setEditingTerm] = useState(null);
  const [editedClassFees, setEditedClassFees] = useState([]);
  const [showCreateTermModal, setShowCreateTermModal] = useState(false);
const [newTermData, setNewTermData] = useState({
  termName: "",
  startDate: "",
  endDate: "",
  classFees: [],
});


  useEffect(() => {
    if (schoolId) {
      fetchAcademicYears();
      fetchClasses();
    }
  }, [schoolId]);

  const fetchAcademicYears = async () => {
    try {
      const { data } = await api.get(`/api/terms/years/${schoolId}`);
      setAcademicYears(data);
    } catch (error) {
      toast.error("Failed to fetch academic years.");
    }
  };

  const handleCreateTerm = (termName) => {
    setNewTermData({
      termName,
      startDate: "",
      endDate: "",
      classFees: allClasses.map(cls => ({
        classId: cls._id,
        className: cls.className,
        totalFees: 0,
      })),
    });
    setShowCreateTermModal(true);
  };

  const handleSubmitNewTerm = async () => {
    const { termName, startDate, endDate, classFees } = newTermData;
  
    if (!startDate || !endDate) {
      toast.error("Start and end dates are required.");
      return;
    }
  
    try {
      await api.post("/api/terms/upsert-term", {
        schoolId,
        yearLabel: selectedYear,
        termName,
        startDate,
        endDate,
        classFees,
      });
      toast.success(`${termName} created successfully.`);
      setShowCreateTermModal(false);
      handleYearSelect(selectedYear); // Refresh term list
    } catch (error) {
      toast.error("Failed to create term.");
    }
  };
  
  

  const fetchClasses = async () => {
    try {
      const { data } = await api.get(`/api/classes/school/${schoolId}`);
      setAllClasses(data);
    } catch (error) {
      toast.error("Failed to fetch classes.");
    }
  };

  const handleYearSelect = async (year) => {
    setSelectedYear(year);
    try {
      const encodedYear = encodeURIComponent(year); // <-- Encode here
      const { data } = await api.get(`/api/terms/${schoolId}/${encodedYear}`);
      setTerms(data);
    } catch (error) {
      toast.error("Failed to fetch terms for the selected year.");
    }
  };
  

  const handleAddYear = async () => {
    if (!newYearLabel) {
      toast.error("Year label cannot be empty.");
      return;
    }
    try {
      await api.post("/api/terms/add-academic-year", {
        schoolId,
        yearLabel: newYearLabel,
      });
      toast.success("Academic year added successfully.");
      setShowAddYearModal(false);
      setNewYearLabel("");
      fetchAcademicYears();
    } catch (error) {
      console.error(error); // helpful for debugging
      console.log("schoolId being sent:", schoolId);
      toast.error(
        error?.response?.data?.message || "Failed to add academic year."
      );
    }
  };
  

  const handleEditFees = (term) => {
    setEditingTerm(term);
    const copiedFees = term.classFees.map(fee => ({ ...fee }));
    setEditedClassFees(copiedFees);
  };
  
  const handleFeeChange = (index, value) => {
    const updatedFees = [...editedClassFees];
    updatedFees[index].totalFees = value;
    setEditedClassFees(updatedFees);
  };
  

  const handleSaveFees = async () => {
    try {
      await api.put(`/api/terms/upsert-term/${editingTerm._id}`, {
        classFees: editedClassFees,
      });
      toast.success("Class fees updated successfully.");
      setEditingTerm(null);
      handleYearSelect(selectedYear);
    } catch (error) {
      toast.error("Failed to update class fees.");
    }
  };

  return (
    <div className="termlyy-container">
      <Sidebar />
      <div className="termlyy-main">
        <Header />
    <div className="term-sessions-manager">
      <h2>Academic Years</h2>
      <div className="year-list">
        {academicYears.map((year) => (
          <button
            key={year}
            className={`year-button ${selectedYear === year ? "active" : ""}`}
            onClick={() => handleYearSelect(year)}
          >
            {year}
          </button>
        ))}
        <button className="add-year-button" onClick={() => setShowAddYearModal(true)}>
          + Add Year
        </button>
      </div>

      {selectedYear && (
        <div className="terms-section">
          <h3>Terms for {selectedYear}</h3>
          <div className="term-list">
            {["Term 1", "Term 2", "Term 3"].map((termName) => {
              const term = terms.find((t) => t.termName === termName);
              return (
                <div key={termName} className="term-card">
                  <h4>{termName}</h4>
                  {term ? (
                    <>
                      <p>
                        Start Date: {new Date(term.startDate).toLocaleDateString()}
                      </p>
                      <p>
                        End Date: {new Date(term.endDate).toLocaleDateString()}
                      </p>
                      <button onClick={() => handleEditFees(term)}>Edit Fees</button>
                    </>
                  ) : (
                    <>
                    <p>Term not created yet.</p>
                    <button onClick={() => handleCreateTerm(term)}>Create</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Year Modal */}
      {showAddYearModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Academic Year</h3>
            <input
              type="text"
              placeholder="e.g., 2025/2026"
              value={newYearLabel}
              onChange={(e) => setNewYearLabel(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleAddYear}>Add Year</button>
              <button onClick={() => setShowAddYearModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fees Modal */}
      {editingTerm && (
        <div className="modal-overlay2">
          <div className="modal2">
            <h3>Edit Fees for {editingTerm.termName}</h3>
            {editedClassFees.map((fee, index) => (
              <div key={fee.classId} className="fee-row">
                <span>{fee.className}</span>
                <input
                type="number"
                step="0.01"
                value={fee.totalFees}
                onChange={(e) => handleFeeChange(index, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button onClick={handleSaveFees}>Save</button>
              <button onClick={() => setEditingTerm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

{showCreateTermModal && (
  <div className="modal-overlay2">
    <div className="modal2">
      <h3>Create {newTermData.termName}</h3>
      <label>Start Date</label>
      <input
        type="date"
        value={newTermData.startDate}
        onChange={(e) =>
          setNewTermData({ ...newTermData, startDate: e.target.value })
        }
      />
      <label>End Date</label>
      <input
        type="date"
        value={newTermData.endDate}
        onChange={(e) =>
          setNewTermData({ ...newTermData, endDate: e.target.value })
        }
      />

      <h4>Set Fees</h4>
      {newTermData.classFees.map((fee, index) => (
        <div key={fee.classId}>
          <label>{fee.className}</label>
          <input
            type="number"
            value={fee.totalFees}
            onChange={(e) => {
              const updatedFees = [...newTermData.classFees];
              updatedFees[index].totalFees = parseFloat(e.target.value);
              setNewTermData({ ...newTermData, classFees: updatedFees });
            }}
          />
        </div>
      ))}

      <button onClick={handleSubmitNewTerm}>Create Term</button>
      <button onClick={() => setShowCreateTermModal(false)}>Cancel</button>
    </div>
  </div>
)}

    </div>
    </div>
    </div>
  );
};

export default TermSessionsManager;
