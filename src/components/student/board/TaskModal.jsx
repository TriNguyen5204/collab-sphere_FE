import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const TaskModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [subtasks, setSubtasks] = useState([{ id: Date.now(), text: "" }]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now(), text: "" }]);
  };

  const handleUpdateSubtask = (id, value) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, text: value } : st))
    );
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      subtasks: subtasks.filter((st) => st.text.trim() !== "")
    });

    setTitle("");
    setSubtasks([{ id: Date.now(), text: "" }]);
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

        {/* Subtasks */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-600">
            Subtasks
          </label>

          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={subtask.text}
                  onChange={(e) =>
                    handleUpdateSubtask(subtask.id, e.target.value)
                  }
                  placeholder="Subtask name..."
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-blue-500"
                />
                <button
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask */}
          <button
            onClick={handleAddSubtask}
            className="mt-3 flex items-center gap-2 text-blue-600 text-sm hover:text-blue-700"
          >
            <Plus size={16} />
            Add Subtask
          </button>
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
