import { useState, useEffect } from "react";
import "./ManageStudents.modules.css";
import UploadStudent from "../../../components/UploadStudent2";
import axios from '../../../api/axios';
import { MdDelete, MdEdit } from "react-icons/md";
import toast from "react-hot-toast";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [toggleAddStudent, setToggleAddStudent] = useState(false);
  const [toggleEditStudent, setToggleEditStudent] = useState(false);
  const [studentToEditDetails, setStudentToEditDetails] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");

  const fetchStudentsByClass = async (className) => {
    await axios
      .get(`/api/get-students-by-class/${className}`)
      .then((res) => {
        setStudents(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;
  const totalPages = Math.ceil(students?.length / studentsPerPage);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students?.slice(indexOfFirstStudent, indexOfLastStudent);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    await axios
      .post("/api/teacher/manage-students/delete", { studentId }, { withCredentials: true })
      .then(() => {
        fetchStudentsByClass(selectedClass);
        toast.success("Student deleted successfully");
      })
      .catch((err) => console.log(err));
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    if (className) {
      fetchStudentsByClass(className);
    } else {
      setStudents([]);
    }
  };
  
  return (
    <div className="students-page">
      <div className="students-content">
        <main className="main-content">
          <div className="header-section">
            <h2>My Student List</h2>
            {!toggleEditStudent ? (
              <button
                onClick={() => setToggleAddStudent(!toggleAddStudent)}
                className="add-stock-button"
              >
                {toggleAddStudent ? "Manage Students" : "Upload Students"}
              </button>
            ) : (
              <button
                onClick={() => setToggleEditStudent(!toggleEditStudent)}
                className="add-stock-button"
              >
                Manage Students
              </button>
            )}
          </div>
          <div className="class-selection">
            <label htmlFor="class-select">Which class do you want?</label>
            <select id="class-select" onChange={handleClassChange}>
              <option value="">Select a class</option>
              <option value="Creche">Creche</option>
              <option value="Nursery 1">Nursery 1</option>
              <option value="Nursery 2">Nursery 2</option>
              <option value="KG 1">KG 1</option>
              <option value="KG 2">KG 2</option>
              <option value="Primary 1">Primary 1</option>
              <option value="Primary 2">Primary 2</option>
              <option value="Primary 3">Primary 3</option>
              <option value="Primary 4">Primary 4</option>
              <option value="Primary 5">Primary 5</option>
              <option value="Primary 6">Primary 6</option>
              <option value="JHS 1">JHS 1</option>
              <option value="JHS 2">JHS 2</option>
              <option value="JHS 3">JHS 3</option>
            </select>
          </div>
          <>
            {toggleEditStudent ? (
              <UploadStudent student={studentToEditDetails} />
            ) : !toggleAddStudent ? (
              <>
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th className="hidden md:table-cell">ID Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents?.map((student, index) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td className="hidden md:table-cell">{student.idno}</td>
                      
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>
                    Showing {indexOfFirstStudent + 1}-{indexOfLastStudent} of {students?.length}
                  </span>
                  <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              </>
            ) : (
              <UploadStudent />
            )}
          </>
        </main>
      </div>
    </div>
  );
};

export default ManageStudents;