import React from 'react';
import { Calendar, Clock, Crown, Edit2, Trash2, Upload, CheckCircle } from 'lucide-react';
import { getStatusColor, getDaysRemaining } from '../../../utils/checkpointHelpers';
import SubmissionsList from './SubmissionsList';

const CheckpointCard = ({ 
  checkpoint, 
  isLeader, 
  onEdit, 
  onDelete, 
  onUpload, 
  onMarkComplete,
  onDeleteSubmission 
}) => {
  const daysRemaining = getDaysRemaining(checkpoint.dueDate);
  const isOverdue = daysRemaining < 0 && checkpoint.status !== 'completed';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Checkpoint Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{checkpoint.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(isOverdue ? 'overdue' : checkpoint.status)}`}>
                {isOverdue ? 'OVERDUE' : checkpoint.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{checkpoint.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Due: {new Date(checkpoint.dueDate).toLocaleDateString()}</span>
              </div>
              {checkpoint.status !== 'completed' && (
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span className={isOverdue ? "text-red-600 font-semibold" : daysRemaining <= 3 ? "text-orange-600" : ""}>
                    {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? "Due today" : `${daysRemaining} days left`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Crown className="text-yellow-500" size={16} />
                <span>Created by {checkpoint.createdBy}</span>
              </div>
            </div>
          </div>

          {isLeader && checkpoint.status !== 'completed' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(checkpoint)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit checkpoint"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(checkpoint.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete checkpoint"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submissions Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Upload size={20} />
            Submissions ({checkpoint.submissions.length})
          </h4>
          {checkpoint.status !== 'completed' && (
            <button
              onClick={() => onUpload(checkpoint)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Upload size={16} />
              Upload Files
            </button>
          )}
        </div>

        <SubmissionsList 
          submissions={checkpoint.submissions}
          checkpointId={checkpoint.id}
          isCompleted={checkpoint.status === 'completed'}
          onDeleteSubmission={onDeleteSubmission}
        />

        {/* Mark Complete Button */}
        {isLeader && checkpoint.status !== 'completed' && checkpoint.submissions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => onMarkComplete(checkpoint.id)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
            >
              <CheckCircle size={20} />
              Mark as Complete
            </button>
          </div>
        )}

        {/* Comments Section */}
        {checkpoint.comments && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Note:</span> {checkpoint.comments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckpointCard;