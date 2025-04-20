import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import "./Class.modules.css";
import Header from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";

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

  useEffect(() => {
    const fetchData = async () => {
      const schoolId = localStorage.getItem("schoolId");
      console.log(localStorage.getItem("schoolId")); 
      try {
        const [teacherRes, studentRes] = await Promise.all([
          axios.get(`/api/teachers?schoolId=${schoolId}`),
          axios.get(`/api/students?schoolId=${schoolId}`),
        ]);
        setTeachers(teacherRes.data);
        setStudents(studentRes.data);
      } catch (error) {
        console.error("Error fetching teachers/students", error);
      }
    };
    fetchData();
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

    // Prepare payload - only include teachers/students if not empty
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
    } catch (err) {
      console.error("Error creating class", err);
      alert(err.response?.data?.message || "Failed to create class.");
    }
  };

  return (
    <div className="class-page">
      <Header />
      <div className="class-page2">
        <Sidebar />
        <div className="create-class-container">
          <h2>Create New Class</h2>
          <form onSubmit={handleSubmit} className="create-class-form">
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
            <div className="select-multiple-box">
              {teachers.map(t => (
                <span
                  key={t._id}
                  className={
                    formData.teachers.includes(t._id)
                      ? "select-option selected"
                      : "select-option"
                  }
                  onClick={() => handleMultiSelect(t._id, "teachers")}
                >
                  {t.name}
                </span>
              ))}
            </div>

            <label>Assign Students (Optional)</label>
            <div className="select-multiple-box">
              {students.map(s => (
                <span
                  key={s._id}
                  className={
                    formData.students.includes(s._id)
                      ? "select-option selected"
                      : "select-option"
                  }
                  onClick={() => handleMultiSelect(s._id, "students")}
                >
                  {s.name}
                </span>
              ))}
            </div>

            <button type="submit" className="submit-button">
              Create Class
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClassPage;
