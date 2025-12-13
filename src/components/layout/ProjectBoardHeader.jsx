import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectBoardViewMenu from '../../features/student/components/ProjectBoardViewMenu';
import ProjectMemberAvatars from '../../features/student/components/ProjectMemberAvatars';
import ProjectBoardSetting from '../../features/student/components/ProjectBoardSetting';
import { LogOut, MessageCircle } from 'lucide-react';
import useTeam from "../../context/useTeam";
import { useAvatar } from "../../hooks/useAvatar";
import ProjectResourcesMenu from './ProjectResourcesMenu';
import { useSelector } from 'react-redux';
import NotificationBell from '../../features/chat/components/NotificationBell';

const ProjectBoardHeader = ({
}) => {
  const navigate = useNavigate();
  const { clearTeam, team, notifications } = useTeam();
  const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(team?.teamName, team?.teamImage);

  useEffect(() => {
    console.log('Team data in ProjectBoardHeader:', team);
    console.log('Notifications in ProjectBoardHeader:', notifications);
  }, [team, notifications]);
  const handleExitProject = async () => {
    await navigate('/student/projects');
    clearTeam();
  };

  return (
    <header className='sticky top-0 z-30 bg-white shadow-md border-b border-gray-200 p-4 flex items-center justify-between pl-6 pr-6'>
      {/* Left side */}
      <div className='flex items-center gap-3'>
        <div className='relative'>
          {shouldShowImage ? (
            <img
              src={team?.teamImage}
              alt={team?.teamName || "Project Avatar"}
              onError={() => setImageError(true)}
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white border ${colorClass}`}
              aria-hidden
            >
              <span>{initials}</span>
            </div>
          )}
        </div>

        <h1 className='text-2xl font-bold bg-black bg-clip-text text-transparent'>
          {team?.projectInfo?.projectName || 'Workspace'}
        </h1>

        <ProjectBoardViewMenu />
      </div>

      {/* Right side */}
      <div className='flex items-center space-x-3'>
        <button
          onClick={() => navigate('/chat')}
          className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200'
          title='Messages'
        >
          <MessageCircle size={20} />
        </button>

        <ProjectResourcesMenu />

        <div className='h-6 w-px bg-gray-300'></div>

        <ProjectMemberAvatars />

        <div className='h-6 w-px bg-gray-300'></div>

        <NotificationBell 
          notifications={notifications || []}
          unreadCount={notifications?.length || 0}
        />

        <ProjectBoardSetting />

        <div className='h-6 w-px bg-gray-300'></div>

        <button
          onClick={handleExitProject}
          className='flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-all duration-200 border border-transparent hover:border-red-200'
          title='Exit project'
          aria-label='Exit project'
        >
          <LogOut size={16} />
          <span className='hidden md:inline'>Exit</span>
        </button>
      </div>
    </header>
  );
};

export default ProjectBoardHeader;
