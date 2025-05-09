import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import "./TrackAttendance.modules.css";

const TrackAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
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
    } catch (error) {
      toast.error("Failed to fetch class list");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch students with total attendance when a class is selected
  const fetchStudentsByClass = async (classId) => {
    if (!classId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/attendance/student-total?termId=LATEST_TERM_ID&classId=${classId}`);
      setStudents(data || []);
    } catch (error) {
      toast.error("Failed to fetch student attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="track-attendance-container">
      <h2 className="track-attendance-title">Track Student Attendance</h2>

      {/* Class Selector */}
      <select className="class-dropdown" onChange={(e) => {
        setSelectedClass(e.target.value);
        fetchStudentsByClass(e.target.value);
      }}>
        <option value="">Select Class</option>
        {classes.map(cls => (
          <option key={cls._id} value={cls._id}>{cls.className}</option>
        ))}
      </select>

      {/* Students Table */}
      {loading ? (
        <p className="loading-message">Loading attendance data...</p>
      ) : students.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID No</th>
              <th>Total Present Days</th>
              <th>Out Of</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="student-row">
                <td className="student-name">{student.name}</td>
                <td className="student-id">{student.idno}</td>
                <td className="attendance-count">{student.totalPresentDays}</td>
                <td className="school-days-count">{student.totalSchoolDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-students-message">No attendance records found for this class.</p>
      )}
    </div>
  );
};

export default TrackAttendance;