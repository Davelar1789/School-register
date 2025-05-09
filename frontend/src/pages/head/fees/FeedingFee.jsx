import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import "./FeedingFee.modules.css";

const FeedingFeePage = () => {
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [loading, setLoading] = useState(false);

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;
  const token = localStorage.getItem("token");

  // ✅ Fetch all classes in the school
  const fetchClasses = async () => {
    if (!schoolId) return toast.error("School ID not found!");

    try {
      setLoading(true);
      const { data } = await axios.get(`/api/classes/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(data || []);
    } catch (error) {
      toast.error("Failed to fetch class list");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch students and their attendance days for each class
  const fetchStudentsByClass = async (classId) => {
    if (!classId) return;
    try {
      setLoading(true);
  
      const token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("Unauthorized: No token found. Please log in.");
        return;
      }
  
      // ✅ First, fetch the latest term dynamically
      const termRes = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const latestTerm = termRes.data?._id;
  
      if (!latestTerm) {
        toast.error("Failed to fetch latest term");
        return;
      }
  
      // ✅ Then, use the latest term ID to fetch student attendance
      const { data } = await axios.get(`/api/attendance/student-total?termId=${latestTerm}&classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const updatedStudents = await Promise.all(
        data.map((student) => ({
          ...student,
          feedingFee: student.feedingFee,
          totalAmountPaid: student.feedingFee * student.totalPresentDays, // ✅ Calculation
        }))
      );
  
      setStudentsByClass((prev) => ({
        ...prev,
        [classId]: updatedStudents,
      }));
    } catch (error) {
      toast.error("Failed to fetch student attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="feeding-fee-container">
      <h2 className="feeding-fee-title">Feeding Fee Management</h2>

      {loading && <p className="loading-message">Loading data...</p>}

      {classes.map((cls) => (
        <div key={cls._id} className="class-section">
          <h3>{cls.className}</h3>
          
          {/* ✅ Fetch students when class is loaded */}
          <button onClick={() => fetchStudentsByClass(cls._id)} className="load-students-button">
            Load Students
          </button>

          {/* Students Table */}
          {studentsByClass[cls._id] && (
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Feeding Fee</th>
                  <th>Attendance Days</th>
                  <th>Total Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {studentsByClass[cls._id].map(student => (
                  <tr key={student._id} className="fee-row">
                    <td>{student.name}</td>
                    <td>{student.feedingFee}</td>
                    <td>{student.totalAttendanceDays}</td>
                    <td>{student.totalAmountPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeedingFeePage;