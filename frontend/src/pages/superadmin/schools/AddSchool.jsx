import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import api from "../../../api/axios";
import "./AddSchool.modules.css";

function AddSchool() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    phone: "",
    address: "",
    headmasterName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/api/schools/register",
        {
          name: formData.schoolName,
          headmaster: formData.headmasterName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: "N/A",
          state: "N/A",
          country: "N/A",
          website: "N/A",
          establishedYear: "N/A",
          numberOfStudents: 0,
          numberOfTeachers: 0,
          numberOfClasses: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("School Registered:", response.data);
      toast.success("School added successfully! 🎉");

      navigate("/all-schools");
    } catch (err) {
      console.error("Error adding school:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addschool-container">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="addschool-form-container">
        <h1>Add New School</h1>

        <form onSubmit={handleSubmit} className="addschool-form">
          <div className="input-group">
            <label>School Name</label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>School Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Headmaster's Name</label>
            <input
              type="text"
              name="headmasterName"
              value={formData.headmasterName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Adding..." : "Add School"}
          </button>
        </form>

        <Link to="/all-schools" className="back-link">← Back to All Schools</Link>
      </div>
    </div>
  );
}

export default AddSchool;
