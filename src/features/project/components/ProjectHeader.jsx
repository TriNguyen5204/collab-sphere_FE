import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  PencilIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import styles from './ProjectHeader.module.css';

const ProjectHeader = ({ projectId, projectData }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/lecturer/projects');
  };

  const handleEdit = () => {
    navigate(`/lecturer/projects/${projectId}/edit`);
  };

  const formatMetaDate = (value) => {
    if (!value) {
      return 'Not set';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Not set';
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const subjectDisplay = projectData.subjectName
    ? `${projectData.subjectName}${projectData.subjectCode ? ` (${projectData.subjectCode})` : ''}`
    : 'Subject not assigned';

  const statusLabel = projectData.statusString || projectData.status || 'PENDING';
  const statusKey = statusLabel.toLowerCase();
  const statusClassKey = statusKey ? statusKey.charAt(0).toUpperCase() + statusKey.slice(1) : 'Pending';
  const createdLabel = formatMetaDate(projectData.createdAt);
  const updatedLabel = formatMetaDate(projectData.updatedAt || projectData.lastModified);
  const ownerLabel = projectData.lecturerName || projectData.createdBy || '—';
  const description = projectData.description || 'No description provided yet.';

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
          </div>
          <p className={styles.moduleDescription}>{description}</p>
          <p className={styles.metaSubtitle}>Created by {ownerLabel}</p>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <AcademicCapIcon className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Subject</span>
                <span className={styles.metaValue}>{subjectDisplay}</span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <CheckCircleIcon className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Status</span>
                <span className={`${styles.metaValue} ${styles.statusValue} ${styles[`status${statusClassKey}`] ?? ''}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <CalendarIcon className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Created</span>
                <span className={styles.metaValue}>{createdLabel}</span>
              </div>
            </div>
            <div className={styles.metaItem}>
              <ClockIcon className={styles.metaIcon} />
              <div>
                <span className={styles.metaLabel}>Last updated</span>
                <span className={styles.metaValue}>{updatedLabel}</span>
              </div>
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
