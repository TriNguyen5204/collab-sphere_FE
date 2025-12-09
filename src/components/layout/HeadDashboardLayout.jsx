import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  BookOpen,
  FolderKanban,
  ClipboardCheck,
  Search,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar'; // Ensure this path is correct in your project
import logo from '../../assets/logov1.png';
import { logout } from '../../store/slices/userSlice';
import useClickOutside from '../../hooks/useClickOutside';
import { useAvatar } from '../../hooks/useAvatar';

const HeadHeader = ({
  fullName,
  avatar,
  isAuthenticated,
  onLogout,
  onLogin,
  navItems,
}) => {
  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(
    fullName,
    avatar
  );
  useClickOutside(searchRef, () => setOpenSearch(false));

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return navItems
      .filter(item => item.label.toLowerCase().includes(q))
      .slice(0, 6)
      .map(item => ({ href: item.href, label: item.label, Icon: item.icon }));
  }, [query, navItems]);

  const handleSelectSuggestion = useCallback(
    suggestion => {
      setOpenSearch(false);
      setQuery('');
      navigate(suggestion.href);
    },
    [navigate]
  );

  return (
    <header className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
      <div className='mx-auto px-4 py-3 md:px-6 lg:px-8'>
        <div className='flex items-center gap-10 w-full'>
          {/* Brand */}
          <div className='flex items-center gap-3 min-w-0'>
            <img src={logo} alt='CollabSphere' className='w-8 h-8 rounded' />
            <div className='leading-tight'>
              <div className='text-sm font-bold text-gray-900'>
                CollabSphere
              </div>
              <div className='text-xs text-orange-600 font-semibold'>
                Head Department
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className='flex-1 relative' ref={searchRef}>
            <div className='relative w-full md:w-1/2'>
              <Search className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
              <input
                type='text'
                placeholder='Search management sections...'
                value={query}
                disabled={!isAuthenticated}
                onFocus={() => setOpenSearch(true)}
                onChange={e => {
                  setQuery(e.target.value);
                  setOpenSearch(true);
                }}
                className='w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all disabled:bg-gray-100 disabled:text-gray-400'
              />
            </div>
            {openSearch && suggestions.length > 0 && (
              <div className='absolute mt-2 w-full md:w-1/2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[80]'>
                <ul className='max-h-72 overflow-y-auto'>
                  {suggestions.map((suggestion, idx) => {
                    const Icon = suggestion.Icon;
                    return (
                      <li key={`${suggestion.href}-${idx}`}>
                        <button
                          type='button'
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className='w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-orange-50 transition-colors'
                        >
                          {Icon ? (
                            <Icon className='w-4 h-4 text-orange-600' />
                          ) : null}
                          <span className='text-sm font-medium text-gray-900'>
                            {suggestion.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div
            className='relative ml-auto flex items-center gap-3'
            ref={profileRef}
          >
            {isAuthenticated ? (
              <>
                {/* Nút Profile */}
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-orange-200 transition-all'
                >
                  {shouldShowImage ? (
                    <img
                      src={avatar}
                      alt='Profile'
                      onError={() => setImageError(true)}
                      className='w-7 h-7 rounded-full object-cover border border-gray-200'
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${colorClass}`}
                    >
                      {initials}
                    </div>
                  )}

                  <span className='hidden sm:inline max-w-[160px] truncate'>
                    {fullName || 'Head Dept'}
                  </span>

                </button>

                {/* Logout nằm kế bên – KHÔNG dropdown */}
                <button
                  type='button'
                  onClick={onLogout}
                  className='flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all'
                >
                  <LogOut className='w-4 h-4' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            ) : (
              <div className='hidden sm:flex items-center gap-3'>
                <button
                  type='button'
                  onClick={onLogin}
                  className='inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600'
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const HeadSidebar = ({ sections, isAuthenticated, onLogin }) => (
  <div className='h-full'>
    {!isAuthenticated && (
      <div className='px-4 pt-6'>
        <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center'>
          <p className='text-sm font-medium text-gray-700'>
            Sign in to access tools
          </p>
          <div className='mt-3 flex flex-col gap-2'>
            <button
              type='button'
              onClick={onLogin}
              className='inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600'
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )}

    <div className='h-full'>
      <AppSidebar
        showBrand={false}
        style={{
          ['--bg-card']: 'transparent',
          ['--border-color']: 'transparent',
          ['--bg-secondary']: 'rgb(226 232 240)',
          boxShadow: 'none',
        }}
        itemClassName='rounded-xl px-3 my-1 font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors'
        activeItemClassName='bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
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

const HeadDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { accessToken, userId, fullName, avatar } = useSelector(
    state => state.user
  );
  const isAuthenticated = Boolean(accessToken);

  // Update Navigation Items for Head Department
  const navigationItems = [
    {
      label: 'Subject Management',
      href: '/head-department/subject-management',
      icon: BookOpen,
      match: path => path.startsWith('/head-department/subject-management'),
    },
    {
      label: 'Project Management',
      href: '/head-department/project-management',
      icon: FolderKanban,
      match: path =>
        path.startsWith('/head-department/project-management') &&
        !path.startsWith('/head-department/project-approvals'),
    },
    {
      label: 'Pending Approvals',
      href: '/head-department/project-approvals',
      icon: ClipboardCheck,
      match: path => path.startsWith('/head-department/project-approvals'),
    },
  ];

  const computedNavigationItems = useMemo(
    () =>
      navigationItems.map(item => {
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
            return (
              normalizedPath === normalizedHref ||
              normalizedPath.startsWith(`${normalizedHref}/`)
            );
          },
        };
      }),
    []
  );

  const sidebarSections = useMemo(
    () => [
      {
        items: computedNavigationItems,
      },
    ],
    [computedNavigationItems]
  );

  const handleLogin = useCallback(() => navigate('/login'), [navigate]);

  const handleProfile = useCallback(() => {
    // Default profile path, or specific path for Head
    const profilePath = userId
      ? `/${userId}/profile`
      : '/head-department/profile';
    navigate(profilePath);
  }, [navigate, userId]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <div className='flex h-screen w-full bg-gray-50 overflow-hidden font-sans'>
      {/* Fixed Header */}
      <div className='fixed top-0 left-0 right-0 z-50'>
        <HeadHeader
          fullName={fullName}
          avatar={avatar}
          isAuthenticated={isAuthenticated}
          onProfile={handleProfile}
          onLogout={handleLogout}
          onLogin={handleLogin}
          navItems={isAuthenticated ? computedNavigationItems : []}
        />
      </div>

      <div className='flex w-full pt-[64px]'>
        {' '}
        {/* Padding top to account for fixed header height approx 64px */}
        {/* Fixed Sidebar */}
        <aside className='fixed left-0 top-[64px] h-[calc(100vh-64px)] w-64 overflow-y-auto bg-gray-50 border-r border-gray-200 hidden md:block'>
          <HeadSidebar
            sections={sidebarSections}
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
          />
        </aside>
        {/* Main Content Area */}
        <main className='flex-1 h-[calc(100vh-64px)] overflow-y-auto md:ml-64 bg-gray-50 p-4 md:p-6 lg:p-8 min-w-0'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default HeadDashboardLayout;
