import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import './UsersAndCourses.modules.css';
import { toast } from 'react-hot-toast';
import Side from "../../../components/Side2";


const UsersAndCourses = () => {
  const [summary, setSummary] = useState({ totalUsers: 0, totalCourses: 0 });
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/summary/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/summary/users?page=${page}&search=${search}`);
      setUsers(response.data.users);
      setTotalPages(Math.ceil(response.data.totalUsers / 10));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/summary/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully');
      fetchUsers(currentPage, searchTerm);
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating role:', error);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchUsers();
  }, []);

  return (
    <div className='uandc-page'>
      <Side />
<div className="users-courses-container">
      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-box">
          <h2>Total Users</h2>
          <p>{summary.totalUsers}</p>
        </div>
        <div className="summary-box">
          <h2>Total Courses</h2>
          <p>{summary.totalCourses}</p>
        </div>
      </div>

      {/* Search and User Table */}
      <div className="user-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => fetchUsers(1, searchTerm)}>Search</button>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3">Loading...</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                      <option value="instructor">Instructor</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => updateUserRole(user._id, user.role)}>Update</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={index + 1 === currentPage ? 'active' : ''}
              onClick={() => {
                setCurrentPage(index + 1);
                fetchUsers(index + 1, searchTerm);
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default UsersAndCourses;
