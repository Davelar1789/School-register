import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { MdEdit } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Cashbook.modules.css';

const Fees = () => {
  const [students, setStudents] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [currentFees, setCurrentFees] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 10;

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("/api/get-all-students");
      const studentsWithFees = res.data.data.map(student => {
        const termFees = student.fees.find(fee => fee.term === selectedTerm);
        if (!termFees) {
          // Initialize fees for new students or students without fees for the selected term
          student.fees.push({
            term: selectedTerm,
            amount: currentFees,
            arrears: 0,
            totalFees: currentFees
          });
        }
        return student;
      });
      setStudents(studentsWithFees);
      
      const firstStudentFees = studentsWithFees[0]?.fees.find(fee => fee.term === selectedTerm);
      if (firstStudentFees) {
        setCurrentFees(firstStudentFees.amount);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching student data');
    }
  };

  const handleTermChange = (e) => {
    setSelectedTerm(e.target.value);
    const firstStudentFees = students[0]?.fees.find(fee => fee.term === e.target.value);
    if (firstStudentFees) {
      setCurrentFees(firstStudentFees.amount);
    } else {
      setCurrentFees(0);
    }
  };

  const handleCurrentFeesChange = (e) => {
    const newFees = Number(e.target.value);
    if (newFees >= 0) {
      setCurrentFees(newFees);
      // Update fees for all students for the selected term
      const updatedStudents = students.map(student => {
        const updatedFees = student.fees.map(fee => {
          if (fee.term === selectedTerm) {
            return {
              ...fee,
              amount: newFees,
              totalFees: newFees + fee.arrears
            };
          }
          return fee;
        });
        return {
          ...student,
          fees: updatedFees
        };
      });
      setStudents(updatedStudents);
    } else {
      toast.error('Fees cannot be negative');
    }
  };

  const handleArrearsChange = (studentId, value) => {
    const arrears = Number(value);
    if (arrears >= 0) {
      const updatedStudents = students.map(student => {
        if (student._id === studentId) {
          const updatedFees = student.fees.map(fee => {
            if (fee.term === selectedTerm) {
              return {
                ...fee,
                arrears,
                totalFees: currentFees + arrears
              };
            }
            return fee;
          });
          return {
            ...student,
            fees: updatedFees
          };
        }
        return student;
      });
      setStudents(updatedStudents);
    } else {
      toast.error('Arrears cannot be negative');
    }
  };

  const handleSaveFees = async () => {
    try {
      const updatedStudents = students.map(student => ({
        _id: student._id,
        fees: student.fees.map(fee => {
          if (fee.term === selectedTerm) {
            return {
              ...fee,
              amount: currentFees,
              totalFees: currentFees + fee.arrears
            };
          }
          return fee;
        })
      }));

      await axios.post("/api/save-fees", {
        students: updatedStudents
      });
      toast.success('Fees saved successfully!');
      fetchAllStudents();
    } catch (err) {
      console.error(err);
      toast.error('Error saving fees');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="fees-page">
      <div className="fees-header">
        <h2>Cashbook</h2>
        <div className="term-selector">
          <select value={selectedTerm} onChange={handleTermChange}>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
      </div>
      <div className="fees-input">
        <label htmlFor="currentFees">Fees for the Term (in GHC):</label>
        <input
          type="number"
          id="currentFees"
          value={currentFees}
          onChange={handleCurrentFeesChange}
        />
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or class..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table className="fees-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Current Fees</th>
            <th>Arrears</th>
            <th>Total Fees</th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.map((student) => {
            const termFees = student.fees.find(fee => fee.term === selectedTerm) || { amount: 0, arrears: 0, totalFees: 0 };
            const totalFees = currentFees + termFees.arrears;
            return (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.class}</td>
                <td>{currentFees}</td>
                <td>
                  <input
                    type="number"
                    value={termFees.arrears}
                    onChange={(e) => handleArrearsChange(student._id, e.target.value)}
                  />
                </td>
                <td>{totalFees}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
      <button className="save-fees-button" onClick={handleSaveFees}>Save Fees</button>
    </div>
  );
};

export default Fees;
