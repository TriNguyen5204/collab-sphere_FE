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
import logo from '../../assets/logov2.svg';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { accessToken } = useSelector(state => state.user);
  const isAuthenticated = Boolean(accessToken);

  const navItems = useMemo(
    () =>
      isAuthenticated
        ? [
            // {
            //   label: 'Dashboard',
            //   href: '/admin',
            //   icon: LayoutDashboard,
            //   match: path => path === '/admin',
            // },
            {
              label: 'Account',
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
          ]
        : [],
    [isAuthenticated],
  );

  const footer = isAuthenticated ? (
    <div className='mt-auto border-t border-slate-100 px-3 py-3'>
      <button
        type='button'
        onClick={() => {
          dispatch(logout());
          navigate('/login');
        }}
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

  const brand = (
    <div className='flex items-center gap-3 border-b border-slate-200 pb-4 -mx-4 px-4'>
      <img src={logo} alt='CollabSphere' className='w-8 h-8 rounded-xl' />
      <div className='leading-tight'>
        <div className='text-sm font-bold text-slate-900'>
          CollabSphere
        </div>
        <div className='text-xs text-slate-500'>Admin Hub</div>
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
      itemClassName="rounded-md px-3"
      activeItemClassName="bg-orangeFpt-50/60 text-orangeFpt-600 font-semibold shadow-inner"
      sections={[
        {
          items: navItems.map(item => ({
            ...item,
            match: path => (item.match ? item.match(path) : path === item.href),
          })),
        },
      ]}
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

export default AdminSidebar;
