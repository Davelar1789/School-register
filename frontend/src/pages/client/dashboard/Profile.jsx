import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import './Profile.modules.css';
import { FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Side from "../../../components/Side2";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [rankData, setRankData] = useState({ rank: null, totalUsers: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/user-info');
        setUserData(response.data.data);

        // Fetch user's rank
        const rankResponse = await axios.get('/api/profile/rank');
        setRankData(rankResponse.data);
      } catch (error) {
        toast.error('Failed to load user or rank data.');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.put(
        '/api/profile/update-profile',
        {
          username: userData.username,
          xp: userData.stats?.xp,
          email: userData.email,
        },
        { withCredentials: true }
      );
      toast.success(response.data.message || 'Profile updated successfully!');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message === "Username is already taken") {
        toast.error("This username is already taken. Please choose a different one.");
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile.');
      }
      console.error('Error updating profile:', error);
    }
  };
  

  const handleCopyReferral = () => {
    const referralLink = `${window.location.origin}/sign-up?ref=${userData?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const getOrdinalSuffix = (rank) => {
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <Side />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-picture-container">
            <img
              src={userData.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-picture"
            />
          </div>
          <div className="profile-header-details">
            <h1 className="profile-name">{userData.username}</h1>
            <div className="xp-card2">
              {userData?.stats?.xp || 0} XP
            </div>
          </div>
        </div>
        <hr className="divider" />
        <div className="profile-fields">
          <div className="field-group">
            <label>Username:</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
            />
                    <button className="save-button" onClick={handleSave}>Save</button>
          </div>
          <div className="field-group">
            <label>Email:</label>
            <input
              type="text"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled
            />
          </div>
        </div>
        <hr className="divider" />
        <div className="extra-section">
          <div className="referrals">
            <h2>Referrals</h2>
            <div className="underline"></div>
            <p>Invite friends and earn points when they signup</p>
            <button className="referral-button" onClick={handleCopyReferral}>
              Copy referral link
            </button>
          </div>
          <div className="leaderboard">
            <h2>Leaderboard</h2>
            <div className="underline"></div>
            <p>
              You are currently {rankData.rank}
              {getOrdinalSuffix(rankData.rank)} on the leaderboard
            </p>
            <Link to="/leaderboard">
              <button className="leaderboard-button">Check leaderboard</button>
            </Link>
          </div>
        </div>
        <div className="stats-box">
          <h2>Overall Stats</h2>
          <p><strong>XP:</strong> {userData.stats?.xp || 0}</p>
          <p><strong>Courses Enrolled:</strong> {userData.stats?.coursesEnrolled || 0}</p>
          <p><strong>Courses Completed:</strong> {userData.stats?.coursesCompleted || 0}</p>
          <p><strong>Friends Referred:</strong> {userData?.referrals || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
