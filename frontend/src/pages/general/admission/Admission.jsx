// AdmissionsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdmissionsPage.modules.css';
import Header from '../../../components/Homepage/Header';

const AdmissionsPage = () => {
    const navigate = useNavigate();

    const handleStudentApply = () => {
        navigate('/apply-student');
    };

    const handleTeacherApply = () => {
        navigate('/apply-teacher');
    };

    return (
            <div className='admissions-page'>
            <Header />
            <section className="hero-admissions">
                <div className="hero-content-admissions">
                    <h1>Admissions</h1>
                    <p>Choose your role and apply to join our school community.</p>
                    <div className="admissions-options">
                        <div className="admission-box" onClick={handleStudentApply}>
                            <span className="ab-emoji">🎒</span><h3>Apply as Student</h3><p>Admission for new pupils</p>
                        </div>
                        <div className="admission-box" onClick={handleTeacherApply}>
                            <span className="ab-emoji">🍎</span><h3>Apply as Teacher</h3><p>Join our teaching staff</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
    );
};

export default AdmissionsPage;
