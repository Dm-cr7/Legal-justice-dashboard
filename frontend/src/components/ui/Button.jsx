import React, { useState } from "react";

/**
 * A theme-aware, flexible, accessible button component.
 * Variants: primary, secondary, accent, outline, destructive.
 * Styles are scoped inline and dynamic for hover/focus feedback.
 */
export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  style = {},
  ...props
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem 1.25rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "6px",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    border: "none",
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
    userSelect: "none",
  };

  const variants = {
    primary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      hover: "#1d4ed8",
    },
    secondary: {
      backgroundColor: "#e2e8f0",
      color: "#1e293b",
      hover: "#cbd5e1",
    },
    accent: {
      backgroundColor: "#10b981",
      color: "#ffffff",
      hover: "#059669",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#2563eb",
      border: "1px solid #2563eb",
      hover: "#eff6ff",
    },
    destructive: {
      backgroundColor: "#ef4444",
      color: "#ffffff",
      hover: "#dc2626",
    },
  };

  const current = variants[variant] || variants.primary;

  const combinedStyle = {
    ...base,
    backgroundColor: hover ? current.hover : current.backgroundColor,
    color: current.color,
    border: current.border || base.border,
    boxShadow: focus ? "0 0 0 2px rgba(37, 99, 235, 0.4)" : "none",
    ...style, // user-supplied overrides last
  };

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={combinedStyle}
      {...props}
    >
      {children}
    </button>
  );
}
