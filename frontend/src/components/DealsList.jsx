/* eslint-disable react/prop-types */
import { useState } from "react";
import "./DealsList.css";

const dealsData = {
  January: [
    {
      productName: "Reflector",
      location: "6096 Marjolaine Landing",
      date: "12.01.2024",
      time: "12.53 PM",
      piece: 423,
      amount: "$34,295",
      status: "Delivered",
    },
    {
      productName: "Helmet",
      location: "1234 Main St",
      date: "15.01.2024",
      time: "10.00 AM",
      piece: 150,
      amount: "$15,000",
      status: "Pending",
    },
  ],
  February: [
    {
      productName: "Gloves",
      location: "9876 Elm St",
      date: "05.02.2024",
      time: "03.15 PM",
      piece: 200,
      amount: "$20,000",
      status: "Delivered",
    },
    {
      productName: "Fire Alarm",
      location: "4567 Oak St",
      date: "25.02.2024",
      time: "11.30 AM",
      piece: 100,
      amount: "$10,000",
      status: "Pending",
    },
  ],
  March: [
    {
      productName: "Fire Extinguisher",
      location: "3210 Pine St",
      date: "10.03.2024",
      time: "01.45 PM",
      piece: 50,
      amount: "$50,000",
      status: "Delivered",
    },
  ],
  April: [],
  May: [],
  June: [
    {
      productName: "Earmuffs",
      location: "8765 Maple St",
      date: "20.06.2024",
      time: "04.00 PM",
      piece: 300,
      amount: "$9,000",
      status: "Pending",
    },
  ],
  July: [],
  August: [],
  September: [],
  October: [],
  November: [],
  December: [],
};

const getMonthName = (monthIndex) => {
  return new Date(2024, monthIndex).toLocaleString("default", {
    month: "long",
  });
};

const DealsList = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthName(new Date().getMonth())
  );
  const [deals, setDeals] = useState(dealsData[selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setDeals(dealsData[event.target.value]);
  };

  return (
    <div className="deals-list ">
      <div className="deals-list-header">
        <h2>Deals Details</h2>
        <div className="month-selector">
          <select value={selectedMonth} onChange={handleMonthChange}>
            {Object.keys(dealsData).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Location</th>
            <th>Date - Time</th>
            <th>Piece</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 ? (
            <tr>
              <td colSpan="6">No deals available for {selectedMonth}</td>
            </tr>
          ) : (
            deals.map((deal, index) => (
              <tr key={index}>
                <td>{deal.productName}</td>
                <td>{deal.location}</td>
                <td>
                  {deal.date} - {deal.time}
                </td>
                <td>{deal.piece}</td>
                <td>{deal.amount}</td>
                <td>
                  <span className={`status ${deal.status.toLowerCase()}`}>
                    {deal.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DealsList;
