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
  },
  ref
) => {
  const disabled = !canEdit;
  const state = formState ?? {};

  const handleFieldChange = (field, value) => {
    if (typeof onChange === 'function') {
      onChange({ ...state, [field]: value });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggleMenu}
        disabled={disabled}
        title={canEdit ? 'Edit checkpoint details' : 'Editing locked'}
        className={`p-2 rounded-lg transition ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
      >
        <Edit2 size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl">
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
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Checkpoint title"
              />
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
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
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
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500">Due Date *</label>
                <input
                  type="date"
                  value={state.dueDate ?? ''}
                  onChange={(event) => handleFieldChange('dueDate', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500">Description</label>
              <textarea
                value={state.description ?? ''}
                onChange={(event) => handleFieldChange('description', event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the checkpoint"
              />
            </div>

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
                isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
