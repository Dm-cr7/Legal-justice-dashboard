import React, { useState } from "react";
import API from "../api/axios";

export default function NewClientModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !contact.trim()) {
      setError("Name and Contact are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/clients", { name, contact, notes });
      if (res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to create client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>New Client</h2>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
          />

          <label style={labelStyle}>Contact</label>
          <input
            type="text"
            style={inputStyle}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
          />

          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, height: "80px" }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />

          {error && <div style={errorStyle}>{error}</div>}

          <div style={buttonRowStyle}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={submitButtonStyle}>
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "var(--card)",
  color: "var(--foreground)",
  padding: "2rem",
  borderRadius: "10px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
};

const titleStyle = {
  marginBottom: "1rem",
  fontSize: "1.4rem",
  fontWeight: "600",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  marginTop: "12px",
  fontSize: "0.9rem",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--input)",
  color: "var(--foreground)",
  fontSize: "0.95rem",
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "1.5rem",
  gap: "0.75rem",
};

const cancelButtonStyle = {
  padding: "8px 14px",
  backgroundColor: "transparent",
  color: "var(--muted-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  cursor: "pointer",
};

const submitButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const errorStyle = {
  marginTop: "10px",
  color: "var(--destructive)",
  fontSize: "0.9rem",
};
