import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";
import "./UploadReportTemplates.modules.css"; // Optional for styling

const UploadReportTemplates = () => {
  const [classList, setClassList] = useState([]);
  const [templates, setTemplates] = useState([{ file: null, selectedClasses: [] }]);
  const [loading, setLoading] = useState(false);

  const schoolId = localStorage.getItem("schoolId");
  const token = localStorage.getItem("token");

  // Fetch classes for this school
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`/api/classes/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassList(res.data || []);
    } catch (err) {
      toast.error("Failed to load class list.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleFileChange = (index, file) => {
    const updated = [...templates];
    updated[index].file = file;
    setTemplates(updated);
  };

  const handleClassToggle = (index, classId) => {
    const updated = [...templates];
    const alreadySelected = updated[index].selectedClasses.includes(classId);
    if (alreadySelected) {
      updated[index].selectedClasses = updated[index].selectedClasses.filter(id => id !== classId);
    } else {
      updated[index].selectedClasses.push(classId);
    }
    setTemplates(updated);
  };

  const addTemplateSlot = () => {
    if (templates.length >= 4) {
      toast.error("You can upload a maximum of 4 templates.");
      return;
    }
    setTemplates([...templates, { file: null, selectedClasses: [] }]);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      for (let i = 0; i < templates.length; i++) {
        const { file, selectedClasses } = templates[i];

        if (!file || selectedClasses.length === 0) {
          toast.error(`Template ${i + 1} needs a file and at least one class.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("schoolId", schoolId);
        formData.append("classIds", JSON.stringify(selectedClasses));

        await axios.post("/api/report-template/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(`Template ${i + 1} uploaded successfully.`);
      }

      setTemplates([{ file: null, selectedClasses: [] }]); // reset after upload
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload one or more templates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-upload-page">
      <Header />
      <Sidebar />
      <div className="template-upload-container">
        <h2>Upload Report Card Templates</h2>

        {templates.map((template, index) => (
          <div className="template-block" key={index}>
            <h4>Template {index + 1}</h4>

            <input
              type="file"
              accept=".docx"
              onChange={(e) => handleFileChange(index, e.target.files[0])}
            />

            <div className="class-select-section">
              <label>Select Classes for this Template:</label>
              <div className="class-list">
                {classList.map((cls) => (
                  <label key={cls._id} className="class-checkbox">
                    <input
                      type="checkbox"
                      checked={template.selectedClasses.includes(cls._id)}
                      onChange={() => handleClassToggle(index, cls._id)}
                    />
                    {cls.className}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        {templates.length < 4 && (
          <button className="add-template-btn" onClick={addTemplateSlot}>
            + Add Another Template
          </button>
        )}

        <button
          className="upload-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Templates"}
        </button>
      </div>
    </div>
  );
};

export default UploadReportTemplates;
