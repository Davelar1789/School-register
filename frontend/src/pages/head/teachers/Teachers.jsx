// src/pages/TeachersDashboard.jsx
import React, { useEffect, useState } from "react";
import "./Teachers.modules.css";
import Header from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import axios from "../../../api/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

const allSubjects = [
  "Mathematics", "English Language", "Integrated Science", "Natural Science", "Social Studies",
  "Ghanaian Language", "Computing", "RME", "OWOP",
  "Career Technology", "Creative Arts", "French", "Economics", "Business Studies",
 "Agricultural Science", "Spanish", "Yoruba", "Others"
];


const allClasses = [
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JHS 1", "JHS 2", "JHS 3"
];


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
    subjectSpecialization: [],
    assignedClasses: [], // <-- NEW
    joinedDate: "",
    status: "Active",
  });

  const token = localStorage.getItem("token");
  let schoolId = null;
  if (token) {
    const decoded = jwtDecode(token);
    schoolId = decoded.schoolId;
  }

  useEffect(() => {
    if (schoolId) {
      fetchTeachers();
    }
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

  const handleSubjectClick = (subject) => {
    setFormData((prevFormData) => {
      const currentSubjects = prevFormData.subjectSpecialization;
      const isSelected = currentSubjects.includes(subject);
      const updatedSubjects = isSelected
        ? currentSubjects.filter(s => s !== subject)
        : [...currentSubjects, subject];

      return { ...prevFormData, subjectSpecialization: updatedSubjects };
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/teachers", { ...formData, schoolId });
      toast.success('Teacher added successfully!');
      fetchTeachers();
      setShowModal(false);
      setFormData({
        name: "",
        gender: "",
        phone: "",
        email: "",
        subjectSpecialization: [],
        assignedClasses: [], // <-- NEW
        joinedDate: "",
        status: "Active",
      });
    } catch (err) {
      console.error("Failed to add teacher", err);
      toast.error('Failed to add teacher. Please try again.');
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
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Subjects</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>{teacher.staffId}</td>
                      <td>{teacher.name}</td>
                      <td>{teacher.phone}</td>
                      <td>{teacher.email || "-"}</td>
                      <td>{teacher.subjectSpecialization?.join(", ")}</td>
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
              <div className="modal scrollable-modal">
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
                  
                  <label>Select Subject(s):</label>
                  <div className="subject-selection">
                    {allSubjects.map(subject => (
                      <span
                        key={subject}
                        className={`subject-tag ${formData.subjectSpecialization.includes(subject) ? "selected" : ""}`}
                        onClick={() => handleSubjectClick(subject)}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                  <label>Select Assigned Class(es):</label>
                    <div className="class-selection">
                      {allClasses.map(cls => (
                        <span
                          key={cls}
                          className={`class-tag ${formData.assignedClasses.includes(cls) ? "selected" : ""}`}
                          onClick={() => {
                            setFormData(prev => {
                              const alreadySelected = prev.assignedClasses.includes(cls);
                              const updated = alreadySelected
                                ? prev.assignedClasses.filter(c => c !== cls)
                                : [...prev.assignedClasses, cls];
                              return { ...prev, assignedClasses: updated };
                            });
                          }}
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  <input type="date" name="joinedDate" value={formData.joinedDate} onChange={handleInput} required />
                  <select name="status" value={formData.status} onChange={handleInput}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="modal-buttons">
                    <button type="submit" className="submit-button">Save</button>
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
