import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectDetail } from '../../services/projectApi';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

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

const ObjectiveCard = ({ objective, index }) => {
  const rawTitle = objective?.title?.trim();
  const rawDescription = objective?.description?.trim();
  const resolvedTitle = rawTitle || rawDescription || 'Untitled Objective';
  const shouldRenderDescription = Boolean(rawTitle && rawDescription);
  const shouldRenderFallback = !rawDescription;

  return (
    <div className={`${glassPanelClass} flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-400">Objective {index + 1}</p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">{resolvedTitle}</h4>
        </div>
        {objective.priority && (
          <span className="rounded-full border border-indigo-200 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-700">
            Priority: {objective.priority}
          </span>
        )}
      </div>
      {(shouldRenderDescription || shouldRenderFallback) && (
        <p className="text-sm text-slate-600">
          {shouldRenderDescription ? rawDescription : 'Description coming soon.'}
        </p>
      )}
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
                    <p className="font-semibold text-slate-800">{milestone.title || 'Untitled milestone'}</p>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {formatDate(milestone.startDate)} — {formatDate(milestone.endDate)}
                    </span>
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
  const normalized = project?.statusString?.trim().toLowerCase();
  return statusTokens[normalized] ?? statusTokens.pending;
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProjectDetail(projectId);
      setProject(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject, reloadKey]);

  const statusMeta = useProjectStatus(project);

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
            <div className="flex flex-col items-end gap-4">
              <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${statusMeta.badge}`}>
                {statusMeta.label}
              </span>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              >
                ← Back
              </button>
            </div>
          </div>
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
                  <ObjectiveCard key={objective.objectiveId ?? objective.id ?? index} objective={objective} index={index} />
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
    </div>
  );
};

export default ProjectDetail;
