import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, ResponsiveContainer
} from "recharts";
import { FaPlus, FaMoneyBillWave, FaEdit, FaTrash } from "react-icons/fa";
import "./FeedingFee.modules.css";

const FeedingFeePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalClassPaid, setTotalClassPaid] = useState(0);
  const [displayAs, setDisplayAs] = useState("table"); // 👈 This is missing
const [totalSchoolPaid, setTotalSchoolPaid] = useState(0);
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
  setSelectedClass(classId);
  setLoading(true);

  try {
    const studentRes =
      classId === "all"
        ? await axios.get(`/api/student/school/${schoolId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.get(`/api/student/class/${classId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

    const studentsList = studentRes.data || [];

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

    // Only update backend if a specific class was selected
    if (classId !== "all") {
      await updateClassTotalPaid(classId, totalPaid);
    }
  } catch (error) {
    toast.error("Failed to fetch student attendance.");
  } finally {
    setLoading(false);
  }
};

const fetchTotalFeedingForSchool = async () => {
  try {
    // First: fetch the latest term
    const termRes = await axios.get(`/api/terms/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const latestTerm = termRes.data?._id;
    if (!latestTerm) {
      toast.error("Failed to fetch latest term");
      return;
    }

    // Then: fetch school total based on term and viewBy
    const res = await axios.get(
      `/api/attendance/feeding-total/school/${schoolId}?termId=${latestTerm}&viewBy=${viewBy}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

setTotalSchoolPaid(res.data?.totalSchoolPaid || 0);
  } catch (error) {
    toast.error("Failed to fetch school's total feeding paid.");
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
  fetchTotalFeedingForSchool(); // add this
}, [viewBy]);


  return (
    <div>
      <Header />
      <Sidebar />
      <div className="feeding-fee-container">
        <h2 className="feeding-fee-title">Feeding Fee Management</h2>

       <div className="attendance-controls">
  {/* View By */}
  <div className="control-group">
    <label>View By:</label>
    <select
      className="control-dropdown"
      value={viewBy}
      onChange={(e) => setViewBy(e.target.value)}
    >
      <option value="today">Today</option>
      <option value="week">This Week</option>
      <option value="month">This Month</option>
      <option value="term">This Term</option>
    </select>
  </div>

  {/* Display As */}
  <div className="control-group">
    <label>Display As:</label>
    <select value={displayAs} onChange={(e) => setDisplayAs(e.target.value)}>
    <option value="table">Table</option>
    <option value="bar">Bar Chart</option>
    <option value="pie">Pie Chart</option>
  </select>
  </div>
</div>


{displayAs === "bar" && students.length > 0 && (
  <div style={{ width: "100%", height: 400 }}>
    <ResponsiveContainer>
      <BarChart data={students} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          interval={0} 
          height={80}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalAmountPaid" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}


{displayAs === "pie" && (
  <PieChart width={400} height={400}>
    <Pie
      data={students}
      dataKey="totalAmountPaid"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={150}
      fill="#82ca9d"
      label
    />
    <Tooltip />
  </PieChart>
)}


        {/* 🟩 Class Selector Dropdown */}
              <select
          className="class-dropdown"
          onChange={(e) => fetchStudentsByClass(e.target.value)}
          value={selectedClass}
        >
          <option value="all">All Classes</option>
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
            <div className="time-summary">
          <div className="time-summary-box">
            <FaMoneyBillWave className="time-summary-icon" />
            <div>
              <h3>Total Feeding Paid for Class:{" "}</h3>
              <span>GHC {totalClassPaid.toLocaleString()}</span>
            </div>
          </div>
          <div className="time-summary-box">
            <FaMoneyBillWave className="time-summary-icon" />
            <div>
              <h3>Total Feeding Paid for School</h3>
              <span>GHC {totalSchoolPaid.toLocaleString()}</span>
            </div>
          </div>
        </div>
          </div>
        )}

        {/* 🟨 Student Table */}
       {displayAs === "table" && students.length > 0 && (
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
