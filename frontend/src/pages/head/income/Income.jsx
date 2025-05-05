import React, { useEffect, useState } from "react";
import "./Income.modules.css";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import api from "../../../api/axios";

const IncomeStatement = () => {
  const [tuitionFee, setTuitionFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract schoolId from cached localStorage
  const schoolData = JSON.parse(localStorage.getItem("schoolData"));
  const schoolId = schoolData?._id; // Adjust key based on actual data

  const incomeItems = [
    { label: "Tuition Fees", amount: tuitionFee },
    { label: "Feeding Fees", amount: 200 },
    { label: "Donations", amount: 500 },
    { label: "Grants", amount: 400 },
  ];

  const expenseItems = [
    { label: "Salaries", amount: 300 },
    { label: "Utilities", amount: 50 },
    { label: "Postage", amount: 50 },
    { label: "Telephone", amount: 50 },
    { label: "Stationery", amount: 50 },
    { label: "Cleaning and Sanitation", amount: 50 },
    { label: "Depreciation", amount: 50 },
    { label: "Transport", amount: 50 },
    { label: "Feeding cost", amount: 50 },
    { label: "Maintenance", amount: 50 },
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = totalIncome;
  const netProfit = totalIncome - totalExpenses;
  const tax = 250;
  const netProfitaftertax = netProfit - tax;

  useEffect(() => {
    const fetchTuitionFees = async () => {
      if (!schoolId) {
        setError("School ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/fees/total-paid/${schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTuitionFee(response.data.totalFeesPaid || 0);
      } catch (err) {
        console.error("Error fetching tuition fees:", err);
        setError("Failed to load tuition fees");
      } finally {
        setLoading(false);
      }
    };

    fetchTuitionFees();
  }, [schoolId]);

  if (loading) return <p>Loading income statement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="income-statement">
        <h2><strong>Income Statement For The Year Ending 31st August, 2025</strong></h2>

        <div className="statement-section">
          <h3><strong>Revenue</strong></h3>
          {incomeItems.map((item, index) => (
            <div key={index} className="statement-row">
              <span>{item.label}</span>
              <span>GHC{item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="statement-total">
            <strong>Total Revenue</strong>
            <strong>GHC{totalIncome.toLocaleString()}</strong>
          </div>
        </div>

        <div className="statement-section">
          <h3><strong>Operating Expenses</strong></h3>
          {expenseItems.map((item, index) => (
            <div key={index} className="statement-row">
              <span>{item.label}</span>
              <span>GHC{item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="statement-total">
            <strong>Total Operating Expenses</strong>
            <strong>GHC{totalExpenses.toLocaleString()}</strong>
          </div>
        </div>

        <div>
          <div className="summary-row">
            <span>Net Profit Before Tax</span>
            <span>GHC{netProfit.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>GHC{tax.toLocaleString()}</span>
          </div>
          <div className="summary-row net-profit">
            <span>Net Profit After Tax</span>
            <span>GHC{netProfitaftertax.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
