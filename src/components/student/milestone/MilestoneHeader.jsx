import React from 'react';
import { Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { getStatusColor } from '../../../utils/milestoneHelpers';

const MilestoneHeader = ({ milestone, isLeader, onComplete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{milestone.title}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(milestone.status)}`}>
              {milestone.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600">{milestone.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600 mb-1">Due Date</p>
          <p className="font-semibold flex items-center gap-2">
            <Calendar size={16} />
            {new Date(milestone.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Questions Completed</p>
          <p className="font-semibold flex items-center gap-2">
            <MessageSquare size={16} />
            {milestone.completedAnswers} / {milestone.requiredAnswers}
          </p>
        </div>
        {milestone.status === 'completed' && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Date</p>
              <p className="font-semibold text-green-600">
                {new Date(milestone.completedDate).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Progress Overview */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold">{milestone.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              milestone.progress < 30 ? 'bg-red-500' :
              milestone.progress < 70 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>

      {/* Complete Milestone Button (Leader Only) */}
      {isLeader && milestone.status === 'in-progress' && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onComplete}
            disabled={milestone.completedAnswers < milestone.requiredAnswers}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            <CheckCircle size={20} />
            Mark Milestone as Complete
          </button>
          {milestone.completedAnswers < milestone.requiredAnswers && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              ⚠️ Answer all questions before completing this milestone
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MilestoneHeader;