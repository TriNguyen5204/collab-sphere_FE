import React, { useMemo, useState, useRef, useCallback } from 'react';
import { UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import logo from '../../assets/logov1.png';
import { logout } from '../../store/slices/userSlice';
import useClickOutside from '../../hooks/useClickOutside';
import { useAvatar } from '../../hooks/useAvatar';

const StaffHeader = ({
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
    <header className='sticky top-0 z-40 bg-white border-b border-slate-200'>
      <div className='mx-auto px-4 py-3 md:px-6 lg:px-8'>
        <div className='flex items-center gap-10 w-full'>
          <div className='flex items-center gap-3 min-w-0'>
            <img src={logo} alt='CollabSphere' className='w-8 h-8 rounded' />
            <div className='leading-tight'>
              <div className='text-sm font-bold text-slate-900'>
                CollabSphere
              </div>
              <div className='text-xs text-slate-500'>Staff Portal</div>
            </div>
          </div>

          <div className='flex-1 relative' ref={searchRef}>
            <div className='relative w-full md:w-1/2'>
              <Search className='w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2' />
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
                className='w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400'
              />
            </div>
            {openSearch && suggestions.length > 0 && (
              <div className='absolute mt-2 w-full md:w-1/2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-[80]'>
                <ul className='max-h-72 overflow-y-auto'>
                  {suggestions.map((suggestion, idx) => {
                    const Icon = suggestion.Icon;
                    return (
                      <li key={`${suggestion.href}-${idx}`}>
                        <button
                          type='button'
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className='w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50'
                        >
                          {Icon ? (
                            <Icon className='w-4 h-4 text-blue-600' />
                          ) : null}
                          <span className='text-sm font-medium text-slate-900'>
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

          <div
            className='relative ml-auto flex items-center gap-3'
            ref={profileRef}
          >
            {isAuthenticated ? (
              <>
                {/* Nút Profile */}
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                >
                  {shouldShowImage ? (
                    <img
                      src={avatar}
                      alt='Profile'
                      onError={() => setImageError(true)}
                      className='w-7 h-7 rounded-full object-cover border border-slate-200'
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${colorClass}`}
                    >
                      {initials}
                    </div>
                  )}
                  <span className='hidden sm:inline max-w-[160px] truncate'>
                    {fullName || 'Staff'}
                  </span>
                </button>

                {/* Nút Logout nằm ngay bên cạnh */}
                <button
                  type='button'
                  onClick={onLogout}
                  className='flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50'
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
                  className='inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600'
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

const StaffSidebar = ({ sections, isAuthenticated, onLogin }) => (
  <div className='h-full'>
    {!isAuthenticated && (
      <div className='px-4 pt-6'>
        <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center'>
          <p className='text-sm font-medium text-slate-700'>
            Sign in to access staff tools
          </p>
          <div className='mt-3 flex flex-col gap-2'>
            <button
              type='button'
              onClick={onLogin}
              className='inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600'
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
        itemClassName='rounded-md px-3'
        activeItemClassName='bg-blue-200 border border-blue-500'
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

const StaffDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { accessToken, userId, fullName, avatar } = useSelector(
    state => state.user
  );
  const isAuthenticated = Boolean(accessToken);

  const navigationItems = [
    {
      label: 'Manage Account',
      href: '/staff/lecturers',
      icon: UserGroupIcon,
      match: path =>
        path === '/staff/lecturers' || path.startsWith('/staff/lecturers/'),
    },
    {
      label: 'Manage Class',
      href: '/staff/classes',
      icon: AcademicCapIcon,
      match: path =>
        path === '/staff/classes' || path.startsWith('/staff/classes/'),
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
    const profilePath = userId ? `/${userId}/profile` : '/staff/profile';
    navigate(profilePath);
  }, [navigate, userId]);
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <div className='min-h-screen w-full bg-slate-50'>
      <StaffHeader
        fullName={fullName}
        avatar={avatar}
        isAuthenticated={isAuthenticated}
        onProfile={handleProfile}
        onLogout={handleLogout}
        onLogin={handleLogin}
        navItems={isAuthenticated ? computedNavigationItems : []}
      />
      <div className='flex'>
        <aside className='fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 border-r border-slate-200'>
          <StaffSidebar
            sections={sidebarSections}
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
          />
        </aside>
        <main className='flex-1 min-h-screen min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-64'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;
