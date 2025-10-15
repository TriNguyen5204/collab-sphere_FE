import React from 'react';
import { Star, BookOpen, Users, User } from 'lucide-react';

const clamp = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const getStatusInfo = (status, progress) => {
  const pct = clamp(progress);
  const label = status ?? (pct >= 100 ? "Completed" : pct > 0 ? "In Progress" : "Not Started");
  // Blue variants only
  const bg = "bg-blue-50";
  const badge = "bg-blue-100 text-blue-800";
  return { label, bg, badge };
};

const ProjectCard = ({ project, isStarred, onToggleStar, onClick }) => {
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
      <button
        onClick={(e) => onToggleStar(e)}
        className="absolute top-2 left-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition z-10"
        aria-label={isStarred ? "Unstar project" : "Star project"}
      >
        <div className="relative group/star">
          <Star
            className={`h-6 w-6 transform transition-transform duration-200 ${
              isStarred
                ? "text-yellow-500 scale-100"
                : "text-gray-400 group-hover/star:scale-110 hover:text-gray-600"
            }`}
            fill={isStarred ? "currentColor" : "none"}
          />
          <span className="absolute -top-12 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/star:opacity-100 transition duration-300 delay-500 pointer-events-none whitespace-nowrap">
            {isStarred
              ? `Click to unstar ${name}.`
              : `Click to star ${name}.`}
          </span>
        </div>
      </button>

      {/* Blue header with status badge */}
      <div className={`flex justify-end items-start rounded-t-lg w-full h-24 bg-blue-300`}/>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">{name}</h2>

        {/* Info */}
        <div className="flex flex-col gap-2 text-sm text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            <span>{className}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <span>{teamName}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" />
            <span>{lecturerName}</span>
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