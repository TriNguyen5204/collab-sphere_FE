import React from 'react';
import { BookOpen, Eye, Edit, Trash2 } from 'lucide-react';

/**
 * SubjectCard Component
 * Displays a single subject in card format
 * 
 * @param {Object} props
 * @param {Object} props.subject - Subject data object
 * @param {Function} props.onView - Callback when view button clicked
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 */
export default function SubjectCard({ subject, onView, onEdit, onDelete }) {
  return (
    <div className='group bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200'>
      <div className='p-6'>
        {/* Header */}
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
              <BookOpen className='w-6 h-6 text-blue-600' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-gray-900 text-base line-clamp-2 leading-tight'>
                {subject.subjectName}
              </h3>
            </div>
          </div>
        </div>

        {/* Subject Code */}
        <div className='mb-4'>
          <span className='inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-mono font-semibold'>
            {subject.subjectCode}
          </span>
        </div>

        {/* Status */}
        <div className='mb-4'>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
              subject.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                subject.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></div>
            {subject.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className='flex gap-2 pt-4 border-t border-gray-200'>
          <button
            onClick={() => onView(subject)}
            className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
          >
            <Eye className='w-4 h-4' />
            View
          </button>
          <button
            onClick={() => onEdit(subject)}
            className='flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
          >
            <Edit className='w-4 h-4' />
          </button>
          <button
            onClick={() => onDelete(subject)}
            className='flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
}