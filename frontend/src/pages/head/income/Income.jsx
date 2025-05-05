import React from "react";
import "./Income.modules.css";

const IncomeStatement = () => {
  // Dummy data – replace with real data or props
  const incomeItems = [
    { label: "Tuition Fees", amount: 500000 },
    { label: "Donations", amount: 75000 },
    { label: "Grants", amount: 45000 },
  ];

  const expenseItems = [
    { label: "Salaries", amount: 300000 },
    { label: "Utilities", amount: 40000 },
    { label: "Maintenance", amount: 25000 },
  ];

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const grossProfit = totalIncome;
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="income-statement">
      <h2>Income Statement</h2>

      <div className="statement-section">
        <h3>Income</h3>
        {incomeItems.map((item, index) => (
          <div key={index} className="statement-row">
            <span>{item.label}</span>
            <span>₦{item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="statement-total">
          <strong>Total Income:</strong>
          <strong>₦{totalIncome.toLocaleString()}</strong>
        </div>
      </div>

      <div className="statement-section">
        <h3>Expenses</h3>
        {expenseItems.map((item, index) => (
          <div key={index} className="statement-row">
            <span>{item.label}</span>
            <span>₦{item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="statement-total">
          <strong>Total Expenses:</strong>
          <strong>₦{totalExpenses.toLocaleString()}</strong>
        </div>
      </div>

      <div className="statement-summary">
        <div className="summary-row">
          <span>Gross Profit:</span>
          <span>₦{grossProfit.toLocaleString()}</span>
        </div>
        <div className="summary-row net-profit">
          <span>Net Profit:</span>
          <span>₦{netProfit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
