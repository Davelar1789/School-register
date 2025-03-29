import { useState, useEffect } from "react";
import axios from '../../../api/axios';
import toast, { Toaster } from "react-hot-toast";
import "./Attendance.modules.css";

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const weeksPerPage = 9;
  const totalPages = Math.ceil(15 / weeksPerPage);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/api/get-all-classes");
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const response = await axios.get(`/api/get-students-by-class/${selectedClass}`);
          const studentsData = response.data.data;
          setStudents(studentsData);

          const initialAttendance = studentsData.reduce((acc, student) => {
            const studentAttendance = student.attendance || [];
            acc[student._id] = Array(15).fill().map((_, weekIndex) => {
              const weekData = studentAttendance.find(att => att.week === weekIndex + 1);
              return weekData ? weekData.days : Array(5).fill(false);
            });
            return acc;
          }, {});
          setAttendance(initialAttendance);
        } catch (error) {
          console.error("Error fetching students", error);
        }
      };

      fetchStudents();
    }
  }, [selectedClass]);

  const handleAttendanceChange = (studentId, week, day) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId].map((days, weekIndex) =>
        weekIndex === week ? days.map((attended, dayIndex) => (dayIndex === day ? !attended : attended)) : days
      ),
    }));
  };

  const getTotalAttendance = (studentId) => {
    return attendance[studentId]?.flat().filter((attended) => attended).length || 0;
  };

  const handleSaveAttendance = async () => {
    try {
      await axios.post("/api/save-attendance", { class: selectedClass, attendance });
      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance", error);
      toast.error(`Failed to save attendance: ${error.response?.data?.message || error.message}`);
    }
  };
  

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startWeek = (currentPage - 1) * weeksPerPage;
  const endWeek = currentPage === totalPages ? 15 : startWeek + weeksPerPage;

  return (
    <div className="attendance-page">
      <Toaster />
      <h2>Attendance</h2>
      <div className="class-selection">
        <label htmlFor="class-select">Select Class:</label>
        <select id="class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select a class</option>
          {classes.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>

      {students.length > 0 && (
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student Name</th>
                {[...Array(endWeek - startWeek)].map((_, index) => (
                  <th key={index}>Week {startWeek + index + 1}</th>
                ))}
                <th>Total Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  {[...Array(endWeek - startWeek)].map((_, weekIndex) => (
                    <td key={weekIndex}>
                      <div className="attendance-grid">
                        {[...Array(5)].map((_, dayIndex) => (
                          <div key={dayIndex} className="attendance-box">
                            <input
                              type="checkbox"
                              checked={attendance[student._id]?.[startWeek + weekIndex]?.[dayIndex] || false}
                              onChange={() => handleAttendanceChange(student._id, startWeek + weekIndex, dayIndex)}
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                  <td>{getTotalAttendance(student._id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
          </div>
          <button className="save-button" onClick={handleSaveAttendance}>Save Attendance</button>
        </div>
      )}
    </div>
  );
};

export default Attendance;
