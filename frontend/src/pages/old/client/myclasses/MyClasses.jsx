import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import "./MyClasses.modules.css";
import { toast } from "react-hot-toast";
import Side from "../../../components/Side2";


const MyClasses = () => {
  const [classCode, setClassCode] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch student classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get("/api/classes/student");
      setClasses(response.data.classes);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async (e) => {
    e.preventDefault();

    if (!classCode.trim()) {
      toast.error("Class code is required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/classes/join", { classCode });
      toast.success(`Joined class "${response.data.class.className}" successfully`);
      setClassCode("");
      fetchClasses(); // Refresh classes
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="s-p">
        <Side />
        <div className="student-page">
      <div className="student-container">
        <h1 className="student-title">My Classes</h1>

        {/* Join Class Form */}
        <form className="join-class-form" onSubmit={handleJoinClass}>
          <label htmlFor="classCode">Enter Class Code</label>
          <input
            type="text"
            id="classCode"
            placeholder="6-digit class code"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
          />
          <button type="submit" className="join-class-button" disabled={loading}>
            {loading ? "Joining..." : "Join Class"}
          </button>
        </form>

        {/* Classes List */}
        <table className="classes-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Number of Students</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem._id}>
                <td>{classItem.className}</td>
                <td>{classItem.enrolledStudents.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
    
  );
};

export default MyClasses;
