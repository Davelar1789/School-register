import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";
import "./MainPage.modules.css";

const Fees = () => {
  const navigate = useNavigate();


  const handleNavigate = (route) => {

    navigate(route);
  };

  return (
    <div className="main-page-container">
      <Sidebar />
      <div className="fees-main2">
        <Header />
        <div className="fees-content">
          <h1 className="fees-title">Classes and Subjects</h1>
          <div className="fees-options">
            <div
              className="fees-box school-fees"
              onClick={() => handleNavigate("/classes")}
            >
              <h2>Classes</h2>
              <p>Manage and view classes in your institution</p>
            </div>

            <div
              className="fees-box feeding-fee"
              onClick={() => handleNavigate("/subjects")}
            >
              <h2>Subjects</h2>
              <p>Track and manage all subjects taught</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fees;
