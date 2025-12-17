import React, { useMemo, useCallback, useState } from 'react';
import {
  BookOpen,
  FolderKanban,
  ClipboardCheck,
  LogOut,
  MessageSquareWarning,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import logo from '../../assets/logov2.svg';
import { logout } from '../../store/slices/userSlice';
import ReportSystemModal from '../../features/student/components/ReportSystemModal';

const HeadSidebar = ({ sections, isAuthenticated, onLogin, onLogout, navigate, onOpenReport }) => {
  const footer = isAuthenticated ? (
    <div className='px-2 py-2 space-y-1'>
      <button
        type='button'
        onClick={onOpenReport}
        className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-600 transition hover:bg-orangeFpt-50 hover:text-orangeFpt-600'
      >
        <MessageSquareWarning className='h-5 w-5' />
        <span className='font-medium'>Report System</span>
      </button>
      <button
        type='button'
        onClick={onLogout}
        className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600'
      >
        <LogOut className='h-5 w-5' />
        <span className='font-medium'>Log out</span>
      </button>
    </div>
  ) : null;

  const unauthPrompt = !isAuthenticated ? (
    <div className='px-4 pt-6'>
      <div className='rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-5 text-center shadow-inner'>
        <p className='text-sm font-medium text-slate-700 mb-2'>Sign in to access head department tools</p>
        <div className='flex flex-col gap-2'>
          <button
            type='button'
            onClick={onLogin}
            className='rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600'
          >
            Login
          </button>
          <button
            type='button'
            onClick={() => navigate('/register')}
            className='rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-500'
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  ) : undefined;

  const brand = (
    <div className='flex items-center gap-3 border-b border-slate-200 pb-4 -mx-4 px-4'>
      <img src={logo} alt='CollabSphere' className='w-8 h-8 rounded-xl' />
      <div className='leading-tight'>
        <div className='text-sm font-bold text-slate-900'>
          CollabSphere
        </div>
        <div className='text-xs text-slate-500'>Head Department</div>
      </div>
    </div>
  );

  return (
    <AppSidebar
      showBrand={false}
      style={{
        ['--bg-card']: 'transparent',
        ['--border-color']: 'transparent',
        ['--bg-secondary']: 'rgb(226 232 240)',
        boxShadow: 'none',
      }}
      itemClassName='rounded-md '
      activeItemClassName='bg-orangeFpt-50/60 text-orangeFpt-600 font-semibold shadow-inner'
      sections={isAuthenticated ? sections : []}
      expanded
      mode='inline'
      topSlot={
        <>
          {brand}
          {unauthPrompt}
          <span className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1 py-2' >Management</span>
        </>
      }
      footerSlot={footer}
    />
  );
};

const normalizePath = (path = '/') => {
  if (!path) return '/';
  const trimmed = path.replace(/\/+$/, '');
  if (!trimmed.length) return '/';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const HeadDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showReportModal, setShowReportModal] = useState(false);

  const { accessToken, userId } = useSelector(
    state => state.user
  );
  const isAuthenticated = Boolean(accessToken);

  // Navigation Items for Head Department
  const navigationItems = [
    {
      label: 'Subjects',
      href: '/head-department/subject-management',
      icon: BookOpen,
      match: path => path.startsWith('/head-department/subject-management'),
    },
    {
      label: 'Projects',
      href: '/head-department/project-management',
      icon: FolderKanban,
      match: path =>
        path.startsWith('/head-department/project-management') &&
        !path.startsWith('/head-department/project-approvals'),
    },
    {
      label: 'Semester',
      href: '/head-department/semester-management',
      icon: ClipboardCheck,
      match: path => path.startsWith('/head-department/semester-management'),
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
    const profilePath = userId ? `/${userId}/profile` : '/head-department/profile';
    navigate(profilePath);
  }, [navigate, userId]);
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <div className='flex min-h-screen w-full bg-slate-50'>
      <aside className='fixed top-0 left-0 h-screen overflow-y-auto bg-white border-r border-slate-200'>
        <HeadSidebar
          sections={sidebarSections}
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onLogout={handleLogout}
          navigate={navigate}
          onOpenReport={() => setShowReportModal(true)}
        />
      </aside>
      <main className='flex-1 min-w-0 px-4 py-6 md:px-6 lg:px-8 ml-56 custom-scrollbar'>
        {children}
      </main>
      <ReportSystemModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={userId}
      />
    </div>
  );
};

export default HeadDashboardLayout;
