import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

export default function ParalegalDashboard() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, clientsRes] = await Promise.all([
          axios.get("/api/tasks", { withCredentials: true }),
          axios.get("/api/clients", { withCredentials: true }),
        ]);
        setTasks(tasksRes.data);
        setClients(clientsRes.data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewClient = async (data) => {
    try {
      const res = await axios.post("/api/clients", data, { withCredentials: true });
      setClients(prev => [res.data, ...prev]);
      reset();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to create client:", err);
    }
  };

  const todo = tasks.filter(t => t.status === 'To Do').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const done = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="dashboard-wrapper">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Client</h3>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit(handleNewClient)} className="modal-body">
              <label>
                Full Name
                <input {...register("name", { required: true })} />
                {errors.name && <span className="error">Name is required</span>}
              </label>
              <label>
                Email
                <input type="email" {...register("email", { required: true })} />
                {errors.email && <span className="error">Valid email is required</span>}
              </label>
              <label>
                Phone
                <input type="tel" {...register("phone")} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="header">
        <div>
          <h1>Paralegal Dashboard</h1>
          <p>Overview of firm activity and tasks.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Client</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="label">To Do Tasks</p>
          <h2>{loading ? "..." : todo}</h2>
        </div>
        <div className="stat-card">
          <p className="label">In Progress</p>
          <h2>{loading ? "..." : inProgress}</h2>
        </div>
        <div className="stat-card">
          <p className="label">Completed</p>
          <h2>{loading ? "..." : done}</h2>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>All Tasks</h3>
          {loading ? (
            <p>Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="empty">No tasks found.</p>
          ) : (
            <ul className="task-list">
              {tasks.map(t => (
                <li key={t._id}>
                  <span>{t.title}</span>
                  <span className={`status ${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Client List</h3>
          {loading ? (
            <p>Loading...</p>
          ) : clients.length === 0 ? (
            <p className="empty">No clients found.</p>
          ) : (
            <table className="client-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          color: #1a202c;
          background: #f0f4f8;
          min-height: 100vh;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 2rem;
        }
        .header h1 {
          font-size: 2rem;
          margin: 0;
        }
        .header p {
          color: #718096;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #1a202c;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-card .label {
          color: #718096;
          font-size: 0.875rem;
        }
        .stat-card h2 {
          font-size: 2rem;
          margin: 0.25rem 0 0;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }
        .card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .card h3 {
          margin-bottom: 1rem;
        }
        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .task-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }
        .status {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          border-radius: 12px;
          background: #e2e8f0;
        }
        .status.to-do { background: #cbd5e1; }
        .status.in-progress { background: #facc15; }
        .status.completed { background: #34d399; }
        .client-table {
          width: 100%;
          border-collapse: collapse;
        }
        .client-table th, .client-table td {
          text-align: left;
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .empty {
          text-align: center;
          color: #a0aec0;
          font-size: 0.9rem;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-body label {
          display: block;
          margin-bottom: 1rem;
        }
        .modal-body input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          margin-top: 0.25rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .error {
          color: #e53e3e;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
