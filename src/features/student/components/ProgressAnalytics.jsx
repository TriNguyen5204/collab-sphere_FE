import React from 'react';
import { BarChart3, Flag, CheckSquare } from 'lucide-react';
import { Skeleton } from './skeletons/StudentSkeletons';

const clampPercent = (n) => {
  const num = Number.isFinite(n) ? n : 0;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return Math.round(num);
};

const ProgressBar = ({ label, rightLabel, value, color = 'bg-orangeFpt-500' }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="text-gray-600">{label}</span>
      {rightLabel ? <span className="font-semibold">{rightLabel}</span> : null}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`${color} h-3 rounded-full transition-all duration-300`}
        style={{ width: `${clampPercent(value)}%` }}
      />
    </div>
  </div>
);

const ProgressAnalytics = ({ progress, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const p = progress || {};

  const overall = clampPercent(p.overallProgress ?? 0);

  const milestonesCompleted = p.milestonesComplete ?? 0;
  const milestonesTotal = p.totalMilestones ?? 0;
  const milestonesPct = clampPercent(
    p.milestonesProgress ?? (milestonesTotal > 0 ? (milestonesCompleted / milestonesTotal) * 100 : 0)
  );

  const checkpointsCompleted = p.checkpointsComplete ?? 0;
  const checkpointsTotal = p.totalCheckpoints ?? 0;
  const checkpointsPct = clampPercent(
    p.checkPointProgress ?? (checkpointsTotal > 0 ? (checkpointsCompleted / checkpointsTotal) * 100 : 0)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={24} />
        Progress Analytics
      </h2>

      <div className="space-y-5">
        <ProgressBar label="Overall Progress" rightLabel={`${overall}%`} value={overall} />

        <div className="pt-2 border-t space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Flag size={16} className="text-blue-500" />
            <span className="font-medium">Milestones</span>
            <span className="text-gray-500">({milestonesCompleted}/{milestonesTotal})</span>
          </div>
          <ProgressBar label="Milestones Progress" rightLabel={`${milestonesPct}%`} value={milestonesPct} color="bg-indigo-600" />

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckSquare size={16} className="text-green-600" />
            <span className="font-medium">Checkpoints</span>
            <span className="text-gray-500">({checkpointsCompleted}/{checkpointsTotal})</span>
          </div>
          <ProgressBar label="Checkpoints Progress" rightLabel={`${checkpointsPct}%`} value={checkpointsPct} color="bg-green-600" />
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
