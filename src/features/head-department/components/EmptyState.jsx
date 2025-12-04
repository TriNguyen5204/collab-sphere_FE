import React from 'react';
import { Search } from 'lucide-react';

/**
 * EmptyState Component
 * Displays when no subjects are found
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query (optional)
 */
export default function EmptyState({ searchQuery }) {
  return (
    <div className='text-center py-12'>
      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
        <Search className='w-8 h-8 text-gray-400' />
      </div>
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
        No subjects found
      </h3>
      <p className='text-gray-500 text-sm'>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first subject'}
      </p>
    </div>
  );
}