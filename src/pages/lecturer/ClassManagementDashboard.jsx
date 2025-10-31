import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  KeyIcon,
  MegaphoneIcon,
  PlusIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { getLecturerClasses } from '../../services/classApi';

const REQUIRED_CLASS_FIELDS = {
  classId: 'Used as the unique key for cards and navigation into class detail.',
  className: 'Displayed as the card title so lecturers can identify the class.',
  subjectCode: 'Shown as the subject badge and used for filtering.',
  subjectName: 'Supports search and gives readable context beside the code.',
  enrolKey: 'Allows lecturers to share or confirm the enrolment key from the dashboard.',
  memberCount: 'Feeds the student count metrics in the stat tiles and class cards.',
  teamCount: 'Required to surface how many teams exist for each class.',
  lecturerName: 'Clarifies the class owner when multiple lecturers collaborate.',
  createdDate: 'Supports chronological sorting and potential timeline displays.',
  isActive: 'Determines status badges and powers the active/inactive filter.'
};

const mapApiClassToViewModel = (apiClass = {}) => ({
  classId: apiClass.classId ?? apiClass.id ?? null,
  className: apiClass.className ?? apiClass.name ?? 'Untitled class',
  subjectCode: apiClass.subjectCode ?? apiClass.subject?.code ?? '—',
  subjectName: apiClass.subjectName ?? apiClass.subject?.name ?? '—',
  enrolKey: apiClass.enrolKey ?? apiClass.enrollmentKey ?? '—',
  memberCount:
    apiClass.memberCount ??
    apiClass.studentCount ??
    apiClass.numberOfStudents ??
    apiClass.totalStudents ??
    0,
  teamCount:
    apiClass.teamCount ??
    apiClass.numberOfTeams ??
    apiClass.totalTeams ??
    0,
  lecturerName:
    apiClass.lecturerName ??
    apiClass.lecturerFullName ??
    apiClass.lecturer?.fullName ??
    '—',
  createdDate: apiClass.createdDate ?? apiClass.createdAt ?? null,
  isActive: (() => {
    if (typeof apiClass.isActive === 'boolean') {
      return apiClass.isActive;
    }

    const statusValue = apiClass.status ?? apiClass.classStatus ?? apiClass.state;

    if (typeof statusValue === 'number') {
      return statusValue === 1 || statusValue === 2;
    }

    if (typeof statusValue === 'string') {
      const normalized = statusValue.toLowerCase();
      return ['active', 'in-delivery', 'in_delivery', 'in progress', 'in_progress'].includes(normalized);
    }

    return false;
  })()
});

const extractClassList = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.list)) {
    return payload.list;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.records)) {
    return payload.records;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const normaliseClassResponse = (payload) => {
  const rawClasses = extractClassList(payload);
  const missingFields = new Set();

  const normalisedClasses = rawClasses.map((rawClass) => {
    Object.keys(REQUIRED_CLASS_FIELDS).forEach((field) => {
      const value = rawClass?.[field];
      if (value === undefined || value === null) {
        missingFields.add(field);
      }
    });
    return mapApiClassToViewModel(rawClass);
  });

  return {
    classes: normalisedClasses,
    missingFields: Array.from(missingFields)
  };
};

const renderClassStatSkeleton = (key) => (
  <div
    key={key}
    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
  >
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-2.5 w-20 rounded bg-slate-200" />
        <div className="h-6 w-14 rounded bg-slate-300" />
      </div>
      <div className="h-10 w-10 rounded-lg bg-slate-200" />
    </div>
    <div className="mt-3 h-2.5 w-28 rounded bg-slate-100" />
  </div>
);

const renderClassCardSkeleton = (key) => (
  <div
    key={key}
    className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-2">
        <div className="h-2.5 w-20 rounded bg-slate-200" />
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-2.5 w-20 rounded bg-slate-100" />
      </div>
      <div className="h-4 w-12 rounded-full bg-slate-200" />
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-slate-100" />
          <div className="h-3.5 w-12 rounded bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
      <div className="h-8 w-full rounded-lg bg-slate-200" />
      <div className="h-8 w-full rounded-lg bg-slate-200" />
    </div>
  </div>
);
const ClassManagementDashboard = () => {
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const showClassSkeleton = isLoadingClasses && classes.length === 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const [announcements] = useState([
    {
      id: 'ann-1',
      title: 'AI Workshop Resources Uploaded',
      body: 'New AI tooling guidelines available in the shared resource hub.',
      timestamp: '2025-09-21T12:45:00Z'
    },
    {
      id: 'ann-2',
      title: 'Curriculum Alignment Review',
  body: 'Submit updated project syllabi to Head of Department by Oct 7.',
      timestamp: '2025-09-20T08:20:00Z'
    }
  ]);

  const quickActions = useMemo(
    () => [
      {
        id: 'qa-1',
        label: 'Create New Project',
        description: 'Manual entry or AI-assisted setup',
        icon: DocumentTextIcon,
        onClick: () => navigate('/lecturer/create-project')
      },
      {
        id: 'qa-2',
        label: 'Upload Requirement Doc',
        description: 'Autogenerate milestones & checkpoints',
        icon: SparklesIcon,
        onClick: () => navigate('/lecturer/create-project')
      },
      {
        id: 'qa-3',
        label: 'Schedule Consultation',
        description: 'Align with teams that need assistance',
        icon: CalendarDaysIcon,
        onClick: () => navigate('/lecturer/monitoring')
      }
    ],
    [navigate]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchLecturerClasses = async () => {
      if (!lecturerId) {
        setClasses([]);
        return;
      }

      setIsLoadingClasses(true);

      try {
        const payload = await getLecturerClasses(lecturerId);
        const { classes: apiClasses, missingFields } = normaliseClassResponse(payload);

        if (!isMounted) {
          return;
        }

        setClasses(apiClasses);

        if (missingFields.length > 0) {
          missingFields.forEach((field) => {
            const reason = REQUIRED_CLASS_FIELDS[field];
            console.warn(
              `[Lecturer Dashboard] Missing '${field}' in /api/class/lecturer response. ${reason ?? 'This field powers lecturer dashboard UI elements.'}`
            );
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load lecturer classes from /api/class/lecturer.', error);
        setClasses([]);
      } finally {
        if (isMounted) {
          setIsLoadingClasses(false);
        }
      }
    };

    fetchLecturerClasses();

    return () => {
      isMounted = false;
    };
  }, [lecturerId]);

  const subjects = useMemo(
    () => Array.from(new Set(classes.map(cls => cls.subjectCode))),
    [classes]
  );

  const classInsights = useMemo(() => {
    return classes.map((cls) => ({
      ...cls
    }));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return classInsights.filter((cls) => {
      const matchesSearch =
        !normalizedSearch.length ||
        cls.className?.toLowerCase().includes(normalizedSearch) ||
        cls.subjectName?.toLowerCase().includes(normalizedSearch) ||
        cls.subjectCode?.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? cls.isActive : !cls.isActive);
      const matchesSubject = subjectFilter === 'all' || cls.subjectCode === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [classInsights, searchTerm, statusFilter, subjectFilter]);

  const stats = useMemo(() => {
    const totalStudents = classInsights.reduce((acc, cls) => acc + (cls.memberCount || 0), 0);
    const totalTeams = classInsights.reduce((acc, cls) => acc + (cls.teamCount || 0), 0);
    const activeClasses = classInsights.filter((cls) => cls.isActive).length;
    const averageClassSize = classInsights.length
      ? Math.round(totalStudents / classInsights.length)
      : 0;

    return {
      totalClasses: classInsights.length,
      totalStudents,
      totalTeams,
      activeClasses,
      averageClassSize
    };
  }, [classInsights]);

  const classStatCards = [
    {
      id: 'activeClasses',
      label: 'Active classes',
      value: `${stats.activeClasses}/${stats.totalClasses}`,
      description: 'Includes classes in delivery or grading state.',
      icon: AcademicCapIcon,
      iconWrapperClass: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'totalStudents',
      label: 'Students enrolled',
      value: stats.totalStudents,
      description: 'Active enrolments.',
      icon: UserGroupIcon,
      iconWrapperClass: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 'totalTeams',
      label: 'Teams tracked',
      value: stats.totalTeams,
      description: 'Derived from team records linked to each class.',
      icon: Squares2X2Icon,
      iconWrapperClass: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'averageClassSize',
      label: 'Average class size',
      value: stats.averageClassSize,
      description: 'Helps balance teams by spotting unusually large cohorts.',
      icon: ClipboardDocumentListIcon,
      iconWrapperClass: 'bg-amber-100 text-amber-600'
    }
  ];

  const formatDate = (input) => {
    if (!input) return 'TBA';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date(input));
  };

  const handleViewClass = (classId) => {
    // Navigate to Screen 07: Class Detail & Resource Management
    navigate(`/lecturer/classes/${classId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="w-full px-5 py-8 space-y-8 lg:px-7 2xl:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lecturer workspace</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">Class & Project Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Review active classes and logistics while we wait for richer milestone data from the backend.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-4">
            {showClassSkeleton
              ? classStatCards.map((card) => renderClassStatSkeleton(card.id))
              : classStatCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.id} className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-500">{card.label}</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{card.value}</p>
                        </div>
                        <div className={`rounded-md p-2 ${card.iconWrapperClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500">{card.description}</p>
                    </div>
                  );
                })}
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">My classes</h2>
                    <p className="text-[11px] text-slate-500">Search, filter, and jump into class-level management.</p>
                    {isLoadingClasses && (
                      <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        <SparklesIcon className="h-3 w-3 animate-spin" />
                        Refreshing data…
                      </p>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-2.5 lg:w-auto lg:flex-row lg:items-center">
                    <div className="relative w-full lg:w-48">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search class or subject"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <ChartBarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-36"
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-36"
                    >
                      <option value="all">All subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {showClassSkeleton ? (
                  <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) =>
                      renderClassCardSkeleton(`class-skeleton-${index}`)
                    )}
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="mt-10 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                    <DocumentTextIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-600">No classes match the selected filters yet.</p>
                    <p className="mt-1 text-xs text-slate-400">Adjust the search parameters or start drafting a new class plan.</p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {[...filteredClasses]
                      .sort((a, b) => {
                        if (a.isActive === b.isActive) {
                          return (a.className || '').localeCompare(b.className || '');
                        }
                        return a.isActive ? -1 : 1;
                      })
                      .map((cls) => {
                      const statusLabel = cls.isActive ? 'Active' : 'Inactive';
                      const statusBadgeClass = cls.isActive
                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                        : 'border border-rose-200 bg-rose-100 text-rose-700';

                      return (
                        <div
                          key={cls.classId}
                          className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-500/90 to-violet-500 px-4 py-3 text-white">
                            <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-white/15 blur-3xl transition group-hover:scale-110" />
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                                  {cls.subjectCode}
                                </span>
                                <h3 className="mt-1.5 text-lg font-semibold leading-snug">
                                  {cls.className}
                                </h3>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass}`}>
                                  <CheckCircleIcon className="h-3 w-3" />
                                  {statusLabel}
                                </span>
                                <Squares2X2Icon className="h-10 w-10 text-white/25" />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 px-4 py-3 text-sm text-slate-600 lg:flex-row lg:items-stretch lg:gap-4">
                            <dl className="flex flex-1 flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs">
                              <div className="flex items-center justify-between text-slate-700">
                                <dt className="font-medium uppercase tracking-wide text-slate-500">Enrol key</dt>
                                <dd className="text-sm font-semibold text-slate-900">{cls.enrolKey}</dd>
                              </div>
                              <div className="flex items-center justify-between text-slate-700">
                                <dt className="font-medium uppercase tracking-wide text-slate-500">Lecturer</dt>
                                <dd className="text-sm font-semibold text-slate-900">{cls.lecturerName ?? '—'}</dd>
                              </div>
                              {cls.createdDate && (
                                <div className="flex items-center justify-between text-slate-700">
                                  <dt className="font-medium uppercase tracking-wide text-slate-500">Created</dt>
                                  <dd className="text-sm font-semibold text-slate-900">{formatDate(cls.createdDate)}</dd>
                                </div>
                              )}
                            </dl>

                            <div className="flex flex-1 items-center justify-between gap-3 text-center">
                              <div className="flex-1 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Students</p>
                                <p className="mt-1 text-base font-semibold text-slate-900">{cls.memberCount}</p>
                              </div>
                              <div className="flex-1 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Teams</p>
                                <p className="mt-1 text-base font-semibold text-slate-900">{cls.teamCount}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row">
                            <button
                              onClick={() => handleViewClass(cls.classId)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                            >
                              <AcademicCapIcon className="h-4 w-4" />
                              Open class workspace
                            </button>
                            <button
                              onClick={() => navigate(`/lecturer/monitoring/${cls.classId}`)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                              <ChartBarIcon className="h-4 w-4" />
                              Performance monitor
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
                    <SparklesIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Frequent workflows to keep momentum while APIs finalise.</p>
                  <div className="mt-4 space-y-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-indigo-100 p-2 text-indigo-600">
                            <action.icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{action.label}</p>
                            <p className="text-xs text-slate-500">{action.description}</p>
                          </div>
                        </div>
                        <CheckCircleIcon className="h-4 w-4 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">Announcements</h2>
                    <MegaphoneIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Important updates and shared resources.</p>
                  <div className="mt-4 space-y-3">
                    {announcements.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.body}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">{formatDate(item.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassManagementDashboard;