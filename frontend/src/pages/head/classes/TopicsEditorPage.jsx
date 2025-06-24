import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../../api/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./EditTopics.modules.css";
import toast from "react-hot-toast";

const EditTopics = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const classId = new URLSearchParams(location.search).get("classId");

  const [term, setTerm] = useState("Term 1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please log in.");
      return;
    }

    const res = await axios.get(`/api/topics/subjects/${subjectId}/topics`, {
      params: { classId, term },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTopics(res.data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch topics.");
  }
};

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error("Fill both title and description.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/topics/subjects/${subjectId}/topics`, {
        classId,
        term,
        title,
        description,
      });

      toast.success("Topic added");
      setTitle("");
      setDescription("");
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save topic");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [term]);

  return (
    <div className="edit-topics-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h2 className="edit-topics-title">Edit Course Topics</h2>

      <div className="form-group">
        <label>Select Term</label>
        <select value={term} onChange={e => setTerm(e.target.value)}>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
      </div>

      <div className="form-group">
        <label>Topic Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter topic title"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <ReactQuill
          value={description}
          onChange={setDescription}
          theme="snow"
        />
      </div>

      <button className="submit-button" onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Add Topic"}
      </button>

      <div className="existing-topics">
        <h3>Topics for {term}</h3>
        <ul>
          {topics.map(topic => (
            <li key={topic._id} className="topic-item">{topic.title}</li>
          ))}
          {topics.length === 0 && <p>No topics yet.</p>}
        </ul>
      </div>
    </div>
  );
};

export default EditTopics;
