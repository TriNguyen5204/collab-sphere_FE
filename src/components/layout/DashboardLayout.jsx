import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { Search, User, LogOut, ChevronDown, MessageSquareWarning, LayoutDashboard } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import logo from '../../assets/logov1.png';
import { logout } from '../../store/slices/userSlice';
import useClickOutside from '../../hooks/useClickOutside';
import { useAvatar } from '../../hooks/useAvatar';
import AIChatAssistant from '../../features/ai/components/AIChatAssistant';
import { getRoleLandingRoute } from '../../constants/roleRoutes';


const LecturerHeader = ({
  fullName,
  avatar,
  isAuthenticated,
  onProfile,
  onLogout,
  navItems,
}) => {
  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(fullName, avatar);
  const roleName = useSelector((state) => state.user.roleName);
  useClickOutside(searchRef, () => setOpenSearch(false));
  useClickOutside(profileRef, () => setOpenProfile(false));

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return navItems
      .filter(item => item.label.toLowerCase().includes(q))
      .slice(0, 6)
      .map(item => ({ href: item.href, label: item.label, Icon: item.icon }));
  }, [query, navItems]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    setOpenSearch(false);
    setQuery('');
    navigate(suggestion.href);
  }, [navigate]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="mx-auto px-4 py-3 md:px-6 lg:px-8">
        <div className="flex items-center gap-10 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="CollabSphere" className="w-8 h-8 rounded" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">CollabSphere</div>
              <div className="text-xs text-slate-500">Lecturer Hub</div>
            </div>
          </div>

          <div className="flex-1 relative" ref={searchRef}>
            <div className="relative w-full md:w-1/2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search workspace sections..."
                value={query}
                disabled={!isAuthenticated}
                onFocus={() => setOpenSearch(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenSearch(true);
                }}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            {openSearch && suggestions.length > 0 && (
              <div className="absolute mt-2 w-full md:w-1/2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-[80]">
                <ul className="max-h-72 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => {
                    const Icon = suggestion.Icon;
                    return (
                      <li key={`${suggestion.href}-${idx}`}>
                        <button
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
                        >
                          {Icon ? <Icon className="w-4 h-4 text-blue-600" /> : null}
                          <span className="text-sm font-medium text-slate-900">{suggestion.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setOpenProfile(!openProfile)}
                  className="flex items-center gap-3 pl-4 border rounded-full hover:border-orangeFpt-100 hover:bg-gradient-to-tl hover:from-orangeFpt-200 hover:via-white/25 hover:to-white transition-all duration-300"
                >
                  <div className='p-1 flex items-center gap-2'>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white overflow-hidden ${colorClass} ring-2 ring-white shadow-sm`}>
                      {shouldShowImage ? (
                        <img
                          src={avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium">{fullName}</p>
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${openProfile ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    <button
                      onClick={() => navigate(getRoleLandingRoute(roleName))}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 rounded-t-xl hover:bg-gray-200 flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenProfile(false);
                        onProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700  hover:bg-gray-200 flex items-center gap-2 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </button>

                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-2 transition-colors"
                    >
                      <MessageSquareWarning size={16} />
                      Report System
                    </button>
                    <div className="h-px bg-gray-50 my-2" />
                    <button
                      type="button"
                      onClick={() => {
                        setOpenProfile(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 rounded-b-xl hover:bg-red-100 flex items-center gap-2 transition-colors"
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

const LecturerSidebar = ({ sections, isAuthenticated, onLogin, onSignup }) => (
  <div className="h-full">
    {!isAuthenticated && (
      <div className="px-4 pt-6">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <p className="text-sm font-medium text-slate-700">Sign in to access lecturer tools</p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={onSignup}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
            >
              <UserPlusIcon className="h-4 w-4" />
              Sign up
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="h-full">
      <AppSidebar
        showBrand={false}
        style={{
          ['--bg-card']: 'transparent',
          ['--border-color']: 'transparent',
          ['--bg-secondary']: 'rgb(226 232 240)',
          boxShadow: 'none',
        }}
        itemClassName="rounded-md px-3"
        activeItemClassName="bg-orangeFpt-50/60 text-orangeFpt-600 font-semibold shadow-inner"
        sections={isAuthenticated ? sections : []}
        expanded
        mode='inline'
      />
    </div>
  </div>
);

const normalizePath = (path = '/') => {
  if (!path) return '/';
  const trimmed = path.replace(/\/+$/, '');
  if (!trimmed.length) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const showChatAssistant = useMemo(() => {
    const path = location.pathname;
    const allowedPaths = [
      '/student',
      '/lecturer/classes',
      '/lecturer/projects',
      '/lecturer/monitoring'
    ];

    const excludedPaths = [
      '/lecturer/projects/create-with-ai',
      '/lecturer/create-project',
      '/lecturer/projects/create'
    ];

    if (excludedPaths.some(p => path.startsWith(p))) return false;

    return allowedPaths.some(p => path === p || path.startsWith(p));
  }, [location.pathname]);

  const { accessToken, userId, fullName, avatar } = useSelector(state => state.user);
  const isAuthenticated = Boolean(accessToken);
  const navigationItems = [
    {
      label: 'Classes',
      href: '/lecturer/classes',
      icon: AcademicCapIcon,
      match: path => path === '/lecturer/classes' || path.startsWith('/lecturer/classes/')
    },
    {
      label: 'Resources Hub',
      href: '/lecturer/resources',
      icon: FolderIcon,
      match: path => path === '/lecturer/resources' || path.startsWith('/lecturer/resources/')
    },
    {
      label: 'Project Library',
      href: '/lecturer/projects',
      icon: BookOpenIcon,
      match: path => path === '/lecturer/projects' || path.startsWith('/lecturer/projects/')
    },
    {
      label: 'Grading',
      href: '/lecturer/grading',
      icon: ClipboardDocumentListIcon,
      match: path => path === '/lecturer/grading' || path.startsWith('/lecturer/grading/')
    },
    {
      label: 'Analytics',
      href: '/lecturer/analytics',
      icon: ChartBarIcon,
      match: path => path === '/lecturer/analytics' || path.startsWith('/lecturer/analytics/')
    },
    {
      label: 'Meetings',
      href: '/lecturer/meetings',
      icon: CalendarDaysIcon,
      match: path => path === '/lecturer/meetings' || path.startsWith('/lecturer/meetings/')
    },
    {
      label: 'Tools',
      href: '/lecturer/tools',
      icon: WrenchScrewdriverIcon,
      match: path => path === '/lecturer/tools' || path.startsWith('/lecturer/tools/')
    },
  ];

  const computedNavigationItems = useMemo(() => navigationItems.map(item => {
    const normalizedHref = normalizePath(item.href);
    const originalMatch = item.match;
    return {
      ...item,
      href: normalizedHref,
      match: path => {
        const normalizedPath = normalizePath(path);
        if (typeof originalMatch === 'function') {
          return originalMatch(normalizedPath);
        }
        return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
      }
    };
  }), []);

  const sidebarSections = useMemo(() => ([
    {
      items: computedNavigationItems,
    },
  ]), [computedNavigationItems]);



  const handleLogin = useCallback(() => navigate('/login'), [navigate]);
  const handleSignup = useCallback(() => navigate('/register'), [navigate]);
  const handleProfile = useCallback(() => {
    const profilePath = userId ? `/${userId}/profile` : '/lecturer/profile';
    navigate(profilePath);
  }, [navigate, userId]);
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <div className='min-h-screen w-full bg-slate-50'>
      <LecturerHeader
        fullName={fullName}
        avatar={avatar}
        isAuthenticated={isAuthenticated}
        onProfile={handleProfile}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onSignup={handleSignup}
        navItems={isAuthenticated ? computedNavigationItems : []}
      />
      <div className='flex'>
        <aside className='fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 border-r border-slate-200'>
          <LecturerSidebar
            sections={sidebarSections}
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        </aside>
        <main className='flex-1 min-h-screen min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-64'>
          {children}
        </main>
      </div>
      {showChatAssistant && <AIChatAssistant />}
    </div>
  );
};

export default DashboardLayout;
