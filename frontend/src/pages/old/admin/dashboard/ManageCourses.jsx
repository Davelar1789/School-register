import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaHome, FaBook, FaBullhorn, FaSignOutAlt, FaBars } from 'react-icons/fa';
import logoIcon from '../../../assets/images/logo.avif';
import './ManageCourses.modules.css';

function ManageCourses() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState({
    Mathematics: {
      'Level 100': ['Calculus I', 'Linear Algebra I'],
      'Level 200': ['Differential Equations', 'Abstract Algebra'],
    },
    'Computer Science': {
      'Level 100': ['Introduction to CS', 'Programming Fundamentals'],
    },
  });
  const [newCourse, setNewCourse] = useState({ department: '', level: '', courseName: '' });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = () => {
    const { department, level, courseName } = newCourse;
    if (!department || !level || !courseName) {
      toast.error('All fields are required!');
      return;
    }

    setCourses((prev) => ({
      ...prev,
      [department]: {
        ...prev[department],
        [level]: [...(prev[department]?.[level] || []), courseName],
      },
    }));

    toast.success('Course added successfully!');
    setNewCourse({ department: '', level: '', courseName: '' });
  };

  const handleDeleteCourse = (department, level, courseName) => {
    setCourses((prev) => {
      const updatedCourses = { ...prev };
      updatedCourses[department][level] = updatedCourses[department][level].filter(
        (course) => course !== courseName
      );

      if (updatedCourses[department][level].length === 0) {
        delete updatedCourses[department][level];
      }

      if (Object.keys(updatedCourses[department]).length === 0) {
        delete updatedCourses[department];
      }

      return updatedCourses;
    });

    toast.success('Course deleted successfully!');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logoIcon} alt="Logo" className="sidebar-logo" />
        </div>
        <nav className="sidebar-menu">
          <Link to="/dashboard" className="menu-item"><FaHome className="icon" /> Dashboard</Link>
          <Link to="/manage-courses" className="menu-item active"><FaBook className="icon" /> Manage Courses</Link>
          <Link to="/manage-notices" className="menu-item"><FaBullhorn className="icon" /> Manage Notices</Link>
          <Link to="/login" className="menu-item"><FaSignOutAlt className="icon" /> Logout</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Manage Courses</h1>

        {/* Add Course Form */}
        <div className="admin-form">
          <h2>Add a New Course</h2>
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={newCourse.department}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="level"
            placeholder="Level (e.g., Level 100)"
            value={newCourse.level}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={newCourse.courseName}
            onChange={handleInputChange}
          />
          <button className="submit-button" onClick={handleAddCourse}>
            Add Course
          </button>
        </div>

        {/* Courses List */}
        <div className="courses-section">
          <h2>Courses</h2>
          {Object.keys(courses).length === 0 ? (
            <p>No courses available. Add new courses to get started.</p>
          ) : (
            Object.keys(courses).map((department) => (
              <div key={department} className="department">
                <h3>{department}</h3>
                {Object.keys(courses[department]).map((level) => (
                  <div key={level} className="level">
                    <h4>{level}</h4>
                    <ul>
                      {courses[department][level].map((course) => (
                        <li key={course}>
                          {course}
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteCourse(department, level, course)}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default ManageCourses;
