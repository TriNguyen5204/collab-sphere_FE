import React, { useMemo } from 'react';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppSidebar from './AppSidebar';
import { logout } from '../../store/slices/userSlice';

const AdminSidebar = () => {
  const location = useLocation();
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
    <div className='mt-auto border-t border-slate-200 px-4 py-4'>
      <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-semibold text-white'>
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
        <p className='text-sm font-medium text-slate-700'>Sign in to manage the platform</p>
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
      brand={{ title: 'Admin console', subtitle: 'CollabSphere', to: '/admin' }}
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

export default AdminSidebar;