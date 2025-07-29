import React from 'react';
import { Navigate, Outlet } from "react-router-dom";

/**
 * A component that protects routes based on user roles.
 * It reads the user's role from localStorage and checks if it's in the list of allowed roles.
 * If the user is authorized, it renders the child route (<Outlet />).
 * If not, it redirects them to the login page.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const role = localStorage.getItem("role");

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <style>{`
        .protected-wrapper {
          padding: 1rem;
          font-family: 'Inter', sans-serif;
        }

        .unauthorized {
          margin: 2rem auto;
          max-width: 600px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          color: #b91c1c;
          font-size: 1rem;
        }
      `}</style>

      <div className="protected-wrapper">
        <Outlet />
      </div>
    </>
  );
}
