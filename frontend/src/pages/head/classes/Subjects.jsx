import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import "./Subjects.modules.css";
import Header from "../../../components/Admin/Header2";
import { MdDelete, MdEdit } from "react-icons/md";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";

const getDataFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return {
      schoolId: decodedToken?.schoolId || null,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const { schoolId } = getDataFromToken() || {};

  useEffect(() => {
    if (schoolId) {
      fetchSubjects();
      fetchClasses();
    }
  }, [schoolId]);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`/api/subjects/school/${schoolId}`);
      setSubjects(res.data);
    } catch (error) {
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`/api/classes/school/${schoolId}`);
      setClasses(res.data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };


  const openModal = (subject = null) => {
    setModalOpen(true);
    if (subject) {
      setEditingSubject(subject);
      setSubjectName(subject.name);
      setSelectedClasses(subject.classes || []);
    } else {
      setEditingSubject(null);
      setSubjectName("");
      setSelectedClasses([]);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleClassChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedClasses([...selectedClasses, value]);
    } else {
      setSelectedClasses(selectedClasses.filter((id) => id !== value));
    }
  };

  const handleSubmit = async () => {
  const { schoolId } = getDataFromToken(); // Use your decoding function

  if (!subjectName) return toast.error("Subject name is required");

  const payload = { name: subjectName, school: schoolId, classes: selectedClasses };
  // console.log("Payload:", payload); // Moved up so it's visible before any request

  try {
    if (editingSubject) {
      await axios.put(`/api/subjects/${editingSubject._id}`, payload);
      toast.success("Subject updated");
    } else {
      await axios.post("/api/subjects", payload);
      toast.success("Subject created");
    }
    fetchSubjects();
    closeModal();
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    toast.error("Error saving subject");
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await axios.delete(`/api/subjects/${id}`);
      toast.success("Subject deleted");
      fetchSubjects();
    } catch (error) {
      toast.error("Error deleting subject");
    }
  };

  return (
    <div className="subjects-container">
      <Sidebar />
      <Header />
      <div className="subjects-main">
        <div className="subjects-header">
          <h2>Subjects</h2>
          <button className="add-button" onClick={() => openModal()}>Add Subject</button>
        </div>

        <table className="subjects-table">
          <thead>
            <tr>
              <th>Name</th>
              {/* <th>Classes</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj) => (
              <tr key={subj._id}>
                <td>{subj.name}</td>
                {/* <td>{(subj.classes || []).map(cid => classes.find(c => c._id === cid)?.className).join(", ")}</td> */}
                <td>
                  <button onClick={() => openModal(subj)}><MdEdit /></button>
                  <button onClick={() => handleDelete(subj._id)}><MdDelete /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingSubject ? "Edit Subject" : "Add Subject"}</h3>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Subject Name"
              />
              <div className="class-checkboxes">
                {classes.map(cls => (
                  <label key={cls._id}>
                    <input
                      type="checkbox"
                      value={cls._id}
                      checked={selectedClasses.includes(cls._id)}
                      onChange={handleClassChange}
                    />
                    {cls.className}
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button onClick={handleSubmit}>{editingSubject ? "Update" : "Create"}</button>
                <button onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
