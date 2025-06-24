import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "../../../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const TopicsEditorPage = () => {
  const { subjectId } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const classId = params.get("classId");
  const { toast } = useToast();

  const [term, setTerm] = useState("Term 1");
  const [topics, setTopics] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTopics = async () => {
    if (!classId || !term) return;
    try {
      const res = await axios.get(`/api/subjects/${subjectId}/topics`, {
        params: { classId, term }
      });
      setTopics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchTopics(); }, [classId, subjectId, term]);

  const handleAddTopic = async () => {
    if (!newTitle || !newDesc) {
      toast({ title: "Error", description: "Fill in both fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/subjects/${subjectId}/topics`, { classId, term, title: newTitle, description: newDesc });
      toast({ title: "Success", description: "Topic added" });
      setNewTitle("");
      setNewDesc("");
      fetchTopics();
    } catch {
      toast({ title: "Error", description: "Could not add topic", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl mb-4">Edit Topics</h2>

      <div className="flex items-center mb-4 space-x-4">
        <select
          className="border rounded p-2"
          value={term}
          onChange={e => setTerm(e.target.value)}
        >
          {["Term 1","Term 2","Term 3"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <ul className="mb-6 space-y-2">
        {topics.map(t => (
          <li key={t._id} className="bg-gray-100 p-3 rounded">{t.title}</li>
        ))}
        {topics.length === 0 && <p>No topics yet.</p>}
      </ul>

      <Input
        placeholder="New topic title"
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
        className="mb-2"
      />
      <Textarea
        placeholder="Topic description (notes)"
        value={newDesc}
        onChange={e => setNewDesc(e.target.value)}
        className="mb-4"
      />
      <Button onClick={handleAddTopic} disabled={loading}>
        {loading ? "Saving..." : "Add Topic"}
      </Button>
    </div>
  );
};

export default TopicsEditorPage;
