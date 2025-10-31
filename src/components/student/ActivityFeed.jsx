import React from 'react';
import { Activity } from 'lucide-react';
import { Skeleton } from '../skeletons/StudentSkeletons';

const ActivityFeed = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pb-3 border-b last:border-b-0">
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Activity size={24} />
        Recent Activity
      </h2>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="pb-3 border-b last:border-b-0">
            <p className="text-sm">
              <span className="font-semibold">{activity.user}</span>
              {' '}<span className="text-gray-600">{activity.action}</span>
              {' '}<span className="font-medium">{activity.task}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;