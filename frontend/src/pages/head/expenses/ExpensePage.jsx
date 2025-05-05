import React, { useState, useEffect } from "react";
import "./Expense.modules.css";
import Header from "../../../components/Admin/Header2";
import Sidebar from "../../../components/Admin/Sidebar";
import api from "../../../api/axios"; // <-- make sure this points to your Axios instance

const ExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const schoolData = JSON.parse(localStorage.getItem("schoolData"));
  const schoolId = schoolData?._id;

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!schoolId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await api.get(`/api/expenses/${schoolId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExpenses(response.data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Failed to load expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [schoolId]);

  const handleInputChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async () => {
    const { date, description, category, amount } = newExpense;
    if (!date || !description || !category || !amount) return;

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/expenses/create",
        { date, description, category, amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses([response.data, ...expenses]);
      setNewExpense({ date: "", description: "", category: "", amount: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Failed to add expense.");
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="expenses-container">
        <div className="expenses-header">
          <h2>Expenses</h2>
          <button className="add-expense-btn" onClick={() => setIsModalOpen(true)}>
            Add Expense
          </button>
        </div>

        {loading ? (
          <p>Loading expenses...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount (GHC)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No expenses recorded.
                  </td>
                </tr>
              ) : (
                expenses.map((expense, index) => (
                  <tr key={index}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>{parseFloat(expense.amount).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Expense</h3>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={newExpense.date}
                onChange={handleInputChange}
              />
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="category" value={newExpense.category} onChange={handleInputChange}>
                <option value="">Select category</option>
                <option value="Salaries">Salaries</option>
                <option value="Utilities">Utilities</option>
                <option value="Stationery">Stationery</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Feeding">Feeding</option>
                <option value="Transport">Transport</option>
                <option value="Other">Other</option>
              </select>
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={newExpense.amount}
                onChange={handleInputChange}
              />
              <div className="modal-buttons">
                <button className="save-btn" onClick={handleAddExpense}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
