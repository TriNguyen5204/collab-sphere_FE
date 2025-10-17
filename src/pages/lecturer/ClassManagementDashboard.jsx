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
const ClassManagementDashboard = () => {
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

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

  const formatDate = (input) => {
    if (!input) return 'TBA';
    return new Date(input).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const handleViewClass = (classId) => {
    // Navigate to Screen 07: Class Detail & Resource Management
    navigate(`/lecturer/classes/${classId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="w-full px-6 py-10 space-y-10 lg:px-8 2xl:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Lecturer workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Class & Project Dashboard</h1>
              <p className="mt-2 text-sm text-slate-500">
                Review active classes and logistics while we wait for richer milestone data from the backend.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => navigate('/lecturer/classes')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
                View Class Library
              </button>
              <button
                onClick={() => navigate('/lecturer/create-project')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4" />
                New Project
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Active classes</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.activeClasses}/{stats.totalClasses}</p>
                </div>
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <AcademicCapIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Includes classes in delivery or grading state.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Students enrolled</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalStudents}</p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Active enrolments pulled from `class_member`.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Teams tracked</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalTeams}</p>
                </div>
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Squares2X2Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Derived from team records linked to each class.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Average class size</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.averageClassSize}</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Helps balance teams by spotting unusually large cohorts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8 2xl:col-span-9">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">My classes</h2>
                    <p className="text-xs text-slate-500">Search, filter, and jump into class-level management.</p>
                    {isLoadingClasses && (
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search class or subject"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <ChartBarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-40"
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-40"
                    >
                      <option value="all">All subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredClasses.length === 0 ? (
                  <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                    <DocumentTextIcon className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-600">No classes match the selected filters yet.</p>
                    <p className="mt-1 text-xs text-slate-400">Adjust the search parameters or start drafting a new class plan.</p>
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredClasses.map((cls) => (
                      <div
                        key={cls.classId}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{cls.subjectCode}</p>
                            <h3 className="mt-1 text-lg font-semibold text-slate-900">{cls.className}</h3>
                            <p className="mt-1 text-xs text-slate-500">Lecturer: {cls.lecturerName}</p>
                            <p className="mt-1 text-xs text-slate-500">Enrol key: {cls.enrolKey}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(cls.isActive)}`}>
                            {cls.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Students</p>
                            <p className="text-base font-semibold text-slate-900">{cls.memberCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Teams</p>
                            <p className="text-base font-semibold text-slate-900">{cls.teamCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Created</p>
                            <p className="text-base font-semibold text-slate-900">{cls.createdDate ? formatDate(cls.createdDate) : '—'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                            <p className="text-base font-semibold text-slate-900">{cls.isActive ? 'In delivery' : 'Inactive'}</p>
                          </div>
                        </div>

                        <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
                          <button
                            onClick={() => handleViewClass(cls.classId)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Open class workspace
                          </button>
                          <button
                            onClick={() => navigate(`/lecturer/monitoring/${cls.classId}`)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            Performance monitor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
                    <SparklesIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Frequent workflows to keep momentum while APIs finalise.</p>
                  <div className="mt-5 space-y-4">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.onClick}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                            <action.icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{action.label}</p>
                            <p className="text-xs text-slate-500">{action.description}</p>
                          </div>
                        </div>
                        <CheckCircleIcon className="h-5 w-5 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
                    <MegaphoneIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Important updates and shared resources.</p>
                  <div className="mt-5 space-y-4">
                    {announcements.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.body}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">{formatDate(item.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4 2xl:col-span-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Data coverage</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">This dashboard currently shows high-level class metadata.</p>
                <p className="mt-4 text-sm text-slate-600">
                  Project assignments, team milestones, and checkpoint timelines are hidden until the API provides those fields.
                  When they are available we can re-enable the project insights cards without further UI changes.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Next steps for lecturers</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Quick reminders to keep classes running smoothly.</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Share enrol keys with new students and verify roster changes weekly.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Use the announcements panel to broadcast resource updates or schedule shifts.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Jump into the class workspace to review submissions and message teams as needed.
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

export default ClassManagementDashboard;