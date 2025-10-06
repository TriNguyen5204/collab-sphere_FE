import { useState } from 'react';
import { BookOpen, FolderKanban, ChevronRight } from 'lucide-react';

export default function HeadDepartmentSidebar() {
  const [activeItem, setActiveItem] = useState('subject');

  const menuItems = [
    {
      id: 'subject',
      name: 'Subject',
      icon: BookOpen,
      description: 'Quản lý môn học',
    },
    {
      id: 'project',
      name: 'Project',
      icon: FolderKanban,
      description: 'Quản lý dự án',
    },
  ];

  <div className='w-64 bg-white shadow-lg'>
    <div className='p-6'>
      <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
    </div>

    <nav className='mt-6'>
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`w-full flex items-center justify-between px-6 py-4 transition-all ${
              isActive
                ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center space-x-3'>
              <Icon className='w-5 h-5' />
              <span className='font-medium'>{item.name}</span>
            </div>
            {isActive && <ChevronRight className='w-4 h-4' />}
          </button>
        );
      })}
    </nav>
  </div>;
}
