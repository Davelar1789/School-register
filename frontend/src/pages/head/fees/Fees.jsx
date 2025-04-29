import React, { useState, useEffect } from "react";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import "./Fees.modules.css";
import { FaPlus, FaMoneyBillWave, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../../../api/axios"; // Adjust if your api path is different

const Fees = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [allClasses, setAllClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substr(0, 10));
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentNote, setPaymentNote] = useState('');


  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const userDataRaw = localStorage.getItem("user"); // or however you saved it
      if (!userDataRaw) {
        toast.error("User not logged in");
        return;
      }
  
      const userData = JSON.parse(userDataRaw);
      const token = userData.token;
  
      const { data } = await api.get("/api/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    if (!selectedStudent || !paymentAmount) {
      alert("Please fill in all required fields.");
      return;
    }
  
    // Get latest term from academicRecords
    let latestTerm = null;
    let yearLabel = "";
    let latestDate = null;
  
    (selectedStudent.academicRecords || []).forEach((record) => {
      (record.terms || []).forEach((term) => {
        if (!latestDate || new Date(term.startDate) > new Date(latestDate)) {
          latestDate = term.startDate;
          latestTerm = term;
          yearLabel = record.yearLabel;
        }
      });
    });
  
    if (!latestTerm || !yearLabel) {
      alert("No valid academic term found for this student.");
      return;
    }
  
    try {
      await api.post("/api/fees/make-payment", {
        studentId: selectedStudent._id,
        yearLabel,
        termName: latestTerm.termName,
        amount: Number(paymentAmount),
        note: paymentNote,
        date: paymentDate, // make sure it's a valid date string
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`, // if protected route
        },
      });
  
      alert("Payment recorded successfully!");
      // Optionally refresh students data
      setIsModalOpen(false);
      setSelectedStudent(null);
      setPaymentAmount('');
      setPaymentNote('');
    } catch (error) {
      console.error(error);
      alert("Failed to record payment.");
    }
  };
  
  

  const fetchClasses = async () => {
    try {
      const schoolDataRaw = localStorage.getItem("schoolData");
      if (!schoolDataRaw) {
        toast.error("School not selected");
        return;
      }
  
      const schoolData = JSON.parse(schoolDataRaw);
      const schoolId = schoolData._id;
  
      const userDataRaw = localStorage.getItem("user");
      const userData = JSON.parse(userDataRaw);
      const token = userData.token;
  
      const { data } = await api.get(`/api/classes/school/${schoolId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setAllClasses(data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };
  

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterStudents(value, selectedClass);
  };

  const handleFilterClass = (e) => {
    const value = e.target.value;
    setSelectedClass(value);
    filterStudents(searchTerm, value);
  };

  const filterStudents = (search, classId) => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.idno.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classId
        ? student.classes && student.classes.length > 0 && student.classes[0]._id === classId
        : true;
      return matchesSearch && matchesClass;
    });
    setFilteredStudents(filtered);
  };

  return (
    <div className="fees-container">
      <Sidebar />
      <div className="fees-main">
        <Header />
        <div className="fees-side">
        <div className="fees-header">
          <h1>Fees Management</h1>
          <div className="fees-header-actions">
            <input
              type="text"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={handleSearch}
              className="fees-search"
            />
            <select
              value={selectedClass}
              onChange={handleFilterClass}
              className="fees-filter"
            >
              <option value="">All Classes</option>
              {allClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
            <button className="fees-add" onClick={() => setIsModalOpen(true)}>
                <FaPlus /> Add New Payment
            </button>
        </div>
        </div>

        <div className="fees-summary">
          <div className="fees-summary-box">
            <FaMoneyBillWave className="fees-summary-icon" />
            <div>
              <h3>Total Fees Collected</h3>
              <p>GHC 50,000</p> {/* replace with calculated value later */}
            </div>
          </div>
          <div className="fees-summary-box">
            <FaMoneyBillWave className="fees-summary-icon" />
            <div>
              <h3>Outstanding Arrears</h3>
              <p>GHC 8,500</p> {/* replace with calculated value later */}
            </div>
          </div>
        </div>

        <div className="fees-tableWrapper">
          {loading ? (
            <p className="fees-loading">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="fees-empty">No students found.</p>
          ) : (
            <table className="fees-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Fees Owed</th>
                  <th>Fees Paid</th>
                  <th>Balance</th>
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                    let className = "N/A";
                    if (student.classes && student.classes.length > 0) {
                    className = student.classes[0]?.className || "N/A";
                    }

                    // Get latest academic record based on year (optional: sort by year if needed)
                    const academicRecords = student.academicRecords || [];

                    // Get the most recent term across all academic years
                    let latestTerm = null;
                    let latestDate = null;

                    academicRecords.forEach((record) => {
                    (record.terms || []).forEach((term) => {
                        if (!latestDate || new Date(term.startDate) > new Date(latestDate)) {
                        latestDate = term.startDate;
                        latestTerm = term;
                        }
                    });
                    });

                    const fees = latestTerm?.fees || {};
                    const feesOwed = fees.totalFees || 0;
                    const feesPaid = fees.amountPaid || 0;
                    const balance = fees.balance ?? (feesOwed - feesPaid);

                    return (
                    <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{className}</td>
                        <td>GHC {feesOwed}</td>
                        <td>GHC {feesPaid}</td>
                        <td>GHC {balance}</td>
                        {/* <td className="fees-actions">
                        <button className="fees-edit">
                            <FaEdit />
                        </button>
                        <button className="fees-delete">
                            <FaTrash />
                        </button>
                        </td> */}
                    </tr>
                    );
                })}
                </tbody>

            </table>
          )}
        </div>
        {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Add New Payment</h2>
      <button className="modal-close" onClick={() => setIsModalOpen(false)}>X</button>

      <div className="modal-field">
        <label>Select Student:</label>
        <select
          value={selectedStudent?._id || ""}
          onChange={(e) => {
            const student = filteredStudents.find(s => s._id === e.target.value);
            setSelectedStudent(student);
          }}
        >
          <option value="">-- Select --</option>
          {filteredStudents.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} ({student.idno})
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <>
          <div className="modal-field">
            <label>Current Balance:</label>
            <p>
              GHC {(() => {
                const academicRecords = selectedStudent.academicRecords || [];
                let latestTerm = null;
                let latestDate = null;

                academicRecords.forEach((record) => {
                  (record.terms || []).forEach((term) => {
                    if (!latestDate || new Date(term.startDate) > new Date(latestDate)) {
                      latestDate = term.startDate;
                      latestTerm = term;
                    }
                  });
                });

                return latestTerm?.fees?.balance ?? 0;
              })()}
            </p>
          </div>

          <div className="modal-field">
            <label>Payment Amount (GHC):</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Payment Date:</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>

          <div className="modal-field">
            <label>Notes (optional):</label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="e.g., Paid via MTN MOMO..."
            />
          </div>

          <button className="modal-save" onClick={handleSavePayment}>
            Save Payment
          </button>
        </>
      )}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default Fees;
