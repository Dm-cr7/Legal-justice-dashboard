import React from "react";

/**
 * A modern, reusable skeleton loader component with internal CSS only.
 */
export default function SkeletonLoader() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    animation: 'pulse 1.5s infinite ease-in-out',
  };

  const boxStyle = {
    height: '112px', // 28 * 4
    backgroundColor: 'var(--skeleton-bg, #e2e8f0)',
    borderRadius: '12px',
  };

  return (
    <div style={containerStyle}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={boxStyle}></div>
      ))}

      {/* Internal keyframes */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          div[style*="animation: pulse"] > div {
            animation: pulse 1.5s infinite;
          }
        `}
      </style>
    </div>
  );
}
