import React, { useEffect, useState } from "react";

export default function ParalegalTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/assigned", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tasks.");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: updated.status } : task
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Paralegal Task Center</h1>
      <p className="subtitle">Manage your assigned legal tasks efficiently.</p>

      {loading ? (
        <p className="info">Loading tasks...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : tasks.length === 0 ? (
        <p className="info">No tasks assigned yet.</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
                  {task.status}
                </span>
              </div>
              <p className="desc">{task.description}</p>
              <div className="task-actions">
                <label>Change Status:</label>
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task._id, e.target.value)}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(to bottom right, #e8f0ff, #f7f9fc);
          font-family: 'Segoe UI', sans-serif;
          color: #1f2937;
        }

        h1 {
          font-size: 2.2rem;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .info {
          font-size: 1rem;
          color: #374151;
        }

        .error {
          color: #dc2626;
          font-weight: 500;
        }

        .task-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .task-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .task-header h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .status {
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          border-radius: 9999px;
          color: white;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status.to-do {
          background-color: #3b82f6;
        }

        .status.in-progress {
          background-color: #f59e0b;
        }

        .status.completed {
          background-color: #10b981;
        }

        .desc {
          font-size: 0.95rem;
          color: #4b5563;
          margin: 0.5rem 0 1rem;
          line-height: 1.5;
        }

        .task-actions {
          display: flex;
          flex-direction: column;
        }

        .task-actions label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .task-actions select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #f9fafb;
          font-size: 0.95rem;
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
