import React, { useEffect, useMemo, useState } from 'react';
import styles from './WorkBreakdownStructure.module.css';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
  approved: { label: 'Approved', tone: styles.statusApproved, icon: CheckCircleIcon },
  completed: { label: 'Completed', tone: styles.statusCompleted, icon: CheckCircleIcon },
  in_progress: { label: 'In Progress', tone: styles.statusInProgress, icon: ClockIcon },
  pending: { label: 'Pending', tone: styles.statusPending, icon: ClockIcon },
  rejected: { label: 'Requires Review', tone: styles.statusRejected, icon: ExclamationTriangleIcon },
};

const PRIORITY_CONFIG = {
  high: { label: 'High priority', tone: styles.priorityHigh },
  medium: { label: 'Medium priority', tone: styles.priorityMedium },
  low: { label: 'Low priority', tone: styles.priorityLow },
};

const clampProgress = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

const resolveStatusConfig = (status) => {
  if (!status) {
    return STATUS_CONFIG.pending;
  }

  const normalised = status.toLowerCase();
  return STATUS_CONFIG[normalised] ?? STATUS_CONFIG.pending;
};

const formatDateLabel = (input) => {
  if (!input) {
    return null;
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const WorkBreakdownStructure = ({ objectives = [], isLoading = false, onMilestoneClick }) => {
  const [expandedObjectiveId, setExpandedObjectiveId] = useState(null);

  useEffect(() => {
    if (!objectives.length) {
      setExpandedObjectiveId(null);
      return;
    }

    setExpandedObjectiveId((current) => {
      if (current && objectives.some((objective) => objective.id === current)) {
        return current;
      }

      return objectives[0]?.id ?? null;
    });
  }, [objectives]);

  const toggleObjective = (objectiveId) => {
    setExpandedObjectiveId((current) => (current === objectiveId ? null : objectiveId));
  };

  const skeletonPlaceholders = useMemo(
    () =>
      Array.from({ length: 2 }).map((_, index) => (
        <div className={styles.skeletonObjective} key={`skeleton-objective-${index}`}>
          <div className={styles.skeletonHeader}>
            <span className={styles.skeletonPill} />
            <span className={styles.skeletonTitle} />
          </div>
          <div className={styles.skeletonBody}>
            <span className={styles.skeletonLine} />
            <span className={styles.skeletonLineShort} />
          </div>
          <div className={styles.skeletonMilestones}>
            {Array.from({ length: 2 }).map((__, milestoneIndex) => (
              <div className={styles.skeletonMilestone} key={`skeleton-ms-${index}-${milestoneIndex}`}>
                <span className={styles.skeletonBadge} />
                <span className={styles.skeletonLineTiny} />
              </div>
            ))}
          </div>
        </div>
      )),
    [],
  );

  const renderPriorityTag = (priority) => {
    if (!priority) {
      return null;
    }

    const normalised = priority.toLowerCase();
    const config = PRIORITY_CONFIG[normalised] ?? PRIORITY_CONFIG.medium;

    return (
      <span className={`${styles.priorityTag} ${config.tone}`}>
        <span className={styles.priorityDot} />
        {config.label}
      </span>
    );
  };

  const renderProgressTag = (progress) => {
    const parsed = clampProgress(progress);
    if (parsed === null) {
      return null;
    }

    return <span className={styles.progressTag}>{parsed}%</span>;
  };

  const renderStatusBadge = (status) => {
    if (!status) {
      return null;
    }

    const config = resolveStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`${styles.statusBadge} ${config.tone}`}>
        <Icon className={styles.statusIcon} />
        {config.label}
      </span>
    );
  };

  const renderMilestones = (milestones = []) => {
    if (!milestones.length) {
      return (
        <div className={styles.emptyMilestones}>No milestones defined for this objective yet.</div>
      );
    }

    return milestones.map((milestone) => {
      const startLabel = formatDateLabel(milestone.startDate);
      const deadlineLabel = formatDateLabel(milestone.endDate ?? milestone.dueDate);
      const progressTag = renderProgressTag(milestone.progress);
      const statusBadge = renderStatusBadge(milestone.status);
      const titleText =
        typeof milestone.title === 'string'
          ? milestone.title.trim()
          : String(milestone.title ?? '').trim();

      const descriptionText =
        typeof milestone.description === 'string' && milestone.description.trim().length > 0
          ? milestone.description.trim()
          : '';
      const shouldRenderDescription =
        descriptionText.length > 0 && descriptionText.toLowerCase() !== titleText.toLowerCase();

      return (
        <button
          key={milestone.id}
          type="button"
          className={styles.milestoneCard}
          onClick={() => onMilestoneClick?.(milestone)}
        >
          <div className={styles.milestoneHeader}>
            <span className={styles.milestoneTitle}>{titleText || 'Untitled milestone'}</span>
            {statusBadge}
          </div>
          {shouldRenderDescription && (
            <p className={styles.milestoneDescription}>{descriptionText}</p>
          )}
          <div className={styles.milestoneMeta}>
            {startLabel && (
              <span className={`${styles.metaItem} ${styles.scheduleItem}`}>
                <ClockIcon className={styles.metaIcon} />
                Start {startLabel}
              </span>
            )}
            {deadlineLabel && (
              <span className={`${styles.metaItem} ${styles.deadlineItem}`}>
                <CalendarDaysIcon className={styles.metaIcon} />
                Deadline {deadlineLabel}
              </span>
            )}
            {progressTag}
          </div>
        </button>
      );
    });
  };

  const renderObjectives = () => {
    if (!objectives.length) {
      return (
        <div className={styles.emptyState}>
          <AcademicCapIcon className={styles.emptyIcon} />
          <h4>No objectives available</h4>
          <p>Once the AI generates objectives for this project, they will appear here with their milestones.</p>
        </div>
      );
    }

    return objectives.map((objective) => {
      const isExpanded = expandedObjectiveId === objective.id;
      const priorityTag = renderPriorityTag(objective.priority);
      const progressTag = renderProgressTag(objective.progress);
      const titleText =
        typeof objective.title === 'string'
          ? objective.title.trim()
          : String(objective.title ?? '').trim();
      const descriptionText =
        typeof objective.description === 'string' && objective.description.trim().length > 0
          ? objective.description.trim()
          : '';
      const shouldRenderDescription =
        descriptionText.length > 0 && descriptionText.toLowerCase() !== titleText.toLowerCase();

      return (
        <div key={objective.id} className={styles.objectiveCard}>
          <header className={styles.objectiveHeader}>
            <button
              type="button"
              className={styles.expandButton}
              onClick={() => toggleObjective(objective.id)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDownIcon className={styles.expandIcon} />
              ) : (
                <ChevronRightIcon className={styles.expandIcon} />
              )}
            </button>
            <div className={styles.objectiveInfo}>
              <div className={styles.objectiveTitleRow}>
                <h4 className={styles.objectiveTitle}>{titleText || 'Untitled objective'}</h4>
              </div>
            </div>
            {(priorityTag || progressTag) && (
              <div className={styles.objectiveMeta}>
                {priorityTag}
                {progressTag}
              </div>
            )}
          </header>

          {isExpanded && (
            <div className={styles.milestoneGroup}>
              <div className={styles.milestoneLabel}>
                <AcademicCapIcon className={styles.milestoneLabelIcon} />
                Milestones
              </div>
              <div className={styles.milestoneList}>{renderMilestones(objective.milestones)}</div>
            </div>
          )}

        </div>
      );
    });
  };

  return (
    <section className={styles.wbsContainer}>
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeading}>
          <PresentationChartLineIcon className={styles.headingIcon} />
            <div>
              <h3 className={styles.sectionTitle}>Academic Work Breakdown Structure</h3>
              <p className={styles.sectionSubtitle}>
                Objectives and their milestones are kept in sync with the AI-generated project blueprint.
              </p>
            </div>
        </div>
      </header>

      <div className={styles.sectionBody}>
        {isLoading ? skeletonPlaceholders : renderObjectives()}
      </div>
    </section>
  );
};

export default WorkBreakdownStructure;
