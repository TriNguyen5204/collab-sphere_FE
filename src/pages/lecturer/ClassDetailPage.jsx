import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Calendar,
  Plus,
  ArrowRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  LayoutDashboard,
  GitBranch,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getClassDetail } from '../../services/userService';
import { normaliseClassDetailPayload } from './classDetailNormalizer';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import { useAvatar } from '../../hooks/useAvatar';

// --- Avatar Component ---
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

// --- Utility Functions ---
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

const getInitials = (name = '') => {
  const segments = String(name).trim().split(/\s+/).filter(Boolean);
  if (!segments.length) return 'NA';
  if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
  return (segments[0].charAt(0) + segments[segments.length - 1].charAt(0)).toUpperCase();
};

const getProgressColor = (progress) => {
  if (progress >= 85) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (progress >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (progress >= 40) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const ClassDetailPage = () => {
  const { classId } = useParams();
  const numericClassId = useMemo(() => toNumber(classId), [classId]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    let ignore = false;
    const fetchDetail = async () => {
      if (!classId) return;
      setLoading(true);
      setError('');
      try {
        const response = await getClassDetail(classId);
        if (ignore) return;
        console.log('Raw class detail response:', response);
        const normalised = normaliseClassDetailPayload(response, numericClassId);
        console.log('Normalised class detail:', normalised);
        setDetail(normalised);
      } catch (err) {
        if (!ignore) setError('Unable to load class details right now.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDetail();
    return () => { ignore = true; };
  }, [classId, numericClassId]);

  // --- Derived Data ---
  const summary = detail?.summary ?? {};
  const teams = detail?.teams ?? [];
  const students = detail?.students ?? [];
  const assignments = detail?.projectAssignments ?? [];
  const classTitle = summary?.name ?? detail?.className ?? 'Class Workspace';

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: classTitle },
  ], [classTitle]);

  const assignmentLookup = useMemo(() => {
    const lookup = new Map();
    assignments.forEach((assignment) => {
      if (assignment?.projectAssignmentId) lookup.set(assignment.projectAssignmentId, assignment);
    });
    return lookup;
  }, [assignments]);

  // Transform teams into detailed cards (Logic from ProjectOverview)
  const projectCards = useMemo(() => {
    if (!teams.length) return [];

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
        status: team.status
      };
    }).sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }, [teams, assignmentLookup]);

  // Stats Calculation (Logic from ProjectOverview)
  const stats = useMemo(() => {
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

  if (error) return (
    <DashboardLayout>
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        {error}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50">
        <LecturerBreadcrumbs items={breadcrumbItems} />

        {/* --- HEADER (Merged Hero) --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
          <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-blue-50/50 blur-2xl"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-lg bg-orangeFpt-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-orangeFpt-700">
                  {summary.subjectCode || 'CLASS'}
                </span>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {summary.term || 'Current Semester'}
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{classTitle}</h1>
                <p className="mt-2 text-lg text-slate-500">
                  {summary.subjectName || 'Class Management Workspace'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Lecturer: {summary.instructor || 'No Lecturer'}</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {summary.totalStudents || 0} Students
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                    <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                    {summary.totalTeams || 0} Teams
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/lecturer/classes/${classId}/project-assignments`}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <BookOpen className="h-4 w-4" />
                Assignments
              </Link>
              {/* UPDATED BUTTON: Create Team */}
              <Link
                to={`/lecturer/classes/${classId}/create-team`}
                className="flex items-center gap-2 rounded-xl bg-orangeFpt-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orangeFpt-200 transition-all hover:bg-orangeFpt-600 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Create Team
              </Link>
            </div>
          </div>
        </div>

        {/* --- STATS STRIP (From Overview) --- */}
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

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 mx-auto">

          {/* --- LEFT COLUMN: TEAMS & ROSTER --- */}
          <div className="flex flex-col gap-8 xl:col-span-2">

            {/* 1. ACTIVE BOARDS / TEAMS */}
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-slate-500" />
                Active Teams
              </h2>

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
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getProgressColor(card.progress)}`}>
                                {card.progress}% Done
                              </span>
                            )}
                          </div>

                          <div className="pl-13 sm:pl-12">
                            <p className="font-medium text-slate-700">{card.projectName}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due: {formatDate(card.dueDate)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                <span>{card.members.length} Members</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 pl-12 sm:pl-0">
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

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 pl-12">
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
                    Teams in this class haven't started any projects yet.
                  </p>
                  <Link
                    to={`/lecturer/classes/${classId}/create-team`}
                    className="mt-4 text-sm font-bold text-orangeFpt-600 hover:text-orangeFpt-700"
                  >
                    Create a Team Now &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* 2. CLASS ROSTER */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Class Roster</h2>
              </div>

              {students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">Code</th>
                        <th className="px-4 py-3 font-semibold">Team</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={member.avatarImg}
                                name={member.name}
                                className="h-9 w-9 rounded-full border border-slate-200 shadow-sm"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{member.name}</p>
                                <p className="text-xs text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{member.code || '—'}</td>
                          <td className="px-4 py-3">
                            {member.team ? (
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                {member.team}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {member.role === 'leader' && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orangeFpt-600">
                                <GraduationCap className="h-3 w-3" /> Leader
                              </span>
                            )}
                            {member.role === 'member' && <span className="text-slate-500">Member</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">No students enrolled.</div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <aside className="space-y-6 xl:col-span-1">
            <div className="sticky top-6 space-y-6">

              {/* Assignment Queue */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Assignments</h2>
                  <Link to={`/lecturer/classes/${classId}/project-assignments`} className="text-xs font-bold text-orangeFpt-500 hover:text-orangeFpt-600">
                    View All
                  </Link>
                </div>

                {assignments.length > 0 ? (
                  <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {assignments.map((assignment) => (
                      <div key={assignment.projectAssignmentId} className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-orangeFpt-200 hover:bg-orangeFpt-50/30 hover:shadow-sm">
                        <div className="flex  justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                              {assignment.projectName}
                            </h3>
                            <h4 className="text-xs text-slate-500 mt-1">{assignment.description}</h4>
                          </div>
                          <span className={`h-2 w-2 rounded-full bg-green-500`}></span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-3">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600">
                            Assigned: {formatDate(assignment.assignedDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No assignments active.
                  </div>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassDetailPage;