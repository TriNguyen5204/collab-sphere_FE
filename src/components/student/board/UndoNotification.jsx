import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

const UndoNotification = ({ message, onUndo, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slideUp">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[320px]">
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onUndo}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-medium transition-all"
        >
          <RotateCcw size={16} />
          Undo
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default UndoNotification;