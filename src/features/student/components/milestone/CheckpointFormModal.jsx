import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const CheckpointFormModal = ({ 
  isOpen, 
  title, 
  checkpoint = {}, 
  onChange, 
  onSubmit, 
  onClose,
  errors = {} // New prop for error object
}) => {
  if (!isOpen) return null;

  // Basic validation for button state (keep your existing logic)
  const hasDueDate = Boolean(checkpoint.dueDate);
  const hasTitle = Boolean(checkpoint.title?.trim());
  // Note: I removed hasDescription from "isFormValid" to allow API to validate it 
  // or allow optional descriptions if your business logic changes, 
  // but kept it consistent with your current request.
  const isFormValid = hasDueDate && hasTitle; 
  
  const actionButtonClasses = `px-6 py-2 text-white rounded-lg transition ${isFormValid ? 'bg-orangeFpt-500 hover:bg-orangeFpt-600' : 'bg-orangeFpt-300 cursor-not-allowed opacity-70'}`;

  // Helper to get input styles
  const getInputClasses = (fieldName) => {
    const baseClasses = "w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-200";
    const hasError = Boolean(errors[fieldName]);
    
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-2 focus:ring-red-200 animate-shake bg-red-50`;
    }
    return `${baseClasses} border-gray-300 focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent`;
  };

  // Helper to render error message
  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-red-500 text-xs animate-fadeIn">
        <AlertCircle size={12} />
        <span>{errors[fieldName]}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Inject Shake Animation Styles */}
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>

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
                onChange={(e) => onChange({ ...checkpoint, startDate: e.target.value }, 'startDate')}
                className={getInputClasses('startDate')}
              />
              {renderError('startDate')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={checkpoint.dueDate}
                onChange={(e) => onChange({ ...checkpoint, dueDate: e.target.value }, 'dueDate')}
                className={getInputClasses('dueDate')}
              />
               {renderError('dueDate')}
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
              onChange={(e) => onChange({ ...checkpoint, title: e.target.value }, 'title')}
              placeholder="Enter checkpoint title"
              className={getInputClasses('title')}
            />
            {renderError('title')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={checkpoint.description}
              onChange={(e) => onChange({ ...checkpoint, description: e.target.value }, 'description')}
              placeholder="Enter checkpoint description"
              rows={4}
              className={getInputClasses('description')}
            />
            {renderError('description')}
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