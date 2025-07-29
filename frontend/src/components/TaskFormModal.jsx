import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'sonner';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';

export default function TaskFormModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/tasks', data, { withCredentials: true });
      onCreated(res.data);
      reset();
      onClose();
      toast.success("✅ Task created successfully!");
    } catch (err) {
      console.error("Task creation error:", err);
      const message = err.response?.data?.error || "❌ Failed to create task.";
      toast.error(message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        <div style={styles.field}>
          <label htmlFor="title" style={styles.label}>Task Title</label>
          <input
            {...register("title", { required: "Task title is required" })}
            id="title"
            placeholder="e.g. File court submission"
            style={{
              ...styles.input,
              borderColor: errors.title ? "#dc2626" : "#cbd5e1"
            }}
          />
          {errors.title && (
            <p style={styles.error}>{errors.title.message}</p>
          )}
        </div>

        <div style={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    marginTop: "1rem"
  },
  field: {
    display: "flex",
    flexDirection: "column"
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "0.5rem",
    color: "#475569"
  },
  input: {
    padding: "0.5rem 0.75rem",
    fontSize: "0.9rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s"
  },
  error: {
    marginTop: "0.25rem",
    fontSize: "0.8rem",
    color: "#dc2626"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "1rem"
  }
};
