/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./SalesChart.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const monthData = {
  January: [30, 45, 28, 50, 45, 40, 35, 60, 30, 40, 50, 30],
  February: [25, 35, 20, 45, 40, 35, 30, 55, 25, 35, 45, 25],
  March: [20, 30, 15, 40, 35, 30, 25, 50, 20, 30, 40, 20],
  April: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  May: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  June: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  July: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  August: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  September: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  October: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  November: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  December: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const getMonthName = (monthIndex) => {
  return new Date(2024, monthIndex).toLocaleString("default", {
    month: "long",
  });
};

const SalesChart = () => {
  const chartRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState(
    getMonthName(new Date().getMonth())
  );
  const [chartData, setChartData] = useState(monthData[selectedMonth]);

  useEffect(() => {
    const chart = chartRef.current;

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  useEffect(() => {
    setChartData(monthData[selectedMonth]);
  }, [selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const createGradient = (ctx, area) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, "#BFE8FF");
    return gradient;
  };

  const data = {
    labels: [
      "5k",
      "10k",
      "15k",
      "20k",
      "25k",
      "30k",
      "35k",
      "40k",
      "45k",
      "50k",
      "55k",
      "60k",
    ],
    datasets: [
      {
        label: "Sales",
        data: chartData,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            // This case happens on initial chart load
            return null;
          }
          return createGradient(ctx, chartArea);
        },
        borderColor: "#3498db",
        pointBackgroundColor: "#3498db",
        pointBorderColor: "#3498db",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.2, // Add some curve to the line
      },
    },
  };

  return (
    <div className="sales-chart">
      <div className="sales-chart-header">
        <h2>Sales Details</h2>
        <div className="month-selector">
          <select value={selectedMonth} onChange={handleMonthChange}>
            {Object.keys(monthData).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default SalesChart;
