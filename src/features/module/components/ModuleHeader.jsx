import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  PencilIcon, 
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import styles from './ModuleHeader.module.css';

const ModuleHeader = ({ moduleId, moduleData }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/lecturer/modules');
  };

  const handleEdit = () => {
    navigate(`/lecturer/modules/${moduleId}/edit`);
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.breadcrumb}>
          <button onClick={handleBack} className={styles.backButton}>
            <ChevronLeftIcon className="w-4 h-4" />
            Modules
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{moduleData.title}</span>
        </div>
      </div>

      <div className={styles.headerContent}>
        <div className={styles.moduleInfo}>
          <div className={styles.titleSection}>
            <h1 className={styles.moduleTitle}>{moduleData.title}</h1>
            <div className={styles.moduleRating}>
              {[...Array(5)].map((_, i) => (
                <StarIconSolid 
                  key={i} 
                  className={`w-5 h-5 ${i < moduleData.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
              <span className={styles.ratingText}>({moduleData.rating}/5)</span>
            </div>
          </div>
          <p className={styles.moduleDescription}>{moduleData.description}</p>
          
          <div className={styles.moduleStats}>
            <div className={styles.statItem}>
              <CalendarIcon className="w-4 h-4" />
              <span>Duration: {moduleData.duration}</span>
            </div>
            <div className={styles.statItem}>
              <AcademicCapIcon className="w-4 h-4" />
              <span>Difficulty: {moduleData.difficulty}</span>
            </div>
            <div className={styles.statItem}>
              <ClockIcon className="w-4 h-4" />
              <span>Est. Hours: {moduleData.estimatedHours}</span>
            </div>
            <div className={styles.statItem}>
              <UserGroupIcon className="w-4 h-4" />
              <span>Team Size: {moduleData.teamSize}</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button onClick={handleEdit} className={styles.editButton}>
            <PencilIcon className="w-4 h-4" />
            Edit Module
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleHeader;