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
  const [totalClassPaid, setTotalClassPaid] = useState(0);
  const [viewBy, setViewBy] = useState("term"); // 'today' | 'week' | 'month' | 'term'

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;
  const token = localStorage.getItem("token");

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

  const fetchStudentsByClass = async (classId) => {
    if (!classId) return;
    setSelectedClass(classId);

    try {
      setLoading(true);

      const studentRes = await axios.get(`/api/student/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentsList = studentRes.data || [];

      // Get latest term
      const termRes = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestTerm = termRes.data?._id;

      if (!latestTerm) {
        toast.error("Failed to fetch latest term");
        return;
      }

      const attendanceRes = await axios.get(
        `/api/attendance/student-total?termId=${latestTerm}&classId=${classId}&viewBy=${viewBy}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const studentAttendanceData = attendanceRes.data;

      const updatedStudents = studentsList.map((student) => {
        const attendanceRecord = studentAttendanceData.find((s) => s._id === student._id);
        const totalAttendanceDays = attendanceRecord?.totalPresentDays || 0;

        return {
          ...student,
          feedingFee: student.feedingFee,
          totalAttendanceDays,
          totalAmountPaid: student.feedingFee * totalAttendanceDays,
        };
      });

      setStudents(updatedStudents);

      const totalPaid = updatedStudents.reduce((sum, student) => sum + student.totalAmountPaid, 0);
      setTotalClassPaid(totalPaid);

      await updateClassTotalPaid(classId, totalPaid);
    } catch (error) {
      toast.error("Failed to fetch student attendance.");
    } finally {
      setLoading(false);
    }
  };

  const updateClassTotalPaid = async (classId, totalPaid) => {
    try {
      await axios.put(
        `/api/classes/update-feeding-total/${classId}`,
        { totalFeedingPaid: totalPaid },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Failed to update class total feeding paid:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    }
  }, [viewBy]); // Re-fetch when filter changes

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="feeding-fee-container">
        <h2 className="feeding-fee-title">Feeding Fee Management</h2>

        {/* 🟧 View Filter Selector */}
        <div className="view-filter-container">
          <label>View By: </label>
          <select
            className="view-filter-dropdown"
            value={viewBy}
            onChange={(e) => setViewBy(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="term">This Term</option>
          </select>
        </div>

        {/* 🟩 Class Selector Dropdown */}
        <select
          className="class-dropdown"
          onChange={(e) => fetchStudentsByClass(e.target.value)}
          value={selectedClass}
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className}
            </option>
          ))}
        </select>

        {loading && <p className="loading-message">Loading data...</p>}

        {/* 🟦 Total Paid Info */}
        {selectedClass && students.length > 0 && (
          <div className="total-feeding-paid">
            <h3>
              Total Feeding Paid for Class:{" "}
              <span>GHC {totalClassPaid.toLocaleString()}</span>
            </h3>
          </div>
        )}

        {/* 🟨 Student Table */}
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
              {students.map((student) => (
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
