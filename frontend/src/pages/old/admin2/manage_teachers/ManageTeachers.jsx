import { useState, useEffect } from "react";
import "./ManageProducts.modules.css";
import UploadTeacher from "../../../components/UploadTeacher";
import axios from '../../../api/axios';
import { MdDelete, MdEdit } from "react-icons/md";
import toast from "react-hot-toast";

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [toggleAddTeacher, setToggleAddTeacher] = useState(false);
  const [toggleEditTeacher, setToggleEditTeacher] = useState(false);
  const [teacherToEditDetails, setTeacherToEditDetails] = useState(null);

  const fetchAllTeachers = async () => {
    await axios
      .get("/api/get-all-teachers")
      .then((res) => {
        setTeachers(res.data.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchAllTeachers();
  }, [toggleAddTeacher]);

  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 8;
  const totalPages = Math.ceil(teachers?.length / teachersPerPage);

  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = teachers?.slice(indexOfFirstTeacher, indexOfLastTeacher);

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

  const handleDeleteTeacher = async (teacherId) => {
    await axios
      .post("/api/admin/manage-teachers/delete", { teacherId }, { withCredentials: true })
      .then(() => {
        fetchAllTeachers();
        toast.success("Teacher deleted successfully");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="teachers-page">
      <div className="teachers-content">
        <main className="main-content">
          <div className="header-section">
            <h2>Teacher List</h2>
            {!toggleEditTeacher ? (
              <button
                onClick={() => setToggleAddTeacher(!toggleAddTeacher)}
                className="add-stock-button"
              >
                {toggleAddTeacher ? "Manage Teachers" : "Upload Teachers"}
              </button>
            ) : (
              <button
                onClick={() => setToggleEditTeacher(!toggleEditTeacher)}
                className="add-stock-button"
              >
                Manage Teachers
              </button>
            )}
          </div>
          <>
            {toggleEditTeacher ? (
              <UploadTeacher teacher={teacherToEditDetails} />
            ) : !toggleAddTeacher ? (
              <>
                <table className="teacher-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Teacher Name</th>
                      <th className="hidden md:table-cell">Department</th>
                      <th>Class</th>
                      <th className="hidden md:table-cell">Subject</th>
                      <th className="hidden lg:table-cell">Salary</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeachers?.map((teacher, index) => (
                      <tr key={teacher._id}>
                        <td>
                          <img
                            src={teacher.images[0]}
                            alt={teacher.name}
                            className="teacher-image rounded-lg"
                          />
                        </td>
                        <td>{teacher.name}</td>
                        <td className="hidden md:table-cell">{teacher.department}</td>
                        <td>{teacher.class}</td>
                        <td className="hidden md:table-cell">{teacher.subject}</td>
                        <td className="hidden lg:table-cell">{teacher.salary}</td>
                        <td>
                          <button
                            onClick={() => {
                              setTeacherToEditDetails(teacher);
                              setToggleEditTeacher(!toggleEditTeacher);
                            }}
                            className="mx-1"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="mx-1"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination">
                  <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>
                    Showing {indexOfFirstTeacher + 1}-{indexOfLastTeacher} of {teachers?.length}
                  </span>
                  <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              </>
            ) : (
              <UploadTeacher />
            )}
          </>
        </main>
      </div>
    </div>
  );
};

export default ManageTeachers;
