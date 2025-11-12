import React from 'react';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => {
  return (
    <div className='min-h-screen w-full bg-slate-50'>
      <StudentHeader />
      <div className='flex'>
        <div className=''>
          <StudentSidebar />
        </div>
        <main className='flex-1 min-w-0 px-4 py-6 md:px-6 lg:px-8'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
