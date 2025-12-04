import React from 'react';
import { Search, Grid, List } from 'lucide-react';

/**
 * SubjectFilters Component
 * Search bar, status filter, and view mode toggle
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {string} props.statusFilter - Current status filter ('all', 'active', 'inactive')
 * @param {Function} props.onStatusChange - Callback when status filter changes
 * @param {string} props.viewMode - Current view mode ('grid' or 'list')
 * @param {Function} props.onViewModeChange - Callback when view mode changes
 * @param {number} props.currentCount - Number of subjects currently displayed
 * @param {number} props.totalCount - Total number of filtered subjects
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
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <div className='flex flex-col md:flex-row gap-4'>
        {/* Search */}
        <div className='flex-1 relative'>
          <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search by subject name or code...'
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all'
        >
          <option value='all'>All Status</option>
          <option value='active'>Active Only</option>
          <option value='inactive'>Inactive Only</option>
        </select>

        {/* View Mode Toggle */}
        <div className='flex gap-2'>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title='Grid View'
          >
            <Grid className='w-5 h-5' />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title='List View'
          >
            <List className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className='mt-4 text-sm text-gray-600'>
        Showing {currentCount} of {totalCount} subjects
      </div>
    </div>
  );
}