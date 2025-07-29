// src/components/FilterBar.jsx
import React from "react";

export default function FilterBar({ status, search, onStatusChange, onSearchChange }) {
  return (
    <>
      <style>{`
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (min-width: 768px) {
          .filter-bar {
            flex-direction: row;
          }
        }

        .filter-select,
        .filter-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          background-color: white;
          color: #111827;
          flex: 1;
        }

        .filter-select {
          max-width: 200px;
        }

        .filter-select:focus,
        .filter-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
        }
      `}</style>

      <div className="filter-bar">
        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or client"
          className="filter-input"
        />
      </div>
    </>
  );
}
