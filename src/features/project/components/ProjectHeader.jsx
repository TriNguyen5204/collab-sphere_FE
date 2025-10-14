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
            <div className={styles.moduleRating}>
              {[...Array(5)].map((_, index) => (
                <StarIconSolid
                  key={index}
                  className={`w-5 h-5 ${index < projectData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className={styles.ratingText}>({projectData.rating}/5)</span>
            </div>
          </div>
          <p className={styles.moduleDescription}>{projectData.description}</p>

          <div className={styles.moduleStats}>
            <div className={styles.statItem}>
              <CalendarIcon className="w-4 h-4" />
              <span>Duration: {projectData.duration}</span>
            </div>
            <div className={styles.statItem}>
              <AcademicCapIcon className="w-4 h-4" />
              <span>Difficulty: {projectData.difficulty}</span>
            </div>
            <div className={styles.statItem}>
              <ClockIcon className="w-4 h-4" />
              <span>Est. Hours: {projectData.estimatedHours}</span>
            </div>
            <div className={styles.statItem}>
              <UserGroupIcon className="w-4 h-4" />
              <span>Team Size: {projectData.teamSize}</span>
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
