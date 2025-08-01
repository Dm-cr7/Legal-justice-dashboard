import React from "react";
import PropTypes from "prop-types";

export default function AnalyticsCards({ pending = 0, inProgress = 0, done = 0 }) {
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
          padding: 0 1rem;
        }

        @media (min-width: 640px) {
          .analytics-cards {
            grid-template-columns: repeat(3, 1fr);
            padding: 0;
          }
        }

        .card {
          background-color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          transition: box-shadow 0.2s ease;
          text-align: center;
        }

        .card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }

        .card h2 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
        }

        .card p {
          font-size: 2rem;
          font-weight: bold;
          color: #1a73e8;
          margin: 0;
        }

        @media (prefers-color-scheme: dark) {
          .card {
            background-color: #1f2937;
            border-color: #374151;
          }

          .card h2 {
            color: #f9fafb;
          }

          .card p {
            color: #60a5fa;
          }
        }
      `}</style>
    </>
  );
}

AnalyticsCards.propTypes = {
  pending: PropTypes.number,
  inProgress: PropTypes.number,
  done: PropTypes.number,
};
