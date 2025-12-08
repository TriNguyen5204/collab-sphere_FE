import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

/**
 * SubjectHeader Component
 * Style: Soft Minimalism (theo style.md)
 * Branding: FPT Orange
 */
export default function SubjectHeader({ onAddClick }) {
  return (
    // Implementation Notes: Rounded containers, light elevation (shadow-sm), generous whitespace
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
      <div className='p-8'> {/* Increased padding to create generous whitespace */}
        <div className='flex items-center justify-between'>
          
          {/* Left Side: Icon & Title */}
          <div className='flex items-center gap-5'>
            {/* Color Strategy: Muted, warm palette for background */}
            <div className='w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100'>
              {/* Color Strategy: Accent color (Orange FPT) for focus */}
              <BookOpen className='w-7 h-7 text-orange-600' />
            </div>
            
            <div>
              {/* Visual Identity: Friendly typography */}
              <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
                Subject Management
              </h1>
              <p className='text-sm text-gray-500 mt-1 font-medium'>
                Manage subjects, syllabus, and learning outcomes
              </p>
            </div>
          </div>

          {/* Right Side: Action Button */}
          {/* Color Strategy: 1 accent color for key actions (Orange FPT) */}
          {/* Implementation Notes: Rounded containers/buttons */}
          <button
            onClick={onAddClick}
            className='group flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 hover:shadow-md transition-all duration-200 font-semibold ease-out'
          >
            <Plus className='w-5 h-5 group-hover:scale-110 transition-transform' />
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
}