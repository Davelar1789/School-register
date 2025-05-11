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
        
      </div>
    </div>
  );
};

export default Fees;
