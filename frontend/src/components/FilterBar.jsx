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

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
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
        }

        .filter-select:focus,
        .filter-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
        }

        .filter-select {
          max-width: 200px;
        }

        @media (prefers-color-scheme: dark) {
          .filter-select,
          .filter-input {
            background-color: #1f2937;
            color: #f9fafb;
            border-color: #374151;
          }
        }
      `}</style>

      <div className="filter-bar">
        {/* Status Dropdown */}
        <div className="filter-group">
          <label htmlFor="status-filter" className="filter-label">Status</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="filter-group">
          <label htmlFor="search-input" className="filter-label">Search</label>
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or client"
            className="filter-input"
          />
        </div>
      </div>
    </>
  );
}
