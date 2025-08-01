import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function NewClientModal({ onClientAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    reset();
    setIsOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/clients", data, { withCredentials: true });
      onClientAdded(res.data);
      closeModal();
    } catch (err) {
      console.error("Add client error:", err);
      alert("❌ " + (err.response?.data?.message || "Failed to add client"));
    }
  };

  return (
    <>
      <button style={styles.addBtn} onClick={openModal}>
        + New Client
      </button>

      {isOpen && (
        <div style={styles.backdrop} role="dialog" aria-modal="true">
          <div style={styles.modal}>
            <h2 style={styles.title}>Add New Client</h2>

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  autoComplete="off"
                  {...register("name", { required: "Name is required" })}
                  style={{
                    ...styles.input,
                    borderColor: errors.name ? "#dc2626" : "#cbd5e1"
                  }}
                />
                {errors.name && <p style={styles.error}>{errors.name.message}</p>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Contact</label>
                <input
                  autoComplete="off"
                  {...register("contact", {
                    required: "Contact is required",
                    pattern: {
                      value: /^(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Must be a valid phone number or email"
                    }
                  })}
                  style={{
                    ...styles.input,
                    borderColor: errors.contact ? "#dc2626" : "#cbd5e1"
                  }}
                />
                {errors.contact && (
                  <p style={styles.error}>{errors.contact.message}</p>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Notes</label>
                <textarea
                  autoComplete="off"
                  {...register("notes")}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.actions}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  addBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "1rem"
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    borderRadius: "10px",
    padding: "2rem",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "700",
    marginBottom: "1rem"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  field: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    fontWeight: "500",
    marginBottom: "0.25rem"
  },
  input: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem"
  },
  textarea: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    minHeight: "80px"
  },
  error: {
    color: "#dc2626",
    fontSize: "0.85rem",
    marginTop: "0.25rem"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1rem"
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#e2e8f0",
    border: "none",
    borderRadius: "6px",
    color: "#1e293b",
    cursor: "pointer"
  },
  submitBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#16a34a",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer"
  }
};
