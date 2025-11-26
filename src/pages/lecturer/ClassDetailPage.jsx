import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Calendar,
  Layers,
  MoreHorizontal,
  ArrowRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ClassDetailPage.module.css';
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

// --- Utility Functions ---
const formatDate = (value, fallback = '—') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name = '') => {
  const segments = String(name).trim().split(/\s+/).filter(Boolean);
  if (!segments.length) return 'NA';
  if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
  return (segments[0].charAt(0) + segments[segments.length - 1].charAt(0)).toUpperCase();
};

const getStatusColor = (status) => {
  if (status === "ACTIVE") return 'bg-green-100 text-green-700 border-green-200';
  if (status === "INACTIVE") return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-orangeFpt-100 text-orangeFpt-700 border-orangeFpt-200';
};

const ClassDetailPage = () => {
  const { classId } = useParams();
  const numericClassId = Number.isFinite(Number(classId)) ? Number(classId) : undefined;
  const [detail, setDetail] = useState(null);
  const [normalisedDetail, setNormalisedDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadDetail = async () => {
      if (!classId) return;
      setLoading(true);
      setError('');
      try {
        const response = await getClassDetail(classId);
        if (ignore) return;
        setDetail(response);
        setNormalisedDetail(normaliseClassDetailPayload(response, numericClassId));
      } catch (err) {
        if (!ignore) setError('Unable to load this class right now.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadDetail();
    return () => { ignore = true; };
  }, [classId, numericClassId]);

  // --- Derived State ---
  const summaryStats = useMemo(() => {
    if (!detail) return [];
    const assignmentTotal = detail.projectAssignments?.length || 0;
    return [
      {
        label: 'Students Enrolled',
        value: detail.memberCount ?? normalisedDetail?.summary?.totalStudents ?? 0,
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      },
      {
        label: 'Formed Teams',
        value: detail.teamCount ?? normalisedDetail?.summary?.totalTeams ?? 0,
        icon: Layers,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
      },
      {
        label: 'Assignments',
        value: assignmentTotal,
        icon: BookOpen,
        color: 'text-orangeFpt-600',
        bg: 'bg-orangeFpt-50'
      },
    ];
  }, [detail, normalisedDetail]);

  const teams = detail?.teams ?? [];
  const assignments = detail?.projectAssignments ?? [];
  const members = detail?.classMembers ?? [];

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: detail?.className ?? 'Class workspace' },
  ], [detail?.className]);

  // --- Render Helpers ---
  if (loading) return (
    <DashboardLayout>
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orangeFpt-200 border-t-orangeFpt-500"></div>
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

  if (!detail) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50 p-6 lg:p-8">

        {/* Breadcrumbs */}
        <LecturerBreadcrumbs items={breadcrumbItems} />

        {/* --- HERO SECTION --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
          <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-blue-50/50 blur-2xl"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-lg bg-orangeFpt-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-orangeFpt-700">
                  {detail.subjectCode || 'CLASS'}
                </span>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {detail.semesterName || 'Current Semester'}
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{detail.className}</h1>
                <p className="mt-2 text-lg text-slate-500">
                  {detail.subjectName || 'Class Management Workspace'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                    {getInitials(detail.lecturerName)}
                  </div>
                  <span className="font-medium">{detail.lecturerName || 'No Lecturer'}</span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div>
                  <span className="text-slate-400">Join Key: </span>
                  <code className="rounded bg-slate-100 px-2 py-1 font-mono font-bold text-slate-800">
                    {detail.enrolKey || '—'}
                  </code>
                </div>
              </div>
            </div>

            <Link
              to={`/lecturer/classes/${classId}/projects`}
              className="group flex items-center gap-2 rounded-xl bg-orangeFpt-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orangeFpt-200 transition-all hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 active:scale-95"
            >
              <BookOpen className="h-5 w-5" />
              <span>Manage Projects</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${detail.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {detail.isActive ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Class Status</p>
              <p className="text-xl font-bold text-slate-900">{detail.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

          {/* --- LEFT COL: TEAMS LIST --- */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Student Teams</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {teams.length}
                </span>
              </div>

              {teams.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {teams.map((team) => (
                    <div key={team.teamId} className="group relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        {/* --- USING NEW AVATAR COMPONENT --- */}
                        <Avatar
                          src={team.team?.teamImage || team.teamImage}
                          name={team.teamName}
                          className="h-10 w-10 rounded-full border border-slate-200 shadow-sm"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-orangeFpt-600 transition-colors">
                            {team.teamName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {team.projectName || 'No Project Selected'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="hidden flex-col items-end sm:flex">
                          <span className="text-xs uppercase tracking-wider text-slate-400">Due Date</span>
                          <span className="font-medium text-slate-700">{formatDate(team.endDate)}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(team.status)}`}>
                          {team.status === "ACTIVE" ? 'Active' : 'Inactive'}
                        </div>
                        <button className="text-slate-400 hover:text-orangeFpt-500">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12">
                  <Users className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-slate-500">No teams formed yet.</p>
                </div>
              )}
            </div>

            {/* --- ROSTER TABLE --- */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Class Roster</h2>
              </div>

              {members.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Team</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="hidden px-4 py-3 font-semibold sm:table-cell">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((member) => (
                        <tr key={member.classMemberId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={member.avatarImg}
                                name={member.fullname}
                                className="h-9 w-9 rounded-full border border-slate-200 shadow-sm"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{member.fullname}</p>
                                <p className="text-xs text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{member.studentCode || '—'}</td>
                          <td className="px-4 py-3">
                            {member.teamName ? (
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                {member.teamName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {member.teamRole === 1 && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orangeFpt-600">
                                <GraduationCap className="h-3 w-3" /> Leader
                              </span>
                            )}
                            {member.teamRole !== 1 && <span className="text-slate-500">Member</span>}
                          </td>
                          <td className="hidden px-4 py-3 text-xs sm:table-cell">
                            <div className="flex flex-col">
                              <span>{member.phoneNumber || '—'}</span>
                            </div>
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

          {/* --- RIGHT COL: ASSIGNMENTS --- */}
          <div className="flex flex-col gap-6 xl:col-span-1">
            <div className="sticky top-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Project Queue</h2>
              </div>

              {assignments.length > 0 ? (
                <div className={`flex flex-col gap-4 overflow-y-auto pr-1 ${styles.assignmentScroller}`} style={{ maxHeight: '800px' }}>
                  {assignments.map((assignment) => (
                    <div key={assignment.projectAssignmentId} className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-orangeFpt-200 hover:bg-orangeFpt-50/30 hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-orangeFpt-400">
                          #{assignment.projectAssignmentId}
                        </span>
                        <span className={`h-2 w-2 rounded-full ${assignment.status === 1 ? 'bg-green-500' : 'bg-orangeFpt-400'}`}></span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                          {assignment.projectName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {assignment.description || 'No description provided.'}
                        </p>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassDetailPage;