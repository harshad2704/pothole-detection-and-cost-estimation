"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import toast from "react-hot-toast";

const GenerateReport = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("/api/reports");
        setReports(response.data.reports);
      } catch (error) {
        toast.error("Failed to fetch reports.");
      }
    };

    fetchReports();
  }, []);

  const fetchReportData = async () => {
    if (!selectedReport) {
      toast.error("Please select a report.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`/api/reports/${selectedReport}`);
      setReportData(response.data.data);
      toast.success("Report data loaded.");
    } catch (error) {
      toast.error("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  // Generate the PDF
  const generatePDF = () => {
    if (reportData.length === 0) {
      toast.error("No data available to generate the report.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Pothole Report", 10, 10);

    // Table headers and rows
    const tableHeaders = [
      "Pothole ID",
      "Length (cm)",
      "Breadth (cm)",
      "Depth (cm)",
      "Volume (cm³)"
    ];
    const tableRows = reportData.map((row) => {
      // Check if the row is the total row
      if (row.id === 'Total') {
        return [
          'Total',
          '-',
          '-',
          '-',
          (row.volume || 0).toFixed(2)
        ];
      }
      // Format the row data if the row is either a blank row or a data row
      return [
          row.id,
          row.length != null ? row.length.toFixed(2) : "",
          row.breadth != null ? row.breadth.toFixed(2) : "",
          row.depth != null ? row.depth.toFixed(2) : "",
          row.volume != null ? row.volume.toFixed(2) : ""
        ];

    });

    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${selectedReport}_report.pdf`);
    toast.success("PDF generated successfully!");
  };

  return (
    <div className="p-6 bg-base-300 min-h-[90vh] flex items-center justify-center flex-col gap-6">
      <h1 className="text-3xl font-bold mb-4">Generate Pothole Report</h1>
      <p className="text-lg mb-6">
        Select a report and generate a PDF with detailed information.
      </p>

      {/* Dropdown to select report */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select Report</label>
        <select
          className="select select-bordered w-full max-w-md"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
        >
          <option value="" disabled>
            Choose a report
          </option>
          {reports.map((report) => (
            <option key={report} value={report}>
              {report}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          className={`btn ${loading ? "btn-disabled" : "btn-primary"}`}
          onClick={fetchReportData}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Report"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={generatePDF}
          disabled={reportData.length === 0}
        >
          Generate PDF
        </button>
      </div>

      {/* Display Report Data */}
      {reportData.length > 0 && (
        <div className="bg-base-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Report Data</h2>
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Length (cm)</th>
                <th>Breadth (cm)</th>
                <th>Depth (cm)</th>
                <th>Volume (cm³)</th>
              </tr>
            </thead>
            
            <tbody>

              {reportData.map((row) => {
                if (row.id === 'Total') {
                  return (
                    <tr key="total" className="font-bold">
                      <td>Total</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>{(row.volume || 0).toFixed(2)}</td>
                    </tr>
                  );
                }
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.length != null ? row.length.toFixed(2) : ""}</td>
                    <td>{row.breadth != null ? row.breadth.toFixed(2) : ""}</td>
                    <td>{row.depth != null ? row.depth.toFixed(2) : ""}</td>
                    <td>{row.volume != null ? row.volume.toFixed(2) : ""}</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;
