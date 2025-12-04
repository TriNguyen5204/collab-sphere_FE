import React from 'react';
import SubjectCard from './SubjectCard';

/**
 * SubjectGridView Component
 * Displays subjects in a grid layout
 * 
 * @param {Object} props
 * @param {Array} props.subjects - Array of subject objects
 * @param {Function} props.onView - Callback when view button clicked
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 */
export default function SubjectGridView({ subjects, onView, onEdit, onDelete }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.subjectId}
          subject={subject}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}