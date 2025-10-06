import React from 'react';
import { BarChart3 } from 'lucide-react';

const ProgressAnalytics = ({ progress }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={24} />
        Progress Analytics
      </h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold">{progress.overall}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.overall}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              Completed
            </span>
            <span className="font-semibold">{progress.tasksCompleted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              In Progress
            </span>
            <span className="font-semibold">{progress.tasksInProgress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              Blocked
            </span>
            <span className="font-semibold">{progress.tasksBlocked}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded" />
              To Do
            </span>
            <span className="font-semibold">{progress.tasksTodo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;