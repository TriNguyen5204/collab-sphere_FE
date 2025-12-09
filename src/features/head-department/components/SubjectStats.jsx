import React from 'react';
import { BookOpen, Package, BookMarked, Filter } from 'lucide-react';
import StatCard from './StatCard';

/**
 * SubjectStats Component
 * Style: Soft Minimalism
 * Branding: FPT Orange context
 */
export default function SubjectStats({ total, active, inactive, categories }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
      {/* Primary Stat - FPT Orange */}
      <StatCard
        icon={BookOpen}
        label='Total Subjects'
        value={total}
        color='orange' // Changed from blue to orange as per FPT requirement
      />
      
      {/* Secondary Stats - Soft Muted Colors */}
      <StatCard
        icon={Package}
        label='Active Courses'
        value={active}
        color='green'
      />
      <StatCard
        icon={BookMarked}
        label='Inactive'
        value={inactive}
        color='gray'
      />
      <StatCard
        icon={Filter}
        label='Categories'
        value={categories}
        color='purple'
      />
    </div>
  );
}