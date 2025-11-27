import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  SparklesIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { getLecturerProjects } from '../../services/projectApi';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

const glassPanelClass =
  'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const statAccentTokens = [
  {
    background: 'from-sky-50/80 via-white/40 to-cyan-50/80',
    iconBg: 'from-sky-200 to-cyan-200',
    iconText: 'text-sky-700',
    glow: 'shadow-[0_20px_55px_rgba(14,165,233,0.35)]'
  },
  {
    background: 'from-indigo-50/80 via-white/40 to-violet-50/80',
    iconBg: 'from-indigo-200 to-violet-200',
    iconText: 'text-indigo-700',
    glow: 'shadow-[0_20px_55px_rgba(99,102,241,0.32)]'
  },
  {
    background: 'from-emerald-50/80 via-white/40 to-lime-50/80',
    iconBg: 'from-emerald-200 to-lime-200',
    iconText: 'text-emerald-700',
    glow: 'shadow-[0_20px_55px_rgba(16,185,129,0.32)]'
  },
  {
    background: 'from-amber-50/80 via-white/40 to-orange-50/80',
    iconBg: 'from-amber-200 to-orange-200',
    iconText: 'text-amber-700',
    glow: 'shadow-[0_20px_55px_rgba(251,191,36,0.35)]'
  }
];

const subjectGradientPalettes = [
  'from-sky-100 via-white to-cyan-50',
  'from-indigo-100 via-white to-purple-50',
  'from-emerald-100 via-white to-lime-50',
  'from-amber-100 via-white to-orange-50'
];

// Deterministic gradient selection keeps project cards color-consistent per subject.
const getSubjectGradient = (subjectCode = '') => {
  const normalized = subjectCode.trim().toUpperCase();
  if (!normalized) {
    return subjectGradientPalettes[0];
  }
  const hash = normalized
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return subjectGradientPalettes[hash % subjectGradientPalettes.length];
};

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

const renderProjectStatSkeleton = (key) => (
  <div
    key={key}
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse"
  >
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-7 w-16 rounded bg-slate-300" />
      </div>
      <div className="h-12 w-12 rounded-xl bg-slate-200" />
    </div>
    <div className="mt-4 h-3 w-32 rounded bg-slate-100" />
  </div>
);

const renderProjectCardSkeleton = (key) => (
  <div
    key={key}
    className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="h-5 w-36 rounded bg-slate-200" />
        <div className="h-3 w-40 rounded bg-slate-100" />
        <div className="h-3 w-32 rounded bg-slate-100" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      <div className="h-10 w-full rounded-xl bg-slate-200" />
    </div>
  </div>
);

const renderMilestoneSkeleton = (key) => (
  <div
    key={key}
    className="rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-4 animate-pulse"
  >
    <div className="h-4 w-40 rounded bg-slate-200" />
    <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
    <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
  </div>
);

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
      return 'border border-emerald-200/70 bg-emerald-50/80 text-emerald-700 shadow-[0_8px_24px_rgba(16,185,129,0.18)]';
    case 'PENDING':
      return 'border border-amber-200/70 bg-amber-50/80 text-amber-700 shadow-[0_8px_24px_rgba(251,191,36,0.2)]';
    case 'REJECTED':
      return 'border border-rose-200/70 bg-rose-50/80 text-rose-700 shadow-[0_8px_24px_rgba(244,63,94,0.18)]';
    default:
      return 'border border-slate-200/70 bg-white/70 text-slate-600 shadow-[0_8px_24px_rgba(148,163,184,0.18)]';
  }
};

const ProjectLibrary = () => {
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const showProjectSkeleton = isLoadingProjects && projects.length === 0;
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
              `[Lecturer Project Library] Missing '${field}' in /api/project/lecturer response. ${reason ?? 'This field powers lecturer project dashboard UI elements.'
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

  const projectStatCards = [
    {
      id: 'totalProjects',
      label: 'Total projects',
      value: stats.totalProjects,
      description: '',
      icon: BookOpenIcon,
      accent: statAccentTokens[0]
    },
    {
      id: 'projectsWithObjectives',
      label: 'Has objectives',
      value: stats.projectsWithObjectives,
      description: 'Projects enriched with at least one learning objective.',
      icon: CheckCircleIcon,
      accent: statAccentTokens[2]
    },
    {
      id: 'totalObjectives',
      label: 'Objectives tracked',
      value: stats.totalObjectives,
      description: 'Total number of objectives across all projects.',
      icon: SparklesIcon,
      accent: statAccentTokens[1]
    },
    {
      id: 'totalMilestones',
      label: 'Milestones synced',
      value: stats.totalMilestones,
      description: 'Milestones exposed by objectives for planning timelines.',
      icon: CalendarDaysIcon,
      accent: statAccentTokens[3]
    }
  ];

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

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProject = (projectId) => {
    navigate(`/lecturer/projects/${projectId}`);
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="relative rounded-[32px] border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer project space</p>
              <h1 className="text-4xl font-semibold text-slate-900">Project Library</h1>
              <p className="text-base text-slate-600">
                Browse live lecturer projects, surface objectives, and keep milestone plans synchronized with the refreshed workspace.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5">
                  <SparklesIcon className="h-4 w-4 text-sky-500" />
                  API-sourced data
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5">
                  <ClipboardDocumentListIcon className="h-4 w-4 text-indigo-500" />
                  Objectives & milestones linked
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row relative" ref={createMenuRef}>
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(79,70,229,0.35)] transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
              >
                <PlusIcon className="h-4 w-4" />
                New project
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCreateMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate('/lecturer/create-project')}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                        <PencilSquareIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Create Manually</div>
                        <div className="text-xs text-slate-500 font-normal">Build from scratch</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => navigate('/lecturer/projects/create-with-ai')}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <CpuChipIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Create with AI</div>
                        <div className="text-xs text-slate-500 font-normal">Generate from PDF</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
          {showProjectSkeleton
            ? projectStatCards.map((card) => renderProjectStatSkeleton(card.id))
            : projectStatCards.map((card, index) => {
              const Icon = card.icon;
              const accent = card.accent ?? statAccentTokens[index % statAccentTokens.length];
              return (
                <div key={card.id} className={`relative overflow-hidden rounded-[24px] ${glassPanelClass} p-6`}>
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.background}`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{card.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
                      <p className="mt-2 text-xs text-slate-600">{card.description || 'Live insight from lecturer data.'}</p>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-br ${accent.iconBg} p-3 ${accent.iconText} ${accent.glow}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              );
            })}
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-8 2xl:col-span-9">
            <div className={`rounded-[32px] ${glassPanelClass} p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[21px] font-semibold uppercase tracking-[0.35em] text-slate-500">Projects</p>
                  {isLoadingProjects && (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-600">
                      <SparklesIcon className="h-3 w-3 animate-spin" />
                      Refreshing data…
                    </p>
                  )}
                </div>
                <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                  <div className="relative w-full lg:w-64">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search project or subject"
                      className="w-full rounded-2xl border border-slate-200/70 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 lg:w-48"
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

              {showProjectSkeleton ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) =>
                    renderProjectCardSkeleton(`project-skeleton-${index}`)
                  )}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="mt-10 rounded-[28px] border border-dashed border-slate-200/70 bg-white/60 py-12 text-center">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-base font-semibold text-slate-700">No projects match the filters</p>
                  <p className="mt-1 text-sm text-slate-500">Adjust filters or create a new project to populate the library.</p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {filteredProjects.map((project) => (
                    <div key={project.projectId ?? project.projectName} className="relative">
                      <div className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${getSubjectGradient(project.subjectCode)} opacity-80 blur-sm`} />
                      <div className={`relative flex h-full flex-col rounded-[28px] ${glassPanelClass} p-6`}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">{project.subjectCode}</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">{project.projectName}</h3>
                            <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                            <p className="mt-2 text-xs text-slate-500">Lecturer | {project.lecturerName}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles(project.status)}`}>
                            {project.statusLabel}
                          </span>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Objectives</p>
                            <p className="text-2xl font-semibold text-slate-900">{project.objectives.length}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Milestones</p>
                            <p className="text-2xl font-semibold text-slate-900">{project.milestoneCount}</p>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Recent objective</p>
                            <p className="text-sm text-slate-600">
                              {project.objectives[0]?.description ?? 'Objectives will appear when provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                          <button
                            onClick={() => handleViewProject(project.projectId)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-white"
                          >
                            Open detail
                          </button>
                          <button
                            onClick={() => navigate(`/lecturer/projects/${project.projectId}/analysis`)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(15,23,42,0.25)] transition hover:bg-slate-800"
                          >
                            AI insights
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6 xl:col-span-4 2xl:col-span-3">

            <div className={`rounded-[28px] ${glassPanelClass} p-6`}>
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                <h2 className="text-xl font-semibold text-slate-900">Upcoming milestones</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">Directly sourced from objective milestones.</p>
              <div className="mt-4 space-y-4">
                {showProjectSkeleton ? (
                  Array.from({ length: 3 }).map((_, index) =>
                    renderMilestoneSkeleton(`milestone-skeleton-${index}`)
                  )
                ) : upcomingMilestones.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/60 bg-white/50 px-4 py-6 text-center text-sm text-slate-600">
                    Milestones will appear once objectives define schedules.
                  </div>
                ) : (
                  upcomingMilestones.map((milestone) => (
                    <div
                      key={`${milestone.objectiveMilestoneId}-${milestone.projectId}`}
                      className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{milestone.title}</p>
                      <p className="text-xs text-slate-500">{milestone.projectName} | {milestone.subjectCode}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(milestone.startDate)} – {formatDate(milestone.endDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`rounded-[28px] ${glassPanelClass} p-6`}>
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-indigo-500" />
                <h2 className="text-xl font-semibold text-slate-900">Lecturer checklist</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">Keep teams aligned with library best practices.</p>
              <ul className="mt-5 space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Confirm each project exposes at least one clear objective before assignment.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Align milestone dates with class pacing so checkpoints feel achievable.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Share payload gaps with the backend early—missing fields are logged in devtools.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectLibrary;