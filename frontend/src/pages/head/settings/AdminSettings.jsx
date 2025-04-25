import React, { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import api from "../../../api/axios.js";
import "./AdminSettings.modules.css";
import Sidebar from "../../../components/Sidebar";
import { toast } from "react-hot-toast";
import Header2 from "../../../components/Header2";

const AdminSettings = () => {
  const [school, setSchool] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const getSchoolFromCache = async () => {
      try {
        const cachedSchoolData = localStorage.getItem('schoolData');
        if (cachedSchoolData) {
          const schoolData = JSON.parse(cachedSchoolData);
          setSchool(schoolData);
          setEditedData(schoolData);
        } else {
          // Optionally, fetch from API if not cached
          const token = localStorage.getItem("token");
          const userId = localStorage.getItem("userId"); // Ensure this is being set on login
          if (!token || !userId) throw new Error("Missing credentials");

          const response = await api.get(`/api/schools/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const schoolData = response.data.school || response.data;
          localStorage.setItem('schoolData', JSON.stringify(schoolData));
          setSchool(schoolData);
          setEditedData(schoolData);
        }
      } catch (err) {
        console.error("Error retrieving school data:", err);
      }
    };

    getSchoolFromCache();
  }, []);

  const handleEditClick = (field) => {
    setEditingField(field);
  };

  const handleInputChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await api.put(
        `/api/schools/${school._id}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const updatedSchool = {
        ...school,
        ...response.data,
      };
  
      setSchool(updatedSchool);
      setEditedData(updatedSchool);
      localStorage.setItem("schoolData", JSON.stringify(updatedSchool));
      window.dispatchEvent(new Event("schoolDataUpdated"));
  
      toast.success("Changes saved! They will reflect after next login.");
    } catch (err) {
      console.error("Error updating school data:", err);
      toast.error("Failed to update school info.");
    }
  };
  
  if (!school) return <div className="loading">Loading...</div>;

  return (
    <div>
    <Header2  />
    <Sidebar />
    <div className="admin-settings-container">
      <Header2 />
      <Sidebar />
      <h2 className="admin-settings-heading">School Settings</h2>

      <div className="settings-row">
        <label>School Name:</label>
        {editingField === "name" ? (
          <input name="name" value={editedData.name} onChange={handleInputChange} />
        ) : (
          <div className="value-display">
            <span>{school.name}</span>
            <MdEdit className="edit-icon" onClick={() => handleEditClick("name")} />
          </div>
        )}
      </div>

      <div className="settings-row">
        <label>Headmaster:</label>
        {editingField === "headmaster" ? (
          <input name="headmaster" value={editedData.headmaster} onChange={handleInputChange} />
        ) : (
          <div className="value-display">
            <span>{school.headmaster}</span>
            <MdEdit className="edit-icon" onClick={() => handleEditClick("headmaster")} />
          </div>
        )}
      </div>

      <div className="settings-row">
        <label>Email:</label>
        <span>{school.email}</span>
      </div>

      <div className="settings-row">
        <label>Phone:</label>
        {editingField === "phone" ? (
          <input name="phone" value={editedData.phone} onChange={handleInputChange} />
        ) : (
          <div className="value-display">
            <span>{school.phone}</span>
            <MdEdit className="edit-icon" onClick={() => handleEditClick("phone")} />
          </div>
        )}
      </div>

      <div className="settings-row">
        <label>Address:</label>
        {editingField === "address" ? (
          <input name="address" value={editedData.address} onChange={handleInputChange} />
        ) : (
          <div className="value-display">
            <span>{school.address}</span>
            <MdEdit className="edit-icon" onClick={() => handleEditClick("address")} />
          </div>
        )}
      </div>

      <div className="settings-row">
        <label>City:</label>
        <span>{school.city || "N/A"}</span>
      </div>

      <div className="settings-row">
        <label>State:</label>
        <span>{school.state || "N/A"}</span>
      </div>

      <div className="settings-row">
        <label>Country:</label>
        <span>{school.country || "N/A"}</span>
      </div>

      <div className="settings-row">
        <label>Website:</label>
        {editingField === "website" ? (
          <input name="website" value={editedData.website} onChange={handleInputChange} />
        ) : (
          <div className="value-display">
            <span>{school.website || "N/A"}</span>
            <MdEdit className="edit-icon" onClick={() => handleEditClick("website")} />
          </div>
        )}
      </div>

      <div className="settings-row">
        <label>Established:</label>
        <span>{school.establishedYear || "N/A"}</span>
      </div>

      {editingField && (
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      )}
    </div>
    </div>
  );
};

export default AdminSettings;
