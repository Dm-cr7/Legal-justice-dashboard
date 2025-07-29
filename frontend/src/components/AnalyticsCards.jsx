// src/components/AnalyticsCards.jsx
import React from "react";

export default function AnalyticsCards({ pending, inProgress, done }) {
  return (
    <>
      <div className="analytics-cards">
        <div className="card">
          <h2>Pending</h2>
          <p>{pending}</p>
        </div>
        <div className="card">
          <h2>In Progress</h2>
          <p>{inProgress}</p>
        </div>
        <div className="card">
          <h2>Done</h2>
          <p>{done}</p>
        </div>
      </div>

      <style jsx>{`
        .analytics-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (min-width: 640px) {
          .analytics-cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .card {
          background-color: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #e0e0e0;
          transition: box-shadow 0.2s ease;
        }

        .card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }

        .card h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }

        .card p {
          font-size: 28px;
          font-weight: bold;
          color: #1a73e8;
        }

        @media (prefers-color-scheme: dark) {
          .card {
            background-color: #1f2937;
            border-color: #374151;
          }

          .card h2 {
            color: #f3f4f6;
          }

          .card p {
            color: #60a5fa;
          }
        }
      `}</style>
    </>
  );
}
