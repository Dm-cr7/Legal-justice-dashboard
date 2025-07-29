import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ListTodo, Plus, X, Edit, Trash2 } from "lucide-react";

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
    try {
      const res = await axios.get("/api/tasks", { withCredentials: true });
      setTasks(res.data);
    } catch {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    const url = editingTask ? `/api/tasks/${editingTask._id}` : "/api/tasks";
    const method = editingTask ? "put" : "post";

    try {
      const res = await axios[method](url, data, { withCredentials: true });
      if (editingTask) {
        setTasks((prev) =>
          prev.map((t) => (t._id === res.data._id ? res.data : t))
        );
      } else {
        setTasks((prev) => [res.data, ...prev]);
      }
      setShowModal(false);
      setEditingTask(null);
    } catch {
      alert("Error saving task.");
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this task?");
    if (!confirm) return;

    try {
      await axios.delete(`/api/tasks/${id}`, { withCredentials: true });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete task.");
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("dueDate", task.dueDate?.substring(0, 10));
    setValue("completed", task.completed);
    setShowModal(true);
  };

  const openNew = () => {
    reset();
    setEditingTask(null);
    setShowModal(true);
  };

  return (
    <div className="tasks-wrapper">
      <div className="tasks-header">
        <div>
          <h1>Task Management</h1>
          <p>View, create, and manage your tasks.</p>
        </div>
        <button className="primary-btn" onClick={openNew}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingTask ? "Edit Task" : "New Task"}</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit(handleSave)} className="modal-form">
              <label>
                Title
                <input {...register("title", { required: true })} />
                {errors.title && <span className="error">Title is required</span>}
              </label>
              <label>
                Due Date
                <input type="date" {...register("dueDate")} />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" {...register("completed")} />
                Completed
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                  {editingTask ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="center">Loading tasks...</p>
        ) : error ? (
          <p className="error center">{error}</p>
        ) : tasks.length === 0 ? (
          <p className="center">No tasks found.</p>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Due Date</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>
                    <span className={t.completed ? "badge done" : "badge pending"}>
                      {t.completed ? "Done" : "Pending"}
                    </span>
                  </td>
                  <td>{t.title}</td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="actions">
                    <button onClick={() => openEdit(t)} title="Edit"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(t._id)} title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .tasks-wrapper {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tasks-header h1 {
          font-size: 1.75rem;
          margin: 0;
        }
        .tasks-header p {
          margin: 0.25rem 0 0;
          color: #666;
        }

        .primary-btn, .secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }
        .primary-btn {
          background-color: #2563eb;
          color: #fff;
        }
        .primary-btn:hover {
          background-color: #1d4ed8;
        }
        .secondary-btn {
          background-color: #f3f4f6;
          color: #111;
        }

        .card {
          background: #fff;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 2rem;
          box-shadow: 0 0 0 1px #e5e7eb;
        }

        .task-table {
          width: 100%;
          border-collapse: collapse;
        }
        .task-table th,
        .task-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .actions-header {
          text-align: right;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge.done {
          background: #dcfce7;
          color: #166534;
        }
        .badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          padding: 2rem;
          border-radius: 10px;
          width: 100%;
          max-width: 500px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-form {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal-form input[type="text"],
        .modal-form input[type="date"] {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          width: 100%;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        .error {
          color: #dc2626;
          font-size: 0.875rem;
        }

        .center {
          text-align: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}
