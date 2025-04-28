import { useState, useEffect } from "react";
import "./UploadStudent.modules.css";
import axios from '../../api/axios';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UploadStudent = ({ student }) => {
  const navigate = useNavigate();
  const classes = [
    "Creche",
    "Nursery 1",
    "Nursery 2",
    "KG 1",
    "KG 2",
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
  ];

  const [studentDetails, setStudentDetails] = useState({
    name: student?.name || "",
    class: student?.class || "",
    idno: student?.idno || "N/A",
    dob: student?.dob || "",
    phone: student?.phone || "",
    address: student?.address || "",
  });

  useEffect(() => {
    if (student) {
      setStudentDetails({
        name: student.name,
        class: student.class,
        idno: student.idno || "N/A",
        dob: student.dob,
        phone: student.phone,
        address: student.address,
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setStudentDetails((prev) => ({ ...prev, [id]: value }));
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setStudentDetails((prev) => ({
      ...prev,
      class: value,
      idno: value === "JHS 3" ? "" : "N/A",
    }));
  };

  const handleUploadStudent = (event) => {
    event.preventDefault();
    if (!studentDetails.name || !studentDetails.class || !studentDetails.idno) {
      return toast.error("Please fill all required fields");
    }

    axios
      .post("/api/student/manage-students/add", studentDetails)
      .then(() => {
        setStudentDetails({
          name: "",
          class: "",
          idno: "N/A",
          dob: "",
          phone: "",
          address: "",
        });
        toast.success("Student uploaded successfully");
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    console.log(studentDetails); // Log the details being sent
  
    if (!studentDetails.name || !studentDetails.class || !studentDetails.idno) {
      return toast.error("Please fill all required fields");
    }
  
    // Add the _id field to the studentDetails object
    const updatedStudentDetails = { ...studentDetails, id: student._id };
  
    await axios
      .put("/api/student/manage-students/edit", updatedStudentDetails, {
        withCredentials: true,
      })
      .then(() => {
        navigate(0);
        toast.success("Student updated successfully");
      })
      .catch((err) => {
        console.log(err); // Ensure errors are logged
      });
  };
  
  
  return (
    <div className="student-page">
      <div className="student-content">
        <main className="main-content">
          <form className="student-form">
            <div className="student-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Student Name</label>
                  <input
                    required
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="Enter Student Name"
                    value={studentDetails.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="class">Class</label>
                  <select
                    required
                    id="class"
                    className="form-input"
                    value={studentDetails.class}
                    onChange={handleClassChange}
                  >
                    <option value="" disabled>
                      Select Class
                    </option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="idno">ID Number</label>
                  <input
                    required
                    type="text"
                    id="idno"
                    className="form-input"
                    placeholder="Enter ID Number"
                    value={studentDetails.idno}
                    onChange={handleChange}
                    disabled={studentDetails.class !== "JHS 3"}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    required
                    type="date"
                    id="dob"
                    className="form-input"
                    value={studentDetails.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    required
                    type="text"
                    id="phone"
                    className="form-input"
                    placeholder="Enter Phone Number"
                    value={studentDetails.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    required
                    type="text"
                    id="address"
                    className="form-input"
                    placeholder="Enter Address"
                    value={studentDetails.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="save-button-container">
                {!student?._id ? (
                  <button
                    type="submit"
                    onClick={handleUploadStudent}
                    className="save-button"
                  >
                    Upload Student
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleEditStudent}
                    className="save-button"
                  >
                    Edit Student
                  </button>
                )}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UploadStudent;
