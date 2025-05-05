import React from "react";
import "./Income.modules.css";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";

const IncomeStatement = () => {
  // Dummy data – replace with real data or props
  const incomeItems = [
    { label: "Tuition Fees", amount: 500000 },
    { label: "Feeding Fees", amount: 200000 },
    { label: "Donations", amount: 75000 },
    { label: "Grants", amount: 45000 },
  ];

  const expenseItems = [
    { label: "Salaries", amount: 300000 },
    { label: "Utilities", amount: 40000 },
    { label: "Postage", amount: 40000 },
    { label: "Telephone", amount: 40000 },
    { label: "Stationery", amount: 40000 },
    { label: "Cleaning and Sanitation", amount: 40000 },
    { label: "Depreciation", amount: 40000 },
    { label: "Transport", amount: 40000 },
    { label: "Feeding cost", amount: 40000 },
    { label: "Maintenance", amount: 25000 },
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = totalIncome;
  const netProfit = totalIncome - totalExpenses;

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
          <span>GHC{grossProfit.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Tax:</span>
          <span>GHC{grossProfit.toLocaleString()}</span>
        </div>
        <div className="summary-row net-profit">
          <span>Net Profit After Tax:</span>
          <span>GHC{netProfit.toLocaleString()}</span>
        </div>
      </div>
    </div>
    </div>
  );
};

export default IncomeStatement;
