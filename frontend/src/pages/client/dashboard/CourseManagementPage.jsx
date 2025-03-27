import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaBars, FaHome, FaBook, FaBullhorn, FaSignOutAlt } from "react-icons/fa";
import axios from "../../../api/axios";
import { toast } from "react-hot-toast";
import "./CourseManagementPage.modules.css";
import Side from "../../../components/Side2";

const CourseManagementPage = () => {
  const { courseId } = useParams(); // Extract courseId from the URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "material" or "test"
  const [modalInput, setModalInput] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch course details on component mount
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/courses/${courseId}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch course:", error);
        setLoading(false);
        toast.error("Failed to load course details.");
      }
    };

    fetchCourse();
  }, [courseId]);

  const openModal = (type) => {
    setModalType(type);
    setModalInput("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleAddItem = async () => {
    if (!modalInput.trim()) {
      toast.error("Input cannot be empty.");
      return;
    }

    try {
      if (modalType === "material") {
        await axios.post(`/api/courses/courses/${courseId}/materials`, { material: modalInput });
        toast.success("Material added successfully!");
      } else if (modalType === "test") {
        await axios.post(`/api/courses/courses/${courseId}/tests`, { title: modalInput, questions: [] });
        toast.success("Test added successfully!");
      }

      // Re-fetch course data
      const updatedCourse = await axios.get(`/api/courses/courses/${courseId}`);
      setCourse(updatedCourse.data);

      closeModal();
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container">
      <Side />

      {/* Main Content */}
      <main className="main-content">
        <h1>Manage Course: {course.title}</h1>

        {/* Course Details Section */}
        <div className="course-section">
          <h2>Details</h2>
          <p>{course.description}</p>
          <p>
            <strong>Code:</strong> {course.courseCode}
          </p>
        </div>

        {/* Course Materials Section */}
        <div className="course-section">
          <div className="section-header">
            <h2>Lessons</h2>
            <button onClick={() => openModal("material")}>Add Lesson</button>
          </div>
          <ul>
            {(course.materials || []).map((material, index) => (
              <li key={index}>{material}</li>
            ))}
          </ul>
        </div>

        {/* Course Tests Section */}
        <div className="course-section">
          <div className="section-header">
            <h2>Tests</h2>
            <button onClick={() => openModal("test")}>Add Test</button>
          </div>
          <ul>
            {(course.tests || []).map((test, index) => (
              <li key={index}>{test.title}</li>
            ))}
          </ul>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Add {modalType === "material" ? "Material" : "Test"}</h2>
            <input
              type="text"
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              placeholder={`Enter ${modalType === "material" ? "material name" : "test title"}`}
            />
            <div className="modal-buttons">
              <button className="add-button" onClick={handleAddItem}>Add</button>
              <button className="cancel-button" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagementPage;
