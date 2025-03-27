import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "../../../api/axios"; // Ensure axios is correctly configured
import "./TermlyDetails.modules.css";

const TermlyDetails = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [termBeginDate, setTermBeginDate] = useState("");
  const [termEndDate, setTermEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch termly details from the database when the component mounts
  useEffect(() => {
    const fetchTermDetails = async () => {
      try {
        const response = await axios.get("/api/get-term-details", {
          withCredentials: true, // If authentication is required
        });

        if (response.data) {
          setYear(response.data.year || "2024/2025");
          setTermBeginDate(response.data.termBeginDate || "");
          setTermEndDate(response.data.termEndDate || "");
        }
      } catch (error) {
        console.error("Error fetching term details:", error.response?.data || error.message);
        toast.error("Error fetching term details");
      } finally {
        setLoading(false);
      }
    };

    fetchTermDetails();
  }, []);

  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        "/api/save-term-details",
        { year, termBeginDate, termEndDate },
        { withCredentials: true } // If authentication is required
      );

      toast.success("Term details saved successfully");
      console.log("Term details saved successfully", response.data);
    } catch (error) {
      console.error("Error saving term details:", error.response?.data || error.message);
      toast.error(`Error saving term details: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  if (loading) return <p>Loading term details...</p>;

  return (
    <div className="termly-details-page">
      <Toaster />
      <div className="termly-details-content" id="termly-details-section">
        <main className="main-content">
          <h2>Termly Details</h2>
          <div className="termly-header">
            <div className="termly-year-term">
              <label>
                Year:
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2027/2028">2027/2028</option>
                </select>
              </label>
              <label>
                Term:
                <select value={term} onChange={(e) => setTerm(e.target.value)}>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </label>
            </div>
            <div className="termly-dates">
              <div className="term-date">
                <label>
                  Term Begin Date:
                  <input
                    type="date"
                    value={termBeginDate}
                    onChange={(e) => setTermBeginDate(e.target.value)}
                  />
                </label>
                <label>
                  Full Begin Date:
                  <input
                    type="text"
                    value={formatDateString(termBeginDate)}
                    readOnly
                  />
                </label>
              </div>
              <div className="term-date">
                <label>
                  Term End Date:
                  <input
                    type="date"
                    value={termEndDate}
                    onChange={(e) => setTermEndDate(e.target.value)}
                  />
                </label>
                <label>
                  Full End Date:
                  <input
                    type="text"
                    value={formatDateString(termEndDate)}
                    readOnly
                  />
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div className="termly-buttons">
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default TermlyDetails;
