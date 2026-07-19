import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { UploadCloud, Trash2, FileText } from "lucide-react";
import "./AdminMarkingSchemes.modules.css";

const AdminMarkingSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [classesList, setClassesList] = useState([]); // fetch from your existing /api/classes endpoint
  const [subjectsList, setSubjectsList] = useState([]); // fetch from your existing /api/subjects endpoint
  const [form, setForm] = useState({
    classId: "", subjectId: "", term: "First Term",
    academicYear: "", title: "", availableFrom: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("adminToken");

  const fetchSchemes = async () => {
    try {
      const res = await api.get("/api/marking-schemes/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchemes(res.data.schemes);
    } catch (err) {
      toast.error("Failed to load marking schemes.");
    }
  };

  useEffect(() => {
    fetchSchemes();
    // also fetch classesList / subjectsList here from your existing endpoints
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please attach a file.");

    try {
      setUploading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", file);

      await api.post("/api/marking-schemes/admin/upload", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Marking scheme uploaded.");
      setForm({ classId: "", subjectId: "", term: "First Term", academicYear: "", title: "", availableFrom: "" });
      setFile(null);
      fetchSchemes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this marking scheme?")) return;
    try {
      await api.delete(`/api/marking-schemes/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted.");
      fetchSchemes();
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="ams-page">
      <h1 className="ams-title">Marking Schemes — Upload</h1>

      <form className="ams-form" onSubmit={handleSubmit}>
        <div className="ams-form-grid">
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
            <option value="">Select Class</option>
            {classesList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
            <option value="">Select Subject</option>
            {subjectsList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>

          <input
            type="text" placeholder="Academic Year e.g. 2025/2026"
            value={form.academicYear}
            onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
            required
          />

          <input
            type="text" placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label className="ams-datetime-label">
            Unlocks at:
            <input
              type="datetime-local"
              value={form.availableFrom}
              onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
              required
            />
          </label>
        </div>

        <label className="ams-file-drop">
          <UploadCloud size={20} />
          {file ? file.name : "Click to attach PDF/DOCX"}
          <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => setFile(e.target.files[0])} />
        </label>

        <button type="submit" disabled={uploading} className="ams-submit-btn">
          {uploading ? "Uploading…" : "Upload Marking Scheme"}
        </button>
      </form>

      <div className="ams-list">
        {schemes.map((s) => (
          <div key={s._id} className="ams-list-item">
            <FileText size={18} />
            <div className="ams-list-info">
              <span className="ams-list-title">{s.title}</span>
              <span className="ams-list-meta">
                {s.class?.name} · {s.subject?.name} · {s.term} · {s.academicYear}
              </span>
              <span className="ams-list-unlock">
                Unlocks: {new Date(s.availableFrom).toLocaleString()}
              </span>
            </div>
            <button className="ams-delete-btn" onClick={() => handleDelete(s._id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMarkingSchemes;