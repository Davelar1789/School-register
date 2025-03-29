import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./Team.modules.css";
import Cameralogo from "../../../assets/images/cameralogo3.png";
import axios from "axios";

const TeamForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    username: "",
    id: "",
  });
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetching all users
  const fetchStuffInfo = async () => {
    try {
      const response = await axios.get("/api/admin/get-all-users");
      setAllUsers(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStuffInfo();
  }, []);

  // Filter users based on email or username input
  const filterUsers = (query) => {
    if (!query) {
      setFilteredUsers([]);
      return;
    }
    const filtered = allUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Handle form input changes and filter users
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "email" || id === "username") {
      filterUsers(value);
    }
  };

  const handleSelectUser = (user) => {
    setFormData({
      email: user.email,
      username: user.username,
      role: user.role,
      id: user._id,
    });
    setFilteredUsers([]);
  };
  console.log(formData);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted", { formData });
  };

  const handleAddNewMember = async (event) => {
    event.preventDefault();
    try {
      await axios.put("/api/admin/stuff/add-member", formData);
      toast.success("Member added successfully");
      navigate(0);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="main-content mt-0 p-0">
      <form onSubmit={handleSubmit} className="team-form">
        <div className="upload-logo-section">
          <div className="logo-placeholder">
            <img src={Cameralogo} alt="Logo" className="logo-img" />
          </div>
        </div>
        <div className="team-fields">
          <div className="form-row">
            <div className="form-group relative">
              <label htmlFor="email">Email</label>
              <input
                value={formData.email}
                onClick={() => setFilteredUsers(allUsers)}
                onChange={handleChange}
                type="text"
                id="email"
                required
                className="form-input"
                placeholder="Search By Email"
              />

              <div className="absolute left-0 right-0 -bottom-2">
                {filteredUsers.length > 0 && (
                  <ul className="dropdown">
                    {filteredUsers.map((user) => (
                      <li key={user.id} onClick={() => handleSelectUser(user)}>
                        {user.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                onChange={handleChange}
                value={formData.username}
                type="text"
                id="username"
                className="form-input"
                placeholder="Search By Username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Update Role
                </option>
                <option value="admin">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
          </div>
        </div>
        <div className="save-button-container">
          <button
            onClick={handleAddNewMember}
            type="submit"
            className="save-button"
          >
            Update Role
          </button>
        </div>
      </form>
    </main>
  );
};

export default TeamForm;
