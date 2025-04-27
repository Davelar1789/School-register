import React, { useState } from 'react';
import Header from '../../../components/Homepage/Header';
import './ApplyTeacher.modules.css';


const ApplyTeacher = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        salaryFrom: '',
        salaryTo: '',
        applicationLetter: null,
        cv: null,
        otherUploads: null
    });

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure all mandatory fields are filled before submission
        if (formData.fullName && formData.salaryFrom && formData.salaryTo && formData.applicationLetter && formData.cv) {
            // Submit logic here
            console.log(formData);
        } else {
            alert('Please fill all required fields');
        }
    };

    return (
        <div className="apply-teacher">
            <Header />
            <div className="form-container">
                <h1>Teacher Application Form</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Expected Salary Range</label>
                        <input type="number" name="salaryFrom" placeholder="From" value={formData.salaryFrom} onChange={handleInputChange} required />
                        <input type="number" name="salaryTo" placeholder="To" value={formData.salaryTo} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Upload Application Letter</label>
                        <input type="file" name="applicationLetter" onChange={handleInputChange} accept=".pdf,.doc,.docx" required />
                    </div>
                    <div className="form-group">
                        <label>Upload CV</label>
                        <input type="file" name="cv" onChange={handleInputChange} accept=".pdf,.doc,.docx" required />
                    </div>
                    <div className="form-group">
                        <label>Other Uploads (Optional)</label>
                        <input type="file" name="otherUploads" onChange={handleInputChange} accept=".pdf,.doc,.docx" />
                    </div>
                    <button type="submit">Submit Application</button>
                </form>
            </div>
        </div>
    );
};

export default ApplyTeacher;
