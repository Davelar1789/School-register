import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../api/axios"; // Ensure this is the correct API instance
import Header2 from "../../../components/Admin/Header2";
import Form from "../../general/register/Sign-up"; // School Registration Form
import "@fortawesome/fontawesome-free/css/all.min.css";
import { FaHome, FaComments, FaUserGraduate, FaChalkboardTeacher, FaCalendar, FaSignOutAlt } from "react-icons/fa";
import "./Dashboard.modules.css";
import { NavLink } from "react-router-dom";
import Sidebar from "../../../components/Admin/Sidebar"
import Image1 from "../../../assets/images/userrr.png"

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [schoolName, setSchoolName] = useState("Loading...");
  const [userProfile, setUserProfile] = useState({ fullName: "Loading...", role: "Loading..." });
  const [schoolStats, setSchoolStats] = useState({
    numberOfStudents: 0,
    numberOfTeachers: 0,
    numberOfClasses: 0,
  });

  const navigate = useNavigate();

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
      const cachedSchoolData = localStorage.getItem('schoolData');
      if (cachedSchoolData) {
        const schoolData = JSON.parse(cachedSchoolData);
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found, please log in again.");
      const response = await api.get(`/api/schools/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        const schoolData = response.data.school || response.data;
        localStorage.setItem('schoolData', JSON.stringify(schoolData));
        setSchool(schoolData);
        setSchoolStats({
          numberOfStudents: schoolData.numberOfStudents || 0,
          numberOfTeachers: schoolData.numberOfTeachers || 0,
          numberOfClasses: schoolData.numberOfClasses || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching school:", error);
    }
  };
  
  
  if (!user) return null; // Prevent rendering if user is still loading

  return (
    <div className="dashboard-container">
      {/* Sidebar - Integrated Directly */}
      <Sidebar />

      {/* Main Content - Starts After Sidebar */}
      <div className="dashboard-main">
        <Header2 />

        {/* Show Dashboard if school exists, else show Registration Form */}
        <div className="dashboard-content">
             <div className="overview-section">
                <div className="overview-card students">
                  <div className="card-header">
                    <i className="fas fa-user-graduate"></i>
                    <div className="card-info">
                      <h3>{schoolStats.numberOfStudents}</h3>
                      <p>Total Students</p>
                    </div>
                  </div>
                  <div className="wave-chart blue-wave"></div>
                </div>

                <div className="overview-card teachers">
                  <div className="card-header">
                    <i className="fas fa-user"></i>
                    <div className="card-info">
                      <h3>{schoolStats.numberOfTeachers}</h3>
                      <p>Total Teachers</p>
                    </div>
                  </div>
                  <div className="wave-chart pink-wave"></div>
                </div>

                <div className="overview-card classes">
                  <div className="card-header">
                    <i className="fas fa-users"></i>
                    <div className="card-info">
                      <h3>{schoolStats.numberOfClasses}</h3>
                      <p>Active Classes</p>
                    </div>
                  </div>
                  <div className="wave-chart orange-wave"></div>
                </div>

                <div className="overview-card requests">
                  <div className="card-header">
                    <i className="fas fa-money-check-alt"></i>
                    <div className="card-info">
                      <h3>0</h3>
                      <p>Pending Requests</p>
                    </div>
                  </div>
                  <div className="wave-chart green-wave"></div>
                </div>
              </div>

              <div className="overview-section4">
                <div className="overview-card4 students4">
                  <div className="card-header4">
                    <i className="fas fa-user-graduate4"></i>
                    <div className="card-info4">
                      <h3>{schoolStats.numberOfStudents}</h3>
                      <p>Total Students</p>
                    </div>
                  </div>
                  <div className="wave-chart4 blue-wave4"></div>
                </div>

                <div className="overview-card4 teachers4">
                  <div className="card-header4">
                    <i className="fas fa-user4"></i>
                    <div className="card-info4">
                      <h3>{schoolStats.numberOfTeachers}</h3>
                      <p>Total Teachers</p>
                    </div>
                  </div>
                  <div className="wave-chart4 pink-wave4"></div>
                </div>

                <div className="overview-card4 classes4">
                  <div className="card-header4">
                    <i className="fas fa-users4"></i>
                    <div className="card-info4">
                      <h3>{schoolStats.numberOfClasses}</h3>
                      <p>Active Classes</p>
                    </div>
                  </div>
                  <div className="wave-chart4 orange-wave4"></div>
                </div>

                <div className="overview-card4 requests4">
                  <div className="card-header4">
                    <i className="fas fa-money-check-alt4"></i>
                    <div className="card-info4">
                      <h3>0</h3>
                      <p>Pending Requests</p>
                    </div>
                  </div>
                  <div className="wave-chart4 green-wave4"></div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="recent-activities">
                <h3>Recent Activities</h3>
                <ul>
                  <li>New student enrolled: John Doe</li>
                  <li>Teacher application received: Mr. Kwame</li>
                  <li>Upcoming PTA meeting scheduled</li>
                  <li>New event: Science Fair on April 15</li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="quick-links">
                <h3>Quick Links</h3>
                <div className="links-grid">
                  <button className="quick-link" onClick={navigate("/students")}>Manage Students</button>
                  <button className="quick-link">Manage Teachers</button>
                  <button className="quick-link">View Reports</button>
                  <button className="quick-link">School Settings</button>
                </div>
              </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
