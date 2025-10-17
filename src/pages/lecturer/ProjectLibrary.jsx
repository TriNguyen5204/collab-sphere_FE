import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { getLecturerProjects } from '../../services/projectApi';

const REQUIRED_PROJECT_FIELDS = {
  projectId: 'Used as the unique key for navigation and actions.',
  projectName: 'Shown as the project title in list and card views.',
  description: 'Displayed beneath the title for quick context.',
  status: 'Determines project status badges and filtering options.',
  subjectCode: 'Provides a quick reference to the linked subject.',
  subjectName: 'Supplies human readable context alongside the subject code.',
  lecturerName: 'Clarifies the project owner when multiple lecturers collaborate.',
  objectives: 'Feeds the objectives preview and milestone rollups.'
};

const STATUS_CODE_MAP = {
  0: 'PENDING',
  1: 'APPROVED',
  2: 'REJECTED'
};

const STATUS_LABELS = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  UNKNOWN: 'Unknown'
};

const normaliseStatus = (rawStatus, fallback) => {
  if (typeof rawStatus === 'string' && rawStatus.trim().length > 0) {
    return rawStatus.trim().toUpperCase();
  }

  if (typeof rawStatus === 'number') {
    return STATUS_CODE_MAP[rawStatus] ?? fallback;
  }

  return fallback;
};

const mapApiProjectToViewModel = (rawProject = {}) => {
  const statusValue = normaliseStatus(
    rawProject.statusString ?? rawProject.status,
    'UNKNOWN'
  );

  const objectives = Array.isArray(rawProject.objectives)
    ? rawProject.objectives.map((objective) => {
        const milestones = Array.isArray(objective.objectiveMilestones)
          ? objective.objectiveMilestones.map((milestone) => ({
              objectiveMilestoneId: milestone.objectiveMilestoneId ?? milestone.id ?? null,
              title: milestone.title ?? 'Untitled milestone',
              description: milestone.description ?? '',
              startDate: milestone.startDate ?? milestone.beginDate ?? null,
              endDate: milestone.endDate ?? milestone.finishDate ?? null
            }))
          : [];

        return {
          objectiveId: objective.objectiveId ?? objective.id ?? null,
          description: objective.description ?? 'Objective description unavailable',
          priority: objective.priority ?? 'Normal',
          milestones
        };
      })
    : [];

  const milestones = objectives.flatMap((objective) =>
    objective.milestones.map((milestone) => ({
      ...milestone,
      objectiveId: objective.objectiveId
    }))
  );

  return {
    projectId: rawProject.projectId ?? rawProject.id ?? null,
    projectName: rawProject.projectName ?? rawProject.name ?? 'Untitled project',
    description: rawProject.description ?? 'Project description unavailable.',
    lecturerName:
      rawProject.lecturerName ??
      rawProject.lecturerFullName ??
      rawProject.lecturer?.fullName ??
      '—',
    lecturerId: rawProject.lecturerId ?? null,
    subjectCode: rawProject.subjectCode ?? rawProject.subject?.code ?? '—',
    subjectName: rawProject.subjectName ?? rawProject.subject?.name ?? '—',
    status: statusValue,
    statusLabel: STATUS_LABELS[statusValue] ?? statusValue,
    objectives,
    milestones,
    hasObjectives: objectives.length > 0,
    milestoneCount: milestones.length
  };
};

const extractProjectList = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.list)) {
    return payload.list;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
};

const normaliseProjectResponse = (payload) => {
  const rawProjects = extractProjectList(payload);
  const missingFields = new Set();

  const projects = rawProjects.map((rawProject) => {
    Object.keys(REQUIRED_PROJECT_FIELDS).forEach((field) => {
      const value = rawProject?.[field];
      if (value === undefined || value === null) {
        missingFields.add(field);
      }
    });

    return mapApiProjectToViewModel(rawProject);
  });

  return {
    projects,
    missingFields: Array.from(missingFields)
  };
};

const formatDate = (value) => {
  if (!value) return 'TBA';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

const statusBadgeStyles = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

const ProjectLibrary = () => {
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      if (!lecturerId) {
        setProjects([]);
        return;
      }

      setIsLoadingProjects(true);

      try {
        const payload = await getLecturerProjects(lecturerId);
        const { projects: apiProjects, missingFields } = normaliseProjectResponse(payload);

        if (!isMounted) {
          return;
        }

        setProjects(apiProjects);

        if (missingFields.length > 0) {
          missingFields.forEach((field) => {
            const reason = REQUIRED_PROJECT_FIELDS[field];
            console.warn(
              `[Lecturer Project Library] Missing '${field}' in /api/project/lecturer response. ${
                reason ?? 'This field powers lecturer project dashboard UI elements.'
              }`
            );
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load lecturer projects from /api/project/lecturer.', error);
        setProjects([]);
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [lecturerId]);

  const projectInsights = useMemo(() => projects, [projects]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set();
    projectInsights.forEach((project) => {
      if (project.status) {
        statuses.add(project.status);
      }
    });
    return Array.from(statuses);
  }, [projectInsights]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projectInsights.filter((project) => {
      const matchesSearch =
        !normalizedSearch.length ||
        project.projectName.toLowerCase().includes(normalizedSearch) ||
        project.subjectName.toLowerCase().includes(normalizedSearch) ||
        project.subjectCode.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projectInsights, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalObjectives = projectInsights.reduce(
      (total, project) => total + project.objectives.length,
      0
    );
    const totalMilestones = projectInsights.reduce(
      (total, project) => total + project.milestoneCount,
      0
    );
    const projectsWithObjectives = projectInsights.filter((project) => project.hasObjectives).length;

    return {
      totalProjects: projectInsights.length,
      projectsWithObjectives,
      totalObjectives,
      totalMilestones
    };
  }, [projectInsights]);

  const upcomingMilestones = useMemo(() => {
    const now = new Date();

    const milestones = projectInsights.flatMap((project) =>
      project.milestones.map((milestone) => ({
        ...milestone,
        projectId: project.projectId,
        projectName: project.projectName,
        subjectCode: project.subjectCode
      }))
    );

    return milestones
      .filter((milestone) => milestone.startDate && new Date(milestone.endDate ?? milestone.startDate) >= now)
      .sort((a, b) => new Date(a.startDate ?? a.endDate ?? now) - new Date(b.startDate ?? b.endDate ?? now))
      .slice(0, 4);
  }, [projectInsights]);

  const handleCreateProject = () => {
    navigate('/lecturer/create-project');
  };

  const handleViewProject = (projectId) => {
    navigate(`/lecturer/projects/${projectId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="w-full px-6 py-10 space-y-10 lg:px-8 2xl:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Lecturer workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Project Library</h1>
              <p className="mt-2 text-sm text-slate-500">
                Browse projects sourced from the API and review objectives and milestones without relying on mock data.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => navigate('/lecturer/projects')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
                Manage project library
              </button>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4" />
                New project
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total projects</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalProjects}</p>
                </div>
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Pulled directly from `/api/project/lecturer`.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Has objectives</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.projectsWithObjectives}</p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Projects enriched with at least one learning objective.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Objectives tracked</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalObjectives}</p>
                </div>
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <SparklesIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Total number of objectives across all projects.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Milestones synced</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalMilestones}</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Milestones exposed by objectives for planning timelines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8 2xl:col-span-9">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
                    <p className="text-xs text-slate-500">Search, filter, and jump into project detail.</p>
                    {isLoadingProjects && (
                      <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        <SparklesIcon className="h-3 w-3 animate-spin" />
                        Refreshing data…
                      </p>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                    <div className="relative w-full lg:w-56">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search project or subject"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-40"
                    >
                      <option value="all">All statuses</option>
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status] ?? status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                    <BookOpenIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-600">No projects match the selected filters yet.</p>
                    <p className="mt-1 text-xs text-slate-400">Adjust the search parameters or create a new project.</p>
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.projectId ?? project.projectName}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{project.subjectCode}</p>
                            <h3 className="mt-1 text-lg font-semibold text-slate-900">{project.projectName}</h3>
                            <p className="mt-1 text-xs text-slate-500">{project.description}</p>
                            <p className="mt-2 text-xs text-slate-500">Lecturer: {project.lecturerName}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeStyles(project.status)}`}>
                            {project.statusLabel}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Objectives</p>
                            <p className="text-base font-semibold text-slate-900">{project.objectives.length}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Milestones</p>
                            <p className="text-base font-semibold text-slate-900">{project.milestoneCount}</p>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Recent objective</p>
                            <p className="text-sm text-slate-600">
                              {project.objectives[0]?.description ?? 'Objectives will appear when provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
                          <button
                            onClick={() => handleViewProject(project.projectId)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Open project detail
                          </button>
                          <button
                            onClick={() => navigate(`/lecturer/projects/${project.projectId}/analysis`)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            AI insights
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4 2xl:col-span-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <InformationCircleIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Data coverage</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">This library mirrors the backend payload exactly.</p>
                <p className="mt-4 text-sm text-slate-600">
                  Objectives and milestones display only when provided by the API. Missing fields are logged to the console so you can coordinate with the backend before surfacing additional UI.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming milestones</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">These are sourced directly from objective milestones.</p>
                <div className="mt-4 space-y-4">
                  {upcomingMilestones.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                      <p className="text-sm font-semibold text-slate-700">No milestones scheduled yet</p>
                      <p className="mt-1 text-xs text-slate-500">Milestones will appear once objectives define timelines.</p>
                    </div>
                  ) : (
                    upcomingMilestones.map((milestone) => (
                      <div key={`${milestone.objectiveMilestoneId}-${milestone.projectId}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{milestone.title}</p>
                        <p className="text-xs text-slate-500">{milestone.projectName} · {milestone.subjectCode}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(milestone.startDate)} – {formatDate(milestone.endDate)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Lecturer checklist</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Quick reminders aligned with current API coverage.</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Confirm each project has clear objectives before assigning to classes.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Coordinate milestone dates with class schedules so students are not overbooked.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Share feedback with the backend team if required fields are missing from responses.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectLibrary;