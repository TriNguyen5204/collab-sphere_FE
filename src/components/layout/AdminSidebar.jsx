import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppSidebar from './AppSidebar';
import { logout } from '../../store/slices/userSlice';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken, roleName } = useSelector(state => state.user);
  const isAuthenticated = Boolean(accessToken);
  const userLabel = roleName || 'Admin user';

  const sections = useMemo(
    () =>
      isAuthenticated
        ? [
            {
              title: 'Administration',
              items: [
                {
                  label: 'Dashboard',
                  href: '/admin',
                  icon: LayoutDashboard,
                  match: path => path === '/admin',
                },
                {
                  label: 'Account management',
                  href: '/admin/account-management',
                  icon: Users,
                  match: path => path.startsWith('/admin/account-management'),
                },
                {
                  label: 'System reports',
                  href: '/admin/reports',
                  icon: FileText,
                  match: path => path.startsWith('/admin/reports'),
                },
              ],
            },
          ]
        : [],
    [isAuthenticated],
  );

  const footer = isAuthenticated ? (
    <div className='mt-auto border-t border-slate-200 px-4 py-4 bg-slate-50'>
      <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow'>
          {userLabel.charAt(0).toUpperCase()}
        </div>
        <div className='flex-1 overflow-hidden'>
          <p className='truncate text-sm font-semibold text-slate-800'>{userLabel}</p>
          <p className='truncate text-xs text-slate-500'>Administrator</p>
        </div>
        <button
          type='button'
          onClick={() => {
            dispatch(logout());
            navigate('/login');
          }}
          className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-500'
          title='Sign out'
        >
          <LogOut className='h-4 w-4' />
        </button>
      </div>
    </div>
  ) : null;

  const unauthPrompt = !isAuthenticated ? (
    <div className='px-4 pt-6'>
      <div className='rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-5 text-center shadow-inner'>
        <p className='text-sm font-medium text-slate-700 mb-2'>Sign in to manage the platform</p>
        <div className='flex flex-col gap-2'>
          <button
            type='button'
            onClick={() => navigate('/login')}
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

  return (
    <AppSidebar
      brand={{
        title: 'Admin Console',
        subtitle: 'CollabSphere',
        to: '/admin',
      }}
      sections={sections.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          match: path => (item.match ? item.match(path) : path === item.href),
          // UI enhancement: add color highlight or background for active links
          className:
            'flex items-center gap-3 rounded-xl px-3 py-2 text-slate-700 font-medium transition hover:bg-slate-100 hover:text-blue-600 [&.active]:bg-blue-50 [&.active]:text-blue-600 [&.active]:font-semibold',
        })),
      }))}
      expanded
      mode='inline'
      className='h-full min-h-screen border-r border-slate-200 bg-white shadow-sm'
      topSlot={unauthPrompt}
      footerSlot={footer}
    />
  );
};

export default AdminSidebar;
