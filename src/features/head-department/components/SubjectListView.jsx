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
 */
export default function SubjectListView({ subjects, onView }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full table-fixed'>
        <thead>
          <tr className='border-b border-slate-200 bg-slate-50'>
            <th className='w-[140px] px-4 py-3 text-left text-sm font-semibold text-slate-700'>
              Code
            </th>
            <th className='px-4 py-3 text-left text-sm font-semibold text-slate-700'>
              Name
            </th>
            <th className='w-[180px] px-4 py-3 text-center text-sm font-semibold text-slate-700'>
              Status
            </th>
            <th className='w-[100px] px-4 py-3 text-center text-sm font-semibold text-slate-700'>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr
              key={subject.subjectId}
              className='border-b border-slate-200 hover:bg-slate-200 transition-colors'
            >
              <td className='px-4 py-4'>
                <span className='inline-block px-3 py-1 bg-orangeFpt-100 text-orangeFpt-700 rounded-md text-sm font-mono font-semibold'>
                  {subject.subjectCode}
                </span>
              </td>
              <td className='px-4 py-4'>
                <div className='flex items-center gap-3 min-w-0'>
                  <span className='font-medium text-slate-900 truncate' title={subject.subjectName}>
                    {subject.subjectName}
                  </span>
                </div>
              </td>
              <td className='px-4 py-4 text-center'>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                    subject.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      subject.isActive ? 'bg-green-500' : 'bg-slate-400'
                    }`}
                  ></div>
                  {subject.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className='px-4 py-4 text-center'>
                <div className='flex items-center justify-center gap-2'>
                  <button
                    onClick={() => onView(subject)}
                    className='p-2 text-orangeFpt-500 hover:bg-orangeFpt-50 rounded-lg transition-colors'
                    title='View'
                  >
                    <Eye className='w-4 h-4' />
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