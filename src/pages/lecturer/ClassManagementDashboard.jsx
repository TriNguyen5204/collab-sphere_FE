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
  const PROJECT_ASSIGNMENT_STATUS = {
    1: { label: 'Drafted', category: 'draft' },
    2: { label: 'In delivery', category: 'active' },
    3: { label: 'Submitted', category: 'submitted' },
    4: { label: 'Archived', category: 'archived' }
  };

  const TEAM_MILESTONE_STATUS = {
    1: { label: 'Planned' },
    2: { label: 'In progress' },
    3: { label: 'Completed' },
    4: { label: 'Deferred' }
  };
  
  const [classes] = useState([
    {
      classId: 201,
      className: 'SE109 - Software Engineering Fundamentals',
      subjectCode: 'SE109',
      subjectName: 'Software Engineering Fundamentals',
      enrolKey: 'A9F-3K0',
      memberCount: 42,
      teamCount: 9,
      lecturerName: 'Dr. Sarah Chen',
      createdDate: '2025-08-12T09:00:00Z',
      isActive: true,
      projectAssignments: [
        {
          projectAssignmentId: 5001,
          projectId: 3001,
          projectName: 'AI Study Companion',
          projectStatus: 2,
          assignmentStatus: 2,
          assignedDate: '2025-08-15T09:00:00Z'
        },
        {
          projectAssignmentId: 5002,
          projectId: 3002,
          projectName: 'Code Quality Toolkit',
          projectStatus: 3,
          assignmentStatus: 3,
          assignedDate: '2025-09-05T09:00:00Z'
        }
      ],
      teamMilestones: [
        {
          teamMilestoneId: 7601,
          teamId: 4101,
          teamName: 'Team Alpha',
          title: 'User Testing Milestone',
          endDate: '2025-10-05T23:59:59Z',
          progress: 0.72,
          status: 2
        },
        {
          teamMilestoneId: 7602,
          teamId: 4102,
          teamName: 'Team Beta',
          title: 'Prototype Revision',
          endDate: '2025-10-02T23:59:59Z',
          progress: 0.55,
          status: 2
        }
      ],
      checkpointDeadlines: [
        {
          checkpointId: 9101,
          teamId: 4102,
          title: 'Sprint 3 Checkpoint',
          dueDate: '2025-10-02T23:59:59Z',
          status: 1
        },
        {
          checkpointId: 9102,
          teamId: 4101,
          title: 'Peer Evaluation Round 2',
          dueDate: '2025-10-04T17:00:00Z',
          status: 1
        }
      ],
      meetings: [
        {
          meetingId: 30101,
          title: 'Mentor Sync',
          scheduleTime: '2025-09-27T10:00:00Z',
          status: 2
        }
      ]
    },
    {
      classId: 202,
      className: 'SE203 - Advanced Database Systems',
      subjectCode: 'SE203',
      subjectName: 'Advanced Database Systems',
      enrolKey: 'J2X-7PD',
      memberCount: 36,
      teamCount: 8,
      lecturerName: 'Dr. Sarah Chen',
      createdDate: '2025-08-10T09:00:00Z',
      isActive: true,
      projectAssignments: [
        {
          projectAssignmentId: 5101,
          projectId: 3101,
          projectName: 'Intelligent Query Assistant',
          projectStatus: 2,
          assignmentStatus: 2,
          assignedDate: '2025-08-20T09:00:00Z'
        },
        {
          projectAssignmentId: 5102,
          projectId: 3102,
          projectName: 'Distributed Caching Dashboard',
          projectStatus: 2,
          assignmentStatus: 2,
          assignedDate: '2025-09-01T09:00:00Z'
        }
      ],
      teamMilestones: [
        {
          teamMilestoneId: 7701,
          teamId: 4201,
          teamName: 'Team Lambda',
          title: 'Prototype Demo Dry Run',
          endDate: '2025-09-30T17:00:00Z',
          progress: 0.41,
          status: 2
        },
        {
          teamMilestoneId: 7702,
          teamId: 4202,
          teamName: 'Team Sigma',
          title: 'Data Model Validation',
          endDate: '2025-10-01T12:00:00Z',
          progress: 0.64,
          status: 2
        }
      ],
      checkpointDeadlines: [
        {
          checkpointId: 9201,
          teamId: 4201,
          title: 'Schema Performance Checkpoint',
          dueDate: '2025-09-29T12:00:00Z',
          status: 1
        }
      ],
      meetings: [
        {
          meetingId: 30111,
          title: 'Database Lab Consultation',
          scheduleTime: '2025-09-26T15:00:00Z',
          status: 2
        }
      ]
    },
    {
      classId: 203,
      className: 'SE301 - Software Architecture & Design',
      subjectCode: 'SE301',
      subjectName: 'Software Architecture & Design',
      enrolKey: 'TBD',
      memberCount: 0,
      teamCount: 0,
      lecturerName: 'Dr. Sarah Chen',
      createdDate: '2025-09-18T09:00:00Z',
      isActive: false,
      projectAssignments: [
        {
          projectAssignmentId: 5201,
          projectId: 3201,
          projectName: 'Microservices Reference Architecture',
          projectStatus: 1,
          assignmentStatus: 1,
          assignedDate: '2025-09-20T09:00:00Z'
        }
      ],
      teamMilestones: [],
      checkpointDeadlines: [],
      meetings: []
    }
  ]);

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

  const subjects = useMemo(
    () => Array.from(new Set(classes.map(cls => cls.subjectCode))),
    [classes]
  );

  const classInsights = useMemo(() => {
    const now = new Date();

    return classes.map((cls) => {
      const projectAssignments = cls.projectAssignments ?? [];
      const activeAssignments = projectAssignments.filter((assignment) => assignment.assignmentStatus === 2).length;
      const submittedAssignments = projectAssignments.filter((assignment) => assignment.assignmentStatus === 3).length;

      const milestoneProgressValues = (cls.teamMilestones ?? []).map((milestone) => milestone.progress ?? 0);
      const avgMilestoneProgress =
        milestoneProgressValues.length > 0
          ? Math.round(
              (milestoneProgressValues.reduce((acc, value) => acc + value, 0) / milestoneProgressValues.length) * 100
            )
          : null;

      const deliverableCandidates = [
        ...(cls.teamMilestones ?? []).map((milestone) => ({
          id: `milestone-${milestone.teamMilestoneId}`,
          title: milestone.title,
          type: 'Team milestone',
          dueDate: milestone.endDate,
          teamName: milestone.teamName
        })),
        ...(cls.checkpointDeadlines ?? []).map((checkpoint) => ({
          id: `checkpoint-${checkpoint.checkpointId}`,
          title: checkpoint.title,
          type: 'Checkpoint',
          dueDate: checkpoint.dueDate,
          teamName: undefined
        })),
        ...(cls.meetings ?? []).map((meeting) => ({
          id: `meeting-${meeting.meetingId}`,
          title: meeting.title,
          type: 'Meeting',
          dueDate: meeting.scheduleTime,
          teamName: undefined
        }))
      ]
        .filter((event) => event.dueDate && new Date(event.dueDate) >= now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      const nextDeliverable = deliverableCandidates[0] || null;

      const isLowProgress = avgMilestoneProgress !== null && avgMilestoneProgress < 50;
      const isDeadlineSoon =
        nextDeliverable &&
        (new Date(nextDeliverable.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 3;

      let attentionTag = 'on-track';
      if (!cls.isActive) {
        attentionTag = 'inactive';
      } else if (isDeadlineSoon) {
        attentionTag = 'deadline-soon';
      } else if (isLowProgress) {
        attentionTag = 'low-progress';
      }

      return {
        ...cls,
        totalAssignments: projectAssignments.length,
        activeAssignments,
        submittedAssignments,
        avgMilestoneProgress,
        nextDeliverable,
        attentionTag
      };
    });
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classInsights.filter((cls) => {
      const matchesSearch =
        cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? cls.isActive : !cls.isActive);
      const matchesSubject = subjectFilter === 'all' || cls.subjectCode === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [classInsights, searchTerm, statusFilter, subjectFilter]);

  const stats = useMemo(() => {
    const totalStudents = classes.reduce((acc, cls) => acc + (cls.memberCount || 0), 0);
    const totalTeams = classes.reduce((acc, cls) => acc + (cls.teamCount || 0), 0);
    const activeClasses = classes.filter((cls) => cls.isActive).length;
    const assignedProjects = classes.reduce(
      (acc, cls) => acc + ((cls.projectAssignments && cls.projectAssignments.length) || 0),
      0
    );

    return {
      totalClasses: classes.length,
      totalStudents,
      totalTeams,
      activeClasses,
      assignedProjects
    };
  }, [classes]);

  const projectStatusSummary = useMemo(() => {
    return classes.reduce(
      (acc, cls) => {
        (cls.projectAssignments || []).forEach((assignment) => {
          const category = PROJECT_ASSIGNMENT_STATUS[assignment.assignmentStatus]?.category || 'draft';
          acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
      },
      { draft: 0, active: 0, submitted: 0, archived: 0 }
    );
  }, [classes, PROJECT_ASSIGNMENT_STATUS]);

  const totalTrackedProjects = useMemo(
    () => Object.values(projectStatusSummary).reduce((acc, value) => acc + value, 0),
    [projectStatusSummary]
  );

  const projectHealthCards = useMemo(
    () => [
      {
        key: 'draft',
        label: 'Drafted',
        count: projectStatusSummary.draft || 0,
        tone: 'text-slate-600',
        badgeClasses: 'bg-slate-100 text-slate-700',
        description: 'Awaiting lecturer activation'
      },
      {
        key: 'active',
        label: 'In delivery',
        count: projectStatusSummary.active || 0,
        tone: 'text-emerald-600',
        badgeClasses: 'bg-emerald-100 text-emerald-700',
        description: 'Teams currently working on milestones'
      },
      {
        key: 'submitted',
        label: 'Submitted for review',
        count: projectStatusSummary.submitted || 0,
        tone: 'text-indigo-600',
        badgeClasses: 'bg-indigo-100 text-indigo-700',
        description: 'Ready for evaluation and grading'
      },
      {
        key: 'archived',
        label: 'Archived',
        count: projectStatusSummary.archived || 0,
        tone: 'text-slate-600',
        badgeClasses: 'bg-slate-100 text-slate-600',
        description: 'Completed or inactive assignments'
      }
    ],
    [projectStatusSummary]
  );

  const formatDate = (input) => {
    if (!input) return 'TBA';
    return new Date(input).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const topTeams = useMemo(() => {
    const teamAggregate = new Map();

    classes.forEach((cls) => {
      (cls.teamMilestones || []).forEach((milestone) => {
        if (!teamAggregate.has(milestone.teamId)) {
          teamAggregate.set(milestone.teamId, {
            teamId: milestone.teamId,
            teamName: milestone.teamName,
            className: cls.className,
            classId: cls.classId,
            progressValues: [],
            upcoming: milestone.endDate,
            status: milestone.status
          });
        }

        const entry = teamAggregate.get(milestone.teamId);
        entry.progressValues.push(milestone.progress ?? 0);

        if (!entry.upcoming || (milestone.endDate && new Date(milestone.endDate) < new Date(entry.upcoming))) {
          entry.upcoming = milestone.endDate;
        }

        if (milestone.status !== undefined) {
          entry.status = milestone.status;
        }
      });
    });

    return Array.from(teamAggregate.values())
      .map((team) => ({
        ...team,
        progress: team.progressValues.length > 0
          ? Math.round(
              (team.progressValues.reduce((acc, value) => acc + value, 0) / team.progressValues.length) * 100
            )
          : 0
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4);
  }, [classes]);

  const upcomingDeliverables = useMemo(() => {
    const now = new Date();
    const events = [];

    classes.forEach((cls) => {
      (cls.teamMilestones || []).forEach((milestone) => {
        if (!milestone.endDate) return;
        events.push({
          id: `milestone-${milestone.teamMilestoneId}`,
          title: milestone.title,
          type: 'Team milestone',
          dueDate: milestone.endDate,
          classLabel: `${cls.subjectCode} · ${cls.className}`
        });
      });

      (cls.checkpointDeadlines || []).forEach((checkpoint) => {
        if (!checkpoint.dueDate) return;
        events.push({
          id: `checkpoint-${checkpoint.checkpointId}`,
          title: checkpoint.title,
          type: 'Checkpoint',
          dueDate: checkpoint.dueDate,
          classLabel: `${cls.subjectCode} · ${cls.className}`
        });
      });

      (cls.meetings || []).forEach((meeting) => {
        if (!meeting.scheduleTime) return;
        events.push({
          id: `meeting-${meeting.meetingId}`,
          title: meeting.title,
          type: 'Meeting',
          dueDate: meeting.scheduleTime,
          classLabel: `${cls.subjectCode} · ${cls.className}`
        });
      });
    });

    return events
      .filter((event) => new Date(event.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
  }, [classes]);

  const teamAlerts = useMemo(() => {
    const now = new Date();
    const alerts = [];

    classes.forEach((cls) => {
      (cls.teamMilestones || []).forEach((milestone) => {
        if (milestone.progress !== undefined && milestone.progress < 0.5) {
          alerts.push({
            id: `low-progress-${milestone.teamMilestoneId}`,
            team: `${milestone.teamName} · ${cls.subjectCode}`,
            message: 'Milestone progress below 50% completion',
            severity: 'medium',
            updatedAt: formatDate(milestone.endDate)
          });
        }

        if (milestone.endDate) {
          const daysUntilDue = (new Date(milestone.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (daysUntilDue <= 2) {
            alerts.push({
              id: `deadline-${milestone.teamMilestoneId}`,
              team: `${milestone.teamName} · ${cls.subjectCode}`,
              message: 'Milestone deadline approaching',
              severity: 'high',
              updatedAt: formatDate(milestone.endDate)
            });
          }
        }
      });

      (cls.checkpointDeadlines || []).forEach((checkpoint) => {
        if (!checkpoint.dueDate) return;
        const daysUntilDue = (new Date(checkpoint.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilDue <= 2) {
          alerts.push({
            id: `checkpoint-alert-${checkpoint.checkpointId}`,
            team: `${cls.subjectCode} · Team ${checkpoint.teamId}`,
            message: 'Checkpoint submission due within 48 hours',
            severity: 'high',
            updatedAt: formatDate(checkpoint.dueDate)
          });
        }
      });
    });

    if (alerts.length === 0) {
      return [];
    }

    const deduped = new Map();
    alerts.forEach((alert) => {
      if (!deduped.has(alert.id)) {
        deduped.set(alert.id, alert);
      }
    });

    return Array.from(deduped.values()).slice(0, 4);
  }, [classes]);

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const handleViewClass = (classId) => {
    // Navigate to Screen 07: Class Detail & Resource Management
    navigate(`/lecturer/classes/${classId}`);
  };

  const attentionStyles = {
    'deadline-soon': 'ring-amber-300 bg-amber-50 text-amber-700',
    'low-progress': 'ring-rose-300 bg-rose-50 text-rose-700',
    inactive: 'ring-slate-300 bg-slate-50 text-slate-500',
    'on-track': 'ring-emerald-300 bg-emerald-50 text-emerald-700'
  };

  const attentionCopy = {
    'deadline-soon': 'Deadline approaching',
    'low-progress': 'Progress needs review',
    inactive: 'Inactive section',
    'on-track': 'On track'
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Assigned projects</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.assignedProjects}</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Counting active `project_assignment` rows per class.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8 2xl:col-span-9">
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
                    {filteredClasses.map((cls) => {
                      const assignmentsPreview = (cls.projectAssignments || []).slice(0, 2);
                      return (
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
                            <div className="flex flex-col items-end gap-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(cls.isActive)}`}>
                                {cls.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${attentionStyles[cls.attentionTag]}`}>
                                <BellAlertIcon className="h-3 w-3" />
                                {attentionCopy[cls.attentionTag]}
                              </span>
                            </div>
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
                              <p className="text-xs uppercase tracking-wide text-slate-400">Active assignments</p>
                              <p className="text-base font-semibold text-slate-900">{cls.activeAssignments}/{cls.totalAssignments}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-slate-400">Avg milestone progress</p>
                              <p className="text-base font-semibold text-slate-900">{cls.avgMilestoneProgress !== null ? `${cls.avgMilestoneProgress}%` : '—'}</p>
                            </div>
                          </div>

                          {cls.nextDeliverable && (
                            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                              <p className="font-semibold text-slate-800">Next deliverable</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-slate-600">
                                  <CalendarDaysIcon className="h-3 w-3" />
                                  Due {formatDate(cls.nextDeliverable.dueDate)}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-slate-600">
                                  <ClipboardDocumentListIcon className="h-3 w-3" />
                                  {cls.nextDeliverable.type}
                                </span>
                                {cls.nextDeliverable.teamName && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-medium text-slate-600">
                                    <UserGroupIcon className="h-3 w-3" />
                                    {cls.nextDeliverable.teamName}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {assignmentsPreview.length > 0 && (
                            <div className="mt-4 text-xs text-slate-500">
                              <p className="font-semibold text-slate-700">Projects assigned</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {assignmentsPreview.map((assignment) => (
                                  <span
                                    key={assignment.projectAssignmentId}
                                    className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-600"
                                  >
                                    {assignment.projectName}
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-500">
                                      {PROJECT_ASSIGNMENT_STATUS[assignment.assignmentStatus]?.label || 'Unknown'}
                                    </span>
                                  </span>
                                ))}
                              </div>
                              {cls.totalAssignments > assignmentsPreview.length && (
                                <button
                                  onClick={() => navigate(`/lecturer/classes/${cls.classId}/projects`)}
                                  className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-800"
                                >
                                  View all project assignments
                                </button>
                              )}
                            </div>
                          )}

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
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Project health overview</h2>
                    <p className="text-xs text-slate-500">Snapshot across all tracked class projects.</p>
                  </div>
                  <ChartBarIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {projectHealthCards.map((card) => {
                    const percentage = totalTrackedProjects > 0
                      ? Math.round((card.count / totalTrackedProjects) * 100)
                      : 0;

                    return (
                      <div
                        key={card.key}
                        className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          <span>{card.label}</span>
                          <span className={`rounded-full px-2 py-1 ${card.badgeClasses}`}>{percentage}%</span>
                        </div>
                        <p className={`mt-3 text-2xl font-semibold ${card.tone}`}>{card.count}</p>
                        <p className="mt-1 text-xs text-slate-500">{card.description}</p>
                      </div>
                    );
                  })}
                </div>
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
                  <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming deadlines</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Keep track of the next major deliverables.</p>
                <div className="mt-4 space-y-4">
                  {upcomingDeliverables.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                      <p className="text-sm font-semibold text-slate-700">No upcoming deadlines</p>
                      <p className="mt-1 text-xs text-slate-500">New milestones, checkpoints, and meetings will appear here.</p>
                    </div>
                  ) : (
                    upcomingDeliverables.map((event) => (
                      <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                        <p className="text-xs text-slate-500">{event.type} · {formatDate(event.dueDate)}</p>
                        <p className="mt-1 text-xs font-medium text-indigo-500">{event.classLabel}</p>
                      </div>
                    ))
                  )}
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
                  <UserGroupIcon className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-900">Team progress spotlight</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">High-performing cohorts to recognise and model.</p>
                <div className="mt-4 space-y-4">
                  {topTeams.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                      <p className="text-sm font-semibold text-slate-700">No active teams yet</p>
                      <p className="mt-1 text-xs text-slate-500">Teams will appear here once milestones begin.</p>
                    </div>
                  ) : (
                    topTeams.map((team) => (
                      <div key={team.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{team.name}</p>
                            <p className="text-xs text-slate-500">{team.className} · {team.classId}</p>
                          </div>
                          <span className="text-lg font-semibold text-indigo-600">{team.progress}%</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                            <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                            Velocity {team.velocity}/wk
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            team.riskLevel === 'low'
                              ? 'bg-emerald-100 text-emerald-700'
                              : team.riskLevel === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            Risk {team.riskLevel}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-indigo-600">
                            <CalendarDaysIcon className="h-3 w-3" />
                            Next: {team.nextDeliverable}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
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