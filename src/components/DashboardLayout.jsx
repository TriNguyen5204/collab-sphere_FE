import React, { useMemo } from 'react';
import {
  AcademicCapIcon,
  BellIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import logo from '../assets/logov1.png';
import { logout } from '../store/slices/userSlice';

const navigationItems = [
  { label: 'Classes', href: '/lecturer/classes', icon: AcademicCapIcon },
  { label: 'Project Library', href: '/lecturer/projects', icon: BookOpenIcon },
  { label: 'Projects', href: '/lecturer/projects', icon: UserGroupIcon },
  { label: 'Grading', href: '/lecturer/grading', icon: ClipboardDocumentListIcon },
  { label: 'Analytics', href: '/lecturer/analytics', icon: ChartBarIcon },
  { label: 'Meetings', href: '/lecturer/meetings', icon: CalendarDaysIcon },
  { label: 'Tools', href: '/lecturer/tools', icon: WrenchScrewdriverIcon },
];

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken, roleName } = useSelector(state => state.user);
  const isAuthenticated = Boolean(accessToken);

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/register');
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userInitial = roleName ? roleName.charAt(0).toUpperCase() : 'U';

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
            items: navigationItems,
          },
        ]
      : []
  ), [isAuthenticated]);

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
    <div className='hidden items-center gap-3 md:flex'>
      <div className='relative hidden lg:block'>
        <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          type='text'
          placeholder='Search anything...'
          className='w-64 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-600 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100'
        />
      </div>

      <button className='inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500'>
        <PlusIcon className='h-4 w-4' />
        Quick add
      </button>

      <button className='relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-400 hover:text-blue-600 hover:shadow-md'>
        <BellIcon className='h-5 w-5' />
        <span className='absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white'>
          3
        </span>
      </button>

      <button
        type='button'
        onClick={handleLogout}
        className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-sm transition hover:border-rose-300 hover:text-rose-600 hover:shadow-md'
        title='Log out'
      >
        {userInitial}
      </button>
    </div>
  ) : (
    <div className='hidden items-center gap-3 md:flex'>
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
      <button className='flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500'>
        <PlusIcon className='h-4 w-4' />
        Quick add
      </button>
      <button className='flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm'>
        <BellIcon className='h-4 w-4' />
        Notifications
      </button>
      <button
        type='button'
        onClick={handleLogout}
        className='flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50'
      >
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