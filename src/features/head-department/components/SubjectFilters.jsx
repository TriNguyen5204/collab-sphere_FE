import React from 'react';
import { Search, Grid, List, ChevronDown } from 'lucide-react';

/**
 * SubjectFilters Component
 * Style: Soft Minimalism (theo style.md)
 * Branding: FPT Orange
 */
export default function SubjectFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  currentCount,
  totalCount,
}) {
  return (
    // Implementation Notes: Light elevation, rounded containers, generous whitespace
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'>
      <div className='flex flex-col md:flex-row gap-4 items-center'>
        
        {/* Search */}
        <div className='flex-1 relative w-full'>
          <Search className='w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
          {/* Visual Identity: Soft geometry. Color Strategy: Accent color on focus. */}
          <input
            type='text'
            placeholder='Search by subject name or code...'
            className='w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-700 placeholder-gray-400 focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none transition-all duration-200'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className='relative min-w-[180px] w-full md:w-auto'>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            // Implementation Notes: Soft shadows, minimal iconography
            className='w-full appearance-none px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-700 cursor-pointer focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none transition-all duration-200'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active Only</option>
            <option value='inactive'>Inactive Only</option>
          </select>
          <ChevronDown className='w-4 h-4 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
        </div>

        {/* View Mode Toggle */}
        <div className='flex gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100'>
          <button
            onClick={() => onViewModeChange('grid')}
            // Color Strategy: Muted warm palette for active state
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title='Grid View'
          >
            <Grid className='w-5 h-5' />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title='List View'
          >
            <List className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Results count */}
      {/* Visual Identity: Friendly typography */}
      <div className='mt-4 text-sm font-medium text-gray-400 ml-1'>
        Showing <span className='text-gray-900 font-semibold'>{currentCount}</span> of {totalCount} subjects
      </div>
    </div>
  );
}