import React, { useState } from 'react';
import {
  Home,
  GraduationCap,
  BookOpen,
  FolderKanban,
  CheckSquare,
  BarChart2,
  Calendar,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Bell,
  LogOut,
  Search,
  Plus,
  Star,
} from 'lucide-react';

const ImprovedSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Tools');

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      badge: null,
      description: 'Dashboard and summary',
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: GraduationCap,
      badge: '12',
      description: 'Manage your classes',
    },
    {
      id: 'topics',
      label: 'Topics Library',
      icon: BookOpen,
      badge: null,
      description: 'Course materials',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      badge: '3',
      description: 'Active projects',
    },
    {
      id: 'grading',
      label: 'Grading',
      icon: CheckSquare,
      badge: '7',
      description: 'Assignments to grade',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart2,
      badge: null,
      description: 'Performance insights',
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: Calendar,
      badge: 'New',
      description: 'Schedule and join meetings',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      badge: null,
      description: 'Utilities and helpers',
    },
  ];

  const quickActions = [
    { icon: Plus, label: 'New Class', color: 'text-blue-600' },
    { icon: Calendar, label: 'Schedule', color: 'text-green-600' },
    { icon: Star, label: 'Favorites', color: 'text-yellow-600' },
  ];

  const handleItemClick = itemId => {
    setActiveItem(itemId);
  };

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-slate-50 to-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className='p-6 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          {!collapsed && (
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center'>
                <GraduationCap className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-lg font-bold text-gray-900'>EduPlatform</h1>
                <p className='text-xs text-gray-500'>Learning Management</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            {collapsed ? (
              <ChevronRight className='w-4 h-4 text-gray-600' />
            ) : (
              <ChevronLeft className='w-4 h-4 text-gray-600' />
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className='px-4 py-3 border-b border-gray-100'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search...'
              className='w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!collapsed && (
        <div className='px-4 py-4 border-b border-gray-100'>
          <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>
            Quick Actions
          </h3>
          <div className='flex gap-2'>
            {quickActions.map((action, index) => (
              <button
                key={index}
                className='flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group'
                title={action.label}
              >
                <action.icon
                  className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className='flex-1 px-4 py-4 overflow-y-auto'>
        <h3
          className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 ${
            collapsed ? 'text-center' : ''
          }`}
        >
          {collapsed ? '•••' : 'Navigation'}
        </h3>

        <nav className='space-y-1'>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={collapsed ? item.label : ''}
              >
                {/* Active Indicator */}
                {isActive && !collapsed && (
                  <div className='absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full'></div>
                )}

                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-gray-700'
                  } ${collapsed ? 'mx-auto' : ''}`}
                />

                {!collapsed && (
                  <>
                    <div className='flex-1'>
                      <div className='font-medium'>{item.label}</div>
                      {item.description && (
                        <div
                          className={`text-xs ${
                            isActive ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badge === 'New'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Hover Tooltip for Collapsed State */}
                {collapsed && (
                  <div className='absolute left-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
                    {item.label}
                    <div className='absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45'></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className='p-4 border-t border-gray-100'>
        {!collapsed ? (
          <div className='space-y-3'>
            {/* Notifications */}
            <div className='flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <div className='flex items-center gap-3'>
                <Bell className='w-4 h-4 text-yellow-600' />
                <div>
                  <p className='text-sm font-medium text-yellow-800'>
                    3 new notifications
                  </p>
                  <p className='text-xs text-yellow-600'>Click to view all</p>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className='flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'>
              <div className='w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center'>
                <User className='w-5 h-5 text-white' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-gray-900'>John Doe</p>
                <p className='text-xs text-gray-500'>Professor</p>
              </div>
              <Settings className='w-4 h-4 text-gray-400 hover:text-gray-600' />
            </div>

            {/* Logout */}
            <button className='w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'>
              <LogOut className='w-4 h-4' />
              <span className='text-sm font-medium'>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className='space-y-2'>
            <button className='w-full p-3 hover:bg-gray-100 rounded-lg transition-colors group'>
              <User className='w-5 h-5 text-gray-600 mx-auto group-hover:text-gray-800' />
            </button>
            <button className='w-full p-3 hover:bg-red-50 rounded-lg transition-colors group'>
              <LogOut className='w-5 h-5 text-red-600 mx-auto' />
            </button>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div className='absolute right-0 top-0 bottom-0 w-1 hover:w-2 bg-transparent hover:bg-blue-200 cursor-col-resize transition-all'></div>
    </aside>
  );
};

export default ImprovedSidebar;
