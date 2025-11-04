import React from 'react';
import { Users, User, School } from 'lucide-react';

const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const ProjectCard = ({ project, onClick }) => {
  const name = project?.projectName || project?.teamName || "Unnamed Project";
  const className = project?.className || "Unknown Class";
  const teamName = project?.teamName || "Unknown Team";
  const lecturerName = project?.lecturerName || "Unknown Lecturer";
  const teamImage = project?.teamImage;
  const progress = clamp(project?.progress);


  return (
    <div
      className="bg-white rounded-lg shadow-md w-80 relative group hover:ring-2 hover:ring-brand-500 hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
      onClick={onClick}
    >
      <div
        className="flex justify-end items-start rounded-t-lg w-full h-32 bg-blue-300 bg-cover bg-center"
        style={teamImage ? { backgroundImage: `url(${teamImage})` } : undefined}
      >
        <div className="flex flex-col items-end bg-slate-100 rounded-full bg-opacity-70 m-1">
          <span className="text-sm font-bold p-1">{project.semesterName}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h2 className="text-xl font-semibold line-clamp-2 min-h-[3rem]">{name}</h2>

        {/* Info */}
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-brand-500" />
            <span>Class: {className}</span>
          </div>
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
        <div className="mt-auto">
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