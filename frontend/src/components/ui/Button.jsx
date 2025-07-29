import React from "react";

/**
 * A reusable and theme-aware Button component.
 * Supports variants: primary, secondary, accent, outline, destructive.
 * All styles are self-contained with internal CSS (no Tailwind or external classes).
 */
export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  style = {},
  ...props
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem 1.25rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "9999px",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s, opacity 0.2s",
    outline: "none",
    border: "none",
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
  };

  const variants = {
    primary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
    },
    secondary: {
      backgroundColor: "#e2e8f0",
      color: "#1e293b",
    },
    accent: {
      backgroundColor: "#10b981",
      color: "#ffffff",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#2563eb",
      border: "1px solid #2563eb",
    },
    destructive: {
      backgroundColor: "#ef4444",
      color: "#ffffff",
    },
  };

  const hoverStyles = {
    primary: { backgroundColor: "#1d4ed8" },
    secondary: { backgroundColor: "#cbd5e1" },
    accent: { backgroundColor: "#059669" },
    outline: { backgroundColor: "#eff6ff" },
    destructive: { backgroundColor: "#dc2626" },
  };

  const finalStyle = {
    ...base,
    ...(variants[variant] || variants.primary),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) Object.assign(e.target.style, hoverStyles[variant]);
      }}
      onMouseLeave={(e) => {
        if (!disabled) Object.assign(e.target.style, variants[variant]);
      }}
      style={finalStyle}
      {...props}
    >
      {children}
    </button>
  );
}
