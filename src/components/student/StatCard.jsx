import React from 'react';

const StatCard = ({ icon: Icon, value, label, iconColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={iconColor} size={24} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
};

export default StatCard;