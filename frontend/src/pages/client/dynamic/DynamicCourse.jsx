import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios"; // Adjust the path according to your project structure
import "./DynamicCourse.modules.css";
import Side from "../../../components/Side2";

const CourseDetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`/api/courses/courses/${courseId}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch course details");
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!course) {
    return <p className="error-message">Course not found!</p>;
  }

  return (
    <div className="main-container">
      <Side />
      <div className="dynamic-page">
 {/* Hero Section */}
 <section className="hero-section">
        <div className="hero-overlay">
          <h1 className="course-title2">{course.title}</h1>
          <p className="course-description2">{course.description}</p>
          <p className="course-code2"><strong>Course Code:</strong> {course.courseCode}</p>
        </div>
      </section>

      {/* Lessons and Tests */}
      <section className="course-content">
        {/* Lessons Section */}
        <div className="content-section">
          <h2 className="section-title">Lessons</h2>
          <hr />
          <div className="cards-container2">
            {course.materials && course.materials.length > 0 ? (
              course.materials.map((material, index) => (
                <div key={index} className="card2">
                  <h3 className="card-title2">Lesson {index + 1}</h3>
                  <p className="card-content2">{material}</p>
                </div>
              ))
            ) : (
              <p className="empty-message">No lessons available for this course.</p>
            )}
          </div>
        </div>

        {/* Tests Section */}
        <div className="content-section">
          <h2 className="section-title">Tests</h2>
          <hr />
          <div className="cards-container2">
            {course.tests && course.tests.length > 0 ? (
              course.tests.map((test, index) => (
                <div key={index} className="card2">
                  <h3 className="card-title2">Test {index + 1}</h3>
                  <p className="card-content2">{test.title}</p>
                </div>
              ))
            ) : (
              <p className="empty-message">No tests available for this course.</p>
            )}
          </div>
        </div>
      </section>
      </div>
     
    </div>
  );
};

export default CourseDetails;
