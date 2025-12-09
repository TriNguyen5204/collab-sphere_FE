import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const AddSubtaskModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim());
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4'>
      <div className='bg-white rounded-xl w-full max-w-md shadow-2xl animate-slideUp'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <Plus size={20} className='text-blue-600' />
            <h3 className='text-lg font-semibold text-gray-800'>
              Add Subtask
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
        <div className='p-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Subtask Title
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder='Enter subtask title...'
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
          />
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
            onClick={handleSave}
            disabled={!title.trim()}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
            type='button'
          >
            <Plus size={18} />
            Add Subtask
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubtaskModal;