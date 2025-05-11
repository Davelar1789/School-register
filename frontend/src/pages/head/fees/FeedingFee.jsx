import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import "./FeedingFee.modules.css";

const FeedingFeePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
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

  // ✅ Fetch students & attendance based on selected class
  const fetchStudentsByClass = async (classId) => {
    if (!classId) return;
    setSelectedClass(classId);

    try {
      setLoading(true);

      // ✅ Fetch students first
      const studentRes = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentsList = studentRes.data || [];

      // ✅ Fetch attendance for each student
      const termRes = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestTerm = termRes.data?._id;

      if (!latestTerm) {
        toast.error("Failed to fetch latest term");
        return;
      }

      const attendanceRes = await axios.get(`/api/attendance/student-total?termId=${latestTerm}&classId=${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentAttendanceData = attendanceRes.data;

      // ✅ Merge attendance data into student records
      const updatedStudents = studentsList.map((student) => {
        const attendanceRecord = studentAttendanceData.find(s => s._id === student._id);
        const totalAttendanceDays = attendanceRecord?.totalPresentDays || 0;

        return {
          ...student,
          feedingFee: student.feedingFee,
          totalAttendanceDays,
          totalAmountPaid: student.feedingFee * totalAttendanceDays, // ✅ Calculation
        };
      });

      setStudents(updatedStudents);
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
    <div>
<Header />
<Sidebar />
    <div className="feeding-fee-container">
      <h2 className="feeding-fee-title">Feeding Fee Management</h2>

      {/* ✅ Class Selector Dropdown */}
      <select className="class-dropdown" onChange={(e) => fetchStudentsByClass(e.target.value)}>
        <option value="">Select a class</option>
        {classes.map(cls => (
          <option key={cls._id} value={cls._id}>{cls.className}</option>
        ))}
      </select>

      {loading && <p className="loading-message">Loading data...</p>}

      <div>
        <h3>Total Feeding Fee For {cls.className}</h3>
      </div>

      {/* ✅ Styled Student Fee Table */}
      {students.length > 0 && (
        <table className="fee-table2">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Feeding Fee</th>
              <th>Attendance Days</th>
              <th>Total Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="fee-row2">
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
    </div>
  );
};

export default FeedingFeePage;