import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Download, Filter, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [generatedReports, setGeneratedReports] = useState([
    { id: 'rep1', name: 'Q2 Case Status Summary', date: '2025-06-30', type: 'PDF', size: '2.1 MB' },
    { id: 'rep2', name: 'May Client Billing Report', date: '2025-06-01', type: 'CSV', size: '450 KB' },
    { id: 'rep3', name: 'Q1 Performance Analytics', date: '2025-04-02', type: 'PDF', size: '5.5 MB' },
  ]);

  const onGenerateReport = async (data) => {
    await new Promise(res => setTimeout(res, 2000));
    const newReport = {
      id: `rep${Date.now()}`,
      name: `${data.reportType} Report`,
      date: new Date().toISOString().split('T')[0],
      type: data.format,
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`
    };
    setGeneratedReports(prev => [newReport, ...prev]);
  };

  return (
    <div className="reports-page">
      <h1>Reports</h1>
      <p className="subtitle">Generate and download system reports</p>

      <div className="grid-container">
        {/* Report Generator */}
        <div className="form-card">
          <div className="form-header">
            <Filter size={20} className="icon" />
            <h2>Generate New Report</h2>
          </div>
          <form onSubmit={handleSubmit(onGenerateReport)}>
            <label>Report Type</label>
            <select {...register("reportType")} required>
              <option>Case Status Summary</option>
              <option>Client Billing</option>
              <option>Task Productivity</option>
              <option>Performance Analytics</option>
            </select>

            <label>Date Range</label>
            <select {...register("dateRange")} required>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Last Quarter</option>
            </select>

            <label>Format</label>
            <select {...register("format")} required>
              <option>PDF</option>
              <option>CSV</option>
            </select>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="spinner" />
                  Generating...
                </>
              ) : "Generate Report"}
            </button>
          </form>
        </div>

        {/* Generated Reports List */}
        <div className="report-list">
          {isSubmitting && (
            <div className="loading-banner">
              <Loader2 className="spinner" />
              Generating your new report...
            </div>
          )}
          {generatedReports.map(report => (
            <div className="report-item" key={report.id}>
              <div className="info">
                <FileText className="report-icon" />
                <div>
                  <div className="title">{report.name}</div>
                  <div className="details">
                    Generated on {new Date(report.date).toLocaleDateString()} • {report.type} • {report.size}
                  </div>
                </div>
              </div>
              <button className="download-button">
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .reports-page {
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          background: #f9fafb;
        }

        h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .grid-container {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }

        .form-card {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .form-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .form-header .icon {
          margin-right: 0.5rem;
          color: #3b82f6;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
        }

        select {
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        button[type="submit"] {
          background-color: #2563eb;
          color: white;
          padding: 0.6rem 1rem;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-banner {
          padding: 0.75rem;
          background-color: #eff6ff;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #2563eb;
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .report-list {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .report-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .report-item:last-child {
          border-bottom: none;
        }

        .info {
          display: flex;
          align-items: center;
        }

        .report-icon {
          color: #3b82f6;
          margin-right: 0.75rem;
        }

        .title {
          font-weight: 600;
          color: #1e293b;
        }

        .details {
          font-size: 0.8rem;
          color: #64748b;
        }

        .download-button {
          background-color: #f1f5f9;
          border: none;
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          color: #1e293b;
          cursor: pointer;
        }

        .download-button svg {
          margin-right: 0.25rem;
        }
      `}</style>
    </div>
  );
}
