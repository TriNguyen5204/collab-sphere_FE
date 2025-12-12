import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

/**
 * SubjectFilters Component
 * Style: Matching Staff/Admin Hub Design
 * Branding: FPT Orange
 */
export default function SubjectFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  currentCount,
  totalCount,
}) {
  return (
    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2'>
      <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2 '>
        Subjects
        <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
          {searchQuery ? `${currentCount} of ${totalCount}` : `${totalCount} total`}
        </span>
      </h2>
      
      {/* Search & Filter Controls */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Search Bar */}
        <div className='relative'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search by name or code...'
            className='w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm'
          />
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
        </div>

        {/* Status Filter */}
        <div className='relative'>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className='appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm cursor-pointer'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active Only</option>
            <option value='inactive'>Inactive Only</option>
          </select>
          <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none' />
        </div>
      </div>
    </div>
  );
}