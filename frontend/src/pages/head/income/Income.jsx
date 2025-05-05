import React from "react";
import "./Income.modules.css";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import api from "../../../api/axios";

const IncomeStatement = () => {
  // Dummy data – replace with real data or props
  const incomeItems = [
    { label: "Tuition Fees", amount: 500 },
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


  return (
    <div>
        <Header />
        <Sidebar />
    <div className="income-statement">
      <h2>Income Statement</h2>

      <div className="statement-section">
        <h3>Income</h3>
        {incomeItems.map((item, index) => (
          <div key={index} className="statement-row">
            <span>{item.label}</span>
            <span>GHC{item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="statement-total">
          <strong>Total Income:</strong>
          <strong>GHC{totalIncome.toLocaleString()}</strong>
        </div>
      </div>

      <div className="statement-section">
        <h3>Expenses</h3>
        {expenseItems.map((item, index) => (
          <div key={index} className="statement-row">
            <span>{item.label}</span>
            <span>GHC{item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="statement-total">
          <strong>Total Expenses:</strong>
          <strong>GHC{totalExpenses.toLocaleString()}</strong>
        </div>
      </div>

      <div className="statement-summary">
        <div className="summary-row">
          <span>Net Profit Before Tax:</span>
          <span>GHC{netProfit.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Tax:</span>
          <span>GHC{tax.toLocaleString()}</span>
        </div>
        <div className="summary-row net-profit">
          <span>Net Profit After Tax:</span>
          <span>GHC{netProfitaftertax.toLocaleString()}</span>
        </div>
      </div>
    </div>
    </div>
  );
};

export default IncomeStatement;
