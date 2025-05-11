import React, { useState, useEffect } from "react";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import "./SchoolFees.modules.css";
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
  const [viewModalOpen, setViewModalOpen] = useState(false);
const [paymentHistory, setPaymentHistory] = useState([]);
const [viewedStudent, setViewedStudent] = useState(null);
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

  const sendWhatsAppReceipt = async (payment) => {
    try {
      const response = await api.post("/api/whatsapp/send-whatsapp-receipt", {
        phoneNumber: payment.phone, // make sure this is available
        studentName: payment.studentName,
        amount: payment.amount,
        date: new Date(payment.date).toLocaleDateString(),
      });
  
      toast.success("Receipt sent via WhatsApp!");
    } catch (error) {
      console.error("WhatsApp receipt error:", error);
      toast.error("Failed to send WhatsApp receipt.");
    }
  };

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
    const userToken = localStorage.getItem("token");

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

      // ✅ Fetch latest fees data from backend
        const response = await api.get(`/api/fees/fetch-fees/${selectedStudent._id}`, {
            headers: {
            Authorization: `Bearer ${userToken}`,
            },
        });
        
        const updatedAcademicRecords = response.data.academicRecords;
        
        // ✅ Update selected student with latest records
        setSelectedStudent(prev => ({
            ...prev,
            academicRecords: updatedAcademicRecords
        }));
  
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

  const handleViewPayments = async (student) => {
    try {
        const userToken = localStorage.getItem("token");

      const response = await api.get(`/api/fees/recent-payments/${student._id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
  
      setViewedStudent(student);
      setPaymentHistory(response.data.payments);
      setViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch recent payments', error);
      alert('Could not fetch recent payments.');
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

  const totalFeesCollected = filteredStudents.reduce((sum, student) => {
    const academicRecords = student.academicRecords || [];
  
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
  
    const feesPaid = latestTerm?.fees?.amountPaid || 0;
    return sum + feesPaid;
  }, 0);
  
  const totalOutstandingArrears = filteredStudents.reduce((sum, student) => {
    const academicRecords = student.academicRecords || [];
  
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
    const balance = fees.balance ?? (fees.totalFees - fees.amountPaid || 0);
    return sum + balance;
  }, 0);
  

  return (
    <div>
      <Sidebar />
      <Header />
      <div className="time-main4">
        <div className="time-side4">
        <div className="time-header4">
          <h1>Fees Management</h1>
          <div className="time-header-actions">
            <input
              type="text"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={handleSearch}
              className="time-search"
            />
            <select
              value={selectedClass}
              onChange={handleFilterClass}
              className="time-filter"
            >
              <option value="">All Classes</option>
              {allClasses.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className}
                </option>
              ))}
            </select>
            {/* <button className="fees-add" onClick={() => setIsModalOpen(true)}>
                <FaPlus /> Add New Payment
            </button> */}
        </div>
        </div>

        <div className="time-summary">
          <div className="time-summary-box">
            <FaMoneyBillWave className="time-summary-icon" />
            <div>
              <h3>Total Fees Collected This Term</h3>
              <p>GHC {totalFeesCollected.toLocaleString()}</p>
            </div>
          </div>
          <div className="time-summary-box">
            <FaMoneyBillWave className="time-summary-icon" />
            <div>
              <h3>Outstanding Arrears</h3>
              <p>GHC {totalOutstandingArrears.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="time-tableWrapper">
          {loading ? (
            <p className="time-loading">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="time-empty">No students found.</p>
          ) : (
            <table className="time-table4">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="nothing">Fees Owed</th>
                  <th className="nothing">Fees Paid</th>
                  <th>Balance</th>
                  <th>Payments</th>
                  <th className="nothing">Payment History</th>
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
                        <td className="nothing">GHC {feesOwed}</td>
                        <td className="nothing">GHC {feesPaid}</td>
                        <td>GHC {balance}</td>
                        <td>
                            <button className="time-add" onClick={() => {
                            setSelectedStudent(student); // auto-select this student
                            setIsModalOpen(true);
                            }}>
                            <FaPlus /> Add New Payment
                            </button>
                        </td>
                        <td className="nothing">
                        <button onClick={() => handleViewPayments(student)} className="time-view">
                            View
                        </button>
                        </td>
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
        {isModalOpen && selectedStudent && (
  <div className="modal-overlay76">
    <div className="modal-content76">
      <h2>Add New Payment</h2>
      <button
        className="modal-close76"
        onClick={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
          setPaymentAmount('');
          setPaymentNote('');
          setPaymentDate('');
        }}
      >
        X
      </button>

      <div className="modal-field76">
        <label>Student:</label>
        <p>{selectedStudent.name} ({selectedStudent.idno})</p>
      </div>

      <div className="modal-field76">
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

      <div className="modal-field76">
        <label>Payment Amount (GHC):</label>
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
      </div>

      <div className="modal-field76">
        <label>Payment Date:</label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
      </div>

      <div className="modal-field76">
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

      <div className="modal-field76">
        <label>Notes (optional):</label>
        <textarea
          value={paymentNote}
          onChange={(e) => setPaymentNote(e.target.value)}
          placeholder="e.g., Paid via MTN MOMO..."
        />
      </div>

      <button className="modal-save76" onClick={handleSavePayment}>
        Save Payment
      </button>
    </div>
  </div>
)}

{viewModalOpen && (
  <div className="modal-overlay76">
    <div className="modal-content76">
      <h2>Recent Payments</h2>
      <button className="modal-close76" onClick={() => setViewModalOpen(false)}>X</button>

      <p><strong>{viewedStudent.name}</strong> ({viewedStudent.idno})</p>

      {paymentHistory.length === 0 ? (
        <p>No recent payments found.</p>
      ) : (
        <ul className="payment-history-list76">
          {paymentHistory.map((payment, idx) => (
            <li key={idx}>
              <p><strong>Amount:</strong> GHC {payment.amount}</p>
              <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
              <p><strong>Method:</strong> {payment.method}</p>
              {payment.note && <p><strong>Note:</strong> {payment.note}</p>}
              <hr />
              <button
        onClick={() => sendWhatsAppReceipt(payment)}
      >
        Send Receipt
      </button>
            </li>
          ))}
        </ul>
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
