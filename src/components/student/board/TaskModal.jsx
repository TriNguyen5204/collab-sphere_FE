import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const TaskModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;


  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
    });

    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Task Title */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-600">
            Task Name
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-blue-500"
            placeholder="Enter task name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
