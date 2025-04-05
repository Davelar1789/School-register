import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { MdDelete, MdEdit } from "react-icons/md";
import Header2 from "../../../components/Header2";
import toast from "react-hot-toast";
import "./Students.modules.css";
import Sidebar from "../../../components/Sidebar";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    idno: "",
    dob: "",
    phone: "",
    address: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
      setFilteredStudents(res.data);
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

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterStudents(value, selectedClass);
  };

  const handleFilterClass = (value) => {
    setSelectedClass(value);
    filterStudents(searchTerm, value);
  };

  const filterStudents = (search, classFilter) => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.idno.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter ? student.class === classFilter : true;
      return matchesSearch && matchesClass;
    });
    setFilteredStudents(filtered);
  };

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleAddStudent = async () => {
    const { name, class: studentClass, idno, dob } = newStudent;
    if (!name || !studentClass || !idno || !dob) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const res = await api.post("/students", newStudent);
      setStudents((prev) => [...prev, res.data]);
      setFilteredStudents((prev) => [...prev, res.data]);
      toast.success("Student added successfully");
      setShowModal(false);
      setNewStudent({
        name: "",
        class: "",
        idno: "",
        dob: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const uniqueClasses = [...new Set(students.map((s) => s.class))];

  return (
    <div className="full-page">
      <Sidebar />
    <div className="students-container">
      <Header2 title="Student Records" />

      <div className="students-controls">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="students-search"
        />
        <select
          value={selectedClass}
          onChange={(e) => handleFilterClass(e.target.value)}
          className="students-filter"
        >
          <option value="">Filter by class</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
        <button className="students-addBtn" onClick={() => setShowModal(true)}>
          + Add Student
        </button>
      </div>

      {loading ? (
        <p className="students-loading">Loading students...</p>
      ) : filteredStudents.length === 0 ? (
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
              {filteredStudents.map((student) => (
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

      {showModal && (
        <div className="students-modalOverlay">
          <div className="students-modal">
            <h3>Add New Student</h3>
            <div className="students-modalForm">
              <input name="name" placeholder="Name" onChange={handleInputChange} value={newStudent.name} />
              <input name="class" placeholder="Class" onChange={handleInputChange} value={newStudent.class} />
              <input name="idno" placeholder="ID Number" onChange={handleInputChange} value={newStudent.idno} />
              <input name="dob" placeholder="Date of Birth" onChange={handleInputChange} value={newStudent.dob} />
              <input name="phone" placeholder="Phone (optional)" onChange={handleInputChange} value={newStudent.phone} />
              <input name="address" placeholder="Address (optional)" onChange={handleInputChange} value={newStudent.address} />
            </div>
            <div className="students-modalButtons">
              <button onClick={handleAddStudent}>Save</button>
              <button onClick={() => setShowModal(false)} className="students-cancelBtn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Students;
