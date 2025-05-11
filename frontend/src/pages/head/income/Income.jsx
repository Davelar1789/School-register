import React, { useEffect, useState } from 'react';
import './Income.modules.css';
import Header from '../../../components/Admin/Header2';
import Sidebar from '../../../components/Admin/Sidebar';
import api from '../../../api/axios';

const IncomeStatement = () => {
  const [tuitionFee, setTuitionFee] = useState(0);
  const [feedingFeeTotal, setFeedingFeeTotal] = useState(0); // ✅ Added state
  const [expenseTotals, setExpenseTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const schoolData = JSON.parse(localStorage.getItem('schoolData'));
  const schoolId = schoolData?._id;

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId) {
        setError('School ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');

        // ✅ Fetch all required data
        const [tuitionRes, feedingRes, expensesRes] = await Promise.all([
          api.get(`/api/fees/total-paid/${schoolId}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/api/feeding/total-income/${schoolId}`, { headers: { Authorization: `Bearer ${token}` } }), // ✅ Fetch total feeding fees paid
          api.get(`/api/expenses/category-totals/${schoolId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        console.log("Tuition fees response:", tuitionRes.data);
        console.log("Feeding fees response:", feedingRes.data);
        console.log("Expenses response:", expensesRes.data);

        setTuitionFee(tuitionRes.data.totalFeesPaid || 0);
        setFeedingFeeTotal(feedingRes.data.totalFeedingPaid || 0); // ✅ Set total feeding fees paid
        setExpenseTotals(expensesRes.data || {});

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load income statement data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  if (loading) return <p>Loading income statement...</p>;
  if (error) return <p>{error}</p>;

  const incomeItems = [
    { label: 'Tuition Fees', amount: tuitionFee },
    { label: 'Feeding Fees', amount: feedingFeeTotal }, // ✅ Updated feeding fee amount
    { label: 'Donations', amount: 0 },
    { label: 'Grants', amount: 0 },
  ];

  const expenseCategories = [
    'Salaries', 'Utilities', 'Postage', 'Telephone', 'Stationery', 'Cleaning and Sanitation',
    'Depreciation', 'Transport', 'Feeding cost', 'Maintenance', 'Other',
  ];

  const expenseItems = expenseCategories.map((category) => ({
    label: category,
    amount: expenseTotals[category] || 0,
  }));

  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const tax = 250;
  const netProfitAfterTax = netProfit - tax;

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
              <span>GHC {item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="statement-total">
            <strong>Total Revenue</strong>
            <strong>GHC {totalIncome.toLocaleString()}</strong>
          </div>
        </div>

        <div className="statement-section">
          <h3><strong>Operating Expenses</strong></h3>
          {expenseItems.map((item, index) => (
            <div key={index} className="statement-row">
              <span>{item.label}</span>
              <span>GHC {item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="statement-total">
            <strong>Total Operating Expenses</strong>
            <strong>GHC {totalExpenses.toLocaleString()}</strong>
          </div>
        </div>

        <div>
          <div className="summary-row">
            <span>Net Profit Before Tax</span>
            <span>GHC {netProfit.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>GHC {tax.toLocaleString()}</span>
          </div>
          <div className="summary-row net-profit">
            <span>Net Profit After Tax</span>
            <span>GHC {netProfitAfterTax.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;