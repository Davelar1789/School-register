"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

export default function LineChart(
  {
    // subjects,
    // marks,
    // sem,
    // borderCol,
    // backgroundCol,
  }
) {
  const sem = "Sales with in the week";
  const subjects = ["", "Mon", "Tues", "Wed", "Thurs", "Fri"];
  const marks = [0, 90, 87, 75, 90, 100];
  const borderCol = "rgb(53, 162, 235)";
  const backgroundCol = "rgba(53, 162, 235, 0.5)";
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options: any = {
    tension: 0.3,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: false,
        text: "Performance",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const labels = subjects;
  const data = {
    labels,
    datasets: [
      {
        label: sem,
        data: marks,
        borderColor: borderCol,
        backgroundColor: backgroundCol,
      },
    ],
  };

  return (
    <>
      <Line className="h-[300px]" options={options} data={data} />
    </>
  );
}
