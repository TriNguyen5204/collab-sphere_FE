import React from 'react';
import { Activity } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
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