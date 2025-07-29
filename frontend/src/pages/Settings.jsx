import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function Settings() {
  return (
    <div className="settings-page">
      <div className="header">
        <h1>Settings</h1>
        <p>Manage your application settings and preferences.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <SlidersHorizontal size={24} className="icon" />
          <h2>Application Settings</h2>
        </div>
        <div className="card-content">
          <p>This is a placeholder for future application settings.</p>
          <p>You could add options here to manage notifications, change themes, or configure integrations.</p>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          padding: 2rem;
          max-width: 900px;
          margin: auto;
        }

        .header h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937; /* gray-900 */
          margin-bottom: 0.25rem;
        }

        .header p {
          font-size: 0.875rem;
          color: #6b7280; /* gray-500 */
        }

        .card {
          background-color: #ffffff;
          border: 1px solid #e5e7eb; /* gray-200 */
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          margin-top: 2rem;
        }

        .card-header {
          display: flex;
          align-items: center;
        }

        .card-header h2 {
          margin-left: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827; /* gray-900 */
        }

        .card-content {
          text-align: center;
          margin-top: 1.5rem;
        }

        .card-content p {
          font-size: 0.95rem;
          color: #4b5563; /* gray-600 */
          margin-bottom: 0.5rem;
        }

        .icon {
          color: #3b82f6; /* primary blue */
        }

        @media (prefers-color-scheme: dark) {
          .settings-page {
            background-color: #0f172a;
          }

          .header h1 {
            color: #f9fafb;
          }

          .header p {
            color: #9ca3af;
          }

          .card {
            background-color: #1e293b;
            border-color: #334155;
          }

          .card-header h2 {
            color: #e2e8f0;
          }

          .card-content p {
            color: #94a3b8;
          }

          .icon {
            color: #60a5fa;
          }
        }
      `}</style>
    </div>
  );
}
