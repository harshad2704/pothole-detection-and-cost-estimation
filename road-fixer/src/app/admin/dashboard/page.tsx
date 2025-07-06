"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AlertTriangle, FileText, Wrench } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  // State to hold the data
  const [dashboardData, setDashboardData] = useState({
    totalPotholesDetected: 120,
    totalReportsGenerated: 45,
    totalRepairsCompleted: 30,
  });
  const [volumeData, setVolumeData] = useState([]);
  const [potholeCounts, setPotholeCounts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/api/dashboard");
        setDashboardData({
          totalPotholesDetected: response.data.potholesDetected || 120,
          totalReportsGenerated: response.data.reportsGenerated || 45,
          totalRepairsCompleted: response.data.repairsCompleted || 30,
        });

        // Fetch all report files to get the accurate volume data
        const reportsResponse = await axios.get("/api/reports");
        if (reportsResponse.data.reports) {
          // Fetch data for each report
          const reportDetailsPromises = reportsResponse.data.reports.map(
            (reportName) => axios.get(`/api/reports/${reportName}`)
          );

          const reportResults = await Promise.all(reportDetailsPromises);

          // Process each report to extract total volume and pothole counts
          const volumeTotals = [];
          const countData = [];
          
          reportResults.forEach((result, index) => {
            const data = result.data.data;
            const reportName = reportsResponse.data.reports[index];

            // Find the total row (which has id === 'Total')
            const totalRow = data.find((row) => row.id === "Total");
            const totalVolume = totalRow ? totalRow.volume : 0;
            
            // Count potholes (exclude the Total row) and reduce by 1 as requested
            const potholeCount = Math.max(0, data.filter(row => row.id !== "Total").length - 1);

            volumeTotals.push({
              fileName: reportName,
              totalVolume: totalVolume,
            });
            
            countData.push({
              fileName: reportName,
              potholeCount: potholeCount
            });
          });

          setVolumeData(volumeTotals);
          setPotholeCounts(countData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch dashboard data!");
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-base-300">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg mb-6">
        Welcome to the admin dashboard. Manage pothole detection, monitor
        repairs, and generate reports from here.
      </p>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg flex items-center justify-between bg-accent text-accent-content">
          <AlertTriangle width={30} />
          <h2 className="text-xl font-semibold">Total Potholes Detected</h2>
          <p className="text-2xl font-bold">
            {dashboardData.totalPotholesDetected}
          </p>
        </div>
        <div className="p-4 rounded-lg flex items-center justify-between bg-accent text-accent-content">
          <FileText width={30} />
          <h2 className="text-xl font-semibold">Total Reports Generated</h2>
          <p className="text-2xl font-bold">
            {dashboardData.totalReportsGenerated}
          </p>
        </div>
        <div className="p-4 rounded-lg flex items-center justify-between bg-accent text-accent-content">
          <Wrench width={30} />
          <h2 className="text-xl font-semibold">Repairs Completed</h2>
          <p className="text-2xl font-bold">
            { dashboardData.totalPotholesDetected/dashboardData.totalReportsGenerated}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-base-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Pothole Count by Report</h2>
          <div className="w-full">
            <Bar
              data={{
                labels: potholeCounts.map((item) => item.fileName),
                datasets: [
                  {
                    label: "Number of Potholes",
                    data: potholeCounts.map((item) => item.potholeCount),
                    backgroundColor: "#f87171",
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Count",
                    },
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Reports",
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-base-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Volume and Cost Comparison
          </h2>
          <div className="w-full">
            <Bar
              data={{
                labels: volumeData.map((item) => item.fileName),
                datasets: [
                  {
                    label: "Volume (cm³)",
                    data: volumeData.map((item) => item.totalVolume),
                    backgroundColor: "#60a5fa",
                  },
                  {
                    label: "Cost (₹)",
                    data: volumeData.map((item) => item.totalVolume * 2),
                    backgroundColor: "#34d399",
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Value",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Reports",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-base-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Total Volume and Costs</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Report Name</th>
                <th className="px-4 py-2">Potholes Count</th>
                <th className="px-4 py-2">Total Volume (cm³)</th>
                <th className="px-4 py-2">Total Maintenance Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {volumeData.map(({ fileName, totalVolume }, index) => {
                const potholeCount = potholeCounts.find(item => item.fileName === fileName)?.potholeCount || 0;
                return (
                  <tr key={index}>
                    <td className="border px-4 py-2">{fileName}</td>
                    <td className="border px-4 py-2">{potholeCount}</td>
                    <td className="border px-4 py-2">
                      {totalVolume.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2">
                      ₹{(totalVolume * 2).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
