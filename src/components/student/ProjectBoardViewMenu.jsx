import React, { useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Kanban, Flag, MessageSquare, ChevronDown, UsersRound } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

const ProjectBoardViewMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { projectId, projectName, teamId, id: legacyTeamId } = useParams();
  const location = useLocation();

  const encodedProjectName = encodeURIComponent(projectName ?? '');
  const effectiveTeamId = teamId || legacyTeamId;

  const menuItems = [
    { name: 'Team Workspace', icon: UsersRound, path: `/student/project/${projectId}/${encodedProjectName}/${effectiveTeamId}/team-workspace` },
    { name: 'Task Board', icon: Kanban, path: `/student/project/${projectId}/${encodedProjectName}/${effectiveTeamId}` },
    { name: 'Milestones & Checkpoints', icon: Flag, path: `/student/project/${projectId}/${encodedProjectName}/${effectiveTeamId}/milestones&checkpoints` },
    { name: 'Peer Evaluation', icon: UsersRound, path: `/student/project/${projectId}/${encodedProjectName}/${effectiveTeamId}/peer-evaluation` },
    { name: 'Communication', icon: MessageSquare, path: `/student/project/${projectId}/${encodedProjectName}/${effectiveTeamId}/communication` },
  ];

  const normalizePath = (p) => (p || '').replace(/\/+$/, '');
  const currentPath = normalizePath(location.pathname);

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
    <div className="relative w-auto" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between px-3 py-2 rounded transition ${
          open ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ActiveIcon className="shrink-0" size={18} />
          <span className="font-medium truncate text-left">{activeItem.name}</span>
        </div>
        <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 bg-gray-800 text-white shadow-lg rounded-lg border border-gray-700 text-sm z-10 w-max min-w-full whitespace-nowrap">
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
                  {isActive && <div className="w-2 h-2 bg-orangeFpt-500 rounded-full"></div>}
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
