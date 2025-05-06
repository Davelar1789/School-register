import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import { toast } from "react-hot-toast";
import "./MainPage.modules.css";

const Fees = () => {
  const navigate = useNavigate();


  const handleNavigate = (route) => {
    if (route === "/feeding-fee") {
      toast.info("Page under maintenance. Try again later", {
      });
      return;
    }

    navigate(route);
  };

  return (
    <div className="main-page-container">
      <Sidebar />
      <div className="fees-main2">
        <Header />
        <div className="fees-content">
          <h1 className="fees-title">Fees</h1>
          <div className="fees-options">
            <div
              className="fees-box school-fees"
              onClick={() => handleNavigate("/school-fees")}
            >
              <h2>School Fees</h2>
              <p>Manage and view all academic fee payments</p>
            </div>

            <div
              className="fees-box feeding-fee"
              onClick={() => handleNavigate("/feeding-fee")}
            >
              <h2>Feeding Fee</h2>
              <p>Track and manage students' meal payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fees;
