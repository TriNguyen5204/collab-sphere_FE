import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Kanban, Flag, CheckSquare, Users, MessageSquare, Folder, BarChart2, ClipboardList, ChevronDown } from 'lucide-react';
import useClickOutside from '../../hooks/useClickOutside';

const ProjectBoardViewMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { id, projectName } = useParams();

  const menuItems = [
    { name: 'Kanban Board', icon: Kanban, path: `/student/project/${id}/${projectName}` },
    { name: 'Milestones', icon: Flag, path: `/student/project/${id}/${projectName}/milestones` },
    { name: 'Checkpoints', icon: CheckSquare, path: `/student/project/${id}/${projectName}/checkpoints` },
    { name: 'Team Members', icon: Users, path: `/student/project/${id}/${projectName}/members` },
    { name: 'Communication', icon: MessageSquare, path: `/student/project/${id}/${projectName}/communication` },
    { name: 'Resources', icon: Folder, path: `/student/project/${id}/${projectName}/resources` },
    { name: 'Analytics', icon: BarChart2, path: `/student/project/${id}/${projectName}/analytics` },
    { name: 'Peer Evaluation', icon: ClipboardList, path: `/student/project/${id}/${projectName}/peer-evaluation` },
  ];

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
        <Kanban className="mr-2" />
        <ChevronDown />
      </button>

      {open && (
        <ul className="absolute mt-2 w-48 bg-gray-800 text-white shadow-lg rounded-lg border border-gray-700 text-sm z-10">
          {menuItems.map(({ name, icon: Icon, path }) => (
            <li key={name}>
              <Link
                to={path}
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2 hover:bg-gray-700 rounded"
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectBoardViewMenu;
