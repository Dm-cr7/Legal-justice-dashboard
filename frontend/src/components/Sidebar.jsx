import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Home, User, Settings, LogOut, BarChart2,
  FileText, Users, Briefcase, ChevronLeft, ChevronRight,
} from "lucide-react";

const SidebarLink = ({ to, icon, children, isExpanded }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: "flex",
      alignItems: "center",
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 500,
      color: isActive ? "#1d4ed8" : "#1e3a8a",
      backgroundColor: isActive ? "#e0f2fe" : "transparent",
      boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
      transform: isActive ? "scale(1.02)" : "none",
      transition: "all 0.2s ease",
      textDecoration: "none",
    })}
  >
    {icon}
    <span
      style={{
        marginLeft: "12px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        maxWidth: isExpanded ? "200px" : "0",
        opacity: isExpanded ? 1 : 0,
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </span>
  </NavLink>
);

export default function Sidebar({ isExpanded, setExpanded }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Guest", email: "Not logged in" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/api/auth/me", { withCredentials: true });
        if (res.data) setUser(res.data);
      } catch {
        setUser({ name: "Guest", email: "Not logged in" });
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    // Optional: Also call backend logout
    // await API.post('/api/auth/logout', {}, { withCredentials: true });
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 600,
            transition: "all 0.3s ease",
            opacity: isExpanded ? 1 : 0,
            maxWidth: isExpanded ? "200px" : "0",
            overflow: "hidden",
          }}
        >
          Justice App
        </h1>
        <button onClick={() => setExpanded(!isExpanded)} style={styles.toggleButton}>
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <SidebarLink to="/dashboard/advocate" icon={<Home size={20} />} isExpanded={isExpanded}>
          Advocate
        </SidebarLink>
        <SidebarLink to="/dashboard/paralegal" icon={<User size={20} />} isExpanded={isExpanded}>
          Paralegal
        </SidebarLink>

        {isExpanded && <p style={styles.sectionLabel}>Management</p>}
        <SidebarLink to="/dashboard/cases" icon={<Briefcase size={20} />} isExpanded={isExpanded}>
          Cases
        </SidebarLink>
        <SidebarLink to="/dashboard/clients" icon={<Users size={20} />} isExpanded={isExpanded}>
          Clients
        </SidebarLink>
        <SidebarLink to="/dashboard/tasks" icon={<FileText size={20} />} isExpanded={isExpanded}>
          Tasks
        </SidebarLink>

        {isExpanded && <p style={styles.sectionLabel}>Insights</p>}
        <SidebarLink to="/dashboard/analytics" icon={<BarChart2 size={20} />} isExpanded={isExpanded}>
          Analytics
        </SidebarLink>
        <SidebarLink to="/dashboard/reports" icon={<FileText size={20} />} isExpanded={isExpanded}>
          Reports
        </SidebarLink>
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <SidebarLink to="/dashboard/profile" icon={<Settings size={20} />} isExpanded={isExpanded}>
          Profile
        </SidebarLink>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "16px",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "#dbeafe",
            transition: "background 0.2s ease",
          }}
        >
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div
            style={{
              marginLeft: "12px",
              transition: "all 0.3s ease",
              opacity: isExpanded ? 1 : 0,
              maxWidth: isExpanded ? "200px" : "0",
              overflow: "hidden",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 600 }}>{user?.name || "Guest"}</p>
            <p style={{ fontSize: "12px", color: "#475569" }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "auto",
              padding: "4px",
              color: "#2563eb",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: isExpanded ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(to bottom, #eff6ff, #dbeafe)",
    color: "#1e3a8a",
    borderRight: "1px solid #bfdbfe",
    boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
    padding: "0 16px",
    borderBottom: "1px solid #bfdbfe",
  },
  toggleButton: {
    padding: "6px",
    color: "#2563eb",
    background: "none",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  nav: {
    flex: 1,
    padding: "16px 8px",
    overflowY: "auto",
  },
  sectionLabel: {
    padding: "16px 16px 4px",
    fontSize: "11px",
    color: "#2563eb",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  footer: {
    padding: "16px 12px",
    borderTop: "1px solid #bfdbfe",
  },
  avatar: {
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    backgroundColor: "#facc15",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "black",
    fontWeight: "bold",
    fontSize: "16px",
    flexShrink: 0,
  },
};
