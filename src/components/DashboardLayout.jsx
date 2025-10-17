import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import logo from '../assets/logov1.png';
import { logout } from '../store/slices/userSlice';
import useClickOutside from '../hooks/useClickOutside';

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
  }
];

const normalizePath = (path = '/') => {
  if (!path) return '/';
  const trimmed = path.replace(/\/+$/, '');
  if (!trimmed.length) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken, roleName } = useSelector(state => state.user);
  const isAuthenticated = Boolean(accessToken);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const closeProfileMenu = useCallback(() => setIsProfileMenuOpen(false), []);
  const handleLogin = useCallback(() => navigate('/login'), [navigate]);
  const handleSignup = useCallback(() => navigate('/register'), [navigate]);
  const handleLogout = useCallback(() => {
    closeProfileMenu();
    dispatch(logout());
    navigate('/login');
  }, [closeProfileMenu, dispatch, navigate]);
  const handleProfile = useCallback(() => {
    closeProfileMenu();
    navigate('/lecturer/classes');
  }, [closeProfileMenu, navigate]);
  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(prev => !prev);
  }, []);

  useClickOutside(profileMenuRef, closeProfileMenu);

  const userInitial = roleName ? roleName.charAt(0).toUpperCase() : 'U';

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

  const brand = {
    title: 'CollabSphere',
    subtitle: 'Lecturer workspace',
    to: '/lecturer/classes',
    logo,
  };
  const sidebarSections = useMemo(() => (
    isAuthenticated
      ? [
          {
            title: 'Workspace',
            items: computedNavigationItems,
          },
        ]
      : []
  ), [isAuthenticated, computedNavigationItems]);

  const unauthSidebarPrompt = !isAuthenticated ? (
    <div className='px-4 pt-6'>
      <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center'>
        <p className='text-sm font-medium text-slate-700'>Sign in to access lecturer tools</p>
        <div className='mt-3 flex flex-col gap-2'>
          <button
            type='button'
            onClick={handleLogin}
            className='inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600'
          >
            <ArrowRightOnRectangleIcon className='h-4 w-4' />
            Login
          </button>
          <button
            type='button'
            onClick={handleSignup}
            className='inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500'
          >
            <UserPlusIcon className='h-4 w-4' />
            Sign up
          </button>
        </div>
      </div>
    </div>
  ) : undefined;

  const headerDesktopRightContent = isAuthenticated ? (
    <div className='ml-auto hidden items-center gap-4 md:flex'>
      <div className='relative hidden lg:block'>
        <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          type='text'
          placeholder='Search anything...'
          className='w-64 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-600 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100'
        />
      </div>

      <div ref={profileMenuRef} className='relative'>
        <button
          type='button'
          onClick={toggleProfileMenu}
          className='inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white pl-2 pr-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
          aria-haspopup='menu'
          aria-expanded={isProfileMenuOpen}
        >
          <span className='flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-base font-semibold'>{userInitial}</span>
          <ChevronDownIcon className={`h-4 w-4 transition ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isProfileMenuOpen ? (
          <div className='absolute right-0 z-10 mt-3 w-48 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-lg ring-1 ring-black/5'>
            <button
              type='button'
              onClick={handleProfile}
              className='flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-slate-50'
            >
              <UserCircleIcon className='h-5 w-5 text-slate-400' />
              Profile
            </button>
            <button
              type='button'
              onClick={handleLogout}
              className='flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-rose-600 transition hover:bg-rose-50'
            >
              <ArrowRightOnRectangleIcon className='h-5 w-5' />
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  ) : (
    <div className='ml-auto hidden items-center gap-3 md:flex'>
      <button
        type='button'
        onClick={handleLogin}
        className='inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600'
      >
        <ArrowRightOnRectangleIcon className='h-4 w-4' />
        Login
      </button>
      <button
        type='button'
        onClick={handleSignup}
        className='inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500'
      >
        <UserPlusIcon className='h-4 w-4' />
        Sign up
      </button>
    </div>
  );

  const headerMobileMenuContent = isAuthenticated ? (
    <div className='space-y-2 border-t border-slate-200 pt-3'>
      <button
        type='button'
        onClick={handleProfile}
        className='flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50'
      >
        <UserCircleIcon className='h-4 w-4' />
        Profile
      </button>
      <button
        type='button'
        onClick={handleLogout}
        className='flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50'
      >
        <ArrowRightOnRectangleIcon className='h-4 w-4' />
        Log out
      </button>
    </div>
  ) : (
    <div className='space-y-2 border-t border-slate-200 pt-3'>
      <button
        type='button'
        onClick={handleLogin}
        className='flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600'
      >
        <ArrowRightOnRectangleIcon className='h-4 w-4' />
        Login
      </button>
      <button
        type='button'
        onClick={handleSignup}
        className='flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500'
      >
        <UserPlusIcon className='h-4 w-4' />
        Sign up
      </button>
    </div>
  );

  return (
    <AppShell
      brand={brand}
      sidebarSections={sidebarSections}
      sidebarTop={unauthSidebarPrompt}
      headerActions={[]}
      headerDesktopRightContent={headerDesktopRightContent}
      headerMobileMenuContent={headerMobileMenuContent}
      initialSidebarExpanded
      sidebarCollapsible={false}
    >
      {children}
    </AppShell>
  );
};

export default DashboardLayout;