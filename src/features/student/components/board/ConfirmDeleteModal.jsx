import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, type = 'task' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4'>
      <div className='bg-white rounded-xl w-full max-w-md shadow-2xl animate-slideUp'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <AlertTriangle size={20} className='text-red-600' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800'>
              {title || `Delete ${type === 'task' ? 'Task' : 'Subtask'}?`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors'
            type='button'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className='p-6'>
          <p className='text-gray-600'>
            {message || `Are you sure you want to delete this ${type}? This action cannot be undone.`}
          </p>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-colors'
            type='button'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors'
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