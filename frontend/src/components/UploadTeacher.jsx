import { useState, useEffect } from "react";
import "./UploadProduct.modules.css";
import { FaCheck, FaCloudUploadAlt } from "react-icons/fa";
import { uploadImage } from "../utils/uploadImage";
import axios from '../api/axios';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const departmentData = {
  "Pre-school": {
    classes: ["Creche", "Nursery1", "Nursery2"],
    subjects: ["All subjects", "Pre-writing Skills", "Numeracy", "Lang. and Lit.", "Creativity"],
  },
  Kindergaten: {
    classes: ["KG1", "KG2"],
    subjects: ["All subjects", "Numeracy", "Lang. and Lit.", "Creativity", "OWOP"],
  },
  Primary: {
    classes: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"],
    subjects: ["All subjects", "Science", "English", "Mathematics", "Computing", "Creative Arts", "RME", "French", "Fante", "OWOP"],
  },
  JHS: {
    classes: ["JHS1", "JHS2", "JHS3"],
    subjects: ["All subjects", "Science", "English", "Mathematics", "Social Studies", "Computing", "CAD", "Career Tech", "RME", "French", "Fante"],
  },
};

const UploadTeacher = ({ teacher }) => {
  const navigate = useNavigate();
  const [teacherDetails, setTeacherDetails] = useState({
    name: teacher?.name || "",
    department: teacher?.department || "",
    class: teacher?.class || "",
    subject: teacher?.subject || "",
    salary: teacher?.salary || "",
    description: teacher?.description || "",
    images: teacher?.images || [],
    id: teacher?._id || "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (teacher?.department) {
      setTeacherDetails((prev) => ({
        ...prev,
        class: departmentData[teacher.department]?.classes[0] || "",
        subject: departmentData[teacher.department]?.subjects[0] || "",
      }));
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setTeacherDetails((prev) => ({ ...prev, [id]: value }));

    if (id === "department") {
      setTeacherDetails((prev) => ({
        ...prev,
        class: departmentData[value]?.classes[0] || "",
        subject: departmentData[value]?.subjects[0] || "",
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    const uploadedImageUrl = await uploadImage(file);

    setTeacherDetails((prev) => ({
      ...prev,
      images: [...prev.images, uploadedImageUrl],
    }));
    setUploadingImage(false);
  };

  const handleImageRemove = (index) => {
    const newTeacherImage = [...teacherDetails.images];
    newTeacherImage.splice(index, 1);

    setTeacherDetails((prev) => ({
      ...prev,
      images: [...newTeacherImage],
    }));
  };

  const handleUploadTeacher = (event) => {
    event.preventDefault();
    if (teacherDetails.department === "") {
      return toast.error("Select a department");
    }

    if (teacherDetails.images.length === 0) {
      return toast.error("Upload at least one Image");
    }

    delete teacherDetails.id;
    axios
      .post("/api/admin/manage-teachers/add", teacherDetails)
      .then(() => {
        setTeacherDetails({
          name: "",
          department: "",
          class: "",
          subject: "",
          salary: "",
          description: "",
          images: [],
        });
        toast.success("Teacher Uploaded");
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    if (teacherDetails.department === "") {
      return toast.error("Select a department");
    }

    if (teacherDetails.images.length === 0) {
      return toast.error("Upload at least one Image");
    }
    await axios
      .put("/api/admin/manage-teachers/edit", teacherDetails, {
        withCredentials: true,
      })
      .then(() => {
        navigate(0);
        toast.success("Teacher Updated");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="teacher-page">
      <div className="teacher-content">
        <main className="main-content">
          <form className="teacher-form">
            <div className="teacher-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Teacher Name</label>
                  <input
                    required
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder="Enter Teacher Name"
                    value={teacherDetails.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    className="form-input"
                    value={teacherDetails.department}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {Object.keys(departmentData).map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row ">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <div className="cur-group">
                    <textarea
                      type="text"
                      id="description"
                      required
                      className="bg-slate-100 p-2 min-h-40 max-h-40 border rounded outline-slate-400"
                      placeholder="Enter Teacher Description"
                      value={teacherDetails.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row mt-32">
                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <div className="cur-group">
                    <input
                      type="number"
                      id="salary"
                      required
                      className="form-input"
                      placeholder="Enter Salary"
                      value={teacherDetails.salary}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="class">Class</label>
                  <select
                    id="class"
                    className="form-input"
                    value={teacherDetails.class}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Class
                    </option>
                    {departmentData[teacherDetails.department]?.classes.map(
                      (classOption) => (
                        <option key={classOption} value={classOption}>
                          {classOption}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    className="form-input"
                    value={teacherDetails.subject}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Subject
                    </option>
                    {departmentData[teacherDetails.department]?.subjects.map(
                      (subjectOption) => (
                        <option key={subjectOption} value={subjectOption}>
                          {subjectOption}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group mt-8 w-full">
              <label htmlFor="teacherImage" className="font-bold text-xl mb-2">
                Upload Image
              </label>
              <label htmlFor="uploadImageInput">
                <div className="p-2 bg-slate-100  cursor-pointer flex justify-center items-center border  rounded h-32 w-full  ">
                  <div className="text-slate-500  flex justify-center items-center flex-col gap-1">
                    <span className="text-4xl">
                      <FaCloudUploadAlt />
                    </span>
                    <p className="text-sm">Upload Teacher Image</p>
                    <input
                      type="file"
                      id="uploadImageInput"
                      className="hidden"
                      onClick={() => setUploadingImage(true)}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </label>
              <div className="uploaded-images">
                <>
                  {teacherDetails.images?.map((img, index) => (
                    <div key={index} className="uploaded-image-box">
                      <img
                        src={img}
                        alt={`Teacher ${index}`}
                        className="uploaded-image"
                      />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => handleImageRemove(index)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {uploadingImage && (
                    <div className="uploaded-image-box bg-slate-300 animate-pulse">
                      <div className="uploaded-image " />
                      <button
                        type="button"
                        onClick={() => setUploadingImage(false)}
                        className="remove-image"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </>
              </div>
            </div>
            <div className="save-button-container">
              {!teacher?._id ? (
                <button
                  type="submit"
                  onClick={handleUploadTeacher}
                  className="save-button"
                >
                  Upload Teacher
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleEditTeacher}
                  className="save-button"
                >
                  Edit Teacher
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default UploadTeacher;
