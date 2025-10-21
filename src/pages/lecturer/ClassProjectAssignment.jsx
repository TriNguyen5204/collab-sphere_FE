import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  LockClosedIcon,
  ArrowPathIcon,
  FolderIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ClassProjectAssignment.module.css';
import { getLecturerProjects } from '../../services/projectApi';
import { getClassDetail } from '../../services/userService';
import { assignProjectsToClass } from '../../services/classApi';
import { toast } from 'sonner';

const formatStatusLabel = (value) => {
  if (!value) {
    return null;
  }

  const trimmed = value.toString().trim();
  if (!trimmed) {
    return null;
  }

  return trimmed
    .replace(/[_\s]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveStatusTone = (value) => {
  const token = value?.toString().trim().toUpperCase();

  if (!token) {
    return null;
  }

  if (['APPROVED', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'DONE'].includes(token)) {
    return 'success';
  }

  if (['PENDING', 'IN_REVIEW', 'AWAITING', 'PLANNING', 'DRAFT'].includes(token)) {
    return 'warning';
  }

  if (['DENIED', 'REJECTED', 'CANCELLED'].includes(token)) {
    return 'danger';
  }

  if (['ARCHIVED', 'CLOSED', 'ON_HOLD'].includes(token)) {
    return 'neutral';
  }

  return 'info';
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.list)) {
    return payload.list;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const normaliseClassDetail = (payload) => {
  const base = payload ?? {};
  const summary = base.class ?? base.classInformation ?? base;
  const assignments = Array.isArray(base.projectAssignments)
    ? base.projectAssignments
    : Array.isArray(base.classProjects)
    ? base.classProjects
    : [];

  const assignedProjectIds = new Set();
  const lockedProjectIds = new Set();

  assignments.forEach((assignment) => {
    if (!assignment) {
      return;
    }

    const idCandidates = [
      assignment.projectId,
      assignment.projectID,
      assignment.project?.projectId,
      assignment.project?.id,
      assignment.project?.projectID,
    ];

    const resolvedId = idCandidates.find((candidate) => candidate !== undefined && candidate !== null);
    if (resolvedId === undefined || resolvedId === null) {
      return;
    }

    const numericId = Number(resolvedId);
    if (!Number.isFinite(numericId)) {
      return;
    }

    assignedProjectIds.add(numericId);

    // Treat assignments linked to active teams as locked so lecturers cannot unassign them here.
    const locked =
      assignment.isAssignedToTeam === true ||
      assignment.isLocked === true ||
      (typeof assignment.teamCount === 'number' && assignment.teamCount > 0) ||
      (typeof assignment.assignedTeamsCount === 'number' && assignment.assignedTeamsCount > 0) ||
      (Array.isArray(assignment.assignedTeams) && assignment.assignedTeams.length > 0);

    if (locked) {
      lockedProjectIds.add(numericId);
    }
  });

  return {
    className: summary?.className ?? summary?.name ?? 'Unnamed Class',
    classCode: summary?.classCode ?? summary?.code ?? '',
    subjectName: summary?.subjectName ?? summary?.subjectTitle ?? summary?.subject?.subjectName ?? '',
    term: summary?.term ?? summary?.semester ?? summary?.period ?? '',
    totalTeams: summary?.teamCount ?? summary?.totalTeams ?? 0,
    totalStudents: summary?.studentCount ?? summary?.totalStudents ?? 0,
    projectAssignments: assignments,
    assignedProjectIds,
    lockedProjectIds,
  };
};

const mapProjectRecord = (record) => {
  if (!record) {
    return null;
  }

  const idCandidates = [
    record.projectId,
    record.id,
    record.projectID,
    record.ProjectId,
    record.project?.projectId,
  ];

  const resolvedId = idCandidates.find((candidate) => candidate !== undefined && candidate !== null);
  if (resolvedId === undefined || resolvedId === null) {
    return null;
  }

  const numericId = Number(resolvedId);
  if (!Number.isFinite(numericId)) {
    return null;
  }

  const status = record.statusString ?? record.projectStatus ?? record.approvalStatus ?? '';
  const priority = record.priority ?? record.projectPriority ?? record.importance ?? '';

  return {
    id: numericId,
    name: record.projectName ?? record.name ?? record.title ?? 'Untitled project',
    subjectName: record.subjectName ?? record.subjectTitle ?? record.subject?.subjectName ?? '',
    subjectCode: record.subjectCode ?? record.subject?.subjectCode ?? '',
    description: record.description ?? record.summary ?? '',
    status: typeof status === 'string' ? status.toUpperCase() : '',
    priority: typeof priority === 'string' ? priority.toLowerCase() : '',
    difficulty: record.difficulty ?? record.level ?? '',
    updatedAt: record.updatedAt ?? record.lastUpdated ?? record.modifiedDate ?? null,
    estimatedDuration: record.estimatedDuration ?? record.duration ?? '',
    tags: Array.isArray(record.tags) ? record.tags : [],
    teamCount: record.teamCount ?? record.assignedTeamsCount ?? 0,
    objectives: Array.isArray(record.objectives) ? record.objectives : [],
  };
};

const normaliseLecturerProjects = (payload) => {
  const rawProjects = extractArray(payload);
  const projects = rawProjects
    .map(mapProjectRecord)
    .filter((project) => {
      if (project === null) {
        return false;
      }

      // Only show approved projects
      const statusUpper = project.status.toUpperCase();
      return statusUpper === 'APPROVED';
    });

  return projects;
};

const formatDate = (input) => {
  if (!input) {
    return 'Not updated yet';
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Not updated yet';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ClassProjectAssignment = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);

  const [isInitialising, setIsInitialising] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classDetail, setClassDetail] = useState(() => normaliseClassDetail(null));
  const [projects, setProjects] = useState([]);
  const [assignedProjectIds, setAssignedProjectIds] = useState(new Set()); // Track already assigned
  const [selectedProjectIds, setSelectedProjectIds] = useState(new Set()); // Track newly selected
  const [lockedProjectIds, setLockedProjectIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const assignedProjectCount = selectedProjectIds.size;

  const loadData = useCallback(async () => {
    if (!classId || !lecturerId) {
      setIsInitialising(false);
      return;
    }

    setIsInitialising(true);

    try {
      const [classResponse, projectsResponse] = await Promise.all([
        getClassDetail(classId),
        getLecturerProjects(lecturerId),
      ]);

      const detail = normaliseClassDetail(classResponse);
      const projectList = normaliseLecturerProjects(projectsResponse);

      setClassDetail(detail);
      setProjects(projectList);
      
      // Store which projects are already assigned to this class
      setAssignedProjectIds(new Set(detail.assignedProjectIds));
      // Start with only newly selected projects (none initially)
      setSelectedProjectIds(new Set());
      setLockedProjectIds(new Set(detail.lockedProjectIds));
    } catch (error) {
      console.error('Failed to load class project assignment data.', error);
      toast.error('Unable to load project assignments for this class.');
    } finally {
      setIsInitialising(false);
    }
  }, [classId, lecturerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Separate projects into assigned and available
  const { assignedProjects, availableProjects } = useMemo(() => {
    const assigned = [];
    const available = [];

    projects.forEach((project) => {
      // Projects that are already assigned to the class go to "assigned" section
      if (assignedProjectIds.has(project.id)) {
        assigned.push(project);
      } else {
        available.push(project);
      }
    });

    return { assignedProjects: assigned, availableProjects: available };
  }, [projects, assignedProjectIds]);

  // Filter available projects by search term
  const filteredAvailableProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return availableProjects;
    }

    return availableProjects.filter((project) => {
      const haystack = [
        project.name,
        project.subjectName,
        project.description,
        project.status,
        project.priority,
        project.difficulty,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [availableProjects, searchTerm]);

  const projectSummary = useMemo(() => {
    return {
      alreadyAssigned: assignedProjects.length,
      newlySelected: selectedProjectIds.size,
      availableToAssign: availableProjects.length,
    };
  }, [assignedProjects.length, availableProjects.length, selectedProjectIds.size]);

  const statusBreakdown = useMemo(() => {
    if (!projects.length) {
      return [];
    }

    const counts = new Map();

    projects.forEach((project) => {
      const statusToken = (project.status || '').toString().trim().toUpperCase();
      
      // Skip projects without a status
      if (!statusToken) {
        return;
      }

      counts.set(statusToken, (counts.get(statusToken) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([status, count]) => {
        const label = formatStatusLabel(status);
        const tone = resolveStatusTone(status);
        
        // Skip if label or tone couldn't be determined
        if (!label || !tone) {
          return null;
        }

        return {
          status,
          count,
          label,
          tone,
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const handleToggleProject = (projectId) => {
    setSelectedProjectIds((current) => {
      const numericId = Number(projectId);
      if (!Number.isFinite(numericId)) {
        return current;
      }

      const next = new Set(current);
      if (next.has(numericId)) {
        next.delete(numericId);
      } else {
        next.add(numericId);
      }
      return next;
    });
  };

  const handleSaveAssignments = async () => {
    if (!classId) {
      toast.error('Invalid class context.');
      return;
    }

    // Combine already assigned projects with newly selected ones
    const allAssignedIds = new Set([...assignedProjectIds, ...selectedProjectIds]);
    const payload = Array.from(allAssignedIds);

    setIsSaving(true);
    try {
      const response = await assignProjectsToClass(classId, payload);
      const message = response?.message ?? response ?? 'Class projects updated successfully.';
      toast.success(message);
      await loadData();
    } catch (error) {
      console.error('Failed to assign projects to class.', error);
      const errorMessage = error?.response?.data?.message ?? 'Failed to update project assignments.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Render a project card for ASSIGNED projects (read-only, no checkbox)
  const renderAssignedProjectCard = (project) => {
    const statusLabel = formatStatusLabel(project.status);
    const statusTone = resolveStatusTone(project.status);
    const objectiveCount = project.objectives?.length ?? 0;

    return (
      <article key={project.id} className={`${styles.card} ${styles.assignedCard}`}>
        <header className={styles.cardHeader}>
          <div className={styles.cardTitleBlock}>
            <span className={`${styles.cardPill} ${styles.cardPillAssigned}`}>
              <CheckCircleIcon className={styles.cardPillIcon} />
              Assigned
            </span>
            <h3 className={styles.cardTitle}>{project.name}</h3>
            {project.subjectCode && <span className={styles.cardTag}>{project.subjectCode}</span>}
          </div>
          {statusLabel && statusTone && (
            <span className={`${styles.statusBadge} ${styles[`status-${statusTone}`]}`}>{statusLabel}</span>
          )}
        </header>

        <p className={styles.cardSummary}>{project.description || 'Description will be available soon.'}</p>

        {objectiveCount > 0 && (
          <div className={styles.cardObjectives}>
            <AcademicCapIcon className={styles.objectivesIcon} />
            <span>{objectiveCount} {objectiveCount === 1 ? 'objective' : 'objectives'}</span>
          </div>
        )}

        <footer className={styles.cardFooter}>
          <div className={styles.cardMeta}>
            {project.subjectName && (
              <span className={styles.cardMetaItem}>
                <BookOpenIcon />
                {project.subjectName}
              </span>
            )}
            <span className={styles.cardMetaItem}>
              <CalendarIcon />
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </footer>
      </article>
    );
  };

  // Render a project card for AVAILABLE projects (with checkbox)
  const renderAvailableProjectCard = (project) => {
    const isSelected = selectedProjectIds.has(project.id);
    const statusLabel = formatStatusLabel(project.status);
    const statusTone = resolveStatusTone(project.status);
    const objectiveCount = project.objectives?.length ?? 0;

    return (
      <article
        key={project.id}
        className={`${styles.card} ${styles.availableCard} ${isSelected ? styles.cardSelected : ''}`}
        onClick={() => handleToggleProject(project.id)}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
      >
        <div className={styles.cardCheckbox}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className={styles.checkbox}
            aria-label={`Select ${project.name}`}
          />
        </div>

        <header className={styles.cardHeader}>
          <div className={styles.cardTitleBlock}>
            {isSelected && (
              <span className={`${styles.cardPill} ${styles.cardPillSelected}`}>
                <CheckCircleIcon className={styles.cardPillIcon} />
                Added to update
              </span>
            )}
            <h3 className={styles.cardTitle}>{project.name}</h3>
            {project.subjectCode && <span className={styles.cardTag}>{project.subjectCode}</span>}
          </div>
          {statusLabel && statusTone && (
            <span className={`${styles.statusBadge} ${styles[`status-${statusTone}`]}`}>{statusLabel}</span>
          )}
        </header>

        <p className={styles.cardSummary}>{project.description || 'Description will be available soon.'}</p>

        {objectiveCount > 0 && (
          <div className={styles.cardObjectives}>
            <AcademicCapIcon className={styles.objectivesIcon} />
            <span>{objectiveCount} {objectiveCount === 1 ? 'objective' : 'objectives'}</span>
          </div>
        )}

        <footer className={styles.cardFooter}>
          <div className={styles.cardMeta}>
            {project.subjectName && (
              <span className={styles.cardMetaItem}>
                <BookOpenIcon />
                {project.subjectName}
              </span>
            )}
            <span className={styles.cardMetaItem}>
              <CalendarIcon />
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </footer>
      </article>
    );
  };

  const renderSkeletonCard = (key) => (
    <div key={key} className={styles.skeletonCard}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonBody} />
      <div className={styles.skeletonBody} />
      <div className={styles.skeletonMeta}>
        <span />
        <span />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.heroShell}>
          <div className={styles.heroContent}>
            <div className={styles.heroTopRow}>
              <Link to={`/lecturer/classes/${classId}`} className={styles.backLink}>
                <ArrowLeftIcon className={styles.backIcon} />
                <span>Back to class overview</span>
              </Link>
              <button
                type="button"
                className={styles.heroSecondary}
                onClick={() => navigate(`/lecturer/projects`)}
              >
                <FolderIcon className={styles.heroSecondaryIcon} />
                Manage projects
              </button>
            </div>

            <div className={styles.heroBody}>
              <div className={styles.heroCopy}>
                <div className={styles.heroBadge}>
                  <SparklesIcon className={styles.heroBadgeIcon} />
                  Assignment workspace
                </div>
                <h1 className={styles.heroTitle}>Assign projects</h1>
                <p className={styles.heroSubtitle}>
                  Choose which approved projects should appear in{' '}
                  <strong>{classDetail.classCode || `Class ${classId}`}</strong>
                  {classDetail.subjectName && ` · ${classDetail.subjectName}`}.
                </p>
              </div>

              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>Already assigned</span>
                  <span className={styles.heroStatValue}>{projectSummary.alreadyAssigned}</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>Ready to publish</span>
                  <span className={styles.heroStatValue}>{projectSummary.newlySelected}</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>Available pool</span>
                  <span className={styles.heroStatValue}>{projectSummary.availableToAssign}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <main className={styles.content}>
            <div className={styles.toolbar}>
              <div className={styles.searchField}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder="Search approved projects by title, subject, or keyword..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search projects"
                />
              </div>

              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  className={styles.actionSecondary}
                  onClick={() => navigate(`/lecturer/projects`)}
                >
                  <FolderIcon className={styles.actionIcon} />
                  Manage projects
                </button>
                <button
                  type="button"
                  className={styles.actionPrimary}
                  onClick={handleSaveAssignments}
                  disabled={isSaving || isInitialising || projectSummary.newlySelected === 0}
                >
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className={`${styles.actionIcon} ${styles.loading}`} />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className={styles.actionIcon} />
                      Publish {projectSummary.newlySelected > 0 ? `(${projectSummary.newlySelected})` : ''}
                    </>
                  )}
                </button>
              </div>
            </div>

            {assignedProjects.length > 0 && (
              <section className={styles.section}>
                <header className={styles.sectionHeader}>
                  <div className={styles.sectionTitleBlock}>
                    <LockClosedIcon className={styles.sectionIcon} />
                    <div>
                      <h2 className={styles.sectionTitle}>Already live in class</h2>
                      <p className={styles.sectionCaption}>These projects are active for students. Update teams from the class workspace.</p>
                    </div>
                  </div>
                  <span className={styles.sectionBadge}>{assignedProjects.length}</span>
                </header>
                <div className={styles.cardsGrid}>
                  {assignedProjects.map(renderAssignedProjectCard)}
                </div>
              </section>
            )}

            <section className={styles.section}>
              <header className={styles.sectionHeader}>
                <div className={styles.sectionTitleBlock}>
                  <ClipboardDocumentListIcon className={styles.sectionIcon} />
                  <div>
                    <h2 className={styles.sectionTitle}>Available to assign</h2>
                    <p className={styles.sectionCaption}>Handpick additional work from your approved project library.</p>
                  </div>
                </div>
                <span className={styles.sectionBadge}>{availableProjects.length}</span>
              </header>

              <div className={styles.cardsGrid}>
                {isInitialising
                  ? Array.from({ length: 6 }).map((_, index) => renderSkeletonCard(index))
                  : filteredAvailableProjects.length > 0
                  ? filteredAvailableProjects.map(renderAvailableProjectCard)
                  : (
                    <div className={styles.emptyState}>
                      <InboxIcon className={styles.emptyIcon} />
                      <h3>No matching projects</h3>
                      <p>
                        {searchTerm
                          ? 'Refine your search or clear the filter to browse everything approved.'
                          : 'Everything in your approved catalogue is already assigned to this class.'}
                      </p>
                    </div>
                  )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassProjectAssignment;
