import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

// Register necessary chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const LineGraph = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Earnings From Appointments",
        data: [200000, 400000, 300000, 700000, 1000000, 800000, 500000, 600000, 400000, 900000, 1200000, 200000],
        fill: true, // This enables the fill under the line
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(0, 123, 255, 0.5)"); // Light blue at the top
          gradient.addColorStop(1, "rgba(0, 123, 255, 0)"); // Transparent at the bottom
          return gradient;
        },
        borderColor: "rgba(0, 123, 255, 1)", // Line color
        borderWidth: 2,
        pointBackgroundColor: "rgba(0, 123, 255, 1)", // Point color
        tension: 0.4, // Line curve
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(200, 200, 200, 0.2)", // Light y-axis grid lines
        },
        ticks: {
          callback: (value) => value.toLocaleString(), // Format y-axis values
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend if not needed
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineGraph;
