import React from 'react';
import { CheckSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const CheckpointSummaryCards = ({ checkpoints }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <CheckSquare className="text-blue-500" size={24} />
          <span className="text-2xl font-bold">{checkpoints.length}</span>
        </div>
        <p className="text-gray-600 text-sm">Total Checkpoints</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="text-green-500" size={24} />
          <span className="text-2xl font-bold">
            {checkpoints.filter(cp => cp.status === 'completed').length}
          </span>
        </div>
        <p className="text-gray-600 text-sm">Completed</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <Clock className="text-blue-500" size={24} />
          <span className="text-2xl font-bold">
            {checkpoints.filter(cp => cp.status === 'in-progress').length}
          </span>
        </div>
        <p className="text-gray-600 text-sm">In Progress</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <AlertCircle className="text-gray-500" size={24} />
          <span className="text-2xl font-bold">
            {checkpoints.filter(cp => cp.status === 'pending').length}
          </span>
        </div>
        <p className="text-gray-600 text-sm">Pending</p>
      </div>
    </div>
  );
};

export default CheckpointSummaryCards;