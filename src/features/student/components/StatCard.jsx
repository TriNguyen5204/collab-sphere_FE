import React from 'react';

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 18,
    value: 'text-xl',
    label: 'text-xs',
    gap: 'mb-1',
  },
  md: {
    container: 'p-4',
    icon: 24,
    value: 'text-2xl',
    label: 'text-sm',
    gap: 'mb-2',
  },
};

const StatCard = ({ icon: Icon, value, label, iconColor, size = 'md' }) => {
  const s = sizeClasses[size] || sizeClasses.md;
  return (
    <div className={`bg-white rounded-lg shadow-md ${s.container}`}>
      <div className={`flex items-center justify-between ${s.gap}`}>
        <Icon className={iconColor} size={s.icon} />
        <span className={`${s.value} font-bold`}>{value}</span>
      </div>
      <p className={`text-gray-600 ${s.label}`}>{label}</p>
    </div>
  );
};

export default StatCard;
