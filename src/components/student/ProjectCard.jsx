import React from 'react';
import { Star, BookOpen, Users, Calendar, Clock } from 'lucide-react';

const statusColors = (status) => {
  switch (status) {
    case "Processing":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getDaysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const ProjectCard = ({ project, isStarred, onToggleStar, onClick }) => {
  const daysRemaining = getDaysRemaining(project.DueDate);
  const isCompleted = project.Status === "Completed";

  return (
    <div
      className="bg-white rounded-lg shadow-md w-80 relative group hover:ring-2 hover:ring-brand-500 hover:shadow-lg transition cursor-pointer overflow-hidden"
      onClick={() => onClick(project)}
    >
      <button
        onClick={(e) => onToggleStar(e, project.ProjectId)}
        className="absolute top-2 left-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition z-10"
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
              ? `Click to unstar ${project.ProjectName}. It will be removed from your starred list.`
              : `Click to star ${project.ProjectName}. It will be added to your starred list.`}
          </span>
        </div>
      </button>

      <div className={`flex justify-end rounded-t-lg w-full h-24 ${statusColors(project.Status)}`}>
        <span className={`px-3 py-1 rounded-bl-lg font-semibold ${statusColors(project.Status)}`}>
          {project.Status}
        </span>
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{project.ProjectName}</h2>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.Description}</p>
        
        {/* Class Info */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          <span className="font-medium">{project.ClassCode}</span>
          <span className="text-gray-400">•</span>
          <span>{project.ClassName}</span>
        </div>

        {/* Team Info */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Users className="w-4 h-4 text-brand-500" />
          <span>{project.TeamName}</span>
          <span className="text-gray-400">•</span>
          <span>{project.TeamMembers} members</span>
        </div>

        {/* Assignment Info */}
        <div className="border-t pt-3 mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Assigned: {new Date(project.AssignedDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          {!isCompleted ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className={daysRemaining < 0 ? "text-red-600 font-semibold" : daysRemaining <= 7 ? "text-orange-600 font-semibold" : "text-gray-600"}>
                  Due: {new Date(project.DueDate).toLocaleDateString()}
                </span>
              </div>
              <span className={daysRemaining < 0 ? "text-red-600 font-semibold" : daysRemaining <= 7 ? "text-orange-600 font-semibold" : "text-gray-600"}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : daysRemaining === 0 ? "Due today" : `${daysRemaining} days left`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Clock className="w-3 h-3" />
              <span className="font-semibold">Completed on: {new Date(project.DueDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Progress Bar */}
          {!isCompleted && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{project.Progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    project.Progress < 30 ? 'bg-red-500' :
                    project.Progress < 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${project.Progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;