import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 * Handles page navigation with smart ellipsis for large page counts
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {number} props.maxVisiblePages - Maximum number of page buttons to show (default: 5)
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5 
}) {
  const pages = [];

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className='p-4'>
      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-600'>
          Page {currentPage} of {totalPages}
        </div>
        
        <div className='flex items-center gap-2'>
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Previous Page'
          >
            <ChevronLeft className='w-5 h-5 text-gray-600' />
          </button>

          {/* First Page + Ellipsis */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className='px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700'
              >
                1
              </button>
              {startPage > 2 && <span className='text-gray-400'>...</span>}
            </>
          )}

          {/* Page Numbers */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                currentPage === page
                  ? 'bg-orangeFpt-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last Page + Ellipsis */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className='text-gray-400'>...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className='px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700'
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            title='Next Page'
          >
            <ChevronRight className='w-5 h-5 text-gray-600' />
          </button>
        </div>
      </div>
    </div>
  );
}