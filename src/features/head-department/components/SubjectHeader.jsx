import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

/**
 * SubjectHeader Component
 * Page header with title and add button
 * 
 * @param {Object} props
 * @param {Function} props.onAddClick - Callback when add button is clicked
 */
export default function SubjectHeader({ onAddClick }) {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <BookOpen className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Subject Management
              </h1>
              <p className='text-sm text-gray-500 mt-1'>
                Manage subjects, syllabus, and learning outcomes
              </p>
            </div>
          </div>
          <button
            onClick={onAddClick}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
          >
            <Plus className='w-4 h-4' />
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
}