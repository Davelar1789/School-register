import React, { useState } from "react";
import Header from "../../../components/Header";
import './ApplyStudent.modules.css';


const ApplyStudent = () => {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    surname: "",
    otherNames: "",
    dob: "",
    languagesSpoken: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    residence: "",
    caregiver: "",
    pickupPerson: "",
    otherPickupPerson: "",
    healthChallenges: "",
    allergies: "",
    classAdmittedTo: "",
    previousSchool: "",
    resolution: false,
    parentName: "",
    signature: "",
    date: "",
  });

  const [showOtherPickup, setShowOtherPickup] = useState(false);
  const [showHealthDetails, setShowHealthDetails] = useState(false);
  const [showAllergiesDetails, setShowAllergiesDetails] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure that all required fields are filled
    if (
      formData.resolution &&
      formData.parentName &&
      formData.signature &&
      formData.date
    ) {
      // Submit form logic
      console.log(formData);
    } else {
      alert("Please fill all required fields");
    }
  };

  return (
    <div className="apply-student">
      <Header />
      <div className="form-container">
        <h1>Student Application Form</h1>
        <form onSubmit={handleSubmit}>
          <h2>Part 1</h2>
          <div className="form-group">
            <label>Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Surname</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Other Names</label>
            <input
              type="text"
              name="otherNames"
              value={formData.otherNames}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Languages Spoken</label>
            <input
              type="text"
              name="languagesSpoken"
              value={formData.languagesSpoken}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Area of Residence</label>
            <input
              type="text"
              name="residence"
              value={formData.residence}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <h2>Part 2</h2>
          <div className="form-group">
            <label>Who is taking care of your child?</label>
            <input
              type="radio"
              name="caregiver"
              value="Parents"
              onChange={handleInputChange}
              required
            /> Parents
            <input
              type="radio"
              name="caregiver"
              value="Guardian"
              onChange={handleInputChange}
              required
            /> Guardian
          </div>
          <div className="form-group">
            <label>Who has the legal permit to pick up your ward?</label>
            <input
              type="radio"
              name="pickupPerson"
              value="Parents"
              onChange={handleInputChange}
              required
            /> Parents
            <input
              type="radio"
              name="pickupPerson"
              value="Guardian"
              onChange={handleInputChange}
              required
            /> Guardian
            <input
              type="radio"
              name="pickupPerson"
              value="Self"
              onChange={handleInputChange}
              required
            /> Self
            <input
              type="radio"
              name="pickupPerson"
              value="Other"
              onChange={() => setShowOtherPickup(true)}
            /> Other
          </div>
          {showOtherPickup && (
            <div className="form-group">
              <label>If other, please specify name and relationship</label>
              <input
                type="text"
                name="otherPickupPerson"
                value={formData.otherPickupPerson}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Does your ward have any health challenges?</label>
            <input
              type="radio"
              name="healthChallenges"
              value="Yes"
              onChange={() => setShowHealthDetails(true)}
            /> Yes
            <input
              type="radio"
              name="healthChallenges"
              value="No"
              onChange={() => setShowHealthDetails(false)}
            /> No
          </div>
          {showHealthDetails && (
            <div className="form-group">
              <label>Please specify health challenges</label>
              <input
                type="text"
                name="healthDetails"
                value={formData.healthDetails}
                onChange={handleInputChange}
              />
            </div>
          )}
          <div className="form-group">
            <label>Does your ward have any allergies?</label>
            <input
              type="radio"
              name="allergies"
              value="Yes"
              onChange={() => setShowAllergiesDetails(true)}
            /> Yes
            <input
              type="radio"
              name="allergies"
              value="No"
              onChange={() => setShowAllergiesDetails(false)}
            /> No
          </div>
          {showAllergiesDetails && (
            <div className="form-group">
              <label>Please specify allergies</label>
              <input
                type="text"
                name="allergyDetails"
                value={formData.allergyDetails}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          <h2>Part 3</h2>
          <div className="form-group">
            <p>I hereby make a request for the admission of my ward...</p>
            <label>Name of Parent/Guardian</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Signature</label>
            <input
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyStudent;
