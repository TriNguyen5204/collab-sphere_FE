import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  PlusIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ClassManagementDashboard = () => {
  const navigate = useNavigate();
  
  const [classes] = useState([
    {
      id: 'SE109-2025',
      name: 'SE109',
      fullName: 'Software Engineering Fundamentals',
      semester: 'Fall 2025',
      enrolledStudents: 42,
      teams: 9,
      status: 'Active',
      joinCode: 'A9F-3K0',
      lastActivity: '2025-09-20T10:00:00Z',
      progress: 78,
      nextSession: 'Mon · 10:00 AM',
      upcomingMilestone: {
        title: 'Milestone 2 Review',
        dueDate: '2025-10-05T23:59:59Z'
      },
      attentionLevel: 'low'
    },
    {
      id: 'SE203-2025',
      name: 'SE203',
      fullName: 'Advanced Database Systems',
      semester: 'Fall 2025',
      enrolledStudents: 36,
      teams: 8,
      status: 'Grading',
      joinCode: 'J2X-7PD',
      lastActivity: '2025-09-19T09:30:00Z',
      progress: 64,
      nextSession: 'Tue · 13:30 PM',
      upcomingMilestone: {
        title: 'Prototype Demo',
        dueDate: '2025-09-30T17:00:00Z'
      },
      attentionLevel: 'medium'
    },
    {
      id: 'SE301-2026',
      name: 'SE301',
      fullName: 'Software Architecture & Design',
      semester: 'Spring 2026',
      enrolledStudents: 0,
      teams: 0,
      status: 'Planned',
      joinCode: 'TBD',
      lastActivity: null,
      progress: 0,
      nextSession: 'Planning',
      upcomingMilestone: null,
      attentionLevel: 'none'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const [upcomingEvents] = useState([
    {
      id: 'event-1',
      title: 'Database Project Prototype Demo',
      classId: 'SE203-2025',
      dueDate: '2025-09-30T17:00:00Z',
      type: 'Milestone'
    },
    {
      id: 'event-2',
      title: 'SE109 Checkpoint Submission',
      classId: 'SE109-2025',
      dueDate: '2025-10-02T23:59:59Z',
      type: 'Checkpoint'
    },
    {
      id: 'event-3',
      title: 'Curriculum Sync with HOD',
      classId: 'SE301-2026',
      dueDate: '2025-10-04T09:00:00Z',
      type: 'Planning'
    }
  ]);

  const [teamAlerts] = useState([
    {
      id: 'alert-1',
      team: 'Team Lambda · SE203',
      message: 'Behind on prototype deliverables',
      severity: 'high',
      updatedAt: '2h ago'
    },
    {
      id: 'alert-2',
      team: 'Team Beta · SE109',
      message: 'Peer evaluation pending for two members',
      severity: 'medium',
      updatedAt: '6h ago'
    }
  ]);

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
      body: 'Submit updated module syllabi to Head of Department by Oct 7.',
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

  const semesters = useMemo(
    () => Array.from(new Set(classes.map(cls => cls.semester))),
    [classes]
  );

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesSearch =
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || cls.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSemester = semesterFilter === 'all' || cls.semester === semesterFilter;
      return matchesSearch && matchesStatus && matchesSemester;
    });
  }, [classes, searchTerm, semesterFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalStudents = classes.reduce((acc, cls) => acc + cls.enrolledStudents, 0);
    const totalTeams = classes.reduce((acc, cls) => acc + cls.teams, 0);
    const activeClasses = classes.filter(cls => cls.status.toLowerCase() === 'active').length;
    const avgProgress =
      classes.length > 0
        ? Math.round(classes.reduce((acc, cls) => acc + cls.progress, 0) / classes.length)
        : 0;

    return {
      totalClasses: classes.length,
      totalStudents,
      totalTeams,
      activeClasses,
      avgProgress
    };
  }, [classes]);

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border border-green-200';
      case 'grading': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'planned': return 'bg-gray-100 text-gray-700 border border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleViewClass = (classId) => {
    // Navigate to Screen 07: Class Detail & Resource Management
    navigate(`/lecturer/classes/${classId}`);
  };

  const formatDate = (input) => {
    if (!input) return 'TBA';
    return new Date(input).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const attentionStyles = {
    high: 'ring-red-300 bg-red-50 text-red-700',
    medium: 'ring-amber-300 bg-amber-50 text-amber-700',
    low: 'ring-emerald-300 bg-emerald-50 text-emerald-700',
    none: 'ring-slate-200 bg-slate-50 text-slate-500'
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Lecturer workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Class & Project Dashboard</h1>
              <p className="mt-2 text-sm text-slate-500">
                Review active classes, upcoming milestones, and teams that need attention while awaiting live data feeds.
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Students engaged</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalStudents}</p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Total enrolment across current term sections.</p>
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
              <p className="mt-3 text-xs text-slate-500">Includes project and lab-based cohorts.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Average progress</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.avgProgress}%</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <ArrowTrendingUpIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Based on submitted checkpoints and milestone completion.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">My classes</h2>
                    <p className="text-xs text-slate-500">Search, filter, and jump into class-level management.</p>
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
                      <option value="all">All status</option>
                      <option value="Active">Active</option>
                      <option value="Grading">Grading</option>
                      <option value="Planned">Planned</option>
                    </select>
                    <select
                      value={semesterFilter}
                      onChange={(e) => setSemesterFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-40"
                    >
                      <option value="all">All semesters</option>
                      {semesters.map((semester) => (
                        <option key={semester} value={semester}>{semester}</option>
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
                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    {filteredClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-900">{cls.name}</h3>
                              <span className="text-xs font-medium text-indigo-600">{cls.semester}</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{cls.fullName}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(cls.status)}`}>
                            {cls.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className="h-4 w-4 text-indigo-500" />
                            <div>
                              <p className="font-semibold text-slate-900">{cls.enrolledStudents}</p>
                              <p className="text-xs text-slate-500">Students enrolled</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AcademicCapIcon className="h-4 w-4 text-indigo-500" />
                            <div>
                              <p className="font-semibold text-slate-900">{cls.teams}</p>
                              <p className="text-xs text-slate-500">Active teams</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span className="font-semibold text-slate-700">{cls.progress}%</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${cls.progress}%` }} />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                            <CalendarDaysIcon className="h-3.5 w-3.5" />
                            Next session: {cls.nextSession}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ring-1 ${attentionStyles[cls.attentionLevel]}`}>
                            <BellAlertIcon className="h-3.5 w-3.5" />
                            {cls.attentionLevel === 'none' ? 'On track' : `${cls.attentionLevel} attention`}
                          </span>
                        </div>

                        {cls.upcomingMilestone && (
                          <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
                            <p className="font-semibold">Upcoming: {cls.upcomingMilestone.title}</p>
                            <p className="mt-1">Due {formatDate(cls.upcomingMilestone.dueDate)}</p>
                          </div>
                        )}

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                          <button
                            onClick={() => handleViewClass(cls.id)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            Manage class
                          </button>
                          <button
                            onClick={() => navigate(`/lecturer/monitoring/${cls.id}`)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                          >
                            Open monitoring
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

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming deadlines</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Keep track of the next major deliverables.</p>
                <div className="mt-4 space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.type} · {formatDate(event.dueDate)}</p>
                      <p className="mt-1 text-xs font-medium text-indigo-500">{event.classId}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Teams needing attention</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Early-warning signals driven by interim analytics.</p>
                <div className="mt-4 space-y-4">
                  {teamAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{alert.team}</p>
                        <p className="mt-1 text-xs text-slate-600">{alert.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          alert.severity === 'high'
                            ? 'bg-red-100 text-red-600'
                            : alert.severity === 'medium'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-400">{alert.updatedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <BellAlertIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Readiness checklist</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Quick reminders to stay aligned with programme governance.</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Confirm grading rubric for SE203 caps milestone demo.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Upload lecture notes to SE109 resource library before next session.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    Draft spring syllabus updates for SE301 ahead of approval workflow.
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