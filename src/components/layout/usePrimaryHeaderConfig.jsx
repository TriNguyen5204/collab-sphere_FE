import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  FolderIcon,
  HomeIcon,
  PhoneIcon,
  PowerIcon,
  UserCircleIcon,
  UserIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../../assets/logov1.png';
import { logout } from '../../store/slices/userSlice';

const usePrimaryHeaderConfig = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const token = useSelector(state => state.user.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setDropdownOpen(false);
  };

  const navLinks = useMemo(
    () => [
      { label: 'Home', href: '/staff', icon: HomeIcon },
      { label: 'Connect room', href: '/test/meeting', icon: VideoCameraIcon },
    ],
    [],
  );

  const brand = useMemo(
    () => ({
      title: 'CollabSphere',
      subtitle: 'Project collaboration',
      to: '/',
      logo,
      showEmblem: true,
      showTitle: true,
      showSubtitle: true,
    }),
    [],
  );

  const unauthenticatedActions = useMemo(
    () => [
      {
        label: 'Login',
        icon: ArrowRightOnRectangleIcon,
        onClick: () => navigate('/login'),
        variant: 'subtle',
      },
      {
        label: 'Sign up',
        icon: UserCircleIcon,
        onClick: () => navigate('/register'),
        variant: 'primary',
      },
    ],
    [navigate],
  );

  const desktopRightContent = token
    ? (
        <div className='relative hidden items-center md:flex' ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
          >
            <UserCircleIcon className='h-5 w-5 text-blue-500' />
            <span>My account</span>
            <ChevronDownIcon className={`h-4 w-4 transition ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className='absolute right-4 top-full mt-3 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl'>
              <button
                onClick={() => {
                  navigate('/staff/lecturers');
                  setDropdownOpen(false);
                }}
                className='flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-600'
              >
                <UserIcon className='h-4 w-4 text-blue-500' />
                Account
              </button>
              <button
                onClick={() => {
                  navigate('/staff/classes');
                  setDropdownOpen(false);
                }}
                className='flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-600'
              >
                <BookOpenIcon className='h-4 w-4 text-blue-500' />
                Class
              </button>
              <button
                onClick={handleLogout}
                className='flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2 text-sm text-rose-600 transition hover:bg-rose-50'
              >
                <PowerIcon className='h-4 w-4' />
                Log out
              </button>
            </div>
          )}
        </div>
      )
    : undefined;

  const mobileMenuContent = token
    ? close => (
        <div className='space-y-2 border-t border-slate-200 pt-3'>
          <button
            onClick={() => {
              navigate('/profile');
              close();
            }}
            className='flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm'
          >
            <UserIcon className='h-4 w-4 text-blue-500' />
            Profile
          </button>
          <button
            onClick={() => {
              navigate('/project');
              close();
            }}
            className='flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm'
          >
            <FolderIcon className='h-4 w-4 text-blue-500' />
            Project
          </button>
          <button
            onClick={() => {
              handleLogout();
              close();
            }}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400'
          >
            <PowerIcon className='h-4 w-4' />
            Log out
          </button>
        </div>
      )
    : undefined;

  const actions = token ? [] : unauthenticatedActions;

  return {
    brand,
    navLinks,
    actions,
    desktopRightContent,
    mobileMenuContent,
  };
};

export default usePrimaryHeaderConfig;
