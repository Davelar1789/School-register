import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import "./SetFeeding.modules.css";

const ManageFeedingFees = () => {
  const [classes, setClasses] = useState([]);
  const [feedingFees, setFeedingFees] = useState({});
  const [loading, setLoading] = useState(false);

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;

  // ✅ Fetch all classes in the school
  const fetchClasses = async () => {
    if (!schoolId) return toast.error("School ID not found!");

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/classes/school/${schoolId}`);
      setClasses(data || []);

      // ✅ Initialize feeding fee state for each class
      const initialFees = {};
      data.forEach(cls => {
        initialFees[cls._id] = cls.feedingFee || ""; // Pre-fill with existing fees if available
      });
      setFeedingFees(initialFees);
    } catch (error) {
      toast.error("Failed to fetch class list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ✅ Handle feeding fee input changes
  const handleFeeChange = (classId, value) => {
    setFeedingFees(prevFees => ({
      ...prevFees,
      [classId]: value,
    }));
  };

  // ✅ Submit all feeding fees at once
  const submitFeedingFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ✅ Send all feeding fees together
      await axios.post("/api/fees/set-feeding-fee", { feedingFees }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Feeding fees updated successfully!");
      fetchClasses(); // Refresh data after submission
    } catch (error) {
      console.error("Error updating feeding fees:", error);
      toast.error("Failed to update feeding fees.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feeding-fee-container22">
      <h2 className="feeding-fee-title22">Manage Feeding Fees</h2>

      {loading && <p className="loading-message22">Loading classes...</p>}

      <table className="fee-table22">
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Feeding Fee</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => (
            <tr key={cls._id} className="fee-row22">
              <td>{cls.className}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={feedingFees[cls._id] || ""}
                  onChange={(e) => handleFeeChange(cls._id, e.target.value)}
                  className="fee-input22"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="submit-button22" onClick={submitFeedingFees} disabled={loading}>
        Submit All Feeding Fees
      </button>
    </div>
  );
};

export default ManageFeedingFees;