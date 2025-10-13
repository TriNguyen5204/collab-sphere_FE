import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const EnrolledClassesSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 rounded-lg border-2 border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export const ClassDetailsSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
    <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  </div>
);