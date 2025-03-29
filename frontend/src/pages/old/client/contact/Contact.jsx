import { useState } from "react";
import "./Contact.modules.css";
import Cameralogo from "../../../assets/assets//images/cameralogo3.png";

const Contact = () => {
  const [gender, setGender] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setDay(""); // reset day when year changes
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
    setDay(""); // reset day when month changes
  };

  const handleDayChange = (event) => {
    setDay(event.target.value);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="contact-page">
      <div className="contact-content">
        <main className="main-content">
          <h2>Add New Contact</h2>
          <div className="contact-form">
            <div className="upload-logo-section">
              <div className="logo-placeholder">
                <img src={Cameralogo} alt="Logo" className="logo-img" />
              </div>
              <a href="#" className="upload-logo">
                Upload Logo
              </a>
            </div>
            <div className="contact-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-input"
                    placeholder="Enter First Name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-input"
                    placeholder="Enter Last Name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="text"
                    id="email"
                    className="form-input"
                    placeholder="Enter Email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    className="form-input"
                    placeholder="Enter Phone Number"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dob-year">Date of Birth</label>
                  <div className="dob-fields">
                    <input
                      type="number"
                      id="dob-year"
                      className="form-input dob-year"
                      placeholder="Year"
                      value={year}
                      onChange={handleYearChange}
                    />
                    <select
                      id="dob-month"
                      className="form-input"
                      value={month}
                      onChange={handleMonthChange}
                    >
                      <option value="" disabled>
                        Select Month
                      </option>
                      {months.map((monthName, index) => (
                        <option key={monthName} value={index + 1}>
                          {monthName}
                        </option>
                      ))}
                    </select>
                    <select
                      id="dob-day"
                      className="form-input"
                      value={day}
                      onChange={handleDayChange}
                      disabled={!year || !month}
                    >
                      <option value="" disabled>
                        Select Day
                      </option>
                      {Array.from(
                        { length: getDaysInMonth(year, month) },
                        (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    className="form-input"
                    value={gender}
                    onChange={handleGenderChange}
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="save-button-container">
              <button className="save-button">Add Now</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;
