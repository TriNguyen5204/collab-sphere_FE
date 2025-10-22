import React from 'react';
import { Users, User } from 'lucide-react';

const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const ProjectCard = ({ project, onClick }) => {
  const name = project?.projectName || project?.teamName || "Unnamed Project";
  const className = project?.className || "Unknown Class";
  const teamName = project?.teamName || "Unknown Team";
  const lecturerName = project?.lecturerName || "Unknown Lecturer";
  const progress = clamp(project?.progress);

  return (
    <div
      className="bg-white rounded-lg shadow-md w-80 relative group hover:ring-2 hover:ring-brand-500 hover:shadow-lg transition cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Blue header with status badge */}
      <div className={`flex justify-end items-start rounded-t-lg w-full h-24 bg-blue-300`}>
        <div className="flex flex-col items-end p-3">
          <span className="text-sm font-medium">{className}</span>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">{name}</h2>

        {/* Info */}
        <div className="flex flex-col gap-2 text-sm text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" />
            <span>Lecturer: {lecturerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <span>Team: {teamName}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;