import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  PencilIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import styles from './ProjectHeader.module.css';

const ProjectHeader = ({ projectId, projectData }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/lecturer/projects');
  };

  const handleEdit = () => {
    navigate(`/lecturer/projects/${projectId}/edit`);
  };

  const duration = projectData.duration || projectData.estimatedDuration || '—';
  const difficulty = projectData.difficulty || '—';
  const estimatedHours = projectData.estimatedHours || projectData.estHours || '—';
  const teamSize = projectData.teamSize || `${projectData.minTeamSize || '—'}-${projectData.maxTeamSize || '—'} members`;
  const ratingValue = Number(projectData.rating) || 0;

  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.breadcrumb}>
          <button onClick={handleBack} className={styles.backButton}>
            <ChevronLeftIcon className="w-4 h-4" />
            Projects
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{projectData.title}</span>
        </div>
      </div>

      <div className={styles.headerContent}>
        <div className={styles.moduleInfo}>
          <div className={styles.titleSection}>
            <h1 className={styles.moduleTitle}>{projectData.title}</h1>
            {ratingValue > 0 && (
              <div className={styles.moduleRating}>
                {[...Array(5)].map((_, index) => (
                  <StarIconSolid
                    key={index}
                    className={`w-5 h-5 ${index < ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className={styles.ratingText}>({ratingValue}/5)</span>
              </div>
            )}
          </div>
          <p className={styles.moduleDescription}>{projectData.description}</p>

          <div className={styles.moduleStats}>
            <div className={styles.statItem}>
              <CalendarIcon className="w-4 h-4" />
              <span>Duration: {duration}</span>
            </div>
            <div className={styles.statItem}>
              <AcademicCapIcon className="w-4 h-4" />
              <span>Difficulty: {difficulty}</span>
            </div>
            <div className={styles.statItem}>
              <ClockIcon className="w-4 h-4" />
              <span>Est. Hours: {estimatedHours}</span>
            </div>
            <div className={styles.statItem}>
              <UserGroupIcon className="w-4 h-4" />
              <span>Team Size: {teamSize}</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button onClick={handleEdit} className={styles.editButton}>
            <PencilIcon className="w-4 h-4" />
            Edit Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
