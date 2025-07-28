// src/components/TaskFormModal.jsx
import React, { useEffect, useState } from "react"
import { Dialog } from "@headlessui/react"

export default function TaskFormModal({ onClose, onCreated }) {
  const [paralegals, setParalegals] = useState([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/users/paralegals", { credentials: "include" })
      .then((res) => res.json())
      .then(setParalegals)
      .catch(console.error)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        onCreated(data)
        onClose()
      } else {
        alert(data.error || "Failed to create task")
      }
    } catch (err) {
      console.error("Task create error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onClose={onClose} className="fixed inset-0 z-50 p-4 bg-black/50">
      <Dialog.Panel className="mx-auto max-w-md bg-white p-6 rounded shadow space-y-4">
        <Dialog.Title className="text-xl font-bold">New Task</Dialog.Title>
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
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Assign to...</option>
            {paralegals.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  )
}
