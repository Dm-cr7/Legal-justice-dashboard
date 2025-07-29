import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function NewCaseModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm({
    defaultValues: { status: 'Pending' }
  });

  const [apiError, setApiError] = useState(null);

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const res = await axios.post('/api/cases', data, { withCredentials: true });
      onCreated(res.data);
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to create case:", err);
      setApiError(err.response?.data?.error || "An unexpected error occurred.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          max-width: 500px;
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          padding: 2rem;
          position: relative;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          background: #f9fafb;
          color: #111827;
        }

        .form-textarea {
          resize: vertical;
        }

        .error-message {
          color: #dc2626;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .error-box {
          background: #fee2e2;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 6px;
          text-align: center;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .btn-primary {
          background-color: #2563eb;
          color: white;
        }

        .btn-primary:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background-color: #d1d5db;
        }
      `}</style>

      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-title">Create New Case</div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Case Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">Case Title</label>
              <input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="form-input"
                placeholder="e.g. Land Dispute in Kiambu"
              />
              {errors.title && (
                <p className="error-message">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                {...register("description")}
                rows="3"
                className="form-textarea"
                placeholder="Case details..."
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                {...register("status")}
                className="form-select"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Error Box */}
            {apiError && (
              <div className="error-box">{apiError}</div>
            )}

            {/* Action Buttons */}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Case"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
