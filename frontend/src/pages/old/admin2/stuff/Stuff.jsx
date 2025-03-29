import { useEffect, useState } from "react";
import "./Team1.modules.css";
import axios from '../../../api/axios';
import TeamForm from "./TeamForm";

const Stuff = () => {
  const [stuffInfo, setStuffInfo] = useState();
  const [toggleTeamForm, setToggleTeamForm] = useState(true);

  const fetchStuffInfo = async () => {
    await axios
      .get("/api/admin/stuff/view-members", { withCredentials: true })
      .then((res) => {
        setStuffInfo(res.data.data);
      });
  };

  useEffect(() => {
    fetchStuffInfo();
  }, []);

  const handleToggle = () => {
    setToggleTeamForm(!toggleTeamForm);
  };

  return (
    <div className="team1-page">
      <div className="team1-content">
        <main className="main-content">
          <div className="header-section">
            <h2>Team</h2>
            <button onClick={handleToggle} className="add-member-button">
              {toggleTeamForm ? "Manage Stuff" : "View Stuff"}
            </button>
          </div>
          {toggleTeamForm ? (
            <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
              {stuffInfo?.map((member, index) => (
                <div
                  className="team-card flex-col justify-center items-center"
                  key={index}
                >
                  <div className="flex items-center justify-center">
                    <img
                      src={member.profilePicture}
                      alt={member.name}
                      className="team-card-img"
                    />
                  </div>
                  <h4 className="truncate">{member.username}</h4>
                  <p>{member.role}</p>
                  <p className="truncate">{member.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <TeamForm />
          )}
        </main>
      </div>
    </div>
  );
};

export default Stuff;
