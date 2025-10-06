
import { path } from 'framer-motion/client';
import { BookOpen, FolderKanban, ChevronRight, LayoutDashboard, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeadDepartmentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Tổng quan',
      path: '/head-department',
    },
    {
      id: 'subject',
      name: 'Subject',
      icon: BookOpen,
      description: 'Quản lý môn học',
      path: '/head-department/subject-management',  
    },
    {
      id: 'project',
      name: 'Project',
      icon: FolderKanban,
      description: 'Quản lý dự án',
      path: '/head-department/project-management',
    },
    {
      id: 'pending-projects',
      name: 'Pending Projects',
      icon: Clock,
      description: 'Dự án chờ duyệt',
      path: '/head-department/project-approvals',
    },
  ];

  return (
    <aside className='w-64 bg-gradient-to-b from-slate-50 to-white h-screen shadow-xl flex flex-col border-r border-gray-200'>
      {/* Header */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
            <LayoutDashboard className='w-5 h-5 text-white' />
          </div>
          <h1 className='text-xl font-bold text-gray-800'>SmartEnroll</h1>
        </div>
      </div>

      {/* Menu */}
      <nav className='flex-1 py-4 px-3 space-y-1'>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 rounded-lg group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
              }`}
            >
              <div className='flex items-center gap-3'>
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  } ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                />
                <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                  {item.name}
                </span>
              </div>
              <ChevronRight 
                className={`w-4 h-4 transition-all duration-200 ${
                  isActive 
                    ? 'text-white opacity-100' 
                    : 'text-gray-400 opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-gray-200'>
        <p className='text-xs text-center text-gray-500 font-medium'>
          © 2025 SmartEnroll
        </p>
      </div>
    </aside>
  );
};

export default HeadDepartmentSidebar;