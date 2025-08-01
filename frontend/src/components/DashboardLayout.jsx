import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

export default function DashboardLayout() {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <>
      {/* Global toast notifications */}
      <Toaster position="top-right" richColors />

      <style>{`
        .dashboard-layout {
          display: flex;
          height: 100vh;
          background-color: #f8fafc;
          color: #1f2937;
          font-family: 'Inter', sans-serif;
        }

        aside.sidebar {
          background-color: #ffffff;
          border-right: 1px solid #e5e7eb;
          transition: width 0.3s ease-in-out;
          overflow: hidden;
        }

        .sidebar-expanded {
          width: 256px;
        }

        .sidebar-collapsed {
          width: 80px;
        }

        .main {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          overflow: hidden;
        }

        .main-content {
          flex-grow: 1;
          overflow-y: auto;
        }

        .content-inner {
          padding: 16px;
        }

        @media (min-width: 640px) {
          .content-inner {
            padding: 24px;
          }
        }

        @media (min-width: 1024px) {
          .content-inner {
            padding: 32px;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside
          className={`sidebar ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
          role="complementary"
          aria-label="Sidebar navigation"
        >
          <Sidebar
            isExpanded={isSidebarExpanded}
            setExpanded={setSidebarExpanded}
          />
        </aside>

        {/* Main Content Area */}
        <div className="main">
          <main className="main-content" role="main" aria-label="Main content">
            <div className="content-inner">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
