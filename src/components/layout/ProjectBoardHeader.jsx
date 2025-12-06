import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectBoardViewMenu from '../../features/student/components/ProjectBoardViewMenu';
import ProjectMemberAvatars from '../../features/student/components/ProjectMemberAvatars';
import ProjectBoardSetting from '../../features/student/components/ProjectBoardSetting';
import NotificationBell from '../../features/chat/components/NotificationBell';
import { LogOut } from 'lucide-react';
import useTeam from "../../context/useTeam";
import { useAvatar } from "../../hooks/useAvatar";
import ProjectResourcesMenu from './ProjectResourcesMenu';
import { SignalRChatProvider } from '../../features/chat/hooks/SignalrChatProvider';
import { useSelector } from 'react-redux';
import { getChat } from '../../features/chat/services/chatApi';
import { MessageCircleMoreIcon } from 'lucide-react';

const ProjectBoardHeader = ({
  archivedItems,
  onRestoreArchived,
  onDeleteArchived,
}) => {
  const navigate = useNavigate();
  const { clearTeam, team } = useTeam();
  const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(team?.teamName, team?.teamImage);

  //state for notification
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [provider, setProvider] = useState(null);

  const accessToken = useSelector(state => state.user.accessToken);
  const [connectedConversationIds, setConnectedConversationIds] = useState([]);

  // Fetch conversation IDs
  useEffect(() => {

    const fetchConversationId = async () => {
      try {
        const response = await getChat();
        if (response && response.chatConversations) {
          const conversationIds = response.chatConversations.map(
            c => c.conversationId
          );
          setConnectedConversationIds(conversationIds);
        }
      } catch (error) {
        console.error('Failed to fetch chat conversations:', error);
      }
    };

    fetchConversationId();
  }, []);

  // Initialize SignalR provider
  useEffect(() => {
    if (!accessToken || connectedConversationIds.length === 0) {
      return;
    }

    const chatProvider = new SignalRChatProvider(
      connectedConversationIds,
      accessToken
    );

    chatProvider.connect();
    setProvider(chatProvider);

    return () => {
      chatProvider.disconnect();
      setProvider(null);
    };
  }, [accessToken, connectedConversationIds]);

  // Set up notification listeners
  useEffect(() => {
    if (!provider) return;

    const onReceiveNoti = receivedNoti => {
      console.log('New notification:', receivedNoti);
      setNotifications(prev => [...prev, receivedNoti]);
      setUnreadCount(prev => prev + 1);
    };

    const onReceiveAllNoti = receivedNotis => {
      console.log('All notifications:', receivedNotis);
      setNotifications(receivedNotis);

      // Count unread
      const unread = receivedNotis.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    };

    provider.onNotiReceived(onReceiveNoti);
    provider.onNotiHistoryReceived(onReceiveAllNoti);

    return () => {
      provider.offNotiReceived(onReceiveNoti);
      provider.offNotiHistoryReceived(onReceiveAllNoti);
    };
  }, [provider]);

  const handleNotificationOpen = () => {
    setUnreadCount(0);
  };

  const handleExitProject = async () => {
    await navigate(-1);
    clearTeam();
  };

  return (
    <header className='sticky top-0 z-30 bg-white shadow-md border-b border-gray-200 p-4 flex items-center justify-between pl-6 pr-6'>
      {/* Left side */}
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <img
            src={team?.teamImage}
            alt={team?.teamName || "Project Avatar"}
            onError={() => setImageError(true)}
            className="w-10 h-10 rounded-full object-cover border"
          />
          {/* Online indicator */}
          <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm'></div>
        </div>

        <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
          {team?.projectInfo?.projectName || 'Workspace'}
        </h1>

        <ProjectBoardViewMenu />
      </div>

      {/* Right side */}
      <div className='flex items-center space-x-3'>
        <MessageCircleMoreIcon
          size={45}
          onClick={() => navigate('/chat')}
          className='text-gray-500 cursor-pointer transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:rotate-3 active:scale-95 p-2 rounded-lg border border-transparent'
        />

        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onOpen={handleNotificationOpen}
        />

        <div className='h-6 w-px bg-gray-300'></div>

        <ProjectMemberAvatars />

        <div className='h-6 w-px bg-gray-300'></div>

        <ProjectResourcesMenu />

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
