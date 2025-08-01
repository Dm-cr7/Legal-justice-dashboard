import React from 'react';
import { Navigate, Outlet } from "react-router-dom";

/**
 * Protects routes based on user roles stored in localStorage.
 * If user role is missing or unauthorized, redirects to login.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const role = localStorage.getItem("role");

  const isAuthorized = role && allowedRoles.includes(role);

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <style>{`
        .protected-wrapper {
          padding: 1rem;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="protected-wrapper">
        <Outlet />
      </div>
    </>
  );
}
