import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

// --- UI Components ---

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const styles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
  };
  return (
    <button className={`btn ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>{children}</div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// --- Modals ---

const NewClientModal = ({ isOpen, onClose, onCreated }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/clients', data, { withCredentials: true });
      onCreated(res.data);
      toast.success("✅ Client created");
      reset();
      onClose();
    } catch {
      toast.error("❌ Failed to create client");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Client">
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <label>
          Name
          <input {...register("name", { required: true })} />
          {errors.name && <p className="error">Name is required</p>}
        </label>
        <label>
          Email
          <input {...register("email", { required: true })} />
          {errors.email && <p className="error">Email is required</p>}
        </label>
        <label>
          Phone
          <input {...register("phone")} />
        </label>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const EditClientModal = ({ isOpen, onClose, client, onUpdated }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({ defaultValues: client });

  useEffect(() => { reset(client); }, [client]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.put(`/api/clients/${client._id}`, data, { withCredentials: true });
      onUpdated(res.data);
      toast.success("✅ Client updated");
      onClose();
    } catch {
      toast.error("❌ Failed to update client");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Client">
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <label>
          Name
          <input {...register("name", { required: true })} />
          {errors.name && <p className="error">Name is required</p>}
        </label>
        <label>
          Email
          <input {...register("email", { required: true })} />
          {errors.email && <p className="error">Email is required</p>}
        </label>
        <label>
          Phone
          <input {...register("phone")} />
        </label>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteClientModal = ({ isOpen, onClose, client, onDeleted }) => {
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/clients/${client._id}`, { withCredentials: true });
      onDeleted(client._id);
      toast.success("🗑️ Client deleted");
      onClose();
    } catch {
      toast.error("❌ Failed to delete client");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Client">
      <div className="delete-confirm">
        <p>
          Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
        </p>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
        </div>
      </div>
    </Modal>
  );
};

// --- Main Page ---

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        toast.error("❌ Failed to load clients");
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleClientCreated = (client) => setClients(prev => [client, ...prev]);
  const handleClientUpdated = (updated) => setClients(prev => prev.map(c => c._id === updated._id ? updated : c));
  const handleClientDeleted = (deletedId) => setClients(prev => prev.filter(c => c._id !== deletedId));

  return (
    <div className="page">
      <NewClientModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onCreated={handleClientCreated} />
      {editingClient && (
        <EditClientModal isOpen={true} onClose={() => setEditingClient(null)} client={editingClient} onUpdated={handleClientUpdated} />
      )}
      {deletingClient && (
        <DeleteClientModal isOpen={true} onClose={() => setDeletingClient(null)} client={deletingClient} onDeleted={handleClientDeleted} />
      )}

      <div className="page-header">
        <div>
          <h1>Client Management</h1>
          <p className="subtext">View and manage your firm's clients.</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus size={16} style={{ marginRight: "4px" }} />
          New Client
        </Button>
      </div>

      <Card>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="center">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan="4" className="center error">{error}</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="4" className="center muted">No clients found.</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client._id}>
                  <td>{client.name}</td>
                  <td className="muted">{client.email}</td>
                  <td className="muted">{client.phone}</td>
                  <td className="text-right">
                    <button onClick={() => setEditingClient(client)} className="link edit">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => setDeletingClient(client)} className="link delete">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <style>{`
        .page { padding: 24px; background: #f9fafe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #111; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .subtext { color: #666; margin-top: 4px; font-size: 14px; }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          transition: background 0.2s;
        }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1e4ed8; }
        .btn-secondary { background: #f0f0f0; color: #333; }
        .btn-danger { background: #dc2626; color: white; }
        .btn-danger:hover { background: #b91c1c; }

        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th, .table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .table th {
          text-align: left;
          background: #f3f4f6;
          font-weight: 600;
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
          border-radius: 8px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
        }
        .modal-body { padding-top: 16px; }
        .close-button {
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .form { display: flex; flex-direction: column; gap: 16px; }
        .form input {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          width: 100%;
        }
        .form label { font-size: 14px; font-weight: 500; color: #333; }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .center { text-align: center; padding: 16px; }
        .error { color: #dc2626; }
        .muted { color: #666; }

        .link {
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
        }
        .link.edit { color: #2563eb; }
        .link.delete { color: #dc2626; }
        .link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
