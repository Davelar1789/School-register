import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { MdDelete, MdEdit } from "react-icons/md";
import Header2 from "../../../components/Header2";
import toast from "react-hot-toast";
import "./Students.modules.css";
import Sidebar from "../../../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import fetchSchoolData from "../../../utils/fetchSchoolData";


const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    dob: "",
    phone: "",
    address: "",
  });

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const schoolId = decoded?.schoolId;

  const fetchStudents = async () => {
    try {
      const res = await api.get("/api/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If backend returns all students, filter here just in case:
      const filtered = res.data.filter((student) => student.schoolId === schoolId);

      setStudents(filtered);
      setFilteredStudents(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const schoolDataRaw = localStorage.getItem("schoolData");
  
    if (schoolDataRaw) {
      const schoolData = JSON.parse(schoolDataRaw);
  
      if (schoolData && schoolData._id) {
        const schoolId = schoolData._id;
        try {
          const { data } = await api.get(`/api/classes/school/${schoolId}`);
          setAllClasses(data);
        } catch (error) {
          toast.error("Could not fetch class list");
        }
      }
    }
  };
  
  useEffect(() => {
    if (showModal) {
      fetchClasses();
    }
  }, [showModal]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    const { name, class: studentClass, dob } = newStudent;
  
    if (!name || !studentClass || !dob) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    const generatedId = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit ID
  
    try {
      const formattedDOB = newStudent.dob.split("T")[0];
  
      // Step 1: Create the student
      const res = await api.post(
        "/api/student",
        {
          ...newStudent,
          dob: formattedDOB,
          idno: generatedId,
          schoolId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const createdStudent = res.data;
  
      // Step 2: Assign the student to the selected class
      await api.post(
        "/api/classes/assign-student",
        {
          studentId: createdStudent._id,
          classId: studentClass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setStudents((prev) => [...prev, createdStudent]);
      setFilteredStudents((prev) => [...prev, createdStudent]);
  
      toast.success("Student added and assigned to class successfully");
      await fetchSchoolData();

      setShowModal(false);
      setNewStudent({
        name: "",
        class: "",
        dob: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add and assign student");
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
                <th className="out">ID No</th>
                <th className="out">DOB</th>
                <th className="out">Phone</th>
                <th className="out">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>
                    {student.classes && student.classes.length > 0 ? student.classes[0].className : "N/A"}
                  </td>
                  <td className="out">{student.idno}</td>
                  <td className="out">{student.dob}</td>
                  <td className="out">{student.phone || "N/A"}</td>
                  <td className="students-actions out">
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
              <select
                name="class"
                onChange={handleInputChange}
                value={newStudent.class}
                className="students-modalForm-input"
              >
                <option value="">Select Class</option>
                {allClasses.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>
             {/* Removed idno input and added date picker for dob */}
              <input
                name="dob"
                type="date"
                onChange={handleInputChange}
                value={newStudent.dob}
              />
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
