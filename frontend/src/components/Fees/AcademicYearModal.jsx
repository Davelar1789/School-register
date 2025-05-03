import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import api from '../../api/axios';

const AcademicYearModal = ({ isOpen, onClose, onYearAdded, schoolId }) => {
  const [yearLabel, setYearLabel] = useState('');

  const handleAddYear = async () => {
    if (!yearLabel) {
      toast.error('Please enter an academic year.');
      return;
    }

    try {
      const response = await api.post('/academic-years', {
        schoolId,
        yearLabel,
      });
      toast.success('Academic year added successfully!');
      onYearAdded(response.data);
      setYearLabel('');
      onClose();
    } catch (error) {
      toast.error('Failed to add academic year.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Academic Year</h2>
        <input
          type="text"
          value={yearLabel}
          onChange={(e) => setYearLabel(e.target.value)}
          placeholder="e.g., 2024/2025"
        />
        <button onClick={handleAddYear}>Add Year</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AcademicYearModal;
