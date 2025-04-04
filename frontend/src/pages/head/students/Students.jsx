// pages/dashboard/students/Students.jsx

import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { MdDelete, MdEdit } from "react-icons/md";
import Header2 from "../../../components/Header2";
import toast from "react-hot-toast";
import "./Students.modules.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((student) => student._id !== id));
      toast.success("Student deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="students-container">
      <Header2 title="Student Records" />

      {loading ? (
        <p className="students-loading">Loading students...</p>
      ) : students.length === 0 ? (
        <p className="students-empty">No students found.</p>
      ) : (
        <div className="students-tableWrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>ID No</th>
                <th>DOB</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.idno}</td>
                  <td>{student.dob}</td>
                  <td>{student.phone || "N/A"}</td>
                  <td className="students-actions">
                    <button className="students-edit">
                      <MdEdit />
                    </button>
                    <button
                      className="students-delete"
                      onClick={() => handleDelete(student._id)}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Students;
