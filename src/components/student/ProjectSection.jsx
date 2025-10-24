import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectSection = ({ 
  title, 
  icon: Icon, 
  projects, 
  onCardClick,
  emptyMessage 
}) => {
  // Generate a stable unique key for each project card
  const getProjectKey = (p, index) => {
    // Prefer lowercase API fields; fall back to possible PascalCase variants
    const projectId = p?.projectId ?? p?.ProjectId;
    const teamId = p?.teamId ?? p?.TeamId;
    const classId = p?.classId ?? p?.ClassId;

    const composed = [classId, teamId, projectId].filter(Boolean).join("-");
    if (composed) return composed;

    // As a last resort, build a key from names plus index to avoid collisions
    const nameKey = [p?.className, p?.teamName, p?.projectName]
      .filter(Boolean)
      .join("|");
    return nameKey ? `${nameKey}:${index}` : `idx-${index}`;
  };

  return (
    <div>
      <h2 className="flex items-center text-2xl font-bold mb-4">
        {Icon ? <Icon className="inline-block mr-3 h-7 w-7" /> : null}
        {title}
        {projects.length > 0 && (
          <span className="ml-2 text-lg font-normal text-gray-600">({projects.length})</span>
        )}
      </h2>
      {projects.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {projects.map((project, idx) => (
            <ProjectCard
              key={getProjectKey(project, idx)}
              project={project}
              onClick={() => onCardClick(project)}
            />
          ))}
        </div>
      ) : (
        emptyMessage && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            {Icon ? <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" /> : null}
            <h3 className="text-xl font-medium text-gray-900 mb-2">{emptyMessage.title}</h3>
            <p className="text-gray-600">{emptyMessage.description}</p>
          </div>
        )
      )}
    </div>
  );
};

export default ProjectSection;