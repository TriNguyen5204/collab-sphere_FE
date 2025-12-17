import React from 'react';
import { Edit, Trash2, CalendarDays } from 'lucide-react';


export default function SemesterList({ semesters, onEdit, onDelete }) {
  if (!semesters || semesters.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-slate-400'>
        <CalendarDays className='w-16 h-16 mb-4 opacity-50' />
        <p className='text-lg font-medium'>No semesters found</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full table-fixed'>
        <thead>
          <tr className='border-b border-slate-200 bg-slate-50'>
            <th className='w-[150px] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
              Code
            </th>
            <th className='px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
              Semester Name
            </th>
            <th className='w-[200px] px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500'>
              Duration
            </th>
            <th className='w-[120px] px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500'>
              Action
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>
          {semesters.map((semester) => (
            <tr
              key={semester.semesterId}
              className='hover:bg-slate-50/80 transition-colors'
            >
              <td className='px-6 py-4'>
                <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-sm font-mono font-bold border border-orangeFpt-100'>
                  {semester.semesterCode}
                </span>
              </td>
              <td className='px-6 py-4'>
                <div className='font-semibold text-slate-800'>
                  {semester.semesterName}
                </div>
              </td>
              <td className='px-6 py-4'>
                <div className='flex flex-col text-sm'>
                  <div className='flex items-center gap-2 text-slate-700'>
                    <span className='w-1 h-1 rounded-full bg-green-500'></span>
                    {new Date(semester.startDate).toLocaleDateString('en-GB')}
                  </div>
                  <div className='w-0.5 h-2 bg-slate-200 ml-0.5 my-0.5'></div>
                  <div className='flex items-center gap-2 text-slate-700'>
                    <span className='w-1 h-1 rounded-full bg-red-500'></span>
                    {new Date(semester.endDate).toLocaleDateString('en-GB')}
                  </div>
                </div>
              </td>
              <td className='px-6 py-4 text-center'>
                <div className='flex items-center justify-center gap-2'>
                  <button
                    onClick={() => onEdit(semester)}
                    className='p-2 text-slate-400 hover:text-orangeFpt-600 hover:bg-orangeFpt-50 rounded-lg transition-all'
                    title='Edit Semester'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => onDelete(semester)}
                    className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
                    title='Delete Semester'
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