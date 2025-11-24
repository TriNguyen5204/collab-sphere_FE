import React from 'react';

/**
 * @typedef {Object} StatCardProps
 * @property {string} label
 * @property {number | string} value
 * @property {React.ReactNode} icon
 * @property {string} [trend]
 * @property {string} [accent]
 */

/**
 * Minimal statistic tile for metadata sidebar.
 * @param {StatCardProps} props
 */
const StatCard = ({ label, value, icon, trend, accent = 'text-gray-500' }) => (
  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/80 px-3 py-2">
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
    <div className={`flex flex-col items-end text-xs ${accent}`}>
      {icon}
      {trend && <span className="mt-1 font-medium">{trend}</span>}
    </div>
  </div>
);

export default StatCard;
