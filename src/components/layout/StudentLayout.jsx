import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import StudentSidebar from './StudentSidebar';
import AIChatAssistant from '../../features/ai/components/AIChatAssistant';

const StudentLayout = ({ children }) => {
  const location = useLocation();

  const showChatAssistant = useMemo(() => {
    const path = location.pathname;
    // Define paths where the chat assistant should be visible
    const allowedPaths = [
      '/student',
    ];

    // Define paths where the chat assistant should be hidden
    const excludedPaths = [
      // Add any specific paths to exclude here
    ];

    if (excludedPaths.some(p => path.startsWith(p))) return false;

    return allowedPaths.some(p => path === p || path.startsWith(p));
  }, [location.pathname]);

  return (
    <div className='min-h-screen w-full bg-slate-50 flex flex-col'>
      <StudentHeader />
      <div className='flex flex-1 min-h-0'>
        <aside className='fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 border-r border-slate-200'>
          <StudentSidebar />
        </aside>
        <main className='flex-1 min-h-0 min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-56 custom-scrollbar'>
          {children}
        </main>
      </div>
      {showChatAssistant && <AIChatAssistant />}
    </div>
  );
};

export default StudentLayout;
