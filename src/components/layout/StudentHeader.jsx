import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FolderKanban,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  MessageCircleMoreIcon,
} from 'lucide-react';
import {
  getClassesByStudentId,
  getListOfTeamsByStudentId,
  getDetailOfTeamByTeamId,
} from '../../services/studentApi';
import { logout } from '../../store/slices/userSlice';
import useClickOutside from '../../hooks/useClickOutside';
import logo from '../../assets/logov1.png';
import { useAvatar } from '../../hooks/useAvatar';
import { useQueryClient } from '@tanstack/react-query';
import useTeam from '../../context/useTeam';
import { getRoleLandingRoute } from '../../constants/roleRoutes';

import NotificationBell from '../../features/chat/components/NotificationBell';
import { SignalRChatProvider } from '../../features/chat/hooks/SignalrChatProvider';
import { getChat } from '../../features/chat/services/chatApi';
const StudentHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const studentId = useSelector(state => state.user.userId);
  const userId = useSelector(state => state.user.userId);
  const roleName = useSelector(state => state.user.roleName);
  const [query, setQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const avatar = useSelector(state => state.user.avatar);
  const fullname = useSelector(state => state.user.fullName);
  const queryClient = useQueryClient();
  const { setTeam } = useTeam();

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

  const searchRef = useRef(null);
  useClickOutside(searchRef, () => setOpenSearch(false));

  const profileRef = useRef(null);
  useClickOutside(profileRef, () => setOpenProfile(false));

  const { initials, colorClass, imageError, setImageError, shouldShowImage } =
    useAvatar(fullname, avatar);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!studentId) return;
      try {
        const [classResp, teamResp] = await Promise.all([
          getClassesByStudentId(studentId),
          getListOfTeamsByStudentId(studentId),
        ]);
        if (cancelled) return;
        const normalizedClasses = Array.isArray(classResp)
          ? classResp
          : Array.isArray(classResp?.list)
            ? classResp.list
            : Array.isArray(classResp?.data)
              ? classResp.data
              : [];
        setClasses(normalizedClasses);
        const list = teamResp?.paginatedTeams?.list ?? teamResp?.list ?? [];
        setProjects(Array.isArray(list) ? list : []);
      } catch (e) {
        if (cancelled) return;
        setClasses([]);
        setProjects([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const classMatches = classes
      .filter(
        c =>
          c.className?.toLowerCase().includes(q) ||
          c.subjectName?.toLowerCase().includes(q) ||
          c.subjectCode?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(c => ({
        type: 'class',
        id: c.classId,
        name: c.className,
        subtitle: c.subjectName || c.subjectCode,
      }));
    const projectMatches = projects
      .filter(
        p =>
          p.projectName?.toLowerCase().includes(q) ||
          p.teamName?.toLowerCase().includes(q) ||
          p.className?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(p => ({
        type: 'project',
        id: p.projectId,
        name: p.projectName,
        subtitle: p.teamName || p.className,
        raw: p,
      }));
    return [...classMatches, ...projectMatches].slice(0, 8);
  }, [query, classes, projects]);

  const onSelectSuggestion = async item => {
    setOpenSearch(false);
    setQuery('');
    if (item.type === 'class') {
      navigate('/student/classes', { state: { selectClassId: item.id } });
    } else if (item.type === 'project') {
      const name = item.raw?.projectName || item.name || 'project';
      const pid = item.raw?.projectId || item.id;
      const tid = item.raw?.teamId || item.teamId;
      if (pid && tid) {
        const normalizedTeamId = Number(tid);
        if (Number.isFinite(normalizedTeamId)) {
          try {
            await queryClient.prefetchQuery({
              queryKey: ['team-detail', normalizedTeamId],
              queryFn: () => getDetailOfTeamByTeamId(normalizedTeamId),
            });
          } catch (error) {
            console.error('Failed to prefetch team details:', error);
          }
          setTeam(normalizedTeamId);
        }
        navigate('/student/project/team-workspace');
      } else if (pid) {
        navigate('/student/projects');
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className='sticky top-0 z-[70] bg-white border-b border-slate-200'>
      <div className='mx-auto px-4 py-3 md:px-6 lg:px-8'>
        <div className='flex items-center gap-10 w-full'>
          {/* Brand */}
          <div className='flex items-center gap-3 min-w-0'>
            <img src={logo} alt='CollabSphere' className='w-8 h-8 rounded' />
            <div className='leading-tight'>
              <div className='text-sm font-bold text-slate-900'>
                CollabSphere
              </div>
              <div className='text-xs text-slate-500'>Student Hub</div>
            </div>
          </div>

          {/* Search */}
          <div className='flex-1 relative' ref={searchRef}>
            <div className='relative w-1/2'>
              <Search className='w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2' />
              <input
                type='text'
                placeholder='Search classes or projects...'
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setOpenSearch(true);
                }}
                onFocus={() => setOpenSearch(true)}
                className='w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            {openSearch && suggestions.length > 0 && (
              <div className='absolute mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-[80]'>
                <ul className='max-h-80 overflow-y-auto'>
                  {suggestions.map((s, idx) => (
                    <li key={`${s.type}-${s.id}-${idx}`}>
                      <button
                        type='button'
                        onClick={() => onSelectSuggestion(s)}
                        className='w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50'
                      >
                        {s.type === 'class' ? (
                          <BookOpen className='w-4 h-4 text-blue-600' />
                        ) : (
                          <FolderKanban className='w-4 h-4 text-violet-600' />
                        )}
                        <div className='min-w-0'>
                          <div className='text-sm font-medium text-slate-900 truncate'>
                            {s.name}
                          </div>
                          {s.subtitle && (
                            <div className='text-xs text-slate-500 truncate'>
                              {s.subtitle}
                            </div>
                          )}
                        </div>
                        <span className='ml-auto text-[10px] uppercase tracking-wide text-slate-400'>
                          {s.type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <MessageCircleMoreIcon
            size={45}
            onClick={() => navigate('/student/project/chat')}
            className='text-gray-500 cursor-pointer transition-all duration-200 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:rotate-3 active:scale-95 p-2 rounded-lg border border-transparent'
          />
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onOpen={handleNotificationOpen}
          />
          {/* Profile menu */}
          <div className='relative' ref={profileRef}>
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className='flex items-center gap-3 pl-4 border-transparent border-2 rounded-full hover:border-orangeFpt-500 hover:rounded-full hover:border-2 hover:text-white hover:bg-orangeFpt-500 transition-all duration-300'
            >
              <div className='p-1 flex items-center gap-2'>
                <div className='text-right hidden md:block'>
                  <p className='text-sm font-medium'>{fullname}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white overflow-hidden ${colorClass} ring-2 ring-white shadow-sm`}
                >
                  {shouldShowImage ? (
                    <img
                      src={avatar}
                      alt='Profile'
                      className='w-full h-full object-cover'
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openProfile ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {openProfile && (
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                <div className='px-4 py-3 border-b border-gray-50 mb-2'>
                  <p className='text-sm font-medium text-gray-900'>
                    Signed in as
                  </p>
                  <p className='text-sm text-gray-500 truncate'>{fullname}</p>
                </div>

                <button
                  onClick={() => navigate(getRoleLandingRoute(roleName))}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors'
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setOpenProfile(false);
                    const profilePath = userId
                      ? `/${userId}/profile`
                      : '/student/profile';
                    navigate(profilePath);
                  }}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors'
                >
                  <User size={16} />
                  Profile
                </button>

                <div className='h-px bg-gray-50 my-2' />

                <button
                  onClick={handleLogout}
                  className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors'
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
