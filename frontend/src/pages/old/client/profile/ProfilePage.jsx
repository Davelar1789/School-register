import React, { useState } from "react";
import "./ProfilePage.modules.css";
import Header from "../../../components/Header";
import userIcon from "../../../assets/images/user2.png";

const ProfilePage = () => {
  const [firstName, setFirstName] = useState("Arthur");
  const [lastName, setLastName] = useState("Nancy");
  const [email, setEmail] = useState("bradley.ortiz@gmail.com");
  const [phone, setPhone] = useState("477-046-1827");
  const [address, setAddress] = useState("116 Jaskolski Stravenue Suite 883");
  const [nation, setNation] = useState("Colombia");
  const [password, setPassword] = useState("********");
  const [gender, setGender] = useState("Male");
  const [language, setLanguage] = useState("English");
  const [dob, setDob] = useState("1990-09-30"); // ISO format for date
  const [profileImage, setProfileImage] = useState(userIcon);

  const handleSave = () => {
    // Handle save functionality
  };

  const handleCancel = () => {
    // Handle cancel functionality
  };

  const handleChangePassword = () => {
    // Handle change password functionality
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-page">
            <Header />
      <div className="profile-header">
        <h2>My Profile</h2>
        <div className="profile-buttons">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
      <div className="profile-card">
        <div className="profile-picture">
          <img src={profileImage} alt="Profile" />
          <input type="file" onChange={handleImageUpload} />
        </div>
        <div className="profile-info">
          <div className="column left-column">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Nation</label>
              <input
                type="text"
                value={nation}
                onChange={(e) => setNation(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} readOnly />
              <button className="change-password" onClick={handleChangePassword}>
                CHANGE PASSWORD
              </button>
            </div>
          </div>
          <div className="column right-column">
            <div className="input-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Female">Prefer not to say</option>
              </select>
            </div>
            <div className="input-group">
              <label>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div className="payment-methods">
              <h4>Payment Method</h4>
              <div className="payment-card">VISA .... 8314 (Expires 06/21)</div>
              <div className="payment-card">Master .... 8314 (Expires 07/19)</div>
              <button className="add-payment-method">
                ADD PAYMENT METHOD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
