import React from "react";

export default function TaskList({ tasks, onStatusChange }) {
  if (!tasks || tasks.length === 0) {
    return <p style={styles.empty}>No tasks assigned yet.</p>;
  }

  return (
    <div style={styles.list}>
      {tasks.map((task) => {
        const { _id, title, description, dueDate, status } = task;

        return (
          <div key={_id} style={styles.card} data-testid={`task-${_id}`}>
            <h3 style={styles.title}>
              {title || <span style={styles.placeholder}>Untitled Task</span>}
            </h3>
            <p style={styles.description}>
              {description || "No description provided."}
            </p>
            <p style={styles.date}>
              Due: {dueDate ? new Date(dueDate).toLocaleDateString() : "N/A"}
            </p>

            <div style={styles.statusRow}>
              <label
                htmlFor={`status-${_id}`}
                style={styles.statusLabel}
              >
                Status:
              </label>
              <select
                id={`status-${_id}`}
                value={status}
                onChange={(e) => onStatusChange(_id, e.target.value)}
                style={styles.select}
                aria-label={`Change status for ${title || "Unnamed Task"}`}
                data-testid={`status-select-${_id}`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  empty: {
    fontStyle: "italic",
    color: "#64748b",
    marginTop: "1rem",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1rem"
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s ease",
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: "600",
    marginBottom: "0.25rem",
    color: "#0f172a"
  },
  placeholder: {
    color: "#94a3b8",
    fontStyle: "italic",
    fontWeight: 400
  },
  description: {
    fontSize: "0.95rem",
    color: "#475569",
    marginBottom: "0.5rem"
  },
  date: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "0.75rem"
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  statusLabel: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#334155"
  },
  select: {
    fontSize: "0.85rem",
    padding: "0.4rem 0.6rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
  }
};
