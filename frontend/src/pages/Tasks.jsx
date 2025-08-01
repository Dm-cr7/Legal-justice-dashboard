// src/pages/Tasks.jsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "../api/axios";
import { Plus, X, Edit2, Trash2 } from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/tasks");
      if (Array.isArray(res.data)) {
        setTasks(res.data);
        setError(null);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    const url = editingTask ? `/api/tasks/${editingTask._id}` : "/api/tasks";
    const method = editingTask ? "put" : "post";

    try {
      const res = await API[method](url, {
        title: data.title,
        dueDate: data.dueDate || null,
        status: data.completed ? "Done" : "Pending",
      });

      const updated = res.data;
      if (!updated._id && editingTask?._id) updated._id = editingTask._id;

      setTasks((prev) =>
        editingTask
          ? prev.map((t) => (t._id === updated._id ? updated : t))
          : [updated, ...prev]
      );

      closeModal();
    } catch (err) {
      console.error("❌ Error saving task:", err);
      alert("Error saving task.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("❌ Error deleting task:", err);
      alert("Failed to delete task.");
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("dueDate", task.dueDate ? task.dueDate.substring(0, 10) : "");
    setValue("completed", task.status === "Done");
    setShowModal(true);
  };

  const openNew = () => {
    reset();
    setEditingTask(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
    setEditingTask(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", fontFamily: "Inter, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Tasks</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#555" }}>Manage your to-dos and deadlines.</p>
        </div>
        <button onClick={openNew} style={btnPrimary}>
          <Plus size={16} /> New Task
        </button>
      </header>

      <section style={{ marginTop: "2rem" }}>
        {loading ? (
          <p style={statusText}>Loading…</p>
        ) : error ? (
          <p style={{ ...statusText, color: "#b91c1c" }}>{error}</p>
        ) : tasks.length === 0 ? (
          <p style={statusText}>No tasks yet. Create one!</p>
        ) : (
          <ul style={taskList}>
            {tasks.map((t) => (
              <li key={t._id} style={taskCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...badge, ...(t.status === "Done" ? badgeDone : badgePending) }}>
                    {t.status}
                  </span>
                  <div>
                    <button onClick={() => openEdit(t)} title="Edit" style={iconBtn}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t._id)} title="Delete" style={iconBtn}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.1rem" }}>{t.title}</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#555" }}>
                  Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showModal && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
              <button onClick={closeModal} style={iconBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(handleSave)} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <label>
                Title
                <input
                  type="text"
                  {...register("title", { required: true })}
                  style={input}
                />
                {errors.title && <span style={fieldError}>Required</span>}
              </label>
              <label>
                Due Date
                <input type="date" {...register("dueDate")} style={input} />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                <input type="checkbox" {...register("completed")} />
                Completed
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" onClick={closeModal} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={btnPrimary}>
                  {editingTask ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const input = {
  marginTop: "0.25rem",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "1rem",
};

const fieldError = {
  color: "#b91c1c",
  fontSize: "0.8rem",
  marginTop: "0.25rem",
};

const btnPrimary = {
  background: "#2563eb",
  color: "#fff",
  padding: "0.6rem 1rem",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const btnSecondary = {
  background: "#f3f4f6",
  color: "#333",
  padding: "0.6rem 1rem",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const iconBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "0.25rem",
  color: "#555",
};

const statusText = {
  textAlign: "center",
  color: "#666",
};

const taskList = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "1.5rem",
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const taskCard = {
  background: "#fff",
  borderRadius: "8px",
  padding: "1rem",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const badge = {
  padding: "0.25rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const badgeDone = {
  background: "#dcfce7",
  color: "#166534",
};

const badgePending = {
  background: "#fef3c7",
  color: "#92400e",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const modalBox = {
  background: "#fff",
  borderRadius: "10px",
  padding: "2rem",
  width: "100%",
  maxWidth: "400px",
};
