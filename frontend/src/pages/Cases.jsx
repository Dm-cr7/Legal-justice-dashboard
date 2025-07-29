import React, { useEffect, useState } from "react";

// Icons and toast
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

// Components (assumed to be present in your project)
import NewCaseModal from "../components/NewCaseModal";
import CaseCard from "../components/CaseCard";
import SkeletonLoader from "../components/SkeletonLoader";
import Button from "../components/ui/Button";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cases", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch cases: ${await res.text()}`);
        setCases(await res.json());
      } catch (err) {
        console.error("Fetch cases error:", err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleCaseCreated = (newCase) => setCases((prev) => [newCase, ...prev]);
  const handleCaseUpdated = (updatedCase) =>
    setCases((prev) => prev.map((c) => (c._id === updatedCase._id ? updatedCase : c)));
  const handleCaseDeleted = (deletedId) =>
    setCases((prev) => prev.filter((c) => c._id !== deletedId));

  return (
    <div style={styles.page}>
      <NewCaseModal
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        onCreated={handleCaseCreated}
      />

      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Case Management</h1>
          <p style={styles.subtext}>View, edit, and manage all legal cases.</p>
        </div>
        <button style={styles.button} onClick={() => setShowNewCaseModal(true)}>
          <Plus size={18} style={{ marginRight: 8 }} />
          New Case
        </button>
      </header>

      <section>
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>Error: {error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>
              No cases found. Click <strong>"New Case"</strong> to get started.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {cases.map((c) => (
              <CaseCard
                key={c._id}
                c={c}
                onUpdated={handleCaseUpdated}
                onDeleted={handleCaseDeleted}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem",
    backgroundColor: "#f0f9ff",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "2rem",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.25rem",
  },
  subtext: {
    fontSize: "0.875rem",
    color: "#475569",
  },
  button: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  errorBox: {
    padding: "2rem",
    backgroundColor: "#fee2e2",
    borderRadius: "8px",
    textAlign: "center",
  },
  errorText: {
    color: "#b91c1c",
    fontWeight: 600,
  },
  emptyBox: {
    padding: "2rem",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    textAlign: "center",
  },
  emptyText: {
    color: "#64748b",
  },
  grid: {
    display: "grid",
    gap: "1.5rem",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  },
};
