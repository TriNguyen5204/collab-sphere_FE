import React from 'react';
import { CheckSquare, CheckCircle, Clock } from 'lucide-react';

const CheckpointSummaryCards = ({ checkpoints }) => {
  const resolveStatus = (cp) => {
    const raw = cp.uiStatus || cp.statusString || cp.status;
    if (typeof raw === 'string') return raw.toLowerCase();
    if (raw === 1) return 'completed';
    return 'processing';
  };

  const completed = checkpoints.filter(cp => resolveStatus(cp) === 'completed').length;
  const processing = checkpoints.filter(cp => resolveStatus(cp) !== 'completed').length;
  const total = checkpoints.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <CheckSquare className="text-blue-500" size={24} />
          <span className="text-2xl font-bold">{total}</span>
        </div>
        <p className="text-gray-600 text-sm">Total Checkpoints</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <Clock className="text-blue-500" size={24} />
          <span className="text-2xl font-bold">{processing}</span>
        </div>
        <p className="text-gray-600 text-sm">Processing</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="text-green-500" size={24} />
          <span className="text-2xl font-bold">{completed}</span>
        </div>
        <p className="text-gray-600 text-sm">Completed</p>
      </div>
    </div>
  );
};

export default CheckpointSummaryCards;
