import React, { useEffect, useState } from 'react';
import './TeacherDetails.modules.css';
import { useParams } from 'react-router-dom';
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

const TeacherDetails = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState('');
const [availableSubjects, setAvailableSubjects] = useState([]);
const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacher();
    fetchClasses();
  }, []);

  const fetchTeacher = async () => {
    try {
      const { data } = await axios.get(`/api/teachers/${id}`);
      setTeacher(data);
      setAssignedClasses(data.classesAssigned || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load teacher details');
    }
  };

  const fetchClasses = async () => {
    const schoolDataRaw = localStorage.getItem("schoolData");
  
    if (schoolDataRaw) {
      const schoolData = JSON.parse(schoolDataRaw);
  
      if (schoolData && schoolData._id) {
        const schoolId = schoolData._id;
        try {
          const { data } = await axios.get(`/api/classes/school/${schoolId}`);
          setAllClasses(data);
        } catch (error) {
          toast.error('Could not fetch class list');
        }
      }
    }
  };

  const handleAssignClass = async (classId) => {
    if (!classId) return;
  
    try {
      const { data } = await axios.post(`/api/classes/assign-teacher`, {
        teacherId: id,
        classId,
      });
  
      // Refresh teacher details to update assigned classes
      fetchTeacher();
  
      toast.success(data.message || 'Class assigned successfully');
    } catch (error) {
      console.error("Assign class failed:", error.response?.data || error.message);
      toast.error('Failed to assign class');
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    if (!classId) return;
    try {
      const { data } = await axios.get(`/api/classes/${classId}/subjects`);
      setAvailableSubjects(data.subjects || []);
      setSelectedSubjects([]); // Reset previous selection
    } catch (error) {
      toast.error("Failed to load subjects for selected class");
    }
  };

  const handleAssignSubjects = async () => {
    if (!selectedClassForSubjects || selectedSubjects.length === 0) {
      toast.error("Please select both class and subjects");
      return;
    }
  
    try {
      const { data } = await axios.post(`/api/classes/assign-subject-teacher`, {
        teacherId: id,
        classId: selectedClassForSubjects,
        subjectIds: selectedSubjects,
      });
  
      fetchTeacher(); // Refresh to reflect changes
      toast.success(data.message || "Subjects assigned successfully");
      setSelectedClassForSubjects('');
      setAvailableSubjects([]);
      setSelectedSubjects([]);
    } catch (error) {
      console.error("Assign subject-teacher failed:", error.response?.data || error.message);
      toast.error("Failed to assign subjects");
    }
  };
  
  
  if (loading) return <p>Loading...</p>;

  return (
    <div className="teacher-details-container">
      <Header />
      <Sidebar />
      <div className="teacher-details-content">
        <h2 className="teacher-heading">Teacher Details</h2>
        <div className="teacher-profile">
          <img
            src={teacher.image || '/default-profile.png'}
            alt="teacher"
            className="teacher-image"
          />
          <div className="teacher-info">
            <p><strong>Name:</strong> {teacher.name}</p>
            <p><strong>Staff ID:</strong> {teacher.staffId}</p>
            <p><strong>Email:</strong> {teacher.email}</p>
            <p><strong>Phone:</strong> {teacher.phone}</p>
            <p><strong>Gender:</strong> {teacher.gender}</p>
            <p><strong>DOB:</strong> {new Date(teacher.dob).toLocaleDateString()}</p>
            <p><strong>Address:</strong> {teacher.address}</p>
            <p><strong>Status:</strong> {teacher.status}</p>
            <p><strong>Joined Date:</strong> {new Date(teacher.joinedDate).toLocaleDateString()}</p>
            <p><strong>Qualification:</strong> {teacher.qualification}</p>
            <p><strong>Subject Specialization:</strong> {teacher.subjectSpecialization.join(', ')}</p>
            <p><strong>Emergency Contact:</strong> {teacher.emergencyContact?.name} ({teacher.emergencyContact?.relation}) - {teacher.emergencyContact?.phone}</p>
          </div>
        </div>

        {teacher.teacherType === "Class Teacher" && (
  <div className="class-assignment">
    <h3>Assign Class (as Class Teacher)</h3>
    <select onChange={(e) => handleAssignClass(e.target.value)} className="class-dropdown">
      <option value="">Select a class</option>
      {allClasses.map((cls) => (
        <option key={cls._id} value={cls._id}>
          {cls.className}
        </option>
      ))}
    </select>

    <p className="info-text">
      As a class teacher, the teacher will automatically gain access to all subjects in this class.
    </p>
  </div>
)}

{["Subject Teacher", "Both"].includes(teacher.teacherType) && (
  <div className="class-assignment">
    {teacher.teacherType === "Both" && (
      <>
        <h3>Assign Class Teacher Class</h3>
        <select onChange={(e) => handleAssignClass(e.target.value)} className="class-dropdown">
          <option value="">Select a class</option>
          {allClasses.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className}
            </option>
          ))}
        </select>

        <p className="info-text">
          This is the teacher’s primary class. They will automatically have access to all its subjects.
        </p>

        <hr style={{ margin: '1rem 0' }} />
      </>
    )}

    <h3>Assign Subject Classes</h3>
    <p>Select a class and then choose the specific subjects this teacher handles in that class.</p>

    <select
      value={selectedClassForSubjects}
      onChange={(e) => {
        const classId = e.target.value;
        setSelectedClassForSubjects(classId);
        fetchSubjectsForClass(classId);
      }}
      className="class-dropdown"
    >
      <option value="">Select a class</option>
      {allClasses
        .filter((cls) =>
          teacher.teacherType === "Both"
            ? !assignedClasses.some((assigned) => assigned._id === cls._id)
            : true
        )
        .map((cls) => (
          <option key={cls._id} value={cls._id}>
            {cls.className}
          </option>
        ))}
    </select>

    {availableSubjects.length > 0 && (
      <>
        <div className="subject-checkboxes">
          {availableSubjects.map((subject) => (
            <label key={subject._id} className="subject-checkbox">
              <input
                type="checkbox"
                value={subject._id}
                checked={selectedSubjects.includes(subject._id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const subjectId = subject._id;
                  setSelectedSubjects((prev) =>
                    checked ? [...prev, subjectId] : prev.filter((id) => id !== subjectId)
                  );
                }}
              />
              {subject.name}
            </label>
          ))}
        </div>

        <button className="assign-btn" onClick={handleAssignSubjects}>
          Assign Selected Subjects
        </button>
      </>
    )}
  </div>
)}

      </div>
    </div>
  );
};

export default TeacherDetails;
