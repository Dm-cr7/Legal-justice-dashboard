import React from "react";

/**
 * A flexible, modern Card component with optional variants and internal styles.
 * Supports: base, outlined, flat variants. Fully theme-aware.
 */
export default function Card({
  children,
  style = {},
  className = "",
  variant = "base", // "base", "outlined", "flat"
  hoverable = false,
}) {
  const baseStyle = {
    backgroundColor: "var(--card-bg, #ffffff)",
    color: "var(--card-text, #1e293b)",
    border: "1px solid var(--card-border, #e2e8f0)",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  };

  const variants = {
    base: {},
    outlined: {
      backgroundColor: "transparent",
      border: "1px solid var(--card-border, #cbd5e1)",
      boxShadow: "none",
    },
    flat: {
      border: "none",
      boxShadow: "none",
    },
  };

  const hoverEffect = hoverable
    ? {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
      }
    : {};

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        ...(variants[variant] || {}),
        ...(hoverable ? { transition: "box-shadow 0.2s" } : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverable) Object.assign(e.currentTarget.style, hoverEffect);
      }}
      onMouseLeave={(e) => {
        if (hoverable)
          Object.assign(e.currentTarget.style, variants[variant] || {});
      }}
    >
      {children}
    </div>
  );
}
