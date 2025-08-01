import React from "react";

/**
 * Reusable stat card for dashboards.
 * Supports icon, label, and value.
 */
export default function StatCard({ icon, label, value, style = {} }) {
  const cardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.25rem",
    borderRadius: "12px",
    backgroundColor: "var(--card-bg, #ffffff)",
    color: "var(--card-text, #1e293b)",
    border: "1px solid var(--card-border, #e2e8f0)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    ...style,
  };

  const leftStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const labelStyle = {
    fontSize: "0.875rem",
    color: "var(--muted-text, #64748b)",
    marginBottom: "0.25rem",
  };

  const valueStyle = {
    fontSize: "1.5rem",
    fontWeight: "600",
  };

  const iconWrapperStyle = {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    padding: "0.5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
  };

  return (
    <div style={cardStyle}>
      <div style={leftStyle}>
        <span style={labelStyle}>{label}</span>
        <span style={valueStyle}>{value}</span>
      </div>
      <div style={iconWrapperStyle}>{icon}</div>
    </div>
  );
}
