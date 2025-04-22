import React, { useEffect, useState } from 'react';
import './TeacherDetails.modules.css';
import { useParams } from 'react-router-dom';
import Header from "../../../components/Header2";
import Sidebar from "../../../components/Sidebar";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";

const TeacherDetails = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
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
    try {
        const { data } = await axios.put(`/api/teachers/${id}/assign-classes`, { classId });
        setAssignedClasses(data.classesAssigned);
      toast.success('Class assigned successfully');
    } catch (error) {
      toast.error('Failed to assign class');
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

        <div className="class-assignment">
          <h3>Assign Classes</h3>
          <select onChange={(e) => handleAssignClass(e.target.value)} className="class-dropdown">
            <option value="">Select a class</option>
            {allClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>

          <div className="assigned-classes-list">
            <h4>Currently Assigned Classes:</h4>
            <ul>
              {assignedClasses.map((cls, index) => (
                <li key={index}>{cls.className || cls}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
