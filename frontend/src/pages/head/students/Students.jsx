import { useState, useEffect } from "react";
import "./Students.modules.css";
import UploadStudent from "../../../components/UploadStudent";
import axios from '../../../api/axios';
import { MdDelete, MdEdit } from "react-icons/md";
import Header2 from "../../../components/Header2";
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
   const [user, setUser] = useState(null);
    const [school, setSchool] = useState(null);
    const [schoolName, setSchoolName] = useState("Loading...");
    const [userProfile, setUserProfile] = useState({ fullName: "Loading...", role: "Loading..." });
    
    
    useEffect(() => {
      // Get user from local storage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("Please login first.");
        navigate("/sign-in");
        return;
      }
  
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
  
      // ✅ Fetch school based on user ID
      fetchSchool(parsedUser._id);
    }, [navigate]);
  
    useEffect(() => {
      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("No token found, please log in again.");
            return;
          }
    
          const response = await api.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (response.data) {
            setUserProfile({
              fullName: response.data.fullName || "Unknown",
              role: response.data.role || "User",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
    
      fetchUserProfile();
    }, []);
  
    useEffect(() => {
  
      const fetchSchoolName = async () => {
        try {
  
          // Get user from localStorage
          const storedUser = localStorage.getItem("user");
          if (!storedUser) {
            return;
          }
  
          const parsedUser = JSON.parse(storedUser);
          const userId = parsedUser._id; // Get logged-in user ID
  
          const token = localStorage.getItem("token");
          if (!token) {
            return;
          }
  
          // Fetch all schools from the database
          const response = await api.get("/api/schools", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
  
          // Find the school where user ID matches
          const userSchool = response.data.find((school) => school.user.toString() === userId);
  
          if (userSchool) {
            setSchoolName(userSchool.name); // Set school name if found
          } else {
            console.log("❌ No school found for this user.");
          }
        } catch (error) {
          console.error("🚨 Error fetching school name:", error);
        }
      };
  
      fetchSchoolName();
    }, []);
  
    const fetchSchool = async (userId) => {
      try {
        const token = localStorage.getItem("token"); // Get token from local storage
        if (!token) {
          throw new Error("No token found, please log in again.");
        }
    
        const response = await api.get(`/api/schools/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Send token in headers
        });
    
        if (response.data) {
          const schoolData = response.data.school || response.data; // Handle both API response structures
    
          setSchool(schoolData);
          setSchoolStats({
            numberOfStudents: schoolData.numberOfStudents || 0,
            numberOfTeachers: schoolData.numberOfTeachers || 0,
            numberOfClasses: schoolData.numberOfClasses || 0,
          });
          console.log("Fetched School Data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching school:", error);
      }
    };
    
    if (!user) return null; // Prevent rendering if user is still loading

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
    <div className="open-page">
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
        
<div className="students-page">
<Header2 />
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
    </div>
    
  );
};

export default ManageStudents;
