import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  GitBranch,
  BookOpen
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getClassDetail } from '../../services/userService';
import { normaliseClassDetailPayload } from './classDetailNormalizer';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import { useAvatar } from '../../hooks/useAvatar';

const Avatar = ({ src, name, className = "" }) => {
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(name, src);

  if (shouldShowImage) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} object-cover bg-white`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} ${colorClass} flex items-center justify-center font-bold uppercase select-none shadow-sm border border-white`}
      style={{ fontSize: '0.85em' }}
    >
      {initials}
    </div>
  );
};

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clampProgress = (value) => (Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0);

const formatDate = (value, fallback = 'TBA') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusColor = (progress) => {
  if (progress >= 85) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (progress >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (progress >= 40) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const ClassProjectOverview = () => {
  const { classId } = useParams();
  const numericClassId = useMemo(() => toNumber(classId), [classId]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchDetail = async () => {
      if (!classId) return;
      setLoading(true);
      setError('');
      try {
        const response = await getClassDetail(classId);
        console.log("class detail response:", response);
        if (ignore) return;
        const normalised = normaliseClassDetailPayload(response, numericClassId);
        console.log("normalised class detail:", normalised);
        setDetail(normalised);
      } catch (err) {
        if (!ignore) setError('Unable to load class projects right now.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDetail();
    return () => { ignore = true; };
  }, [classId, numericClassId]);

  const summary = detail?.summary ?? {};
  const teams = detail?.teams ?? [];
  const students = detail?.students ?? [];
  const assignments = detail?.projectAssignments ?? [];
  const classTitle = summary?.name ?? detail?.className ?? 'Class Project Overview';

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: classTitle, href: `/lecturer/classes/${classId}` },

  ], [classId, classTitle]);

  const assignmentLookup = useMemo(() => {
    const lookup = new Map();
    assignments.forEach((assignment) => {
      if (assignment?.projectAssignmentId) lookup.set(assignment.projectAssignmentId, assignment);
    });
    return lookup;
  }, [assignments]);

  const projectCards = useMemo(() => {
    if (!teams.length) return [];
    console.log("test team:", teams);
    return teams.map((team, index) => {
      const rawProgress = toNumber(team?.avgProgress ?? team?.progress);
      const progress = rawProgress !== null ? clampProgress(rawProgress) : null;
      const dueDate = team?.project?.dueDate ?? team?.projectDueDate ?? team?.endDate;
      const assignment = assignmentLookup.get(team.projectAssignmentId);
      
      const memberNames = Array.isArray(team?.members)
        ? team.members.map(m => ({ name: m.name || m.fullname, img: m.avatarImg }))
        : [];

      return {
        id: team.id || team.teamId || index,
        teamName: team.name || team.teamName || `Team ${index + 1}`,
        projectName: team.project?.name || team.projectName || assignment?.projectName || 'Unassigned Project',
        progress,
        dueDate,
        members: memberNames,
        repo: team.gitLink || team.repository,
        assignmentId: assignment?.projectAssignmentId,
        teamImage: team?.teamImage,
      };
    }).sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }, [teams, assignmentLookup]);

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    console.log(projectCards);
    const cards = projectCards.filter(c => typeof c.progress === 'number');
    if (!cards.length) return null;
    return {
      avg: Math.round(cards.reduce((acc, c) => acc + (c.progress || 0), 0) / cards.length),
      onTrack: cards.filter(c => (c.progress || 0) >= 60).length,
      atRisk: cards.filter(c => (c.progress || 0) < 60).length,
      overdue: cards.filter(c => {
        if (!c.dueDate) return false;
        return new Date(c.dueDate) < new Date() && (c.progress || 0) < 100;
      }).length
    };
  }, [projectCards]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeFpt-200 border-t-orangeFpt-500"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50">
        <LecturerBreadcrumbs items={breadcrumbItems} />

        {/* --- HEADER --- */}
        <header className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-orangeFpt-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orangeFpt-600">
                  <Briefcase className="h-3.5 w-3.5" />
                  Project Workspace
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {detail?.semesterName || 'Current Term'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{classTitle}</h1>
                <p className="mt-2 text-slate-500 max-w-2xl">
                  Monitor active team boards, track milestone progress, and manage project assignments for this class.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  {summary?.totalStudents || detail?.memberCount || 0} Students
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600">
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  {summary?.totalTeams || detail?.teamCount || 0} Teams
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/lecturer/classes/${classId}/project-assignments`}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <BookOpen className="h-4 w-4" />
                Assignments
              </Link>
              <Link
                to={`/lecturer/classes/${classId}/create-project`}
                className="flex items-center gap-2 rounded-xl bg-orangeFpt-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orangeFpt-200 transition-all hover:bg-orangeFpt-600 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {/* --- STATS STRIP --- */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-500">Avg. Progress</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.avg}%</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-500">On Track</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.onTrack} <span className="text-sm font-normal text-slate-400">Teams</span></p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-500">At Risk</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.atRisk} <span className="text-sm font-normal text-slate-400">Teams</span></p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-500">Overdue</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.overdue} <span className="text-sm font-normal text-slate-400">Items</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

          {/* --- MAIN COLUMN: ACTIVE TEAMS --- */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Active Boards & Teams</h2>
            </div>

            {projectCards.length > 0 ? (
              <div className="flex flex-col gap-4">
                {projectCards.map((card) => (
                  <div key={card.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-orangeFpt-200 hover:shadow-md">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                      {/* Left: Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={card.teamImage}
                            name={card.teamName}
                            className="h-10 w-10 rounded-full"
                          />

                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-orangeFpt-600 transition-colors">{card.teamName}</h3>
                          {card.progress !== null && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(card.progress)}`}>
                              {card.progress}% Done
                            </span>
                          )}
                        </div>

                        <div className="pl-11">
                          <p className="font-medium text-slate-700">{card.projectName}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Due: {formatDate(card.dueDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>{card.assignmentId ? `#${card.assignmentId}` : 'No Assignment'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 pl-11 sm:pl-0">
                        {card.repo && (
                          <a href={card.repo} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                            <GitBranch className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          to={`/lecturer/classes/${classId}/team/${card.id}`}
                          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeFpt-500"
                        >
                          View Board
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 pl-11">
                      <div className="flex -space-x-2 overflow-hidden">
                        {card.members.length > 0 ? (
                          card.members.map((m, idx) => (
                            <Avatar
                              key={idx}
                              src={m.img}
                              name={m.name}
                              className="h-8 w-8 rounded-full ring-2 ring-white"
                            />
                          ))
                        ) : (
                          <span className="text-xs italic text-slate-400">No members assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <LayoutDashboard className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No Active Projects</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Teams in this class haven't started any projects yet. Create an assignment to get them started.
                </p>
              </div>
            )}
          </div>

          {/* --- SIDEBAR: ASSIGNMENTS & CONTRIBUTORS --- */}
          <aside className="space-y-6 xl:col-span-1">
            {/* Project Queue */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Project Queue</h3>
                <span className="text-xs font-semibold text-slate-500">{assignments.length} Total</span>
              </div>
              {assignments.length > 0 ? (
                <ul className="space-y-3">
                  {assignments.slice(0, 5).map((a) => (
                    <li key={a.projectAssignmentId} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 line-clamp-1">{a.projectName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Assigned {formatDate(a.assignedDate)}</p>
                      </div>
                      <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                        #{a.projectAssignmentId}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No assignments created yet.</p>
              )}
              <div className="mt-4 pt-2">
                <Link to={`/lecturer/classes/${classId}/project-assignments`} className="text-xs font-bold text-orangeFpt-500 hover:text-orangeFpt-600">View All Assignments →</Link>
              </div>
            </div>

            {/* Roster / Top Contributors */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Top Students</h3>
              </div>
              {students.length > 0 ? (
                <ul className="space-y-4">
                  {students.slice(0, 4).map((s) => (
                    <li key={s.id || s.studentId} className="flex items-center gap-3">
                      <Avatar
                        name={s.name || s.fullname}
                        src={s.avatarImg || s.avatar}
                        className="h-8 w-8 rounded-full"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">{s.name || s.fullname}</p>
                        <p className="truncate text-xs text-slate-500">{s.team || s.teamName || 'No Team'}</p>
                      </div>
                      {s.progress !== undefined && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {s.progress}%
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No students enrolled.</p>
              )}
            </div>
          </aside>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassProjectOverview;
