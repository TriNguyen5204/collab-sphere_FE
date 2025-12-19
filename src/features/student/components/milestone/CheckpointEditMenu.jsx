import React from 'react';
import { Edit2, AlertCircle } from 'lucide-react';

const complexityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const CheckpointEditMenu = React.forwardRef((
  {
    isOpen,
    canEdit,
    onToggleMenu,
    onCloseMenu,
    formState,
    onChange,
    onSubmit,
    isSubmitting = false,
    errorMessage,
    errors = {},
    milestoneStartDate,
    milestoneEndDate
  },
  ref
) => {
  const disabled = !canEdit;
  const state = formState ?? {};

  // Helper to update field and trigger parent onChange
  const handleFieldChange = (field, value) => {
    if (typeof onChange === 'function') {
      onChange(field, value); 
    }
  };

  // Helper for input styles
  const getInputClasses = (fieldName) => {
    const baseClasses = "mt-1 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none";
    const hasError = Boolean(errors[fieldName]);

    if (hasError) {
      return `${baseClasses} border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200 animate-shake`;
    }
    return `${baseClasses} border-gray-300 focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-500`;
  };

  // Helper to render inline error
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
    <div ref={ref} className="relative">
      {/* Inject Animation Styles */}
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

      <button
        type="button"
        onClick={onToggleMenu}
        disabled={disabled}
        title={canEdit ? 'Edit checkpoint details' : 'Editing locked'}
        className={`p-2 rounded-lg transition ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-orangeFpt-600 hover:bg-orangeFpt-50'}`}
      >
        <Edit2 size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="border-b px-4 py-3">
            <h4 className="text-sm font-semibold text-gray-900">Update Checkpoint</h4>
            <p className="mt-1 text-xs text-gray-500">Modify details and save changes.</p>
          </div>

          <div className="max-h-96 overflow-y-auto px-4 py-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500">Title *</label>
              <input
                type="text"
                value={state.title ?? ''}
                onChange={(event) => handleFieldChange('title', event.target.value)}
                className={getInputClasses('title')}
                placeholder="Checkpoint title"
              />
              {renderError('title')}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500">Complexity *</label>
              <div className="mt-1 flex gap-2">
                {complexityOptions.map((option) => {
                  const isActive = (state.complexity ?? '').toUpperCase() === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleFieldChange('complexity', option.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'border-orangeFpt-500 bg-orangeFpt-50 text-orangeFpt-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-orangeFpt-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={state.startDate ?? ''}
                  onChange={(event) => handleFieldChange('startDate', event.target.value)}
                  className={getInputClasses('startDate')}
                  min={milestoneStartDate || ''}
                  max={state.dueDate || milestoneEndDate || ''}
                />
                {renderError('startDate')}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500">Due Date *</label>
                <input
                  type="date"
                  value={state.dueDate ?? ''}
                  onChange={(event) => handleFieldChange('dueDate', event.target.value)}
                  className={getInputClasses('dueDate')}
                  min={state.startDate || milestoneStartDate || ''}
                  max={milestoneEndDate || ''}
                />
                {renderError('dueDate')}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500">Description</label>
              <textarea
                value={state.description ?? ''}
                onChange={(event) => handleFieldChange('description', event.target.value)}
                rows={3}
                className={getInputClasses('description')}
                placeholder="Describe the checkpoint"
              />
              {renderError('description')}
            </div>

            {/* Fallback Generic Error Message */}
            {errorMessage ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3">
            <button
              type="button"
              onClick={onCloseMenu}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition ${
                isSubmitting ? 'bg-orangeFpt-300 cursor-not-allowed' : 'bg-orangeFpt-600 hover:bg-orangeFpt-700'
              }`}
            >
                {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

CheckpointEditMenu.displayName = 'CheckpointEditMenu';

export default CheckpointEditMenu;