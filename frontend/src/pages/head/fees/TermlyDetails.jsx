import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { MdEdit } from 'react-icons/md';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [selectedTermForDateEdit, setSelectedTermForDateEdit] = useState(null);
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
    setIsSaving(true); // Start loading animation
    try {
      await api.post(`/api/terms/upsert-term/${editingTerm._id}`, {
        classFees: editedClassFees,
      });
      toast.success("Class fees updated successfully.");
      setEditingTerm(null);
      handleYearSelect(selectedYear);
    } catch (error) {
      toast.error("Failed to update class fees.");
    } finally {
        setIsSaving(false); // Stop loading animation
      }
  };

  const handleStartDateSave = async () => {
    if (!newStartDate || !selectedTermForDateEdit?._id) {
      toast.error("Start date or term is missing.");
      return;
    }
  
    try {
      await api.patch(`/api/terms/update-term-dates/${selectedTermForDateEdit._id}`, {
        startDate: newStartDate,
      });
  
      toast.success("Start date updated!");
      setIsStartModalOpen(false);
      setSelectedTermForDateEdit(null);
      handleYearSelect(selectedYear); // Refresh terms
  
    } catch (error) {
      console.error("Failed to update start date:", error);
      toast.error("Failed to update start date.");
    }
  };
  
  const handleEndDateSave = async () => {
    if (!newEndDate || !selectedTermForDateEdit?._id) {
      toast.error("End date or term is missing.");
      return;
    }
  
    try {
      await api.patch(`/api/terms/update-term-dates/${selectedTermForDateEdit._id}`, {
        endDate: newEndDate,
      });
  
      toast.success("End date updated!");
      setIsEndModalOpen(false);
      setSelectedTermForDateEdit(null);
      handleYearSelect(selectedYear); // Refresh terms
  
    } catch (error) {
      console.error("Failed to update end date:", error);
      toast.error("Failed to update end date.");
    }
  };
  
  

return (
  <div className="termlyy-container">
    <Sidebar />

    <div className="termlyy-main">
      <Header />

      <div className="term-sessions-manager">
        {/* HEADER */}
        <div className="tsm-header">
          <h2>Academic Sessions</h2>
          <button
            className="primary-btn"
            onClick={() => setShowAddYearModal(true)}
          >
            + Add Academic Year
          </button>
        </div>

        {/* ACADEMIC YEARS */}
        <div className="year-list">
          {academicYears.map((year) => (
            <button
              key={year}
              className={`year-pill ${
                selectedYear === year ? "active" : ""
              }`}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </button>
          ))}
        </div>

        {/* TERMS */}
        {selectedYear && (
          <div className="terms-section">
            <h3>Terms – {selectedYear}</h3>

            <div className="term-list">
              {["Term 1", "Term 2", "Term 3"].map((termName) => {
                const term = terms.find((t) => t.termName === termName);

                return (
                  <div key={termName} className="term-card">
                    <div className="term-card-header">
                      <h4>{termName}</h4>
                    </div>

                    {term ? (
                      <>
                        <div className="term-dates">
                          <div>
                            <span>Start Date</span>
                            <p>
                              {new Date(term.startDate).toLocaleDateString()}
                              <MdEdit
                                className="edit-icon"
                                onClick={() => {
                                  setSelectedTermForDateEdit(term);
                                  setIsStartModalOpen(true);
                                }}
                              />
                            </p>
                          </div>

                          <div>
                            <span>End Date</span>
                            <p>
                              {new Date(term.endDate).toLocaleDateString()}
                              <MdEdit
                                className="edit-icon"
                                onClick={() => {
                                  setSelectedTermForDateEdit(term);
                                  setIsEndModalOpen(true);
                                }}
                              />
                            </p>
                          </div>
                        </div>

                        <button
                          className="secondary-btn full"
                          onClick={() => handleEditFees(term)}
                        >
                          Edit Fees
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="muted-text">
                          This term has not been created yet.
                        </p>
                        <button
                          className="primary-btn full"
                          onClick={() => handleCreateTerm(termName)}
                        >
                          Create Term
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= MODALS (UNCHANGED LOGIC) ================= */}

        {showAddYearModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Add Academic Year</h3>

              <input
                type="text"
                placeholder="e.g. 2025/2026"
                value={newYearLabel}
                onChange={(e) => setNewYearLabel(e.target.value)}
              />

              <div className="modal-actions">
                <button className="primary-btn" onClick={handleAddYear}>
                  Add Year
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => setShowAddYearModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {editingTerm && (
          <div className="modal-overlay">
            <div className="modal large">
              <h3>Edit Fees – {editingTerm.termName}</h3>

              {editedClassFees.map((fee, index) => (
                <div key={fee.classId} className="fee-row">
                  <span>{fee.className}</span>
                  <input
                    type="number"
                    value={fee.totalFees}
                    onChange={(e) =>
                      handleFeeChange(
                        index,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              ))}

              <div className="modal-actions">
                <button className="primary-btn" onClick={handleSaveFees}>
                  Save Changes
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => setEditingTerm(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Saving changes…</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default TermSessionsManager;
