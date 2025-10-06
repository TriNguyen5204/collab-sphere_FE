import React from 'react';
import { Flag, Calendar, ChevronRight, CheckCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import { getStatusColor, getStatusIcon, getDaysRemaining } from '../../../utils/milestoneHelpers';

const iconMap = {
  CheckCircle: CheckCircle,
  Clock: Clock,
  AlertCircle: AlertCircle,
  Lock: Lock,
  Flag: Flag
};

const MilestoneTimeline = ({ milestones, selectedMilestone, onSelectMilestone }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Flag size={24} />
        Milestone Timeline
      </h2>
      
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const daysRemaining = getDaysRemaining(milestone.dueDate);
          const isActive = selectedMilestone.id === milestone.id;
          const IconComponent = iconMap[getStatusIcon(milestone.status)];
          
          return (
            <div key={milestone.id} className="relative">
              {/* Connection Line */}
              {index < milestones.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-8 bg-gray-300" />
              )}
              
              <button
                onClick={() => milestone.status !== 'locked' && onSelectMilestone(milestone)}
                disabled={milestone.status === 'locked'}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : milestone.status === 'locked'
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getStatusColor(milestone.status)}`}>
                    <IconComponent size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {milestone.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Calendar size={12} />
                      <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                      {milestone.status !== 'completed' && milestone.status !== 'locked' && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className={daysRemaining < 0 ? "text-red-600 font-semibold" : daysRemaining <= 7 ? "text-orange-600" : ""}>
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? "Due today" : `${daysRemaining} days left`}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            milestone.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {isActive && <ChevronRight className="text-blue-500 flex-shrink-0" size={20} />}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTimeline;