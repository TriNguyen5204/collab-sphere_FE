import React from 'react';
import { BookOpen, Eye, Edit, Trash2 } from 'lucide-react';

// Helper function for glass panel styling
const glassPanelClass = 'backdrop-blur-sm bg-white/40 border border-white/60';

// Helper function to get subject gradient based on subject code
const getSubjectGradient = (subjectCode) => {
  const gradients = {
    DBI202: 'from-yellow-100 via-white to-yellow-100',
    CS102: 'from-blue-100 via-white to-blue-100',
    DBI201: 'from-green-100 via-white to-green-100',
    PM101: 'from-orange-100 via-white to-orange-100',
    WED201: 'from-purple-100 via-white to-purple-100',
    DS: 'from-pink-100 via-white to-pink-100',
    CS101: 'from-indigo-100 via-white to-indigo-100',
    OSG202: 'from-rose-100 via-white to-rose-100',
    ES211: 'from-cyan-100 via-white to-cyan-100',
  };
  return gradients[subjectCode] || 'from-violet-100 via-white to-blue-100';
};

// StatusBadge Component
const StatusBadge = ({ isActive }) => (
  <span
    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
      isActive
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-gray-200 text-gray-600'
    }`}
  >
    {isActive ? 'ACTIVE' : 'INACTIVE'}
  </span>
);

/**
 * SubjectCard Component
 * Displays a single subject in card format
 * 
 * @param {Object} props
 * @param {Object} props.subject - Subject data object
 * @param {Function} props.onView - Callback when view button clicked
 */
export default function SubjectCard({ subject, onView }) {
  return (
    <div
      className={`${glassPanelClass} flex h-full flex-col rounded-3xl bg-gradient-to-br ${getSubjectGradient(
        subject.subjectCode
      )} p-4 transition hover:-translate-y-1 hover:shadow-2xl focus-within:ring-4 focus-within:ring-orange-200`}
    >
      {/* Header */}
      <div className='flex items-center justify-between gap-3 mb-4'>
        <div className='flex-1 min-w-0'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 mb-1.5'>
            SUBJECT
          </p>
          <h3 className='text-xl font-bold text-slate-900 line-clamp-2 leading-tight'>
            {subject.subjectName}
          </h3>
          <p className='text-sm text-slate-500 mt-1'>
            Code: {subject.subjectCode}
          </p>
        </div>
        <StatusBadge isActive={subject.isActive} />
      </div>

      {/* Subject Info */}
      <div className='flex-1 mb-4'>
        <div className='bg-white/90 rounded-xl p-3 border border-gray-100 shadow-sm'>
          <div className='flex items-center gap-2'>
            <BookOpen className='w-4 h-4 text-gray-400 flex-shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-gray-500'>Subject Code</p>
              <p className='text-lg font-bold text-gray-900 font-mono'>
                {subject.subjectCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2 pt-4 border-t border-gray-200/50'>
        <button
          onClick={() => onView(subject)}
          className='flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'
        >
          <Eye className='w-4 h-4' />
          View
        </button>
      </div>
    </div>
  );
}