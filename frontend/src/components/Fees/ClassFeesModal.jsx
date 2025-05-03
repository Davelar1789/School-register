import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import api from '../../api/axios';

const ClassFeesModal = ({ isOpen, onClose, academicYear, termName, schoolId }) => {
  const [classes, setClasses] = useState([]);
  const [classFees, setClassFees] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get(`/classes/school/${schoolId}`);
        setClasses(response.data);
        const initialFees = response.data.map((cls) => ({
          classId: cls._id,
          className: cls.className,
          totalFees: 0,
        }));
        setClassFees(initialFees);
      } catch (error) {
        toast.error('Failed to fetch classes.');
      }
    };

    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen, schoolId]);

  const handleFeeChange = (index, value) => {
    const updatedFees = [...classFees];
    updatedFees[index].totalFees = Number(value);
    setClassFees(updatedFees);
  };

  const handleSaveFees = async () => {
    try {
      await api.post('/termsessions', {
        schoolId,
        yearLabel: academicYear,
        termName,
        classFees,
      });
      toast.success('Term session created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create term session.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          Set Fees for {termName} - {academicYear}
        </h2>
        {classFees.map((fee, index) => (
          <div key={fee.classId}>
            <label>{fee.className}</label>
            <input
              type="number"
              value={fee.totalFees}
              onChange={(e) => handleFeeChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleSaveFees}>Save Fees</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ClassFeesModal;
