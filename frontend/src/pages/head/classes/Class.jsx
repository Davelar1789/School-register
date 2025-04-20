import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import "./Class.modules.css";
import Header from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import { toast } from "react-hot-toast";


const CreateClassPage = () => {
  const [formData, setFormData] = useState({
    className: "",
    description: "New class adding...",
    level: "",
    teachers: [],
    students: [],
  });

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAllData = async () => {
    const schoolDataRaw = localStorage.getItem("schoolData");

    if (schoolDataRaw) {
      const schoolData = JSON.parse(schoolDataRaw);

      if (schoolData && schoolData._id) {
        const schoolId = schoolData._id;
        localStorage.setItem("schoolId", schoolId);

        try {
          const [teacherRes, studentRes, classRes] = await Promise.all([
            axios.get(`/api/teachers?schoolId=${schoolId}`),
            axios.get(`/api/student?schoolId=${schoolId}`),
            axios.get(`/api/classes?schoolId=${schoolId}`),
          ]);
          setTeachers(teacherRes.data);
          setStudents(studentRes.data);
          setClasses(classRes.data);
        } catch (error) {
          console.error("Error fetching data", error);
        }
      }
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (id, key) => {
    setFormData(prev => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(id) ? list.filter(i => i !== id) : [...list, id],
      };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const schoolId = localStorage.getItem("schoolId");

    const payload = {
      school: schoolId,
      className: formData.className,
      description: formData.description,
      level: formData.level,
    };

    if (formData.teachers.length > 0) payload.teachers = formData.teachers;
    if (formData.students.length > 0) payload.students = formData.students;

    try {
      await axios.post("/api/classes", payload);
      alert("Class created successfully!");
      setFormData({
        className: "",
        description: "New class adding...",
        level: "",
        teachers: [],
        students: [],
      });
      setShowModal(false);
      fetchAllData(); // refresh list
      toast.success('Class added successfully!');
    } catch (err) {
      toast.error('Failed to add class. Please try again.');
      console.error("Error creating class", err);
      alert(err.response?.data?.message || "Failed to create class.");
    }
  };

  const handleDelete = async classId => {
    try {
      await axios.delete(`/api/classes/${classId}`);
      alert("Class deleted.");
      fetchAllData();
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete class.");
    }
  };

  return (
    <div className="class-page">
      <Header />
      <div className="class-page2">
        <Sidebar />
        <div className="create-class-container">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>All Classes</h2>
            <button onClick={() => setShowModal(true)}>Add Class</button>
          </div>

          {/* Table of Classes */}
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Level</th>
                <th>Teachers</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls._id}>
                  <td>{cls.className}</td>
                  <td>{cls.level}</td>
                  <td>{cls.teachers?.length || 0}</td>
                  <td>{cls.students?.length || 0}</td>
                  <td>
                    <button>Edit</button>
                    <button onClick={() => handleDelete(cls._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal Form */}
          {showModal && (
            <div className="modal">
              <h3>Create New Class</h3>
              <form onSubmit={handleSubmit}>
                <label>Class Name</label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />

                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />

                <label>Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Level</option>
                  <option value="Nursery">Nursery</option>
                  <option value="Primary">Primary</option>
                  <option value="Junior High">Junior High</option>
                  <option value="Senior High">Senior High</option>
                </select>

                <label>Assign Teachers (Optional)</label>
                <div>
                  {teachers.map(t => (
                    <span
                      key={t._id}
                      onClick={() => handleMultiSelect(t._id, "teachers")}
                      style={{
                        cursor: "pointer",
                        margin: 4,
                        background: formData.teachers.includes(t._id)
                          ? "#ddd"
                          : "transparent",
                      }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>

                <label>Assign Students (Optional)</label>
                <div>
                  {students.map(s => (
                    <span
                      key={s._id}
                      onClick={() => handleMultiSelect(s._id, "students")}
                      style={{
                        cursor: "pointer",
                        margin: 4,
                        background: formData.students.includes(s._id)
                          ? "#ddd"
                          : "transparent",
                      }}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>

                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateClassPage;
