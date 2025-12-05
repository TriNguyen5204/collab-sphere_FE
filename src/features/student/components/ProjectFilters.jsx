import React from 'react';
import { Search, Filter } from 'lucide-react';

const ProjectFilters = ({ 
  searchQuery, 
  onSearchChange, 
  selectedClass, 
  onClassChange, 
  semesterFilter, 
  onSemesterChange,
  classes = [],
  semesters = [],
  compact = false,
  framed = true,
}) => {
  const containerClasses = compact
    ? "rounded-2xl border border-orangeFpt-200/50 bg-white/95 backdrop-blur-xl shadow-[0_20px_45px_-25px_rgba(249,115,22,0.55)]"
    : "rounded-2xl border border-slate-100 bg-white/85 backdrop-blur-md shadow-lg shadow-orangeFpt-100/40";

  const labelClasses = "text-xs font-semibold uppercase tracking-wide text-orangeFpt-600";
  const fieldBase = "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-orangeFpt-400 focus:outline-none focus:ring-2 focus:ring-orangeFpt-200";

  const controls = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Search */}
      <div className="flex flex-col gap-2">
        <span className={labelClasses}>Search</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Find projects or teams"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${fieldBase} pl-10`}
          />
        </div>
      </div>

      {/* Class Filter */}
      <div className="flex flex-col gap-2">
        <span className={labelClasses}>Class</span>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className={`${fieldBase} appearance-none pl-10`}
          >
            <option value="all">All Classes</option>
            {classes.map((cls, idx) => (
              <option key={idx} value={cls.code}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Semester Filter */}
      <div className="flex flex-col gap-2">
        <span className={labelClasses}>Semester</span>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={semesterFilter}
            onChange={(e) => onSemesterChange(e.target.value)}
            className={`${fieldBase} appearance-none pl-10`}
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem, idx) => (
              <option key={idx} value={sem.code}>
                {sem.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  if (!framed) {
    return controls;
  }

  return (
    <div className='p-4'>
      {controls}
    </div>
  );
};

export default ProjectFilters;
