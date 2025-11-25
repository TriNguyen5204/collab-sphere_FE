import React from 'react';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children }) => {
  return (
    <div className='min-h-screen w-full bg-slate-50'>
      <StudentHeader />
      <div className='flex'>
        <aside className='fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 border-r border-slate-200'>
          <StudentSidebar />
        </aside>
        <main className='flex-1 min-h-screen min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-64'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
