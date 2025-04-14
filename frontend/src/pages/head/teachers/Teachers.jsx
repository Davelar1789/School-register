// src/pages/TeachersDashboard.jsx
import React, { useEffect, useState } from "react";
import "./Teachers.modules.css";
import Header from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import axios from "../../../api/axios";

const TeachersDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    phone: "",
    email: "",
    subjectSpecialization: "",
    joinedDate: "",
    status: "Active",
  });

  const schoolId = localStorage.getItem("schoolId");

  useEffect(() => {
    fetchTeachers();
  }, [schoolId]);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`/api/teachers/school/${schoolId}`);
      setTeachers(res.data);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/teachers", { ...formData, schoolId });
      fetchTeachers();
      setShowModal(false);
      setFormData({
        name: "",
        gender: "",
        phone: "",
        email: "",
        subjectSpecialization: "",
        joinedDate: "",
        status: "Active",
      });
    } catch (err) {
      console.error("Failed to add teacher", err);
    }
  };

  useEffect(() => {
    let filtered = teachers;
  
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        `${t.name} ${t.staffId}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  
    if (selectedStatus) {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }
  
    setFilteredTeachers(filtered);
  }, [searchTerm, selectedStatus, teachers]);
  
  const handleSearch = (term) => setSearchTerm(term);
  const handleFilterStatus = (status) => setSelectedStatus(status);

  return (
    <div className="teachers-container">
      <Header />
      <div className="teachers-main">
        <Sidebar />
        <div className="teachers-content">
        <div className="teachers-controls">
  <input
    type="text"
    placeholder="Search by name or ID..."
    value={searchTerm}
    onChange={(e) => handleSearch(e.target.value)}
    className="teachers-search"
  />
  <select
    value={selectedStatus}
    onChange={(e) => handleFilterStatus(e.target.value)}
    className="teachers-filter"
  >
    <option value="">Filter by status</option>
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
  <button className="add-button" onClick={() => setShowModal(true)}>
    + Add New Teacher
  </button>
</div>

{loading ? (
  <p>Loading teachers...</p>
) : filteredTeachers.length === 0 ? (
  <p>No teachers found.</p>
) : (
  <div className="table-wrapper">
    <table className="teachers-table">
      <thead>
        <tr>
          <th>Staff ID</th>
          <th>Name</th>
          <th>Gender</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Joined</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {filteredTeachers.map((teacher) => (
          <tr key={teacher._id}>
            <td>{teacher.staffId}</td>
            <td>{teacher.name}</td>
            <td>{teacher.gender}</td>
            <td>{teacher.phone}</td>
            <td>{teacher.email || "-"}</td>
            <td>{new Date(teacher.joinedDate).toLocaleDateString()}</td>
            <td>{teacher.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

          {showModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Add New Teacher</h3>
                <form onSubmit={handleAddTeacher}>
                  <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInput} required />
                  <select name="gender" value={formData.gender} onChange={handleInput} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInput} required />
                  <input type="email" name="email" placeholder="Email (optional)" value={formData.email} onChange={handleInput} />
                  <input type="text" name="subjectSpecialization" placeholder="Subject Specialization" value={formData.subjectSpecialization} onChange={handleInput} required />
                  <input type="date" name="joinedDate" value={formData.joinedDate} onChange={handleInput} required />
                  <select name="status" value={formData.status} onChange={handleInput}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="modal-buttons">
                    <button type="submit" className="submit-button" onClick={handleAddTeacher}>Save</button>
                    <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TeachersDashboard;
