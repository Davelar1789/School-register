import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import './Instructor.modules.css';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Side from "../../../components/Side2";


const Instructor = () => {
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes/');
      setClasses(response.data.classes);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };
  

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();

    if (!className.trim()) {
      toast.error('Class name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/classes/create', { className });
      toast.success(`Class "${response.data.class.className}" created successfully`);
      setClassName('');
      setIsModalOpen(false);
      fetchClasses(); // Refresh the classes list
    } catch (error) {
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await axios.delete(`/api/classes/${classId}`);
      toast.success('Class deleted successfully');
      fetchClasses(); // Refresh the classes list
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const handleEditClass = (classId) => {
    // Placeholder for edit functionality
    toast('Edit functionality to be implemented!');
  };

  return (
    <div className='instructor-page'>
        <Side />
        <div className="instructor-container">
      <div className="header">
        <h1 className="instructor-title">My Classes</h1>
        <button className="add-class-button" onClick={() => setIsModalOpen(true)}>
          Add Class
        </button>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create a New Class</h2>
            <form className="create-class-form" onSubmit={handleCreateClass}>
              <label htmlFor="className">Class Name</label>
              <input
                type="text"
                id="className"
                placeholder="Enter class name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              <button type="submit" className="create-class-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
            </form>
            <button className="modal-close-button" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Classes Table */}
      <table className="classes-table">
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Number of Students</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((classItem) => (
            <tr key={classItem._id}>
              <td>{classItem.className}</td>
              <td>{classItem.enrolledStudents.length}</td>
              <td>
                <div className="action-icons">
                    <FaEdit className="action-icon edit-icon" onClick={() => handleEditClass(classItem._id)} />
                    <FaTrashAlt className="action-icon delete-icon" onClick={() => handleDeleteClass(classItem._id)} />
                </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    </div>
    
  );
};

export default Instructor;
