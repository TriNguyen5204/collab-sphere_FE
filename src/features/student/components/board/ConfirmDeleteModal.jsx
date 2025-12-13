import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, type = 'task' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn'>
      <div className='bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp border border-gray-100 overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center justify-between'>
          <div className='flex items-center gap-2 text-white'>
            <div className='p-1.5 bg-white/20 rounded-lg backdrop-blur-sm'>
              <AlertTriangle size={20} />
            </div>
            <h3 className='text-lg font-bold tracking-tight'>
              {title || `Delete ${type === 'task' ? 'Task' : 'Subtask'}?`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-all'
            type='button'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-6'>
          <p className='text-gray-600 font-medium'>
            {message || `Are you sure you want to delete this ${type}? This action cannot be undone.`}
          </p>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl font-medium transition-all'
            type='button'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className='px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2'
            type='button'
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;