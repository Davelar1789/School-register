import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaHome,
  FaBook,
  FaBullhorn,
  FaSignOutAlt,
  FaBars,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSortAlphaDown,
  FaSortAlphaUp
} from 'react-icons/fa';
import logoIcon from '../../../assets/images/logo.avif';
import './ManageCourses.modules.css';
import Side from "../../../components/Side2";


function ManageCourses() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCourse, setNewCourse] = useState({ title: '', description: '', courseCode: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [editCourse, setEditCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const coursesPerPage = 10;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses/courses');
        setCourses(response.data);
      } catch (error) {
        toast.error(`Failed to fetch courses: ${error.response?.data?.message || error.message}`);
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedCourses = [...courses].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setCourses(sortedCourses);
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditClick = (course) => {
    setEditCourse(course);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(`/api/courses/courses/${editCourse._id}`, editCourse);
      setCourses((prev) =>
        prev.map((course) => (course._id === editCourse._id ? response.data.course : course))
      );
      toast.success('Course updated successfully');
      setShowEditModal(false);
    } catch (error) {
      toast.error(`Failed to update course: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteCourseId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/courses/courses/${deleteCourseId}`);
      setCourses((prev) => prev.filter((course) => course._id !== deleteCourseId));
      toast.success('Course deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(`Failed to delete course: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = async () => {
    try {
      const response = await axios.post('/api/courses/courses', newCourse);
      setCourses((prev) => [...prev, response.data]);
      toast.success('Course added successfully');
      setNewCourse({ title: '', description: '', courseCode: '' });
      setShowAddModal(false);
    } catch (error) {
      toast.error(`Failed to add course: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="dashboard3">
      <Side />

      {/* Main Content */}
      <main className="main-content3">
        <h1>Manage Courses</h1>

        {/* Search and Add Button */}
        <div className="header-controls3">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-bar"
          />
          <button className="add-course-button3" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add New Course
          </button>
        </div>

        {/* Courses Table */}
        <div className="courses-section3">
          <h2>Courses</h2>
          {courses.length === 0 ? (
            <p>No courses available. Add new courses to get started.</p>
          ) : (
            <>
              <table className="courses-table3">
  <thead>
    <tr>
      <th onClick={() => handleSort('title')}>
        Title{' '}
        {sortConfig.key === 'title' &&
          (sortConfig.direction === 'ascending' ? (
            <FaSortAlphaDown />
          ) : (
            <FaSortAlphaUp />
          ))}
      </th>
      <th onClick={() => handleSort('description')}>
        Department{' '}
        {sortConfig.key === 'description' &&
          (sortConfig.direction === 'ascending' ? (
            <FaSortAlphaDown />
          ) : (
            <FaSortAlphaUp />
          ))}
      </th>
      <th onClick={() => handleSort('courseCode')}>
        Course Code{' '}
        {sortConfig.key === 'courseCode' &&
          (sortConfig.direction === 'ascending' ? (
            <FaSortAlphaDown />
          ) : (
            <FaSortAlphaUp />
          ))}
      </th>
      <th>Options</th>
    </tr>
  </thead>
  <tbody>
    {currentCourses.map((course) => (
      <tr key={course._id}>
        <td>
          <Link to={`/manage-courses/${course._id}`} className="course-link3">
            {course.title}
          </Link>
        </td>
        <td>{course.description}</td>
        <td>{course.courseCode}</td>
        <td>
          <button onClick={() => handleEditClick(course)} className="icon-button3">
            <FaEdit />
          </button>
          <button onClick={() => handleDeleteClick(course._id)} className="icon-button3">
            <FaTrashAlt />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

              {/* Pagination */}
              <div className="pagination3">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`pagination-button3 ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <div className="modal3">
          <div className="modal-content3">
            <h2>Add New Course</h2>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newCourse.title}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Department"
              value={newCourse.description}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="courseCode"
              placeholder="Course Code"
              value={newCourse.courseCode}
              onChange={handleInputChange}
            />
            <div className='modal-buttons3'>
            <button className='save-button3' onClick={handleAddCourse}>Add</button>
            <button className='cancel-button3' onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal3">
          <div className="modal-content3">
            <h2>Edit Course</h2>
            <input
              type="text"
              name="title"
              value={editCourse?.title || ''}
              onChange={handleEditChange}
            />
            <input
              type="text"
              name="description"
              value={editCourse?.description || ''}
              onChange={handleEditChange}
            />
            <input
              type="text"
              name="courseCode"
              value={editCourse?.courseCode || ''}
              onChange={handleEditChange}
            />
            <div className='modal-buttons3'>
            <button className='save-button3' onClick={handleEditSubmit}>Save</button>
            <button className='cancel-button3' onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal3">
          <div className="modal-content3">
            <p>Are you sure you want to delete this course?</p>
            <div className='modal-buttons3'>
            <button className='save-button3' onClick={handleDeleteConfirm}>Yes</button>
            <button className='cancel-button3' onClick={() => setShowDeleteConfirm(false)}>No</button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCourses;
