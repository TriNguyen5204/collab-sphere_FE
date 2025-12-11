import React, { useMemo } from 'react';
import { BookOpen, FolderKanban, LayoutDashboard, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppSidebar from './AppSidebar';
import logo from '../../assets/logov2.svg';
import { logout } from '../../store/slices/userSlice';

const HeadDepartmentSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken, roleName } = useSelector(state => state.user);
  const isAuthenticated = Boolean(accessToken);
  const userLabel = roleName || 'Head department';

  const sections = useMemo(
    () =>
      isAuthenticated
        ? [
            {
              title: 'Department',
              items: [
                {
                  label: 'Dashboard',
                  href: '/head-department',
                  icon: LayoutDashboard,
                  match: path => path === '/head-department',
                },
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
                  match: path => path.startsWith('/head-department/project-management'),
                },
                {
                  label: 'Pending approvals',
                  href: '/head-department/project-approvals',
                  icon: Clock,
                  match: path => path.startsWith('/head-department/project-approvals'),
                },
              ],
            },
          ]
        : [],
    [isAuthenticated],
  );

  const footer = isAuthenticated ? (
    <div className='mt-auto border-t border-slate-200 px-4 py-4'>
      <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-semibold text-white'>
          {userLabel.charAt(0).toUpperCase()}
        </div>
        <div className='flex-1 overflow-hidden'>
          <p className='truncate text-sm font-semibold text-slate-800'>{userLabel}</p>
          <p className='truncate text-xs text-slate-500'>Department lead</p>
        </div>
        <button
          type='button'
          onClick={() => {
            dispatch(logout());
            navigate('/login');
          }}
          className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:text-rose-500'
          title='Sign out'
        >
          <LogOut className='h-4 w-4' />
        </button>
      </div>
    </div>
  ) : null;

  const unauthPrompt = !isAuthenticated ? (
    <div className='px-4 pt-6'>
      <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center'>
        <p className='text-sm font-medium text-slate-700'>Sign in to oversee departments</p>
        <div className='mt-3 flex flex-col gap-2'>
          <button
            type='button'
            onClick={() => navigate('/login')}
            className='inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600'
          >
            Login
          </button>
          <button
            type='button'
            onClick={() => navigate('/register')}
            className='inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500'
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  ) : undefined;

  return (
    <AppSidebar
      brand={{ title: 'Head department', subtitle: 'SmartEnroll', to: '/head-department', logo }}
      sections={sections.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          match: path => (item.match ? item.match(path) : path === item.href),
        })),
      }))}
      expanded
      mode='inline'
      className='h-full min-h-screen border-r border-slate-200 bg-white'
      topSlot={unauthPrompt}
      footerSlot={footer}
    />
  );
};

export default HeadDepartmentSidebar;
