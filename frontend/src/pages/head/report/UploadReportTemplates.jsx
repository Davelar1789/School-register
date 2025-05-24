import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";
import "./UploadReportTemplates.modules.css";

const UploadReportTemplates = () => {
  const [classList, setClassList] = useState([]);
  const [templates, setTemplates] = useState([{ file: null, selectedClasses: [] }]);
  const [loading, setLoading] = useState(false);

  const [selectedReportClass, setSelectedReportClass] = useState("");
  const [nextTermDate, setNextTermDate] = useState("");
  const [nextTermFees, setNextTermFees] = useState("");

  const schoolDataRaw = localStorage.getItem("schoolData");
  const schoolId = schoolDataRaw ? JSON.parse(schoolDataRaw)._id : null;
  const token = localStorage.getItem("token");

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

  const handleGenerateReports = async () => {
    if (!selectedReportClass || !nextTermDate || !nextTermFees) {
      return toast.error("Please select class, next term date, and next term fees.");
    }

    try {
      // Fetch latest term first
      const { data: term } = await axios.get(`/api/terms/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const termId = term?._id;
      if (!termId) {
        return toast.error("Latest term not found.");
      }

      const downloadUrl = `/api/reports/class/${selectedReportClass}?termId=${termId}&nextTermDate=${nextTermDate}&nextTermFees=${nextTermFees}`;

      window.open(downloadUrl, "_blank"); // Open ZIP file in new tab

    } catch (err) {
      console.error("Report generation failed:", err);
      toast.error("Failed to generate reports.");
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

        <hr style={{ margin: "2rem 0" }} />

        <h2>Generate Report Cards</h2>
        <div className="report-controls">
          <label>Class:</label>
          <select
            value={selectedReportClass}
            onChange={(e) => setSelectedReportClass(e.target.value)}
            className="class-dropdown"
          >
            <option value="">-- Select Class --</option>
            {classList.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>

          <label>Next Term Begins:</label>
          <input
            type="date"
            value={nextTermDate}
            onChange={(e) => setNextTermDate(e.target.value)}
          />

          <label>Fees for Next Term (GHS):</label>
          <input
            type="number"
            value={nextTermFees}
            onChange={(e) => setNextTermFees(e.target.value)}
            placeholder="e.g. 450"
          />

          <button className="generate-btn" onClick={handleGenerateReports}>
            Generate & Download Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadReportTemplates;
