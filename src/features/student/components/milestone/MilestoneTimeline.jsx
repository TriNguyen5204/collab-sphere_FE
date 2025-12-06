import React from 'react';
import { Flag, Calendar, ChevronRight, CheckCircle, Clock, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { getStatusColor, getStatusIcon, getDaysRemaining, normalizeMilestoneStatus } from '../../../../utils/milestoneHelpers';

const iconMap = {
  CheckCircle: CheckCircle,
  Clock: Clock,
  AlertCircle: AlertCircle,
  Flag: Flag
};

const MilestoneTimeline = ({ milestones, selectedMilestone, onSelectMilestone}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Flag size={24} />
        Milestone Timeline
      </h2>

      <div className="space-y-3 w-full">
        {milestones.map((milestone) => {
          const dueDate = milestone?.endDate;
          const daysRemaining = dueDate ? getDaysRemaining(dueDate) : 0;
          const activeId = selectedMilestone?.teamMilestoneId;
          const milestoneId = milestone?.teamMilestoneId;
          const status = normalizeMilestoneStatus(milestone?.status);
          const iconKey = getStatusIcon(status);
          const IconComponent = iconMap[iconKey] || Flag;
          const isActive = activeId === milestoneId;

          return (
            <div key={milestoneId} className="w-full">
              <button
                onClick={() => onSelectMilestone(milestone)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${isActive
                    ? 'border-orangeFpt-500 bg-orangeFpt-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } flex items-start gap-3`}
              >
                  <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {milestone.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Calendar size={12} />
                      <span>{dueDate ? new Date(dueDate).toLocaleDateString() : '—'}</span>
                      {status?.toLowerCase() !== 'completed' && dueDate && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className={daysRemaining < 0 ? "text-red-600 font-semibold" : daysRemaining <= 7 ? "text-orange-600" : ""}>
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? "Due today" : `${daysRemaining} days left`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="text-orangeFpt-500 flex-shrink-0 self-center" size={20} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
