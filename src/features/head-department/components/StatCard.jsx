import React from 'react';

/**
 * StatCard Component
 * Displays a statistic with an icon, label, and value
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.label - Label text
 * @param {number} props.value - Numeric value to display
 * @param {string} props.color - Color theme (blue, green, gray, purple)
 */
export default function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-50 text-gray-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-gray-600 mb-1'>{label}</p>
          <p className='text-3xl font-bold text-gray-900'>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className='w-6 h-6' />
        </div>
      </div>
    </div>
  );
}