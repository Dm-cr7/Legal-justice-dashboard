import React from 'react';

/**
 * A reusable, modern Card component.
 * Self-contained with internal CSS styles. Supports light/dark themes.
 */
export default function Card({ children, style = {}, className = '' }) {
  const cardStyle = {
    backgroundColor: "var(--card-bg, #ffffff)",
    color: "var(--card-text, #1e293b)",
    border: "1px solid var(--card-border, #e2e8f0)",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "background-color 0.3s, color 0.3s, border 0.3s",
    ...style,
  };

  return (
    <div className={className} style={cardStyle}>
      {children}
    </div>
  );
}
