import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.titleLink}>
          <h1 style={styles.title}>Justice App</h1>
        </Link>
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar"
          style={styles.menuButton}
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 20,
    width: "100%",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
  },
  titleLink: {
    textDecoration: "none",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "700",
    fontFamily: "'Poppins', sans-serif",
    color: "#1e293b", // slate-800
    margin: 0,
  },
  menuButton: {
    background: "transparent",
    border: "none",
    color: "#475569", // slate-600
    cursor: "pointer",
    padding: "0.25rem",
    outline: "none",
    borderRadius: "6px",
    transition: "background 0.2s ease",
  },
  menuButtonHover: {
    backgroundColor: "#f1f5f9", // hover state (optional in future)
  },
};
