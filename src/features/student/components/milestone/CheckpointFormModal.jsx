import React from 'react';
import { X } from 'lucide-react';

const CheckpointFormModal = ({ 
  isOpen, 
  title, 
  checkpoint = {}, 
  onChange, 
  onSubmit, 
  onClose 
}) => {
  if (!isOpen) return null;

  const hasStartDate = Boolean(checkpoint.startDate);
  const hasDueDate = Boolean(checkpoint.dueDate);
  const hasComplexity = Boolean(checkpoint.complexity);
  const hasTitle = Boolean(checkpoint.title?.trim());
  const hasDescription = Boolean(checkpoint.description?.trim());
  const isFormValid = hasStartDate && hasDueDate && hasComplexity && hasTitle && hasDescription;
  const actionButtonClasses = `px-6 py-2 text-white rounded-lg transition ${isFormValid ? 'bg-orangeFpt-500 hover:bg-orangeFpt-600' : 'bg-orangeFpt-300 cursor-not-allowed opacity-70'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={checkpoint.startDate || ''}
                onChange={(e) => onChange({ ...checkpoint, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={checkpoint.dueDate}
                onChange={(e) => onChange({ ...checkpoint, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complexity
            </label>
            <select
              value={checkpoint.complexity || 'LOW'}
              onChange={(e) => onChange({ ...checkpoint, complexity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent focus:outline-none"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={checkpoint.title}
              onChange={(e) => onChange({ ...checkpoint, title: e.target.value })}
              placeholder="Enter checkpoint title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={checkpoint.description}
              onChange={(e) => onChange({ ...checkpoint, description: e.target.value })}
              placeholder="Enter checkpoint description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent focus:outline-none"
            />
          </div>

        </div>

        <div className="p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={actionButtonClasses}
            disabled={!isFormValid}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckpointFormModal;
