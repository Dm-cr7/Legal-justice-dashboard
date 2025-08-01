import React, { useEffect } from "react";

export default function SkeletonLoader({ count = 6 }) {
  useEffect(() => {
    // Avoid injecting CSS on server or duplicate injection on client
    if (typeof window === "undefined") return;

    const styleId = "skeleton-shimmer-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .skeleton-box {
          background: linear-gradient(
            to right,
            #e2e8f0 8%,
            #f1f5f9 18%,
            #e2e8f0 33%
          );
          background-size: 800px 104px;
          animation: shimmer 1.5s infinite linear;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
    padding: "1rem",
  };

  const cardStyle = {
    height: "120px",
    backgroundColor: "#e2e8f0",
  };

  return (
    <div style={containerStyle} role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-box" style={cardStyle}></div>
      ))}
    </div>
  );
}
