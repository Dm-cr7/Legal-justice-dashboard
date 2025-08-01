// src/components/TaskFormModal.jsx
import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

export default function TaskFormModal({ onClose, onCreated }) {
  const [paralegals, setParalegals] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/users/paralegals", { credentials: "include" })
      .then((res) => res.json())
      .then(setParalegals)
      .catch((err) => {
        console.error("Failed to load paralegals:", err);
        setParalegals([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data);
        setForm({
          title: "",
          description: "",
          dueDate: "",
          assignedTo: "",
          status: "Pending",
        });
        onClose();
      } else {
        setErrorMsg(data.error || "Failed to create task");
      }
    } catch (err) {
      console.error("Task create error:", err);
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-40 p-4">
        <Dialog.Panel className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <Dialog.Title className="text-xl font-semibold">New Task</Dialog.Title>

          {errorMsg && (
            <div className="text-red-600 text-sm">{errorMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              required
              className="w-full border p-2 rounded"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border p-2 rounded"
            />

            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Assign to paralegal...</option>
              {paralegals.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
