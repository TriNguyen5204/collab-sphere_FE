import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  UserGroupIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './LecturerMonitoringDashboard.module.css';
import { getClassDetail } from '../../services/userService';
import { normaliseClassDetailPayload } from './classDetailNormalizer';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const SectionTitle = ({ title, action }) => (
  <div className="flex items-center justify-between gap-4">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {action}
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{title}</p>
    <p className="mt-3 text-sm text-slate-500">{description}</p>
  </div>
);

const LecturerMonitoringDashboard = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const numericClassId = Number.isFinite(Number(classId)) ? Number(classId) : undefined;

  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchDetail = async () => {
      if (!classId) {
        setClassDetail(null);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await getClassDetail(classId);
        if (ignore) {
          return;
        }
        const detail = normaliseClassDetailPayload(response, numericClassId);
        setClassDetail(detail);
      } catch (err) {
        if (ignore) {
          return;
        }
        console.error('Failed to load lecturer monitoring data.', err);
        setClassDetail(null);
        setError(err?.message ?? 'Unable to load class metrics right now.');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      ignore = true;
    };
  }, [classId, numericClassId, reloadKey]);

  const metrics = useMemo(() => {
    if (!classDetail) {
      return null;
    }

    const students = classDetail.students ?? [];
    const teams = classDetail.teams ?? [];
    const resources = classDetail.resources ?? [];
    const assignments = classDetail.projectAssignments ?? [];

    const studentsWithTeam = students.filter(
      (student) => student.teamId !== null && student.teamId !== undefined,
    ).length;

    const avgProgress = teams.length
      ? Math.round(
          teams.reduce((total, team) => {
            const progress = Number(team.avgProgress);
            return total + (Number.isFinite(progress) ? progress : 0);
          }, 0) / teams.length,
        )
      : null;

    return {
      studentCount: students.length,
      studentsWithTeam,
      unassignedStudents: Math.max(students.length - studentsWithTeam, 0),
      teamCount: teams.length,
      idleTeams: teams.filter((team) => !team.projectId).length,
      resourceCount: resources.length,
      assignmentCount: assignments.length,
      avgProgress,
    };
  }, [classDetail]);

  const summary = classDetail?.summary;
  const teams = classDetail?.teams ?? [];
  const resources = classDetail?.resources ?? [];
  const assignments = classDetail?.projectAssignments ?? [];

  const statCards = [
    {
      label: 'Students',
      value: metrics?.studentCount ?? '—',
      helper:
        metrics && metrics.studentCount > 0
          ? `${metrics.studentsWithTeam} assigned · ${metrics.unassignedStudents} pending`
          : 'Awaiting class data',
      icon: UserGroupIcon,
    },
    {
      label: 'Teams',
      value: metrics?.teamCount ?? '—',
      helper:
        metrics && metrics.teamCount > 0
          ? `${metrics.idleTeams} without project`
          : 'Create teams from Class Detail',
      icon: Squares2X2Icon,
    },
    {
      label: 'Avg team progress',
      value: metrics?.avgProgress !== null && metrics?.avgProgress !== undefined ? `${metrics.avgProgress}%` : '—',
      helper: 'Calculated from student progress snapshots',
      icon: ArrowTrendingUpIcon,
    },
    {
      label: 'Resources',
      value: metrics?.resourceCount ?? '—',
      helper: 'Class files available to students',
      icon: ClipboardDocumentListIcon,
    },
  ];

  const renderHeader = () => (
    <header className={`${styles.headerSection} flex-wrap gap-4`}>
      <div className="min-w-[260px]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Lecturer Monitoring</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {summary?.name || 'Class Monitoring'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {summary?.code ? `${summary.code} · ${summary.term || 'Term TBD'}` : summary?.term || 'Term not provided'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          <ArrowPathIcon className="h-4 w-4" /> Refresh data
        </button>
        <button
          type="button"
          onClick={() => navigate(`/lecturer/classes/${classId}`)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          Open class detail
        </button>
      </div>
    </header>
  );

  const renderStats = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">{stat.helper}</p>
          </div>
        );
      })}
    </div>
  );

  const renderTeams = () => (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <SectionTitle
        title="Team snapshot"
        action={
          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            onClick={() => navigate(`/lecturer/classes/${classId}`)}
          >
            Manage teams
          </button>
        }
      />
      {teams.length ? (
        <ul className="mt-4 space-y-3">
          {teams.map((team) => (
            <li key={team.id} className="rounded-2xl border border-slate-100 bg-white/90 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{team.name}</p>
                  <p className="text-sm text-slate-500">
                    {team.project?.name ? team.project.name : 'No project assigned'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Avg progress</p>
                  <p className="text-lg font-semibold text-slate-900">{team.avgProgress ?? '—'}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                  style={{ width: `${Math.min(Math.max(team.avgProgress ?? 0, 0), 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {team.members.length} members · Created {formatDate(team.createdDate)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No teams" description="Teams will appear after students are grouped in Class Detail." />
      )}
    </div>
  );

  const renderAssignments = () => (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <SectionTitle
        title="Project assignments"
        action={
          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            onClick={() => navigate(`/lecturer/classes/${classId}/projects`)}
          >
            Assign projects
          </button>
        }
      />
      {assignments.length ? (
        <ul className="mt-4 space-y-3">
          {assignments.slice(0, 6).map((assignment) => (
            <li
              key={assignment.projectAssignmentId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/90 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">Project #{assignment.projectId}</p>
                <p className="text-xs text-slate-500">Assigned {formatDate(assignment.assignedDate)}</p>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {assignment.status || 'pending'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No assignments" description="Use Assign projects to connect approved ideas with teams." />
      )}
    </div>
  );

  const renderResources = () => (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
      <SectionTitle
        title="Class resources"
        action={
          <button
            type="button"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            onClick={() => navigate(`/lecturer/classes/${classId}`)}
          >
            Manage resources
          </button>
        }
      />
      {resources.length ? (
        <ul className="mt-4 space-y-3">
          {resources.slice(0, 6).map((resource) => (
            <li key={resource.id} className="rounded-xl border border-slate-100 bg-white/90 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{resource.title}</p>
                  <p className="text-xs text-slate-500">
                    Uploaded {formatDate(resource.uploadDate)} · {resource.type || 'file'}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {resource.downloads} downloads
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No resources" description="Upload reference files from Class Detail to support students." />
      )}
    </div>
  );

  const renderInterventions = () => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 shadow-sm">
      <SectionTitle
        title="Interventions & alerts"
        action={
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
            <ExclamationTriangleIcon className="h-4 w-4" /> Pending API
          </span>
        }
      />
      <p className="mt-3 text-sm text-slate-600">
        This panel will surface milestone risks, checkpoint blockers, and evaluation follow-ups once the
        `/api/class/{classId}/progress`, `/api/class/{classId}/intervention-alerts`, and `/api/evaluate/*` endpoints are wired in.
        For now, open the class detail view to review milestones manually.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-500">
        <li>Team milestone completion rates (FE-05.5)</li>
        <li>Checkpoint delays and member contribution gaps (FE-05.6)</li>
        <li>Pending evaluation tasks per lecturer rubric (FE-05.7)</li>
      </ul>
    </div>
  );

  const renderBody = () => (
    <div className="space-y-6 p-6">
      {renderStats()}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {renderTeams()}
          {renderAssignments()}
        </div>
        <div className="space-y-6">
          {renderResources()}
          {renderInterventions()}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!classId) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <AcademicCapIcon className="h-12 w-12 text-indigo-400" />
          <p className="text-base text-slate-600">
            Select a class from the Class Management dashboard to open the monitoring workspace.
          </p>
          <button
            type="button"
            onClick={() => navigate('/lecturer/classes')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Go to classes
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-500">
          <ArrowPathIcon className="h-10 w-10 animate-spin" />
          <p>Loading class insights…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-base font-semibold text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-600"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!classDetail) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-500">
          <p>We could not find class data for this ID. Try refreshing or return to Class Management.</p>
          <button
            type="button"
            onClick={() => navigate('/lecturer/classes')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Back to classes
          </button>
        </div>
      );
    }

    return (
      <>
        {renderHeader()}
        {renderBody()}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className={styles.lecturerDashboard}>{renderContent()}</div>
    </DashboardLayout>
  );
};

export default LecturerMonitoringDashboard;
