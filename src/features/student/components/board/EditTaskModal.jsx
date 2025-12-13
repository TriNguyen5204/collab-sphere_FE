import React, { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';

const EditTaskModal = ({ isOpen, onClose, onSave, initialTitle, type = 'task' }) => {
  const [title, setTitle] = useState(initialTitle || '');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || '');
    }
  }, [isOpen, initialTitle]);

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
    <div className='fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn'>
      <div className='bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp border border-gray-100 overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 p-4 flex items-center justify-between'>
          <div className='flex items-center gap-2 text-white'>
            <div className='p-1.5 bg-white/20 rounded-lg backdrop-blur-sm'>
              <Pencil size={20} />
            </div>
            <h3 className='text-lg font-bold tracking-tight'>
              {type === 'task' ? 'Rename Task' : 'Rename Subtask'}
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
          <label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1'>
            {type === 'task' ? 'Task Title' : 'Subtask Title'}
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder={`Enter ${type} title...`}
            className='w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all placeholder-gray-400'
          />
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
            onClick={handleSave}
            disabled={!title.trim()}
            className='px-6 py-2 bg-orangeFpt-500 hover:bg-orangeFpt-600 text-white rounded-xl font-bold shadow-lg shadow-orangeFpt-500/30 hover:shadow-orangeFpt-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            type='button'
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;