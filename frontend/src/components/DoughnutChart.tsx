"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

const DoughnutChart = () => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    ArcElement,
    Title,
    Legend
  );
  const data = {
    labels: ["PPE", "Fall Protection", "Fire Safety"],
    datasets: [
      {
        label: "My First Dataset",
        data: [300, 50, 100],
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top Category Sales",
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <>
      <Doughnut height={300} data={data} options={options} />
    </>
  );
};

export default DoughnutChart;
