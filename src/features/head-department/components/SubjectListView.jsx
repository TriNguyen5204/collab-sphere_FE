import React from 'react';
import { BookOpen, Eye, Edit, Trash2 } from 'lucide-react';

/**
 * SubjectListView Component
 * Displays subjects in a table/list layout
 * 
 * @param {Object} props
 * @param {Array} props.subjects - Array of subject objects
 * @param {Function} props.onView - Callback when view button clicked
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 */
export default function SubjectListView({ subjects, onView, onEdit, onDelete }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-gray-200'>
            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
              Subject Code
            </th>
            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
              Subject Name
            </th>
            <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
              Status
            </th>
            <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr
              key={subject.subjectId}
              className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
            >
              <td className='px-4 py-4'>
                <span className='inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-mono font-semibold'>
                  {subject.subjectCode}
                </span>
              </td>
              <td className='px-4 py-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <BookOpen className='w-5 h-5 text-blue-600' />
                  </div>
                  <span className='font-medium text-gray-900'>
                    {subject.subjectName}
                  </span>
                </div>
              </td>
              <td className='px-4 py-4'>
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
              </td>
              <td className='px-4 py-4'>
                <div className='flex items-center justify-end gap-2'>
                  <button
                    onClick={() => onView(subject)}
                    className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                    title='View'
                  >
                    <Eye className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => onEdit(subject)}
                    className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                    title='Edit'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => onDelete(subject)}
                    className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    title='Delete'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}