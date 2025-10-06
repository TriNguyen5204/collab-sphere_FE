import React, { useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Kanban, Flag, CheckSquare, Users, MessageSquare, Folder, BarChart2, ClipboardList, ChevronDown, UsersRound } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

const ProjectBoardViewMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { id, projectName } = useParams();
  const location = useLocation();

  const menuItems = [
    { name: 'Board', icon: Kanban, path: `/student/project/${id}/${projectName}` },
    { name: 'Team Workspace', icon: UsersRound, path: `/student/project/${id}/${projectName}/team-workspace` },
    { name: 'Milestones', icon: Flag, path: `/student/project/${id}/${projectName}/milestones` },
    { name: 'Checkpoints', icon: CheckSquare, path: `/student/project/${id}/${projectName}/checkpoints` },
    { name: 'Communication', icon: MessageSquare, path: `/student/project/${id}/${projectName}/communication` },
    { name: 'Peer Evaluation', icon: ClipboardList, path: `/student/project/${id}/${projectName}/peer-evaluation` },
  ];

  // Find current active menu item based on current path
  const activeItem = menuItems.find(item => item.path === location.pathname) || menuItems[0];
  const ActiveIcon = activeItem.icon;

  // Close the menu when a click is detected outside
  useClickOutside(menuRef, () => setOpen(false));

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center px-3 py-2 rounded transition ${
          open ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      >
        <ActiveIcon className="mr-2" size={18} />
        <span className="mr-2 font-medium">{activeItem.name}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="absolute mt-2 w-56 bg-gray-800 text-white shadow-lg rounded-lg border border-gray-700 text-sm z-10">
          {menuItems.map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            
            return (
              <li key={name}>
                <Link
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-2.5 hover:bg-gray-700 rounded transition ${
                    isActive ? 'bg-gray-700 text-white font-semibold' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="flex-1">{name}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProjectBoardViewMenu;
