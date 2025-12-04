import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  FolderIcon,
  HomeIcon,
  PhoneIcon,
  PowerIcon,
  UserCircleIcon,
  UserIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../../assets/logov1.png';
import { logout } from '../../store/slices/userSlice';
import { useAvatar } from '../../hooks/useAvatar';
import { getRoleLandingRoute } from '../../constants/roleRoutes';

const usePrimaryHeaderConfig = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { accessToken: token, fullName, avatar, roleName, userId } = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(fullName, avatar);

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
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-4 border-transparent border-2 rounded-full hover:border-orangeFpt-500 hover:rounded-full hover:border-2 hover:text-white hover:bg-orangeFpt-500 transition-all duration-300"
            >
              <div className='p-1 flex items-center gap-2'>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{fullName}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white overflow-hidden ${colorClass} ring-2 ring-white shadow-sm`}>
                  {shouldShowImage ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-sm font-medium text-gray-900">Signed in as</p>
                  <p className="text-sm text-gray-500 truncate">{fullName}</p>
                </div>
                
                <button 
                  onClick={() => navigate(getRoleLandingRoute(roleName))}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    const profilePath = userId ? `/${userId}/profile` : '/profile';
                    navigate(profilePath);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <User size={16} />
                  Profile
                </button>
                
                <div className="h-px bg-gray-50 my-2" />
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
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
