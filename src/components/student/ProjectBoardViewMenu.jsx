import React, { useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Kanban, Flag, CheckSquare, MessageSquare, ClipboardList, ChevronDown, UsersRound } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

const ProjectBoardViewMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { id, projectName } = useParams();
  const location = useLocation();

  // Ensure paths use the encoded project name to match location.pathname
  const encodedProjectName = encodeURIComponent(projectName ?? '');

  const menuItems = [
    { name: 'Board', icon: Kanban, path: `/student/project/${id}/${encodedProjectName}` },
    { name: 'Team Workspace', icon: UsersRound, path: `/student/project/${id}/${encodedProjectName}/team-workspace` },
    { name: 'Milestones & Checkpoints', icon: Flag, path: `/student/project/${id}/${encodedProjectName}/milestones&checkpoints` },
    { name: 'Communication', icon: MessageSquare, path: `/student/project/${id}/${encodedProjectName}/communication` },
    { name: 'Peer Evaluation', icon: ClipboardList, path: `/student/project/${id}/${encodedProjectName}/peer-evaluation` },
  ];

  // Helpers for robust matching
  const normalizePath = (p) => (p || '').replace(/\/+$/, '');
  const currentPath = normalizePath(location.pathname);

  // Pick the most specific (longest) matching item so "Board" doesn't win on subpaths
  const activeItem =
    [...menuItems]
      .map(i => ({ ...i, path: normalizePath(i.path) }))
      .filter(i => currentPath === i.path || currentPath.startsWith(i.path + '/'))
      .sort((a, b) => b.path.length - a.path.length)[0]
    || menuItems[0];

  const ActiveIcon = activeItem.icon;
  const activePath = normalizePath(activeItem.path);

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
        <ul className="absolute mt-2 bg-gray-800 text-white shadow-lg rounded-lg border border-gray-700 text-sm z-10 w-full">
          {menuItems.map(({ name, icon: Icon, path }) => {
            const normalizedPath = normalizePath(path);
            const isActive = normalizedPath === activePath;

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
                  {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
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
