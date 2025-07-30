import React, { useState } from "react"
import { useForm } from "react-hook-form"

export default function NewClientModal({ onClientAdded }) {
  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm()

  const openModal = () => setIsOpen(true)
  const closeModal = () => {
    reset()
    setIsOpen(false)
  }

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
      const newClient = await res.json()
      onClientAdded(newClient)  // inform parent to update list
      closeModal()
    } catch (err) {
      console.error("Failed to add client:", err)
      alert("Error adding client: " + err.message)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + New Client
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">Contact</label>
                <input
                  {...register("contact", { required: "Contact is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm">{errors.contact.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">Notes</label>
                <textarea
                  {...register("notes")}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
