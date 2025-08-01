import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2 } from 'lucide-react';

export default function CaseCard({ c, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [title, setTitle] = useState(c.title);
  const [description, setDescription] = useState(c.description);
  const [status, setStatus] = useState(c.status);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTitle(c.title);
    setDescription(c.description);
    setStatus(c.status);
  }, [c]);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`/api/cases/${c._id}`, { title, description, status }, { withCredentials: true });
      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      alert("Failed to update case.");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/cases/${c._id}`, { withCredentials: true });
      onDeleted(c._id);
    } catch (err) {
      alert("Failed to delete case.");
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await axios.post(`/api/cases/${c._id}/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpdated({ ...c, documents: [...(c.documents || []), res.data.document] });
      setSelectedFile(null);
    } catch (err) {
      alert("Failed to upload document.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const statusColors = {
    'Pending': 'badge yellow',
    'In Progress': 'badge blue',
    'Done': 'badge green',
  };

  const fileUrl = (relativePath) => `${window.location.origin}${relativePath}`;

  return (
    <div className="case-card">
      <style>{`
        .case-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        .title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #222;
        }
        .badge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge.yellow {
          background: #fef3c7;
          color: #92400e;
        }
        .badge.blue {
          background: #e0f2fe;
          color: #1e40af;
        }
        .badge.green {
          background: #dcfce7;
          color: #166534;
        }
        .desc {
          font-size: 0.9rem;
          color: #555;
          margin-top: 8px;
        }
        .edit-input,
        .edit-textarea,
        .edit-select {
          width: 100%;
          margin-top: 4px;
          padding: 8px;
          font-size: 0.9rem;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .documents {
          margin-top: 16px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        .documents ul {
          margin: 8px 0 0 16px;
          font-size: 0.85rem;
        }
        .upload {
          border-top: 1px solid #eee;
          padding-top: 12px;
          margin-top: 16px;
        }
        .upload input[type="file"] {
          font-size: 0.8rem;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
        .button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .primary {
          background: #2563eb;
          color: #fff;
        }
        .secondary {
          background: #f3f4f6;
          color: #333;
        }
        .danger {
          background: #f87171;
          color: white;
        }
        .confirm-box {
          text-align: center;
          background: #fee2e2;
          padding: 10px;
          border-radius: 6px;
        }
      `}</style>

      {editing ? (
        <>
          <h3 className="title">Edit Case</h3>
          <div>
            <label>Title</label>
            <input className="edit-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>Description</label>
            <textarea className="edit-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label>Status</label>
            <select className="edit-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <div className="actions">
            <button className="button secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="button primary" onClick={handleUpdate}>Save Changes</button>
          </div>
        </>
      ) : (
        <>
          <div className="header">
            <h2 className="title">{c.title}</h2>
            <span className={statusColors[c.status]}>{c.status}</span>
          </div>
          <p className="desc">{c.description}</p>

          {c.documents?.length > 0 && (
            <div className="documents">
              <h4>Documents:</h4>
              <ul>
                {c.documents.map((doc, idx) => (
                  <li key={idx}>
                    <a href={fileUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                      {doc.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="upload">
            <label>Upload Document:</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button
                className="button primary"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          <div className="actions">
            {!showDeleteConfirm ? (
              <>
                <button className="button secondary" onClick={() => setEditing(true)}>
                  <Edit size={16} /> Edit
                </button>
                <button className="button danger" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={16} /> Delete
                </button>
              </>
            ) : (
              <div className="confirm-box">
                <p>Are you sure you want to delete?</p>
                <div className="actions" style={{ justifyContent: 'center' }}>
                  <button className="button secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  <button className="button danger" onClick={handleDelete}>Yes, Delete</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
