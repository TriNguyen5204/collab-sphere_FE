import { useState } from 'react';
import {
  BookOpen,
  FolderKanban,
  ChevronRight,
  LayoutDashboard,
  Clock,
  PanelLeftClose,
  PanelRight ,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../assets/logov1.png';
import { motion, AnimatePresence } from 'framer-motion';

const HeadDepartmentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-slate-50 to-white h-screen shadow-xl flex flex-col border-r border-gray-200 sticky top-0 transition-all duration-300`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-4 border-b border-gray-200 transition-all duration-300 ${
          collapsed ? 'flex-col gap-2' : ''
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? 'justify-center' : 'justify-start gap-3'
          } w-full`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-md">
            <img src={Logo} alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          {!collapsed && (
            <h1 className="text-lg font-bold text-gray-800 transition-opacity duration-300">
              SmartEnroll
            </h1>
          )}
        </div>

        {/* Nút toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          {collapsed ? (
            <PanelRight  size={22} />
          ) : (
            <PanelLeftClose size={22} />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav
        className={`flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-3 text-left transition-all duration-200 rounded-lg group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'text-white scale-110'
                      : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-105'
                  }`}
                />
                {!collapsed && (
                  <span
                    className={`font-medium ${
                      isActive ? 'text-white' : ''
                    } transition-opacity duration-300`}
                  >
                    {item.name}
                  </span>
                )}
              </div>

              {!collapsed && (
                <ChevronRight
                  className={`w-4 h-4 transition-all duration-200 ${
                    isActive
                      ? 'text-white opacity-100'
                      : 'text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-gray-200 text-center text-xs text-gray-500 font-medium"
          >
            © 2025 SmartEnroll
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default HeadDepartmentSidebar;
