import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, Menu, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'accounts', label: 'Account Management', icon: Users, path: '/admin/account-management' },
    { id: 'reports', label: 'System Report', icon: FileText, path: '/admin/reports' },
  ];

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col h-screen`}>
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        {sidebarOpen && (
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                navigate(item.path);}}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} px-4 py-3 mb-2 rounded-lg transition-all ${
                activeMenu === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </div>
              {sidebarOpen && activeMenu === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t">
        <div className={`flex items-center ${sidebarOpen ? '' : 'justify-center'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}