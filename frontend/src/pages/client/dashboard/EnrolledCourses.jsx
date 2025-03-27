import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';
import './EnrolledCourses.modules.css';
import Side from '../../../components/Side2';

const EnrolledCourses = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/user-info');
        const userId = response.data.data._id;
        setUserData(response.data.data);

        const enrolledResponse = await axios.get(`/api/courses/${userId}/enrolled-courses`);
        const { enrolledCourses } = enrolledResponse.data;
        setEnrolledCourses(enrolledCourses);
        setFilteredCourses(enrolledCourses);
      } catch (error) {
        toast.error('Failed to load user or enrolled courses.');
        console.error('Error fetching user or enrolled courses:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const results = enrolledCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        course.courseCode.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term)
    );

    setFilteredCourses(results);
  };

  const handleDelete = async (courseId) => {
    if (!userData?._id) {
      toast.error("User not logged in or user ID not found.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await axios.delete("/api/courses/unenroll", {
          data: {
            userId: userData._id,
            courseId, // Use courseId here
          },
        });

        toast.success(response.data.message);

        // Update state to remove the deleted course
        const updatedCourses = enrolledCourses.filter(
          (course) => course.courseId !== courseId
        );
        setEnrolledCourses(updatedCourses);
        setFilteredCourses(updatedCourses); // Update filtered list as well
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete course."
        );
        console.error("Error deleting course:", error);
      }
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="enrolled-courses-page">
      <Side />
      <div className="main-content">
        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search enrolled courses..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <table className="enrolled-courses-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Title</th>
              <th>Department</th>
              <th className="options-column">Options</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.courseId}>
                <td>{course.courseCode}</td>
                <td>
                  <Link to={`/course/${course.courseId}`}>{course.title}</Link>
                </td>
                <td>{course.description}</td>
                <td className="options-column">
                  <FaTrash
                    className="delete-icon"
                    onClick={() => handleDelete(course.courseId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnrolledCourses;
