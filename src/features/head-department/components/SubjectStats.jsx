import React from 'react';
import { BookOpen, Package, BookMarked, Filter } from 'lucide-react';
import StatCard from './StatCard';

/**
 * SubjectStats Component
 * Displays statistics cards for subjects
 * 
 * @param {Object} props
 * @param {number} props.total - Total number of subjects
 * @param {number} props.active - Number of active subjects
 * @param {number} props.inactive - Number of inactive subjects
 * @param {number} props.categories - Number of subject categories
 */
export default function SubjectStats({ total, active, inactive, categories }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <StatCard
        icon={BookOpen}
        label='Total Subjects'
        value={total}
        color='blue'
      />
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