import React, { useEffect } from "react";

export default function SkeletonLoader() {
  useEffect(() => {
    const styleId = "skeleton-loader-animation-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .skeleton-loader {
          background: linear-gradient(
            to right,
            #e2e8f0 8%,
            #f1f5f9 18%,
            #e2e8f0 33%
          );
          background-size: 800px 100px;
          animation: shimmer 1.4s infinite linear;
        }

        .skeleton-dark {
          background: linear-gradient(
            to right,
            #475569 8%,
            #64748b 18%,
            #475569 33%
          );
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
  };

  const boxStyle = {
    height: "112px",
    borderRadius: "10px",
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-loader"
          style={boxStyle}
        ></div>
      ))}
    </div>
  );
}
