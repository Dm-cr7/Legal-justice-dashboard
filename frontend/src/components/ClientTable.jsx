// src/components/ClientTable.jsx
import React from "react";

export default function ClientTable({ clients }) {
  return (
    <div className="client-table-wrapper">
      <style>{`
        .client-table-wrapper {
          overflow-x: auto;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        thead {
          background: #f3f4f6;
          color: #374151;
        }

        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr:hover {
          background-color: #f9fafb;
        }

        button.view-button {
          background: none;
          border: none;
          color: #2563eb;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
        }

        button.view-button:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          th, td {
            padding: 10px 12px;
            font-size: 0.85rem;
          }
        }
      `}</style>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td>{client.name}</td>
              <td>{client.contact || "—"}</td>
              <td>
                <button className="view-button">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
