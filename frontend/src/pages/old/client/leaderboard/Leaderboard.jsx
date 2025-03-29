import React, { useState, useEffect } from "react";
import axios from "../../../api/axios";
import "./Leaderboard.modules.css";
import Side from "../../../components/Side2";


const Leaderboard = () => {
  const [userRanking, setUserRanking] = useState(null);
  const [topRankings, setTopRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Fetch user rank
        const userResponse = await axios.get("/api/leaderboard/user-ranking");
        setUserRanking(userResponse.data);

        // Fetch top 10 rankings
        const topResponse = await axios.get("/api/leaderboard/top-ranking");
        setTopRankings(topResponse.data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  return (
    <div className="lp">
        <Side />
<div className="leaderboard-page">
      <h1 className="leaderboard-title">Leaderboard</h1>
      <div className="leaderboard-container">
        {/* User Ranking Table */}
        <div className="table-container">
          <h2>Your Ranking</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Friends Invited</th>
                <th>Total XP</th>
              </tr>
            </thead>
            <tbody>
              {userRanking ? (
                <tr>
                  <td>{userRanking.rank}</td>
                  <td>{userRanking.username}</td>
                  <td>{userRanking.friendsInvited}</td>
                  <td className="xp-color">{userRanking.totalXP}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="4">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Overall Ranking Table */}
        <div className="table-container">
          <h2>Overall</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Friends Invited</th>
                <th>Total XP</th>
              </tr>
            </thead>
            <tbody>
              {topRankings.length > 0 ? (
                topRankings.map((user, index) => (
                  <tr key={index}>
                    <td>{user.rank}</td>
                    <td>{user.username}</td>
                    <td>{user.friendsInvited}</td>
                    <td className="xp-color">{user.totalXP}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default Leaderboard;
