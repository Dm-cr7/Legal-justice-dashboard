import React, { useEffect, useState } from "react";
import API from "../api/axios"; // <-- Custom instance that injects token
import {
  Briefcase,
  ClipboardCheck,
  CheckCircle2,
  Plus,
  ListTodo,
} from "lucide-react";
import { motion as Motion } from "framer-motion";

import NewCaseModal from "../components/NewCaseModal.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import CaseCard from "../components/CaseCard.jsx";
import SkeletonLoader from "../components/ui/SkeletonLoader.jsx";

export default function AdvocateDashboard() {
  const [cases, setCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [casesRes, tasksRes] = await Promise.all([
          API.get("/api/cases"),
          API.get("/api/tasks?createdBy=me"),
        ]);
        setCases(casesRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCaseCreated = (nc) => setCases((prev) => [nc, ...prev]);
  const handleCaseUpdated = (uc) =>
    setCases((prev) => prev.map((c) => (c._id === uc._id ? uc : c)));
  const handleCaseDeleted = (id) =>
    setCases((prev) => prev.filter((c) => c._id !== id));
  const handleTaskCreated = (nt) => setTasks((prev) => [nt, ...prev]);

  const pending = cases.filter((c) => c.status === "Pending").length;
  const inProgress = cases.filter((c) => c.status === "In Progress").length;
  const done = cases.filter((c) => c.status === "Done").length;

  return (
    <div className="dashboard-container">
      {/* Modals */}
      <NewCaseModal
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        onCreated={handleCaseCreated}
      />
      <TaskFormModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onCreated={handleTaskCreated}
      />

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="title">Advocate Dashboard</h1>
          <p className="subtitle">Your current workload and assigned tasks</p>
        </div>
        <div className="button-group">
          <button className="button secondary" onClick={() => setShowNewTaskModal(true)}>
            <Plus size={16} /> New Task
          </button>
          <button className="button primary" onClick={() => setShowNewCaseModal(true)}>
            <Plus size={16} /> New Case
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <Motion.div
        className="stat-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {[
          { title: "Pending Cases", value: pending, icon: <Briefcase /> },
          { title: "In Progress", value: inProgress, icon: <ClipboardCheck /> },
          { title: "Completed", value: done, icon: <CheckCircle2 /> },
        ].map((stat) => (
          <Motion.div
            key={stat.title}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="stat-card"
          >
            <div className="stat-icon">{stat.icon}</div>
            <div>
              <h3>{stat.title}</h3>
              <p>{loading ? "..." : stat.value}</p>
            </div>
          </Motion.div>
        ))}
      </Motion.div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Cases */}
        <div>
          <h2 className="section-title">Recent Cases</h2>
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="error-card">{error}</div>
          ) : cases.length === 0 ? (
            <div className="empty-card">No cases found.</div>
          ) : (
            <div className="case-grid">
              {cases.map((c) => (
                <div key={c._id} className="case-card">
                  <CaseCard
                    c={c}
                    onUpdated={handleCaseUpdated}
                    onDeleted={handleCaseDeleted}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <h2 className="section-title">My Tasks</h2>
          <div className="task-card">
            {loading ? (
              <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p>No tasks available.</p>
            ) : (
              <ul className="task-list">
                {tasks.map((t) => (
                  <li key={t._id} className="task-item">
                    <ListTodo size={18} className="task-icon" />
                    <span className="task-text">{t.title}</span>
                    <span className="task-date">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Scoped CSS (do not remove or move out) */}
      <style jsx>{`
        .dashboard-container {
          background: #f3f7fc;
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
        }
        .dashboard-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0c1a38;
        }
        .subtitle {
          font-size: 1rem;
          color: #526281;
        }
        .button-group {
          display: flex;
          gap: 1rem;
        }
        .button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .button.primary {
          background-color: #2563eb;
          color: white;
        }
        .button.secondary {
          background-color: #e0e7ff;
          color: #1e3a8a;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 1rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .stat-icon {
          color: #2563eb;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        .section-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #0f172a;
        }
        .case-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .case-card {
          background: white;
          border-radius: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .case-card:hover {
          transform: scale(1.015);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .task-card {
          background: white;
          padding: 1rem;
          border-radius: 10px;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
          max-height: 400px;
          overflow-y: auto;
        }
        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .task-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: 8px;
          background-color: #eff6ff;
          margin-bottom: 0.5rem;
          transition: background 0.2s ease;
        }
        .task-item:hover {
          background-color: #dbeafe;
        }
        .task-icon {
          color: #2563eb;
        }
        .task-text {
          flex: 1;
          margin-left: 0.5rem;
          color: #1e293b;
        }
        .task-date {
          font-size: 0.875rem;
          color: #64748b;
        }
        .error-card,
        .empty-card {
          background: #fef2f2;
          color: #b91c1c;
          padding: 1.5rem;
          border-radius: 10px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
