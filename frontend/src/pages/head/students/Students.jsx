import { useState, useEffect } from "react";
import "./Students.modules.css";
import UploadStudent from "../../../components/UploadStudent";
import axios from '../../../api/axios';
import { MdDelete, MdEdit } from "react-icons/md";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [toggleAddStudent, setToggleAddStudent] = useState(false);
  const [toggleEditStudent, setToggleEditStudent] = useState(false);
  const [studentToEditDetails, setStudentToEditDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const studentsPerPage = 8;
  const totalPages = Math.ceil(students?.length / studentsPerPage);

  const fetchAllStudents = async () => {
    await axios
      .get("/api/student/get-all-students")
      .then((res) => {
        setStudents(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchAllStudents();
  }, [toggleAddStudent]);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students
    ?.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.idno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstStudent, indexOfLastStudent);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteStudent = async () => {
    if (studentToDelete) {
      await axios
        .post("/api/student/manage-students/delete", { studentId: studentToDelete }, { withCredentials: true })
        .then(() => {
          fetchAllStudents();
          toast.success("Student deleted successfully");
        })
        .catch((err) => console.log(err));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const openDeleteModal = (studentId) => {
    setStudentToDelete(studentId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <div className="students-page">
        {/* Sidebar - Integrated Directly */}
              <div className="sidebar">
                {/* School Logo */}
                <div className="sidebar-header">
                  <div className="logo">{school?.name ? school.name.charAt(0) : "S"}</div>
                  <div className="school-name">{school?.name || "School Dashboard"}</div>
                </div>
        
                {/* User Profile */}
                <div className="sidebar-profile">
                  <img src={Image1} alt="User" className="profile-pic" />
                  <div>
                  <h4>{userProfile.fullName}</h4>
                  <p className="user-role">{userProfile.role}</p>
                </div>
                </div>
        
                {/* Menu Items */}
                <ul className="sidebar-nav">
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaHome className="icon" /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/chat" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaComments className="icon" /> Chat
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/students" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaUserGraduate className="icon" /> Student <span className="badge">35</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/teachers" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaChalkboardTeacher className="icon" /> Teacher
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaCalendar className="icon" /> Event
                    </NavLink>
                </li>
                <li className="logout">
                    <NavLink to="/logout">
                    <FaSignOutAlt className="icon" /> Logout
                    </NavLink>
                </li>
                </ul>
              </div>
        
      <div className="students-content">
        <main className="main-content">
          <div className="header-section">
            <h2>Student List</h2>
            {!toggleEditStudent ? (
              <button
                onClick={() => setToggleAddStudent(!toggleAddStudent)}
                className="add-stock-button"
              >
                {toggleAddStudent ? "Manage Students" : "Upload Students"}
              </button>
            ) : (
              <button
                onClick={() => setToggleEditStudent(!toggleEditStudent)}
                className="add-stock-button"
              >
                Manage Students
              </button>
            )}
          </div>
          <>
            {toggleEditStudent ? (
              <UploadStudent student={studentToEditDetails} />
            ) : !toggleAddStudent ? (
              <>
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th className="hidden md:table-cell">ID Number</th>
                      <th className="hidden md:table-cell">Date of Birth</th>
                      <th className="hidden lg:table-cell">Phone Number</th>
                      <th className="hidden md:table-cell">Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents?.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td className="hidden md:table-cell">{student.idno}</td>
                        <td className="hidden md:table-cell">{student.dob}</td>
                        <td className="hidden lg:table-cell">{student.phone}</td>
                        <td className="hidden md:table-cell">{student.address}</td>
                        <td>
                          <button
                            onClick={() => {
                              setStudentToEditDetails(student);
                              setToggleEditStudent(!toggleEditStudent);
                            }}
                            className="mx-1"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(student._id)}
                            className="mx-1"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>
                    Showing {indexOfFirstStudent + 1}-{indexOfLastStudent} of {students?.length}
                  </span>
                  <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              </>
            ) : (
              <UploadStudent />
            )}
          </>
        </main>
      </div>

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete the selected student?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteStudent}>Yes</button>
              <button onClick={closeDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
