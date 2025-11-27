import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  getProjectDetail,
  updateProjectBeforeApproval,
  deleteProjectBeforeApproval,
} from '../../services/projectApi';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import ModalWrapper from '../../components/layout/ModalWrapper';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const statusTokens = {
  pending: {
    label: 'Pending Approval',
    badge: 'bg-amber-100/70 text-amber-800 border border-amber-200/70',
  },
  approved: {
    label: 'Approved',
    badge: 'bg-emerald-100/70 text-emerald-800 border border-emerald-200/70',
  },
  denied: {
    label: 'Denied',
    badge: 'bg-rose-100/70 text-rose-800 border border-rose-200/70',
  },
  removed: {
    label: 'Removed',
    badge: 'bg-slate-200/80 text-slate-700 border border-slate-300/70',
  },
};

const STATUS_CODE_MAP = {
  0: 'PENDING',
  1: 'APPROVED',
  2: 'DENIED',
};

const resolveProjectStatusKey = (project) => {
  if (!project) {
    return 'PENDING';
  }

  const stringCandidates = [
    project.statusString,
    project.statusKey,
    project.statusText,
    typeof project.status === 'string' ? project.status : null,
  ];

  for (const candidate of stringCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().toUpperCase();
    }
  }

  if (typeof project.status === 'number' && STATUS_CODE_MAP[project.status] !== undefined) {
    return STATUS_CODE_MAP[project.status];
  }

  return 'PENDING';
};
const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const generateTempId = () => `tmp-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;

const createEmptyMilestone = () => ({
  id: generateTempId(),
  milestoneId: null,
  objectiveMilestoneId: null,
  title: '',
  description: '',
  startDate: '',
  endDate: '',
});

const createEmptyObjective = () => ({
  id: generateTempId(),
  objectiveId: null,
  title: '',
  description: '',
  priority: '',
  objectiveMilestones: [createEmptyMilestone()],
});

const normalizeObjectivesForDraft = (objectives) => {
  if (!Array.isArray(objectives) || objectives.length === 0) {
    return [createEmptyObjective()];
  }

  return objectives.map((objective) => {
    const baseObjective = {
      id: objective.objectiveId ?? objective.id ?? generateTempId(),
      objectiveId: objective.objectiveId ?? objective.id ?? null,
      title: objective.title ?? '',
      description: objective.description ?? '',
      priority: objective.priority ?? '',
      objectiveMilestones: [],
    };

    if (Array.isArray(objective.objectiveMilestones) && objective.objectiveMilestones.length > 0) {
      baseObjective.objectiveMilestones = objective.objectiveMilestones.map((milestone) => ({
        id: milestone.objectiveMilestoneId ?? milestone.milestoneId ?? milestone.id ?? generateTempId(),
        milestoneId: milestone.milestoneId ?? milestone.id ?? null,
        objectiveMilestoneId: milestone.objectiveMilestoneId ?? milestone.id ?? null,
        title: milestone.title ?? '',
        description: milestone.description ?? '',
        startDate: toDateInputValue(milestone.startDate ?? milestone.beginDate),
        endDate: toDateInputValue(milestone.endDate ?? milestone.dueDate),
      }));
    }

    if (!baseObjective.objectiveMilestones.length) {
      baseObjective.objectiveMilestones = [createEmptyMilestone()];
    }

    return baseObjective;
  });
};

const resolveObjectiveIdentifier = (objective) => objective?.objectiveId ?? objective?.id ?? null;
const resolveMilestoneIdentifier = (milestone) =>
  milestone?.objectiveMilestoneId ?? milestone?.milestoneId ?? milestone?.id ?? null;

const EmptyState = ({ title, description }) => (
  <div className={`${glassPanelClass} rounded-3xl p-6 text-center`}>
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{title}</p>
    <p className="mt-3 text-base text-slate-500">{description}</p>
  </div>
);

const LoadingShell = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
      <div className={`${glassPanelClass} animate-pulse rounded-3xl border-white/60 bg-white/70 p-8`}>
        <div className="h-4 w-40 rounded-full bg-slate-200/80" />
        <div className="mt-4 h-10 w-3/4 rounded-full bg-slate-200/80" />
        <div className="mt-6 h-6 w-full rounded-full bg-slate-200/70" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={`${glassPanelClass} animate-pulse rounded-2xl p-6`}>
            <div className="h-4 w-24 rounded-full bg-slate-200/80" />
            <div className="mt-4 h-8 w-1/2 rounded-full bg-slate-200/80" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorPanel = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10">
    <div className="mx-auto max-w-3xl px-4">
      <div className={`${glassPanelClass} rounded-3xl border-rose-100 bg-rose-50/80 p-8 text-center`}>
        <p className="text-base font-semibold text-rose-600">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
);

const InfoStat = ({ label, value, accent = 'from-slate-50 to-white', pill }) => (
  <div className={`${glassPanelClass} rounded-2xl bg-gradient-to-br ${accent} p-5`}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">{label}</p>
    {pill ? (
      <span className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${pill}`}>{value}</span>
    ) : (
      <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
    )}
  </div>
);

const ObjectiveCard = ({ objective, index, isPending, onEditObjective, onEditMilestone }) => {
  const rawDescription = objective?.description?.trim();
  const descriptionToShow = rawDescription || 'Details coming soon.';

  return (
    <div className={`${glassPanelClass} flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-400">Objective {index + 1}</p>
          <p className="mt-2 text-base leading-relaxed text-slate-600">{descriptionToShow}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {objective.priority && (
            <span className="rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-700">
              Priority: {objective.priority}
            </span>
          )}
          {isPending && (
            <button
              type="button"
              onClick={() => onEditObjective?.(objective)}
              className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Edit objective
            </button>
          )}
        </div>
      </div>
      {Array.isArray(objective.objectiveMilestones) && objective.objectiveMilestones.length > 0 && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Milestones</p>
          <ul className="mt-3 grid gap-3 text-sm text-slate-600">
            {objective.objectiveMilestones.map((milestone, milestoneIndex) => {
              const milestoneDescription = milestone?.description?.trim();

              return (
                <li
                  key={milestone.id ?? milestoneIndex}
                  className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{milestone.title || 'Untitled milestone'}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {formatDate(milestone.startDate)} — {formatDate(milestone.endDate)}
                      </span>
                    </div>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onEditMilestone?.(objective, milestone)}
                        className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        Edit milestone
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {milestoneDescription || 'Details coming soon.'}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const useProjectStatus = (project) => {
  const normalized = resolveProjectStatusKey(project).toLowerCase();
  return statusTokens[normalized] ?? statusTokens.pending;
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({ projectName: '', description: '' });
  const [editFormError, setEditFormError] = useState('');
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [structureDraft, setStructureDraft] = useState(() => normalizeObjectivesForDraft([]));
  const [structureMetaDraft, setStructureMetaDraft] = useState({ projectName: '', description: '' });
  const [structureFormError, setStructureFormError] = useState('');
  const [isStructureSaving, setIsStructureSaving] = useState(false);
  const [structureFocus, setStructureFocus] = useState(null);

  const fetchProject = useCallback(
    async (options = {}) => {
      if (!projectId) return null;
      const silent = Boolean(options.silent);
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await getProjectDetail(projectId);
        setProject(data);
        return data;
      } catch (err) {
        if (!silent) {
          setError(err);
        } else {
          console.error('Silent project refresh failed.', err);
        }
        throw err;
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [projectId]
  );

  useEffect(() => {
    fetchProject();
  }, [fetchProject, reloadKey]);

  useEffect(() => {
    if (!structureModalOpen || !structureFocus) return;
    if (typeof document === 'undefined') return;
    const targetId = structureFocus.milestoneId
      ? `milestone-editor-${structureFocus.milestoneId}`
      : structureFocus.objectiveId
      ? `objective-editor-${structureFocus.objectiveId}`
      : null;
    if (!targetId) return;
    const timer = setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [structureFocus, structureModalOpen]);

  const statusMeta = useProjectStatus(project);
  const statusKey = resolveProjectStatusKey(project);
  const isPendingProject = statusKey === 'PENDING';
  const resolvedProjectId = project?.projectId ?? project?.id ?? null;

  const composePendingUpdatePayload = useCallback(
    (partialPayload = {}, { includeObjectivesFallback = true } = {}) => {
      if (!resolvedProjectId) {
        throw new Error('Missing project identifier.');
      }

      const payload = {
        projectId: resolvedProjectId,
        ...partialPayload,
      };

      const resolvedLecturerId = project?.lecturerId ?? lecturerId;
      if (resolvedLecturerId) {
        payload.lecturerId = resolvedLecturerId;
      }

      const subjectId = project?.subjectId ?? project?.subject?.subjectId ?? project?.subject?.id;
      if (subjectId) {
        payload.subjectId = subjectId;
      }

      if (project?.status !== undefined) {
        payload.status = project.status;
      } else if (project?.statusString) {
        payload.status = project.statusString;
      }

      if (includeObjectivesFallback && !payload.objectives && Array.isArray(project?.objectives)) {
        payload.objectives = project.objectives;
      }

      return payload;
    },
    [lecturerId, project, resolvedProjectId]
  );

  const projectObjectives = useMemo(() => {
    if (!Array.isArray(project?.objectives)) return [];
    return project.objectives;
  }, [project]);

  const metaRows = useMemo(
    () => [
      {
        label: 'Subject',
        value: project?.subjectName
          ? `${project.subjectName}${project?.subjectCode ? ` (${project.subjectCode})` : ''}`
          : '—',
      },
      {
        label: 'Lecturer',
        value: project?.lecturerName
          ? `${project.lecturerName}${project?.lecturerCode ? ` · ${project.lecturerCode}` : ''}`
          : '—',
      },
      { label: 'Created', value: formatDate(project?.createdAt) },
      { label: 'Last Updated', value: formatDate(project?.updatedAt) },
    ],
    [project]
  );

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Project Library', href: '/lecturer/projects' }];

    if (project?.classId) {
      items.push({ label: 'Class Detail', href: `/lecturer/classes/${project.classId}` });
    }

    items.push({ label: project?.projectName ?? 'Project Detail' });

    return items;
  }, [project?.classId, project?.projectName]);

  const openEditModal = () => {
    if (!project || !isPendingProject) {
      toast.error('Only pending projects can be edited before approval.');
      return;
    }
    setEditDraft({
      projectName: project.projectName ?? '',
      description: project.description ?? '',
    });
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = (force = false) => {
    if (!force && isEditSaving) return;
    setIsEditModalOpen(false);
    setEditFormError('');
  };

  const handleEditInputChange = (field, value) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPendingUpdate = async (event) => {
    event.preventDefault();
    if (!project || !resolvedProjectId) {
      toast.error('Missing project context.');
      return;
    }
    if (!isPendingProject) {
      toast.error('Only pending projects can be updated in this view.');
      return;
    }

    const projectName = editDraft.projectName.trim();
    const description = editDraft.description.trim();
    if (!projectName) {
      setEditFormError('Please provide a project name.');
      return;
    }

    setIsEditSaving(true);
    setEditFormError('');

    const payload = composePendingUpdatePayload({ projectName, description });

    try {
      const response = await updateProjectBeforeApproval(payload);
      toast.success(response?.message ?? 'Project updated.');
      await fetchProject({ silent: true });
      closeEditModal(true);
    } catch (err) {
      console.error('Failed to update project before approval.', err);
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to update this project.';
      setEditFormError(message);
      toast.error(message);
    } finally {
      setIsEditSaving(false);
    }
  };

  const openDeleteModal = () => {
    if (!isPendingProject) {
      toast.error('Only pending projects can be removed.');
      return;
    }
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = (force = false) => {
    if (!force && isDeleteSubmitting) return;
    setDeleteModalOpen(false);
  };

  const handleDeletePendingProject = async () => {
    if (!resolvedProjectId) {
      toast.error('Missing project context.');
      return;
    }
    if (!isPendingProject) {
      toast.error('Only pending projects can be removed.');
      return;
    }

    setIsDeleteSubmitting(true);
    try {
      const response = await deleteProjectBeforeApproval(resolvedProjectId);
      toast.success(response?.message ?? 'Project deleted.');
      closeDeleteModal(true);
      navigate('/lecturer/projects');
    } catch (err) {
      console.error('Failed to delete project before approval.', err);
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to delete this project.';
      toast.error(message);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const openStructureModal = (focus = null) => {
    if (!project || !isPendingProject) {
      toast.error('Only pending projects can be edited before approval.');
      return;
    }
    setStructureMetaDraft({
      projectName: project.projectName ?? '',
      description: project.description ?? '',
    });
    setStructureDraft(normalizeObjectivesForDraft(project.objectives ?? []));
    setStructureFormError('');
    setStructureFocus(focus && focus.objectiveId ? focus : null);
    setStructureModalOpen(true);
  };

  const closeStructureModal = (force = false) => {
    if (!force && isStructureSaving) return;
    setStructureModalOpen(false);
    setStructureFormError('');
    setStructureFocus(null);
  };

  const handleStructureMetaChange = (field, value) => {
    setStructureMetaDraft((prev) => ({ ...prev, [field]: value }));
  };

  const editObjectiveDraft = (objectiveId, updater) => {
    setStructureDraft((prev) =>
      prev.map((objective) => {
        if (objective.id !== objectiveId) {
          return objective;
        }
        const nextState = typeof updater === 'function' ? updater(objective) : { ...objective, ...updater };
        return {
          ...objective,
          ...nextState,
        };
      })
    );
  };

  const handleObjectiveFieldChange = (objectiveId, field, value) => {
    editObjectiveDraft(objectiveId, (objective) => ({ ...objective, [field]: value }));
  };

  const handleAddObjective = () => {
    setStructureDraft((prev) => [...prev, createEmptyObjective()]);
  };

  const handleRemoveObjective = (objectiveId) => {
    setStructureDraft((prev) => {
      const filtered = prev.filter((objective) => objective.id !== objectiveId);
      return filtered.length ? filtered : [createEmptyObjective()];
    });
  };

  const handleAddMilestone = (objectiveId) => {
    editObjectiveDraft(objectiveId, (objective) => ({
      ...objective,
      objectiveMilestones: [...(objective.objectiveMilestones ?? []), createEmptyMilestone()],
    }));
  };

  const handleMilestoneFieldChange = (objectiveId, milestoneId, field, value) => {
    editObjectiveDraft(objectiveId, (objective) => ({
      ...objective,
      objectiveMilestones: (objective.objectiveMilestones ?? []).map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, [field]: value } : milestone
      ),
    }));
  };

  const handleObjectiveEditRequest = (objective) => {
    const objectiveId = resolveObjectiveIdentifier(objective);
    openStructureModal(objectiveId ? { objectiveId } : null);
  };

  const handleMilestoneEditRequest = (objective, milestone) => {
    const objectiveId = resolveObjectiveIdentifier(objective);
    const milestoneId = resolveMilestoneIdentifier(milestone);
    openStructureModal(
      objectiveId
        ? {
            objectiveId,
            milestoneId: milestoneId ?? null,
          }
        : null
    );
  };

  const handleRemoveMilestone = (objectiveId, milestoneId) => {
    editObjectiveDraft(objectiveId, (objective) => {
      const remaining = (objective.objectiveMilestones ?? []).filter((milestone) => milestone.id !== milestoneId);
      return {
        ...objective,
        objectiveMilestones: remaining.length ? remaining : [createEmptyMilestone()],
      };
    });
  };

  const handleStructureSubmit = async (event) => {
    event.preventDefault();
    if (!project || !resolvedProjectId) {
      toast.error('Missing project context.');
      return;
    }
    if (!isPendingProject) {
      toast.error('Only pending projects can be updated in this view.');
      return;
    }

    const projectName = structureMetaDraft.projectName.trim();
    const description = structureMetaDraft.description.trim();

    if (!projectName) {
      setStructureFormError('Project name is required.');
      return;
    }
    if (!structureDraft.length) {
      setStructureFormError('Add at least one objective.');
      return;
    }

    let normalizedObjectives = [];
    try {
      normalizedObjectives = structureDraft.map((objective, objectiveIndex) => {
        const descriptionValue = (objective.description ?? '').trim();
        if (!descriptionValue) {
          throw new Error(`Objective ${objectiveIndex + 1} needs a description.`);
        }

        const milestoneSource = Array.isArray(objective.objectiveMilestones) ? objective.objectiveMilestones : [];
        const normalizedMilestones = milestoneSource.map((milestone, milestoneIndex) => {
          const milestoneTitle = milestone.title.trim();
          if (!milestoneTitle) {
            throw new Error(`Milestone ${milestoneIndex + 1} in objective ${objectiveIndex + 1} requires a title.`);
          }
          if (milestone.endDate && milestone.startDate && milestone.endDate < milestone.startDate) {
            throw new Error(
              `Milestone ${milestoneIndex + 1} in objective ${objectiveIndex + 1} must end on or after its start date.`
            );
          }
          return {
            objectiveMilestoneId: milestone.objectiveMilestoneId ?? milestone.milestoneId ?? null,
            milestoneId: milestone.milestoneId ?? null,
            title: milestoneTitle,
            description: milestone.description.trim() || null,
            startDate: milestone.startDate || null,
            endDate: milestone.endDate || null,
          };
        });

        const normalizedTitle = (objective.title ?? '').trim() || descriptionValue || `Objective ${objectiveIndex + 1}`;

        return {
          objectiveId: objective.objectiveId ?? objective.id ?? null,
          title: normalizedTitle,
          description: descriptionValue,
          priority: objective.priority || null,
          objectiveMilestones: normalizedMilestones,
        };
      });
    } catch (validationError) {
      setStructureFormError(validationError.message);
      return;
    }

    setStructureFormError('');
    setIsStructureSaving(true);

    const payload = composePendingUpdatePayload(
      {
        projectName,
        description,
        objectives: normalizedObjectives,
      },
      { includeObjectivesFallback: false }
    );

    try {
      const response = await updateProjectBeforeApproval(payload);
      toast.success(response?.message ?? 'Project brief updated.');
      await fetchProject({ silent: true });
      setEditDraft({ projectName, description });
      closeStructureModal(true);
    } catch (err) {
      console.error('Failed to update full brief.', err);
      const message = err?.response?.data?.message ?? err?.message ?? 'Unable to update the project brief.';
      setStructureFormError(message);
      toast.error(message);
    } finally {
      setIsStructureSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingShell />;
  }

  if (error) {
    return (
      <ErrorPanel
        message={error?.message ?? 'Unable to load project details.'}
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project"
        description="We could not locate this project. Please return to the project library."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <LecturerBreadcrumbs items={breadcrumbItems} className="mb-2" />

        <section className={`${glassPanelClass} rounded-3xl border border-indigo-100/50 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Project Overview</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">{project.projectName}</h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {project.description || 'Description updating soon.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" /> Subject: {project.subjectName ?? '—'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Lecturer: {project.lecturerName ?? '—'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-4 lg:w-80">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              >
                ← Back
              </button>
            </div>
          </div>

          {isPendingProject && (
            <div className="mt-8 border-t border-slate-200/60 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pending draft controls</p>
                  <p className="mt-1 text-sm text-slate-600">Update everything before approval.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="rounded-2xl border border-slate-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Quick edit overview
                  </button>
                  <button
                    type="button"
                    onClick={openDeleteModal}
                    className="rounded-2xl border border-rose-200/80 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                  >
                    Delete pending project
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <InfoStat label="Status" value={statusMeta.label} pill={statusMeta.badge} />
          <InfoStat label="Subject" value={project.subjectName ?? '—'} accent="from-sky-50 via-white to-cyan-50" />
          <InfoStat label="Lecturer" value={project.lecturerName ?? '—'} accent="from-emerald-50 via-white to-teal-50" />
          <InfoStat label="Last Updated" value={formatDate(project.updatedAt)} accent="from-indigo-50 via-white to-violet-50" />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className={`${glassPanelClass} rounded-3xl p-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Details</p>
              <dl className="mt-4 grid gap-4 md:grid-cols-2">
                {metaRows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-sm font-semibold text-slate-500">{row.label}</dt>
                    <dd className="mt-1 text-base text-slate-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Objectives</p>
              {projectObjectives.length === 0 && (
                <EmptyState title="Objectives" description="Objectives have not been added to this project yet." />
              )}
              <div className="grid gap-4">
                {projectObjectives.map((objective, index) => (
                  <ObjectiveCard
                    key={objective.objectiveId ?? objective.id ?? index}
                    objective={objective}
                    index={index}
                    isPending={isPendingProject}
                    onEditObjective={handleObjectiveEditRequest}
                    onEditMilestone={handleMilestoneEditRequest}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className={`${glassPanelClass} rounded-3xl p-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Timeline</p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3">
                  <span className="font-semibold text-slate-500">Created</span>
                  <span className="text-slate-900">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3">
                  <span className="font-semibold text-slate-500">Last Updated</span>
                  <span className="text-slate-900">{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className={`${glassPanelClass} rounded-3xl p-6`}>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Meta</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Project ID</p>
                  <p className="text-base text-slate-900">#{project.projectId ?? project.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Subject Code</p>
                  <p className="text-base text-slate-900">{project.subjectCode ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Lecturer Code</p>
                  <p className="text-base text-slate-900">{project.lecturerCode ?? '—'}</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <ModalWrapper isOpen={structureModalOpen} onClose={() => closeStructureModal(false)} title="Edit objectives & milestones">
        <form className="space-y-6 max-h-[75vh] overflow-y-auto pr-1" onSubmit={handleStructureSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500" htmlFor="structure-project-name">
                Project name
              </label>
              <input
                id="structure-project-name"
                type="text"
                value={structureMetaDraft.projectName}
                onChange={(event) => handleStructureMetaChange('projectName', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="E.g., AI research sprint"
                disabled={isStructureSaving}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500" htmlFor="structure-project-description">
                Description
              </label>
              <textarea
                id="structure-project-description"
                rows={4}
                value={structureMetaDraft.description}
                onChange={(event) => handleStructureMetaChange('description', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Summarise the full scope students will tackle."
                disabled={isStructureSaving}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Objectives</p>
              <button
                type="button"
                onClick={handleAddObjective}
                disabled={isStructureSaving}
                className="inline-flex items-center rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                + Add objective
              </button>
            </div>

            {structureDraft.map((objective, index) => {
              const resolvedObjectiveId = resolveObjectiveIdentifier(objective) ?? objective.id ?? `objective-${index}`;
              const objectiveEditorId = `objective-editor-${resolvedObjectiveId}`;
              const isObjectiveFocused = structureFocus?.objectiveId === resolvedObjectiveId;

              return (
                <div
                  key={objective.id}
                  id={objectiveEditorId}
                  className={`space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 ${
                    isObjectiveFocused ? 'ring-2 ring-sky-200 shadow-lg' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Objective {index + 1}</p>
                      <p className="text-sm text-slate-500">Define what students accomplish in this phase.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(objective.id)}
                      disabled={isStructureSaving || structureDraft.length === 1}
                      className="inline-flex items-center rounded-xl border border-rose-200/70 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove objective
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500" htmlFor={`objective-description-${objective.id}`}>
                        Description
                      </label>
                      <textarea
                        id={`objective-description-${objective.id}`}
                        rows={3}
                        value={objective.description}
                        onChange={(event) => handleObjectiveFieldChange(objective.id, 'description', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        placeholder="Clarify deliverables and expectations for this objective."
                        disabled={isStructureSaving}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500" htmlFor={`objective-priority-${objective.id}`}>
                        Priority
                      </label>
                      <select
                        id={`objective-priority-${objective.id}`}
                        value={objective.priority ?? ''}
                        onChange={(event) => handleObjectiveFieldChange(objective.id, 'priority', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                        disabled={isStructureSaving}
                      >
                        <option value="">Select priority</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Milestones</p>
                      <button
                        type="button"
                        onClick={() => handleAddMilestone(objective.id)}
                        disabled={isStructureSaving}
                        className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        + Add milestone
                      </button>
                    </div>

                    {objective.objectiveMilestones.map((milestone, milestoneIndex) => {
                      const resolvedMilestoneId =
                        resolveMilestoneIdentifier(milestone) ?? milestone.id ?? `milestone-${milestoneIndex}`;
                      const milestoneEditorId = `milestone-editor-${resolvedMilestoneId}`;
                      const isMilestoneFocused = structureFocus?.milestoneId === resolvedMilestoneId;

                      return (
                        <div
                          key={milestone.id}
                          id={milestoneEditorId}
                          className={`space-y-3 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm ${
                            isMilestoneFocused ? 'ring-2 ring-sky-200' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-600">Milestone {milestoneIndex + 1}</p>
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestone(objective.id, milestone.id)}
                              disabled={isStructureSaving || objective.objectiveMilestones.length === 1}
                              className="text-xs font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500" htmlFor={`milestone-title-${milestone.id}`}>
                              Title
                            </label>
                            <input
                              id={`milestone-title-${milestone.id}`}
                              type="text"
                              value={milestone.title}
                              onChange={(event) => handleMilestoneFieldChange(objective.id, milestone.id, 'title', event.target.value)}
                              className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                              placeholder="E.g., Submit proposal"
                              disabled={isStructureSaving}
                              required
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-semibold text-slate-500" htmlFor={`milestone-start-${milestone.id}`}>
                                Start date
                              </label>
                              <input
                                id={`milestone-start-${milestone.id}`}
                                type="date"
                                value={milestone.startDate}
                                onChange={(event) => handleMilestoneFieldChange(objective.id, milestone.id, 'startDate', event.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                disabled={isStructureSaving}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-500" htmlFor={`milestone-end-${milestone.id}`}>
                                End date
                              </label>
                              <input
                                id={`milestone-end-${milestone.id}`}
                                type="date"
                                value={milestone.endDate}
                                onChange={(event) => handleMilestoneFieldChange(objective.id, milestone.id, 'endDate', event.target.value)}
                                className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                disabled={isStructureSaving}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500" htmlFor={`milestone-description-${milestone.id}`}>
                              Description
                            </label>
                            <textarea
                              id={`milestone-description-${milestone.id}`}
                              rows={2}
                              value={milestone.description}
                              onChange={(event) => handleMilestoneFieldChange(objective.id, milestone.id, 'description', event.target.value)}
                              className="mt-1 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                              placeholder="Describe the deliverable."
                              disabled={isStructureSaving}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {structureFormError && <p className="text-sm font-semibold text-rose-600">{structureFormError}</p>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => closeStructureModal(false)}
              disabled={isStructureSaving}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isStructureSaving}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(15,23,42,0.25)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
            >
              {isStructureSaving ? 'Saving…' : 'Save full brief'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      <ModalWrapper isOpen={isEditModalOpen} onClose={() => closeEditModal(false)} title="Edit pending project">
        <form className="space-y-5" onSubmit={handleSubmitPendingUpdate}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500" htmlFor="pending-project-name">
              Project name
            </label>
            <input
              id="pending-project-name"
              type="text"
              value={editDraft.projectName}
              onChange={(event) => handleEditInputChange('projectName', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="E.g., Industry research sprint"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500" htmlFor="pending-project-description">
              Description
            </label>
            <textarea
              id="pending-project-description"
              rows={5}
              value={editDraft.description}
              onChange={(event) => handleEditInputChange('description', event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-800 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Summarise the project scope students will tackle."
            />
            <p className="mt-2 text-xs text-slate-500">These quick edits keep the pending draft aligned without reopening the full builder.</p>
          </div>
          {editFormError && <p className="text-sm font-semibold text-rose-600">{editFormError}</p>}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => closeEditModal(false)}
              disabled={isEditSaving}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditSaving}
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(15,23,42,0.25)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
            >
              {isEditSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      <ModalWrapper isOpen={deleteModalOpen} onClose={() => closeDeleteModal(false)} title="Remove pending project">
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            You are about to remove <span className="font-semibold text-slate-900">{project?.projectName}</span> from the lecturer library.
            This action is only available for pending drafts and cannot be undone.
          </p>
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-amber-800">
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Reminder</p>
            <p className="mt-1 text-sm">Approved projects stay locked for auditing; only pending drafts can be removed here.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => closeDeleteModal(false)}
            disabled={isDeleteSubmitting}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
          >
            Keep project
          </button>
          <button
            type="button"
            onClick={handleDeletePendingProject}
            disabled={isDeleteSubmitting}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(244,63,94,0.35)] transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
          >
            {isDeleteSubmitting ? 'Deleting…' : 'Delete project'}
          </button>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default ProjectDetail;
