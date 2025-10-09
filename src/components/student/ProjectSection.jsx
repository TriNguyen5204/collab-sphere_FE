import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectSection = ({ 
  title, 
  icon: Icon, 
  projects, 
  starred, 
  onToggleStar, 
  onCardClick,
  emptyMessage 
}) => {
  return (
    <div>
      <h2 className="flex items-center text-2xl font-bold mb-4">
        <Icon className="inline-block mr-3 h-7 w-7" />
        {title}
        {projects.length > 0 && (
          <span className="ml-2 text-lg font-normal text-gray-600">({projects.length})</span>
        )}
      </h2>
      {projects.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.ProjectId}
              project={project}
              isStarred={starred.includes(project.ProjectId)}
              onToggleStar={onToggleStar}
              onClick={onCardClick}
            />
          ))}
        </div>
      ) : (
        emptyMessage && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">{emptyMessage.title}</h3>
            <p className="text-gray-600">{emptyMessage.description}</p>
          </div>
        )
      )}
    </div>
  );
};

export default ProjectSection;