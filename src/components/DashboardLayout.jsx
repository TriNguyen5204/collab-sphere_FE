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
} from '@heroicons/react/24/outline';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppSidebar from './layout/AppSidebar';
import logo from '../assets/logov1.png';
import { logout } from '../store/slices/userSlice';
import useClickOutside from '../hooks/useClickOutside';
import { generateAvatarFromName } from '../utils/avatar';


const LecturerHeader = ({
  fullName,
  avatar,
  fallbackAvatar,
  isAuthenticated,
  onProfile,
  onLogout,
  onLogin,
  onSignup,
  navItems,
}) => {
  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-[70] bg-white border-b border-slate-200">
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

          <div className="relative ml-auto" ref={profileRef}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpenProfile(prev => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <img
                    src={avatar || fallbackAvatar}
                    alt="Profile"
                    onError={(e) => { e.target.src = fallbackAvatar; }}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline max-w-[160px] truncate">{fullName || 'Lecturer'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {openProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-[80]">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenProfile(false);
                        onProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenProfile(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Login
                </button>
                <button
                  type="button"
                  onClick={onSignup}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Sign up
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
        activeItemClassName="bg-blue-200 border border-blue-500"
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
    {
      label: 'Profile',
      href: userId ? `/${userId}/profile` : '/lecturer/profile',
      icon: User,
      match: path => path === `/${userId}/profile` || path.startsWith('/lecturer/profile'),
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

  const fallbackAvatar = useMemo(() => generateAvatarFromName(fullName), [fullName]);

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
        fallbackAvatar={fallbackAvatar}
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
    </div>
  );
};

export default DashboardLayout;