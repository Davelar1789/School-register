import React, { useEffect, useState } from "react";
import "./TeacherDetails.modules.css";
import { useParams } from "react-router-dom";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

const TeacherDetails = () => {
  const { id } = useParams();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const [allClasses, setAllClasses] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  const [selectedTab, setSelectedTab] = useState("classAssign");

  // For subject assignment
  const [selectedClass, setSelectedClass] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    fetchTeacher();
    fetchClasses();
  }, []);

  const fetchTeacher = async () => {
    try {
      const { data } = await axios.get(`/api/teachers/${id}`);
      setTeacher(data);
      setAssignedClasses(data.classesAssigned || []);
      setAssignedSubjects(data.subjectsAssigned || []);
      setLoading(false);
    } catch {
      toast.error("Failed to load teacher info");
    }
  };

  const fetchClasses = async () => {
    const raw = localStorage.getItem("schoolData");
    if (!raw) return;

    const school = JSON.parse(raw);

    try {
      const { data } = await axios.get(`/api/classes/school/${school._id}`);
      setAllClasses(data);
    } catch {
      toast.error("Failed to load classes");
    }
  };

  const handleAssignClass = async (classId) => {
    try {
      await axios.post(`/api/classes/assign-teacher`, {
        teacherId: id,
        classId,
      });

      toast.success("Class assigned");
      fetchTeacher();
    } catch {
      toast.error("Failed to assign class");
    }
  };

  const loadSubjects = async (classId) => {
    try {
      const { data } = await axios.get(`/api/classes/${classId}/subjects`);
      setAvailableSubjects(data);
    } catch {
      toast.error("Failed to load class subjects");
    }
  };

  const assignSubjects = async () => {
    if (!selectedClass || selectedSubjects.length === 0) {
      toast.error("Select class and subjects first");
      return;
    }

    try {
      await axios.post(`/api/classes/assign-subject-teacher2`, {
        teacherId: id,
        classId: selectedClass,
        subjectIds: selectedSubjects,
      });

      toast.success("Subjects assigned");
      fetchTeacher();

      setSelectedClass("");
      setAvailableSubjects([]);
      setSelectedSubjects([]);
    } catch {
      toast.error("Error assigning subjects");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="td-wrapper">
      <Header />
      <Sidebar />

      <div className="td-content">

        {/* TOP: Teacher Card */}
        <div className="td-profile-card">
          <img
            src={teacher.image || "/default-profile.png"}
            alt="Teacher"
            className="td-avatar"
          />

          <div className="td-profile-info">
            <h2>{teacher.name}</h2>
            <p className="td-role-badge">{teacher.teacherType}</p>

            <div className="td-info-grid">
              <span><strong>Staff ID:</strong> {teacher.staffId}</span>
              <span><strong>Email:</strong> {teacher.email}</span>
              <span><strong>Phone:</strong> {teacher.phone}</span>
              <span><strong>Gender:</strong> {teacher.gender}</span>
              <span><strong>DOB:</strong> {new Date(teacher.dob).toLocaleDateString()}</span>
              <span><strong>Status:</strong> {teacher.status}</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="td-tabs">
          <button
            className={selectedTab === "classAssign" ? "active" : ""}
            onClick={() => setSelectedTab("classAssign")}
          >
            Class Assignment
          </button>

          <button
            className={selectedTab === "subjectAssign" ? "active" : ""}
            onClick={() => setSelectedTab("subjectAssign")}
          >
            Subject Assignment
          </button>
        </div>

        {/* TAB CONTENTS */}
     {/* ================== CLASS ASSIGNMENT TAB ================== */}
{selectedTab === "classAssign" && (
  <div className="td-card">
    <h3>Assign as Class Teacher</h3>

  {/* Assignment dropdown */}
    <select onChange={(e) => handleAssignClass(e.target.value)}>
      <option value="">Select Class</option>
      {allClasses
        .filter(cls => !assignedClasses.some(ac => ac._id === cls._id)) // exclude already assigned
        .map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.className}
          </option>
        ))}
    </select>

    {/* Show already assigned classes */}
    <div className="td-assigned-list">
      <h4>Already Assigned Classes</h4>
      {assignedClasses.length === 0 ? (
        <p>No classes assigned yet.</p>
      ) : (
        <div className="td-chip-list">
          {assignedClasses.map((c) => (
            <span className="td-chip filled" key={c._id}>
              {c.className}
            </span>
          ))}
        </div>
      )}
    </div>

    <p className="td-hint">
      Assigning a class automatically gives the teacher full access to all its subjects.
    </p>
  </div>
)}

{/* ================== SUBJECT ASSIGNMENT TAB ================== */}
{selectedTab === "subjectAssign" && (
  <div className="td-card">
    <h3>Assign Subject Teacher</h3>

    {/* Show already assigned subjects grouped by class */}
    <div className="td-assigned-list">
      <h4>Already Assigned Subjects</h4>
      {assignedSubjects.length === 0 ? (
        <p>No subjects assigned yet.</p>
      ) : (
        assignedSubjects.reduce((acc, s) => {
          if (!acc[s.className]) acc[s.className] = [];
          acc[s.className].push(s.subjectName);
          return acc;
        }, {})
      )}
      {Object.entries(
        assignedSubjects.reduce((acc, s) => {
          if (!acc[s.className]) acc[s.className] = [];
          acc[s.className].push(s.subjectName);
          return acc;
        }, {})
      ).map(([className, subjects]) => (
        <div key={className}>
          <h5>{className}</h5>
          <div className="td-chip-list">
            {subjects.map((sub) => (
              <span className="td-chip filled" key={sub}>
                {sub}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Assignment dropdown */}
    <select
      value={selectedClass}
      onChange={(e) => {
        setSelectedClass(e.target.value);
        loadSubjects(e.target.value);
      }}
    >
      <option value="">Select Class</option>
      {allClasses
        .filter(cls => cls.subjects && cls.subjects.length > 0) // only classes with subjects
        .map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.className}
          </option>
        ))}
    </select>

    {/* Subject chips */}
    {availableSubjects.length > 0 && (
      <div className="td_subjects">
        {availableSubjects.map((sub) => (
          <label key={sub._id} className="td-chip">
            <input
              type="checkbox"
              value={sub._id}
              checked={selectedSubjects.includes(sub._id)}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedSubjects((prev) =>
                  prev.includes(id)
                    ? prev.filter((s) => s !== id)
                    : [...prev, id]
                );
              }}
            />
            {sub.name}
          </label>
        ))}
      </div>
    )}

    {availableSubjects.length > 0 && (
      <button className="td-btn" onClick={assignSubjects}>
        Assign Selected Subjects
      </button>
    )}
  </div>
)}

      </div>
    </div>
  );
};

export default TeacherDetails;
