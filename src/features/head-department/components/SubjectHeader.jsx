import React from 'react';
import { BookOpen, Plus, Users, FileEdit } from 'lucide-react';

/**
 * SubjectHeader Component
 * Style: Matching Staff/Admin Hub Design
 * Branding: FPT Orange
 */
export default function SubjectHeader({ onAddClick, onCreateClick, stats }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
      <div className="relative z-10 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
              Head Department
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Subject <span className="text-orangeFpt-500 font-bold">Management</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage subjects, syllabus, and learning outcomes
            </p>
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={onCreateClick}
                className='flex items-center gap-2 px-5 py-2.5 bg-orangeFpt-500 text-white rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium'
              >
                <Plus className='w-4 h-4' />
                Create a Subject
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          {stats && (
            <div className="w-full max-w-sm">
              <div
                className={`rounded-2xl border px-5 py-4 shadow-sm backdrop-blur transition-all duration-200
                  border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500
                `}
              >
                <div className="flex justify-between items-start">
                  <p className='text-[11px] uppercase tracking-wide font-semibold text-orangeFpt-700'>
                    Total Subjects
                  </p>
                  <Users className='w-5 h-5 text-orangeFpt-600' />
                </div>
                <p className="text-3xl font-bold text-orangeFpt-600 mt-2">
                  {stats.total || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}