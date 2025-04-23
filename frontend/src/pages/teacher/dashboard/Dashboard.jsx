import React from "react";
import Header from "../../../components/Header2";
import Sidebar from "../../../components/TeacherSidebar";
import api from "../../../api/axios";
import "./TeacherDashboard.modules.css";

const TeacherDashboard = () => {
  const [classCount, setClassCount] = useState(0);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const response = await api.get("/api/teachers/teacher/teacher-classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setClassCount(response.data.count);
      } catch (error) {
        console.error("Error fetching class count:", error.response?.data || error.message);
      }
    };
  
    fetchClasses();
  }, []);
  
  
return (
    <div className="teacher-dashboard2">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main2">
          <h1 className="dashboard-title">Welcome, Teacher!</h1>
          <p className="dashboard-subtitle">Here’s your activity overview</p>

          <div className="dashboard-widgets">
            <div className="widget-card">
              <h3>Total Classes</h3>
              <p>{classCount}</p> {/* 🟢 Now dynamic */}
            </div>
            <div className="widget-card">
              <h3>Students</h3>
              <p>158</p>
            </div>
            <div className="widget-card">
              <h3>Assignments Due</h3>
              <p>3</p>
            </div>
            <div className="widget-card">
              <h3>Messages</h3>
              <p>5</p>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Upcoming Classes</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Mathematics</td>
                  <td>JHS 2B</td>
                  <td>April 15</td>
                  <td>9:00 AM</td>
                </tr>
                <tr>
                  <td>Science</td>
                  <td>JHS 3A</td>
                  <td>April 15</td>
                  <td>11:00 AM</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="dashboard-section">
            <h2>Recent Activity</h2>
            <ul className="activity-list">
              <li>✔️ Graded assignment for JHS 1C - English</li>
              <li>📢 Sent class announcement to JHS 2A</li>
              <li>📝 Uploaded quiz for JHS 3B - ICT</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
