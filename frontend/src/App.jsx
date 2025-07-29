import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import all page and layout components
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AdvocateDashboard from "./pages/AdvocateDashboard.jsx";
import ParalegalDashboard from "./pages/ParalegalDashboard.jsx";
import ParalegalTasks from "./pages/ParalegalTasks.jsx";
import Tasks from "./pages/Tasks.jsx";
import Cases from "./pages/Cases.jsx";
import Clients from "./pages/Clients.jsx";
import Profile from "./pages/Profile.jsx";
import Analytics from "./pages/Analytics.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import Settings from "./pages/Settings.jsx"; // Added missing import
import TestUI from './pages/TestUI';

// Import the layout and protection components
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

/**
 * The main App component that defines all application routes.
 * It uses a custom ProtectedRoute component to handle authorization
 * based on user roles.
 */
export default function App() {
  return (
    // The <BrowserRouter> is removed from here and should wrap <App /> in your main.jsx file
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Dashboard Layout for all protected routes */}
      <Route element={<DashboardLayout />}>
        {/* Advocate-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={["advocate"]} />}>
          <Route path="/dashboard/advocate" element={<AdvocateDashboard />} />
        </Route>

        {/* Paralegal-only Routes */}
        <Route element={<ProtectedRoute allowedRoles={["paralegal"]} />}>
          <Route path="/dashboard/paralegal" element={<ParalegalDashboard />} />
          <Route path="/dashboard/paralegal/tasks" element={<ParalegalTasks />} />
        </Route>

        {/* Shared Routes (Accessible by both Advocate & Paralegal) */}
        <Route element={<ProtectedRoute allowedRoles={["advocate", "paralegal"]} />}>
          <Route path="/dashboard/cases" element={<Cases />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test-ui" element={<TestUI />} />
        </Route>
      </Route>

      {/* Catch-all Route to redirect unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
