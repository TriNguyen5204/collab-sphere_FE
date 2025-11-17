import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './TeamProjectDetail.module.css';
import { getTeamDetail } from '../../services/teamApi';
import { getProjectDetail } from '../../services/projectApi';
import { getMilestonesByTeam, getMilestoneDetail, createMilestone, updateMilestone, deleteMilestone } from '../../services/milestoneApi';
import { normalizeMilestoneStatus } from '../../utils/milestoneHelpers';
import { toast } from 'sonner';

const Modal = ({ title, onClose, children, disableClose = false }) => (
  <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h4>{title}</h4>
        {onClose && (
          <button type="button" className={styles.modalCloseButton} onClick={onClose} disabled={disableClose} aria-label="Close">
            ×
          </button>
        )}
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
);

const statAccents = [
  { bg: 'linear-gradient(135deg, #bae6fd, #c7d2fe)', text: '#0f172a' },
  { bg: 'linear-gradient(135deg, #c7d2fe, #ddd6fe)', text: '#312e81' },
  { bg: 'linear-gradient(135deg, #bbf7d0, #a7f3d0)', text: '#064e3b' },
  { bg: 'linear-gradient(135deg, #fde68a, #fef3c7)', text: '#78350f' },
];

const formatStatusLabel = (status) => {
  if (!status) return 'Pending';
  return status
    .toString()
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (value, fallback = 'TBA') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
};

const convertTeamRole = (teamRole, fallback = 'Member') => {
  if (typeof teamRole === 'string' && teamRole.trim()) {
    return formatStatusLabel(teamRole);
  }
  switch (teamRole) {
    case 1:
      return 'Leader';
    case 0:
      return 'Member';
    default:
      return fallback;
  }
};

const getStatusColor = (status) => {
  const normalized = (status ?? '').toString().toLowerCase();
  if (['completed', 'done', 'success'].includes(normalized)) return '#059669';
  if (['in progress', 'in-progress', 'processing', 'active'].includes(normalized)) return '#3b82f6';
  if (['pending', 'not done', 'upcoming', 'planned'].includes(normalized)) return '#6b7280';
  if (['at risk', 'risk', 'warning'].includes(normalized)) return '#d97706';
  if (['behind', 'delayed', 'blocked'].includes(normalized)) return '#dc2626';
  if (['on track', 'healthy'].includes(normalized)) return '#059669';
  return '#6b7280';
};

const getPriorityColor = (priority) => {
  const normalized = (priority ?? '').toString().toLowerCase();
  if (normalized === 'high') return '#dc2626';
  if (normalized === 'medium') return '#d97706';
  if (normalized === 'low') return '#0f766e';
  return '#475569';
};

const getComplexityColor = (complexity) => {
  const normalized = (complexity ?? '').toString().toLowerCase();
  if (normalized === 'easy') return '#0ea5e9';
  if (normalized === 'medium') return '#f97316';
  if (normalized === 'hard' || normalized === 'high') return '#dc2626';
  return '#475569';
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const detectCustomMilestone = (milestone) => {
  if (!milestone) return false;
  return Boolean(
    milestone.isCustom ||
      milestone.custom ||
      milestone.isManual ||
      milestone.customMilestone ||
      milestone.source === 'CUSTOM' ||
      milestone.origin === 'CUSTOM' ||
      milestone.isTemplate === false ||
      milestone.template === false
  );
};

const initialMilestoneForm = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
};

const MAX_VISIBLE_CHECKPOINTS = 3;

const normalizeMilestoneCollection = (payload) => {
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.teamMilestones)) return payload.teamMilestones;
  if (Array.isArray(payload)) return payload;
  return [];
};

const getInitials = (name = '') => {
  const segments = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!segments.length) return 'NA';
  if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
  return `${segments[0].charAt(0)}${segments[segments.length - 1].charAt(0)}`.toUpperCase();
};

const TeamProjectDetail = () => {
  const { classId, projectId: routeProjectId } = useParams();
  const teamId = routeProjectId;

  const [teamDetail, setTeamDetail] = useState(null);
  const [projectRaw, setProjectRaw] = useState(null);
  const [teamMembersRaw, setTeamMembersRaw] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState({ team: false, project: false, milestones: false });
  const [errors, setErrors] = useState({ team: null, project: null, milestones: null });
  const [fetchedProjectId, setFetchedProjectId] = useState(null);
  const [milestoneModal, setMilestoneModal] = useState(null);
  const [milestoneFormValues, setMilestoneFormValues] = useState(initialMilestoneForm);
  const [milestoneFormError, setMilestoneFormError] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [mutationLoading, setMutationLoading] = useState({ milestone: false, delete: false });
  const [openMilestoneMenuId, setOpenMilestoneMenuId] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;

    const fetchTeam = async () => {
      setLoading((prev) => ({ ...prev, team: true }));
      setErrors((prev) => ({ ...prev, team: null }));
      try {
        const detail = await getTeamDetail(teamId);
        if (cancelled) return;
        setTeamDetail(detail);
        const members = detail?.memberInfo?.members;
        setTeamMembersRaw(Array.isArray(members) ? members : []);
      } catch (error) {
        if (!cancelled) {
          setErrors((prev) => ({ ...prev, team: error }));
        }
      } finally {
        if (!cancelled) {
          setLoading((prev) => ({ ...prev, team: false }));
        }
      }
    };

    fetchTeam();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  useEffect(() => {
    const projectIdentifier = teamDetail?.projectInfo?.projectId ?? teamDetail?.projectInfo?.id ?? null;
    if (!projectIdentifier || projectIdentifier === fetchedProjectId) return;

    let cancelled = false;
    const fetchProject = async () => {
      setLoading((prev) => ({ ...prev, project: true }));
      setErrors((prev) => ({ ...prev, project: null }));
      try {
        const detail = await getProjectDetail(projectIdentifier);
        if (!cancelled) {
          setProjectRaw(detail);
          setFetchedProjectId(projectIdentifier);
        }
      } catch (error) {
        if (!cancelled) {
          setErrors((prev) => ({ ...prev, project: error }));
        }
      } finally {
        if (!cancelled) {
          setLoading((prev) => ({ ...prev, project: false }));
        }
      }
    };

    fetchProject();
    return () => {
      cancelled = true;
    };
  }, [teamDetail, fetchedProjectId]);

  const normalizeCheckpoints = useCallback((checkpointList) => {
    if (!Array.isArray(checkpointList)) return [];
    return checkpointList.map((checkpoint, index) => {
      const id = checkpoint?.checkpointId ?? checkpoint?.id ?? index;
      const statusToken = normalizeMilestoneStatus(checkpoint?.statusString ?? checkpoint?.status);
      const assignments = Array.isArray(checkpoint?.assignments)
        ? checkpoint.assignments
        : Array.isArray(checkpoint?.members)
          ? checkpoint.members
          : [];
      const assignees = assignments
        .map((member) => member?.studentName ?? member?.fullName ?? member?.name)
        .filter(Boolean);
      return {
        id,
        title: checkpoint?.title ?? checkpoint?.name ?? `Checkpoint ${index + 1}`,
        description: checkpoint?.description ?? '',
        statusToken,
        statusLabel: formatStatusLabel(statusToken),
        dueDate: checkpoint?.dueDate ?? checkpoint?.deadline ?? checkpoint?.targetDate ?? null,
        startDate: checkpoint?.startDate ?? checkpoint?.beginDate ?? null,
        updatedAt: checkpoint?.updatedAt ?? checkpoint?.lastActivity ?? null,
        complexity: checkpoint?.complexity ?? checkpoint?.difficulty ?? 'MEDIUM',
        assignees,
        teamMilestoneId: checkpoint?.teamMilestoneId ?? checkpoint?.milestoneId ?? null,
      };
    });
  }, []);

  const normalizeMilestone = useCallback((milestone) => {
    const id = milestone?.teamMilestoneId ?? milestone?.milestoneId ?? milestone?.id;
    const statusToken = normalizeMilestoneStatus(milestone?.statusString ?? milestone?.status);
    const checkpoints = normalizeCheckpoints(milestone?.checkpoints ?? milestone?.tasks ?? []);
    const lookupKeys = Array.from(
      new Set(
        [milestone?.teamMilestoneId, milestone?.milestoneId, milestone?.objectiveMilestoneId, milestone?.id]
          .map((value) => (value === undefined ? null : value))
          .filter(Boolean)
      )
    );
    return {
      id,
      title: milestone?.title ?? milestone?.name ?? `Milestone ${id ?? ''}`,
      description: milestone?.description ?? '',
      dueDate: milestone?.dueDate ?? milestone?.endDate ?? milestone?.targetDate ?? null,
      startDate: milestone?.startDate ?? milestone?.beginDate ?? null,
      updatedAt: milestone?.updatedAt ?? milestone?.lastUpdated ?? null,
      statusToken,
      statusLabel: formatStatusLabel(statusToken),
      progress: Number.isFinite(milestone?.progress) ? Math.round(milestone.progress) : statusToken === 'completed' ? 100 : 0,
      tasks: Array.isArray(milestone?.tasks) ? milestone.tasks : checkpoints.map((checkpoint) => checkpoint.title).filter(Boolean),
      checkpoints,
      isCustom: detectCustomMilestone(milestone),
      lookupKeys,
    };
  }, [normalizeCheckpoints]);

  const hydrateMilestones = useCallback(async (items) => {
    return Promise.all(
      items.map(async (item) => {
        if (!item.id) return item;
        try {
          const detail = await getMilestoneDetail(item.id);
          const checkpoints = normalizeCheckpoints(detail?.checkpoints ?? detail?.checkpointList ?? item.checkpoints ?? []);
          const statusToken = normalizeMilestoneStatus(detail?.statusString ?? detail?.status ?? item.statusToken);
          return {
            ...item,
            description: detail?.description ?? item.description,
            startDate: detail?.startDate ?? detail?.beginDate ?? item.startDate,
            dueDate: detail?.dueDate ?? detail?.endDate ?? item.dueDate,
            updatedAt: detail?.updatedAt ?? detail?.lastUpdated ?? item.updatedAt,
            progress: Number.isFinite(detail?.progress) ? Math.round(detail.progress) : item.progress,
            statusToken,
            statusLabel: formatStatusLabel(statusToken),
            checkpoints,
            isCustom: detectCustomMilestone(detail ?? item),
          };
        } catch (error) {
          console.error('Unable to hydrate milestone detail:', error);
          return item;
        }
      })
    );
  }, [normalizeCheckpoints]);

  const fetchMilestones = useCallback(async (options = {}) => {
    if (!teamId) return;
    const silent = Boolean(options.silent);
    if (!silent) {
      setLoading((prev) => ({ ...prev, milestones: true }));
    }
    setErrors((prev) => ({ ...prev, milestones: null }));
    try {
      const response = await getMilestonesByTeam(teamId);
      const baseList = normalizeMilestoneCollection(response).map(normalizeMilestone);
      const hydrated = await hydrateMilestones(baseList);
      if (isMountedRef.current) {
        setMilestones(hydrated);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setErrors((prev) => ({ ...prev, milestones: error }));
        setMilestones([]);
      }
    } finally {
      if (!silent && isMountedRef.current) {
        setLoading((prev) => ({ ...prev, milestones: false }));
      }
    }
  }, [teamId, hydrateMilestones, normalizeMilestone]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const closeMilestoneModal = () => {
    setMilestoneModal(null);
    setMilestoneFormValues(initialMilestoneForm);
    setMilestoneFormError(null);
  };

  const openCreateMilestoneModal = () => {
    setMilestoneModal({
      mode: 'create',
      heading: 'Create Custom Milestone',
      allowDetails: true,
      milestoneId: null,
    });
    setMilestoneFormValues(initialMilestoneForm);
    setMilestoneFormError(null);
    setOpenMilestoneMenuId(null);
  };

  const openEditMilestoneModal = (milestone, scope = 'dates') => {
    if (!milestone) return;
    setMilestoneModal({
      mode: 'edit',
      heading: scope === 'details' ? 'Edit Milestone Details' : 'Edit Milestone Dates',
      allowDetails: scope === 'details',
      milestoneId: milestone.id,
      isCustom: milestone.isCustom,
    });
    setMilestoneFormValues({
      title: milestone.title ?? '',
      description: milestone.description ?? '',
      startDate: toDateInputValue(milestone.startDate),
      endDate: toDateInputValue(milestone.dueDate ?? milestone.endDate),
    });
    setMilestoneFormError(null);
    setOpenMilestoneMenuId(null);
  };

  const handleMilestoneFieldChange = (field, value) => {
    setMilestoneFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleMenuBlur = (event, milestoneId) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpenMilestoneMenuId((prev) => (prev === milestoneId ? null : prev));
    }
  };

  const toggleMilestoneMenu = (milestoneId) => {
    setOpenMilestoneMenuId((prev) => (prev === milestoneId ? null : milestoneId));
  };

  const openDeleteMilestoneDialog = (milestone) => {
    if (!milestone?.id) return;
    setConfirmState({
      type: 'milestone-delete',
      milestone,
    });
    setOpenMilestoneMenuId(null);
  };

  const closeConfirmState = () => {
    setConfirmState(null);
  };

  const handleMilestoneSubmit = async (event) => {
    event.preventDefault();
    if (!milestoneModal) return;

    const { allowDetails, mode, milestoneId } = milestoneModal;
    const trimmedTitle = milestoneFormValues.title.trim();

    if (allowDetails && !trimmedTitle) {
      setMilestoneFormError('Title is required.');
      return;
    }
    if (!milestoneFormValues.startDate || !milestoneFormValues.endDate) {
      setMilestoneFormError('Start date and end date are required.');
      return;
    }
    if (milestoneFormValues.endDate < milestoneFormValues.startDate) {
      setMilestoneFormError('End date must be on or after start date.');
      return;
    }

    setMutationLoading((prev) => ({ ...prev, milestone: true }));
    setMilestoneFormError(null);

    let numericTeamId = null;
    if (mode === 'create') {
      numericTeamId = Number(teamId);
      if (!teamId || Number.isNaN(numericTeamId)) {
        setMilestoneFormError('Team context is invalid. Refresh and try again.');
        setMutationLoading((prev) => ({ ...prev, milestone: false }));
        return;
      }
    }

    const payload = {
      startDate: milestoneFormValues.startDate,
      endDate: milestoneFormValues.endDate,
    };

    if (allowDetails) {
      payload.title = trimmedTitle;
      payload.description = milestoneFormValues.description?.trim() || null;
    }

    try {
      let response;
      if (mode === 'create') {
        response = await createMilestone({ ...payload, teamId: numericTeamId });
      } else if (milestoneId) {
        response = await updateMilestone(milestoneId, payload);
      }
      toast.success(response?.message ?? 'Milestone saved');
      closeMilestoneModal();
      await fetchMilestones({ silent: true });
    } catch (error) {
      const message = error?.message ?? 'Unable to save milestone.';
      setMilestoneFormError(message);
      toast.error(message);
    } finally {
      setMutationLoading((prev) => ({ ...prev, milestone: false }));
    }
  };

  const handleDeleteMilestone = async () => {
    if (!confirmState?.milestone?.id) return;
    setMutationLoading((prev) => ({ ...prev, delete: true }));
    try {
      const response = await deleteMilestone(confirmState.milestone.id);
      toast.success(response?.message ?? 'Milestone deleted');
      closeConfirmState();
      await fetchMilestones({ silent: true });
    } catch (error) {
      const message = error?.message ?? 'Unable to delete milestone.';
      toast.error(message);
    } finally {
      setMutationLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const projectData = useMemo(() => {
    const progress = Number.isFinite(teamDetail?.teamProgress?.overallProgress)
      ? Math.round(teamDetail.teamProgress.overallProgress)
      : Number.isFinite(projectRaw?.progress)
        ? Math.round(projectRaw.progress)
        : 0;

    const statusString = teamDetail?.teamProgress?.statusString ?? projectRaw?.statusString ?? projectRaw?.status ?? 'Pending';
    const assignmentId =
      teamDetail?.projectAssignmentId ??
      teamDetail?.projectInfo?.projectAssignmentId ??
      teamDetail?.projectInfo?.projectAssignmentID ??
      teamDetail?.projectInfo?.assignmentId ??
      null;

    return {
      id: teamId,
      title: projectRaw?.projectName ?? teamDetail?.projectInfo?.projectName ?? 'Team Project',
      team: teamDetail?.teamName ?? 'Team',
      description: projectRaw?.description ?? teamDetail?.projectInfo?.description ?? 'Description updating soon.',
      status: formatStatusLabel(statusString),
      statusToken: statusString,
      progress,
      startDate: projectRaw?.startDate ?? teamDetail?.teamProgress?.startDate ?? null,
      dueDate: projectRaw?.dueDate ?? projectRaw?.endDate ?? teamDetail?.teamProgress?.endDate ?? null,
      lastUpdate: projectRaw?.updatedAt ?? teamDetail?.teamProgress?.updatedAt ?? null,
      repositoryUrl: teamDetail?.gitLink ?? projectRaw?.repositoryUrl ?? null,
      subjectName: projectRaw?.subjectName ?? teamDetail?.classInfo?.subjectName ?? '',
      lecturerName: projectRaw?.lecturerName ?? teamDetail?.lecturerInfo?.lecturerName ?? '',
      className: teamDetail?.classInfo?.className ?? '',
      assignmentId,
    };
  }, [projectRaw, teamDetail, teamId]);

  const teamMembers = useMemo(() => {
    return (teamMembersRaw || []).map((member, index) => {
      return {
        id: member?.studentId ?? member?.id ?? member?.classMemberId ?? index,
        name: member?.studentName ?? member?.fullName ?? member?.fullname ?? 'Unnamed Member',
        role: convertTeamRole(member?.teamRole),
        email: member?.studentEmail ?? member?.email ?? '',
      };
    });
  }, [teamMembersRaw]);

  const assignmentLabel = projectData.assignmentId ? `#${projectData.assignmentId}` : 'Not linked';

  const summaryStats = useMemo(() => {
    const baseStats = [
      { label: 'Completion', value: `${projectData.progress}%`, helper: 'Overall progress' },
      { label: 'Status', value: projectData.status, helper: 'Project state' },
      { label: 'Assignment', value: assignmentLabel, helper: 'Project assignment' },
      { label: 'Team Members', value: teamMembers.length, helper: 'Active roster' },
    ];

    return baseStats.map((stat, index) => ({
      ...stat,
      accent: statAccents[index % statAccents.length],
      glyph: stat.label.charAt(0),
    }));
  }, [projectData.progress, projectData.status, assignmentLabel, teamMembers.length]);

  const heroBadges = useMemo(() => {
    return [
      projectData.team ? `Team ${projectData.team}` : null,
      projectData.subjectName ? projectData.subjectName : null,
      projectData.className ? projectData.className : null,
    ].filter(Boolean);
  }, [projectData.team, projectData.subjectName, projectData.className]);

  const milestoneCards = useMemo(() => milestones, [milestones]);

  const milestoneLookup = useMemo(() => {
    const map = new Map();
    milestoneCards.forEach((milestone) => {
      const keys = Array.isArray(milestone.lookupKeys) && milestone.lookupKeys.length > 0 ? milestone.lookupKeys : [milestone.id];
      keys.filter(Boolean).forEach((key) => {
        if (!map.has(key)) {
          map.set(key, milestone);
        }
      });
    });
    return map;
  }, [milestoneCards]);

  const objectiveGroups = useMemo(() => {
    if (!Array.isArray(projectRaw?.objectives)) return [];
    return projectRaw.objectives
      .filter(Boolean)
      .map((objective, index) => {
        const milestoneList = Array.isArray(objective?.objectiveMilestones)
          ? objective.objectiveMilestones.filter(Boolean)
          : [];
        return {
          id: objective?.objectiveId ?? objective?.id ?? index,
          title: objective?.title ?? `Objective ${index + 1}`,
          description: objective?.description ?? '',
          priority: objective?.priority ? formatStatusLabel(objective.priority) : null,
          priorityToken: objective?.priority ?? null,
          milestones: milestoneList.map((milestone, milestoneIndex) => {
            const statusToken = normalizeMilestoneStatus(milestone?.statusString ?? milestone?.status);
            return {
              id: milestone?.teamMilestoneId ?? milestone?.milestoneId ?? milestone?.objectiveMilestoneId ?? milestone?.id ?? milestoneIndex,
              referenceIds: {
                teamMilestoneId: milestone?.teamMilestoneId ?? milestone?.teamMilestoneID ?? null,
                milestoneId: milestone?.milestoneId ?? milestone?.id ?? null,
                objectiveMilestoneId: milestone?.objectiveMilestoneId ?? null,
              },
              statusToken,
              statusLabel: formatStatusLabel(statusToken),
              title: milestone?.title ?? `Milestone ${milestoneIndex + 1}`,
              description: milestone?.description ?? '',
              startDate: milestone?.startDate ?? milestone?.beginDate ?? null,
              endDate: milestone?.endDate ?? milestone?.dueDate ?? null,
              updatedAt: milestone?.updatedAt ?? milestone?.lastUpdated ?? null,
            };
          }),
        };
      });
  }, [projectRaw]);

  const projectMeta = [
    { label: 'Subject', value: projectData.subjectName || '—' },
    { label: 'Lecturer', value: projectData.lecturerName || '—' },
    { label: 'Start date', value: formatDate(projectData.startDate) },
    { label: 'Last updated', value: formatDate(projectData.lastUpdate) },
  ];

  const teamMeta = [
    { label: 'Class', value: projectData.className || '—' },
    { label: 'Assignment', value: assignmentLabel },
    { label: 'Due date', value: formatDate(projectData.dueDate) },
    {
      label: 'Repository',
      value: projectData.repositoryUrl ? (
        <a href={projectData.repositoryUrl} target="_blank" rel="noopener noreferrer">
          Open repository ↗
        </a>
      ) : (
        'Not linked'
      ),
    },
  ];

  const hasObjectiveGroups = objectiveGroups.length > 0;

  return (
    <>
      <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to={`/lecturer/classes/${classId}`} className={styles.breadcrumbLink}>
            Class Details
          </Link>
          <span className={styles.breadcrumbSeparator}>→</span>
          <span className={styles.breadcrumbCurrent}>Team Project Detail</span>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Project intelligence</p>
            <h1>{projectData.title}</h1>
            <p className={styles.heroDescription}>{projectData.description}</p>
            <div className={styles.heroBadges}>
              {heroBadges.map((badge, index) => (
                <span key={`${badge}-${index}`} className={styles.heroBadge}>
                  {badge}
                </span>
              ))}
              <span className={styles.heroBadge}>Due {formatDate(projectData.dueDate)}</span>
            </div>
            {projectData.repositoryUrl && (
              <a href={projectData.repositoryUrl} target="_blank" rel="noopener noreferrer" className={styles.heroLink}>
                Open repository ↗
              </a>
            )}
          </div>
          <div className={styles.heroMetrics}>
            <div className={styles.heroMetricPrimary}>
              <span className={styles.heroMetricLabel}>Completion</span>
              <div className={styles.heroProgressOrb}>
                <span>{projectData.progress}%</span>
              </div>
              <p className={styles.heroMetricHelper}>Updated {formatDate(projectData.lastUpdate)}</p>
            </div>
          </div>
        </div>

        {errors.team && (
          <div className={styles.inlineError}>
            Unable to load team context: {String(errors.team?.message || errors.team)}
          </div>
        )}
        {errors.project && (
          <div className={styles.inlineInfo}>
            Unable to load project overview: {String(errors.project?.message || errors.project)}
          </div>
        )}
      </header>

      <section className={styles.summaryGrid}>
        {summaryStats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: stat.accent.bg, color: stat.accent.text }}>
              <span>{stat.glyph}</span>
            </div>
            <div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              {stat.helper && <div className={styles.statHelper}>{stat.helper}</div>}
            </div>
          </div>
        ))}
      </section>

      <section className={styles.panelGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Project details</h3>
          </div>
          <dl className={styles.metaList}>
            {projectMeta.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Team overview</h3>
          </div>
          <dl className={styles.metaList}>
            {teamMeta.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.milestoneSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3>Milestones & checkpoints</h3>
            <p className={styles.sectionSubtext}>Lecturers can add custom milestones while checkpoints remain a read-only preview owned by students.</p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreateMilestoneModal}
            disabled={mutationLoading.milestone || loading.milestones}
          >
            {mutationLoading.milestone ? 'Saving…' : '+ Add Milestone'}
          </button>
        </div>

        {loading.milestones && <p className={styles.panelBody}>Loading milestones…</p>}
        {errors.milestones && !loading.milestones && (
          <p className={styles.inlineError}>Unable to load milestones: {String(errors.milestones?.message || errors.milestones)}</p>
        )}
        {!loading.milestones && !errors.milestones && !hasObjectiveGroups && milestoneCards.length === 0 && (
          <p className={styles.panelBody}>No milestones have been created for this team yet.</p>
        )}

        {hasObjectiveGroups ? (
          <div className={styles.objectiveWrapper}>
            <p className={styles.objectiveHelper}>Objective milestones now include full lecturer controls.</p>
            <div className={styles.objectiveList}>
              {objectiveGroups.map((objective) => (
                <div key={objective.id} className={styles.objectiveCard}>
                  <div className={styles.objectiveHeader}>
                    <div>
                      <p className={styles.objectiveLabel}>Objective</p>
                      <h4>{objective.title}</h4>
                    </div>
                    {objective.priority && (
                      <span className={styles.priorityTag} style={{ background: getPriorityColor(objective.priorityToken) }}>
                        {objective.priority}
                      </span>
                    )}
                  </div>
                  {objective.description && <p className={styles.objectiveDescription}>{objective.description}</p>}
                  <div className={styles.objectiveMilestones}>
                    {objective.milestones.length === 0 && <p className={styles.panelBody}>No milestones have been defined for this objective yet.</p>}
                    {objective.milestones.map((milestone) => {
                      const identifierCandidates = [
                        milestone.id,
                        milestone.referenceIds?.teamMilestoneId,
                        milestone.referenceIds?.milestoneId,
                        milestone.referenceIds?.objectiveMilestoneId,
                      ].filter(Boolean);
                      const linkedMilestone = identifierCandidates.reduce((found, key) => {
                        if (found) return found;
                        return milestoneLookup.get(key) ?? null;
                      }, null);
                      const displayMilestone = linkedMilestone ?? {
                        ...milestone,
                        statusToken: milestone.statusToken ?? 'pending',
                        statusLabel: milestone.statusLabel ?? 'Pending',
                        checkpoints: [],
                        progress: 0,
                        isCustom: false,
                      };
                      const startDate = linkedMilestone?.startDate ?? milestone.startDate;
                      const dueDate = linkedMilestone?.dueDate ?? milestone.endDate;
                      const visibleCheckpoints = displayMilestone.checkpoints.slice(0, MAX_VISIBLE_CHECKPOINTS);
                      const hiddenCount = Math.max(0, displayMilestone.checkpoints.length - visibleCheckpoints.length);
                      const hasActions = Boolean(linkedMilestone);
                      return (
                        <div key={milestone.id} className={styles.objectiveMilestoneItem}>
                          <div className={styles.objectiveMilestoneHeaderRow}>
                            <div className={styles.objectiveMilestoneTitleGroup}>
                              <p className={styles.objectiveMilestoneTitle}>{displayMilestone.title}</p>
                              {displayMilestone.isCustom && <span className={styles.customTag}>Custom</span>}
                            </div>
                            <div className={styles.objectiveMilestoneActions}>
                              <span className={styles.statusPill} style={{ background: getStatusColor(displayMilestone.statusToken) }}>
                                {displayMilestone.statusLabel}
                              </span>
                              {hasActions && (
                                <div
                                  className={styles.milestoneActions}
                                  tabIndex={-1}
                                  onBlur={(event) => handleMenuBlur(event, linkedMilestone.id)}
                                >
                                  <button
                                    type="button"
                                    className={styles.menuButton}
                                    onClick={() => toggleMilestoneMenu(linkedMilestone.id)}
                                    aria-haspopup="true"
                                    aria-expanded={openMilestoneMenuId === linkedMilestone.id}
                                  >
                                    ⋮
                                  </button>
                                  {openMilestoneMenuId === linkedMilestone.id && (
                                    <div className={styles.actionMenu}>
                                      <button type="button" onClick={() => openEditMilestoneModal(linkedMilestone, 'dates')}>
                                        Edit dates
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={styles.objectiveMilestoneMetaRow}>
                            <span>Start {formatDate(startDate)}</span>
                            <span>Due {formatDate(dueDate)}</span>
                            {displayMilestone.updatedAt && <span>Updated {formatDate(displayMilestone.updatedAt)}</span>}
                          </div>
                          {displayMilestone.description && <p className={styles.objectiveMilestoneDescription}>{displayMilestone.description}</p>}
                          {hasActions ? (
                            <>
                              <div className={styles.milestoneProgressBar}>
                                <div
                                  className={styles.milestoneProgressFill}
                                  style={{ width: `${displayMilestone.progress}%`, background: getStatusColor(displayMilestone.statusToken) }}
                                />
                              </div>
                              <div className={styles.milestoneBody}>
                                <p className={styles.milestoneMeta}>
                                  {displayMilestone.checkpoints.length ? `${displayMilestone.checkpoints.length} checkpoint(s)` : 'No checkpoints linked yet.'}
                                </p>
                              </div>
                              <div className={styles.milestoneFooter}>
                                <p className={styles.checkpointNotice}>Checkpoint CRUD is owned by students; lecturers can view a preview below.</p>
                              </div>
                              <div className={styles.checkpointList}>
                                {displayMilestone.checkpoints.length === 0 && <p className={styles.panelBody}>No checkpoints yet.</p>}
                                {visibleCheckpoints.map((checkpoint) => (
                                  <div key={checkpoint.id} className={styles.checkpointItem}>
                                    <div>
                                      <div className={styles.checkpointTitleRow}>
                                        <p className={styles.checkpointTitle}>{checkpoint.title}</p>
                                        <span className={styles.complexityTag} style={{ background: getComplexityColor(checkpoint.complexity) }}>
                                          {formatStatusLabel(checkpoint.complexity)}
                                        </span>
                                      </div>
                                      {checkpoint.description && <p className={styles.checkpointDescription}>{checkpoint.description}</p>}
                                      <div className={styles.checkpointMeta}>
                                        <span>Start {formatDate(checkpoint.startDate)}</span>
                                        <span>Due {formatDate(checkpoint.dueDate)}</span>
                                        <span>Status {checkpoint.statusLabel}</span>
                                      </div>
                                      {checkpoint.assignees.length > 0 && (
                                        <p className={styles.checkpointAssignees}>Assigned to {checkpoint.assignees.join(', ')}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {hiddenCount > 0 && (
                                  <p className={styles.panelBody}>
                                    {hiddenCount} additional checkpoint{hiddenCount > 1 ? 's are' : ' is'} managed inside the student board.
                                  </p>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className={styles.inlineInfo}>This milestone blueprint is waiting for team-linked data.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.milestoneManager}>
            <div className={styles.milestoneList}>
              {milestoneCards.map((milestone) => {
                const visibleCheckpoints = milestone.checkpoints.slice(0, MAX_VISIBLE_CHECKPOINTS);
                const hiddenCount = Math.max(0, milestone.checkpoints.length - visibleCheckpoints.length);
                return (
                  <div key={milestone.id} className={styles.milestoneCard}>
                    <div className={styles.milestoneHeader}>
                      <div>
                        <div className={styles.milestoneTitleRow}>
                          <h4>{milestone.title}</h4>
                          {milestone.isCustom && <span className={styles.customTag}>Custom</span>}
                        </div>
                        <span className={styles.milestoneMeta}>
                          Start {formatDate(milestone.startDate)} • Due {formatDate(milestone.dueDate)}
                        </span>
                        {milestone.updatedAt && <span className={styles.milestoneMeta}>Updated {formatDate(milestone.updatedAt)}</span>}
                      </div>
                      <div className={styles.milestoneHeaderActions}>
                        <span className={styles.statusPill} style={{ background: getStatusColor(milestone.statusToken) }}>
                          {milestone.statusLabel}
                        </span>
                        <div
                          className={styles.milestoneActions}
                          tabIndex={-1}
                          onBlur={(event) => handleMenuBlur(event, milestone.id)}
                        >
                          <button
                            type="button"
                            className={styles.menuButton}
                            onClick={() => toggleMilestoneMenu(milestone.id)}
                            aria-haspopup="true"
                            aria-expanded={openMilestoneMenuId === milestone.id}
                          >
                            ⋮
                          </button>
                          {openMilestoneMenuId === milestone.id && (
                            <div className={styles.actionMenu}>
                              <button type="button" onClick={() => openEditMilestoneModal(milestone, 'dates')}>
                                Edit dates
                              </button>
                              <button
                                type="button"
                                disabled={!milestone.isCustom}
                                className={!milestone.isCustom ? styles.menuItemDisabled : ''}
                                onClick={() => milestone.isCustom && openEditMilestoneModal(milestone, 'details')}
                              >
                                Edit details
                              </button>
                              <button
                                type="button"
                                disabled={!milestone.isCustom}
                                className={`${styles.menuDanger} ${!milestone.isCustom ? styles.menuItemDisabled : ''}`.trim()}
                                onClick={() => milestone.isCustom && openDeleteMilestoneDialog(milestone)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.milestoneProgressBar}>
                      <div
                        className={styles.milestoneProgressFill}
                        style={{ width: `${milestone.progress}%`, background: getStatusColor(milestone.statusToken) }}
                      />
                    </div>
                    <div className={styles.milestoneBody}>
                      {milestone.description && <p className={styles.milestoneDescription}>{milestone.description}</p>}
                      <p className={styles.milestoneMeta}>
                        {milestone.checkpoints.length ? `${milestone.checkpoints.length} checkpoint(s)` : 'No checkpoints linked yet.'}
                      </p>
                    </div>
                    <div className={styles.milestoneFooter}>
                      <p className={styles.checkpointNotice}>Checkpoint CRUD is owned by students; lecturers can view a preview below.</p>
                    </div>
                    <div className={styles.checkpointList}>
                      {milestone.checkpoints.length === 0 && <p className={styles.panelBody}>No checkpoints yet.</p>}
                      {visibleCheckpoints.map((checkpoint) => (
                        <div key={checkpoint.id} className={styles.checkpointItem}>
                          <div>
                            <div className={styles.checkpointTitleRow}>
                              <p className={styles.checkpointTitle}>{checkpoint.title}</p>
                              <span className={styles.complexityTag} style={{ background: getComplexityColor(checkpoint.complexity) }}>
                                {formatStatusLabel(checkpoint.complexity)}
                              </span>
                            </div>
                            {checkpoint.description && <p className={styles.checkpointDescription}>{checkpoint.description}</p>}
                            <div className={styles.checkpointMeta}>
                              <span>Start {formatDate(checkpoint.startDate)}</span>
                              <span>Due {formatDate(checkpoint.dueDate)}</span>
                              <span>Status {checkpoint.statusLabel}</span>
                            </div>
                            {checkpoint.assignees.length > 0 && (
                              <p className={styles.checkpointAssignees}>Assigned to {checkpoint.assignees.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {hiddenCount > 0 && (
                        <p className={styles.panelBody}>
                          {hiddenCount} additional checkpoint{hiddenCount > 1 ? 's are' : ' is'} managed inside the student board.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className={styles.teamSection}>
        <div className={styles.sectionHeader}>
          <h3>Team members</h3>
        </div>
        <div className={styles.membersGrid}>
          {teamMembers.length === 0 && !loading.team && (
            <div className={styles.memberCard}>
              <p>No team members available for this team yet.</p>
            </div>
          )}
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.memberHeader}>
                <div className={styles.memberAvatar}>{getInitials(member.name)}</div>
                <div>
                  <h4>{member.name}</h4>
                  {member.email && <p className={styles.memberEmail}>{member.email}</p>}
                </div>
                <span className={styles.roleBadge}>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>

      {milestoneModal && (
        <Modal
          title={milestoneModal.heading}
          onClose={mutationLoading.milestone ? undefined : closeMilestoneModal}
          disableClose={mutationLoading.milestone}
        >
          <form className={styles.modalForm} onSubmit={handleMilestoneSubmit}>
            {milestoneFormError && <p className={styles.modalError}>{milestoneFormError}</p>}
            {milestoneModal.allowDetails && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="milestone-title">
                    Title
                  </label>
                  <input
                    id="milestone-title"
                    type="text"
                    className={styles.formInput}
                    value={milestoneFormValues.title}
                    onChange={(event) => handleMilestoneFieldChange('title', event.target.value)}
                    disabled={mutationLoading.milestone}
                    placeholder="Milestone title"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="milestone-description">
                    Description
                  </label>
                  <textarea
                    id="milestone-description"
                    className={styles.formTextarea}
                    rows={4}
                    value={milestoneFormValues.description}
                    onChange={(event) => handleMilestoneFieldChange('description', event.target.value)}
                    placeholder="Optional context for this milestone"
                    disabled={mutationLoading.milestone}
                  />
                </div>
              </>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="milestone-start-date">
                  Start date
                </label>
                <input
                  id="milestone-start-date"
                  type="date"
                  className={styles.formInput}
                  value={milestoneFormValues.startDate}
                  onChange={(event) => handleMilestoneFieldChange('startDate', event.target.value)}
                  disabled={mutationLoading.milestone}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="milestone-end-date">
                  End date
                </label>
                <input
                  id="milestone-end-date"
                  type="date"
                  className={styles.formInput}
                  value={milestoneFormValues.endDate}
                  onChange={(event) => handleMilestoneFieldChange('endDate', event.target.value)}
                  disabled={mutationLoading.milestone}
                  required
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={closeMilestoneModal} disabled={mutationLoading.milestone}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton} disabled={mutationLoading.milestone}>
                {mutationLoading.milestone ? 'Saving…' : milestoneModal.mode === 'create' ? 'Create Milestone' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmState && (
        <Modal title="Delete milestone" onClose={mutationLoading.delete ? undefined : closeConfirmState} disableClose={mutationLoading.delete}>
          <div className={styles.confirmBody}>
            <p>
              This action will remove <strong>{confirmState.milestone?.title}</strong> and its checkpoints. This cannot be undone.
            </p>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryButton} onClick={closeConfirmState} disabled={mutationLoading.delete}>
                Cancel
              </button>
              <button type="button" className={styles.dangerButton} onClick={handleDeleteMilestone} disabled={mutationLoading.delete}>
                {mutationLoading.delete ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TeamProjectDetail;
