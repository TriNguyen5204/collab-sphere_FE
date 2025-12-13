import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Calendar, FileText, Sparkles, RefreshCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getClassesByStudentId, getClassDetailsById, getAssignedTeamByClassId, getDetailOfTeamByTeamId } from '../../services/studentApi';
import { EnrolledClassesSkeleton, ClassDetailsSkeleton } from '../../features/student/components/skeletons/StudentSkeletons';
import { useSelector } from 'react-redux';
import StudentLayout from '../../components/layout/StudentLayout';
import ProjectCard from '../../features/student/components/ProjectCard';
import { useQueryClient } from '@tanstack/react-query';
import useTeam from '../../context/useTeam';

const StudentClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingAssignedTeamId, setLoadingAssignedTeamId] = useState(null);

  const [detailsById, setDetailsById] = useState({});
  const [assignedTeamByClassId, setAssignedTeamByClassId] = useState({});

  const studentId = useSelector(state => state.user.userId);

  const auth = useSelector(state => state.user);
  useEffect(() => {
    console.log('Auth state:', auth);
  }, [auth]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.classId === selectedClassId) || null,
    [classes, selectedClassId]
  );
  const selectedDetails = detailsById[selectedClassId] || null;

  const slugify = (str = '') =>
    String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setTeam } = useTeam();

  const handleViewMembers = () => {
    if (!selectedClass) return;
    const slug = slugify(selectedClass.className);
    navigate(`/student/${slug}/members`, { state: { details: selectedDetails } });
  };

  const handleViewProjects = () => {
    if (!selectedClass) return;
    const slug = slugify(selectedClass.className);
    console.log('Selected details for navigation:', selectedDetails);
    navigate(`/student/${slug}/projects`, { state: { details: selectedDetails } });
  };

  const handleViewSyllabus = () => {
    if (!selectedClass) return;
    const slug = slugify(selectedClass.className);
    navigate(`/student/${slug}/syllabus`, { state: { details: selectedDetails } });
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso ?? '';
    }
  };

  const fetchAssignedTeam = async (classId, force = false) => {
    if (!classId) return null;
    if (!force && Object.prototype.hasOwnProperty.call(assignedTeamByClassId, classId)) {
      return assignedTeamByClassId[classId];
    }
    try {
      setLoadingAssignedTeamId(classId);
      const response = await getAssignedTeamByClassId(classId);
      const team = response?.studentTeam ?? null;
      console.log('Fetched assigned team for classId', classId, response);
      setAssignedTeamByClassId((prev) => ({ ...prev, [classId]: team }));
      return team;
    } catch (error) {
      toast.error(error.response?.data?.errorList?.[0]?.message || 'Failed to load assigned team');
      setAssignedTeamByClassId((prev) => {
        const next = { ...prev };
        delete next[classId];
        return next;
      });
      return null;
    } finally {
      setLoadingAssignedTeamId((prev) => (prev === classId ? null : prev));
    }
  };

  const fetchClasses = async () => {
    if (!studentId) {
      toast.error('Missing student id');
      return [];
    }
    try {
      setLoadingList(true);
      const list = await getClassesByStudentId(studentId, { viewAll: true });
      console.log('Fetched classes:', list);
      setClasses(list);
      const ids = list.map((c) => c.classId);
      console.log('Class IDs:', ids);
      if (!ids.includes(selectedClassId) && ids.length) {
        setSelectedClassId(ids[0]);
      } else if (selectedClassId) {
        fetchAssignedTeam(selectedClassId, true);
      }
      return list;
    } finally {
      setLoadingList(false);
    }
  };

  const fetchDetails = async (classId) => {
    if (!classId) return null;
    if (detailsById[classId]) return detailsById[classId];
    try {
      setLoadingDetails(true);
      const details = await getClassDetailsById(classId);
      console.log('Fetched details for classId', classId, details);
      setDetailsById((prev) => ({ ...prev, [classId]: details }));
      return details;
    } catch (error) {
      toast.error('Failed to fetch class details');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    (async () => {
      const list = await fetchClasses();
      if (list.length) {
        fetchDetails(list[0].classId);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchDetails(selectedClassId);
      fetchAssignedTeam(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    const target = location.state?.selectClassId;
    if (target && classes.some(c => c.classId === target)) {
      setSelectedClassId(target);
    }
  }, [location.state, classes]);

  const classStats = useMemo(() => {
    const total = classes.length;
    const active = classes.filter((c) => c.isActive).length;
    const members = classes.reduce((acc, curr) => acc + (curr.memberCount ?? 0), 0);
    const teams = classes.reduce((acc, curr) => acc + (curr.teamCount ?? curr.teams?.length ?? 0), 0);
    return [
      { label: 'Total Classes', value: total },
      { label: 'Active', value: active },
      { label: 'Members', value: members },
      { label: 'Teams', value: teams },
    ];
  }, [classes]);

  const handleAssignedTeamClick = async (team) => {
    const teamId = team?.teamId;
    const projectId = team?.projectId;
    if (!teamId || !projectId) return;
    const normalizedTeamId = Number(teamId);
    if (!Number.isFinite(normalizedTeamId)) return;
    try {
      await queryClient.prefetchQuery({
        queryKey: ['team-detail', normalizedTeamId],
        queryFn: () => getDetailOfTeamByTeamId(normalizedTeamId),
      });
    } catch (error) {
      console.error('Failed to prefetch team details:', error);
    }
    setTeam(normalizedTeamId);
    navigate('/student/project/team-workspace');
  };

  const assignedTeam = assignedTeamByClassId[selectedClassId];
  const isAssignedTeamLoading = loadingAssignedTeamId === selectedClassId && !assignedTeam;
  const assignedTeamCardData = assignedTeam
    ? {
      ...assignedTeam,
      className: assignedTeam.className ?? selectedDetails?.className,
      lecturerName: assignedTeam.lecturerName ?? selectedDetails?.lecturerName,
    }
    : null;

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
          <div className="relative z-10 px-6 py-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Class Overview</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Master every class with ease</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Quickly switch classes, review lecturer details, and jump to teams or syllabi from one clean view.
                </p>
              </div>
              <div className="w-full max-w-xl">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {classStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-orangeFpt-100 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white px-4 py-3 shadow-sm shadow-orangeFpt-100/60 backdrop-blur"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-slate-900 flex justify-end">{stat.label}</p>
                      <p className="mt-1 text-xl font-semibold text-orangeFpt-500 flex justify-end">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-orangeFpt-100 bg-white/95 p-5 shadow-lg shadow-orangeFpt-100/40">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orangeFpt-500" />
                  Assigned Classes ({classes.length})
                </h2>
              </div>

              {loadingList ? (
                <EnrolledClassesSkeleton count={3} />
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {classes.map((c) => (
                    <button
                      key={c.classId}
                      type="button"
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${selectedClassId === c.classId
                        ? 'border-orangeFpt-200 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-inner'
                        : 'border-slate-200 hover:border-orangeFpt-00 bg-white'
                        }`}
                      onClick={() => setSelectedClassId(c.classId)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.subjectCode}</p>
                          <h3 className="text-base font-semibold text-slate-900">{c.className}</h3>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border font-semibold ${c.isActive
                          ? 'text-green-800 border-green-200 bg-green-50'
                          : 'text-slate-600 border-slate-200 bg-slate-50'
                          }`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{c.memberCount ?? 0} members</span>
                      </div>
                    </button>
                  ))}
                  {!classes.length && (
                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                      No classes found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedClass ? (
              loadingDetails && !selectedDetails ? (
                <ClassDetailsSkeleton />
              ) : selectedDetails ? (
                <div className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl shadow-slate-200/60">
                  {/* ... Header Section ... */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-orangeFpt-500">{selectedDetails.subjectCode}</p>
                      <h2 className="text-3xl font-semibold text-slate-900">{selectedDetails.className}</h2>
                      <p className="text-sm text-slate-500">{selectedDetails.subjectName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleViewMembers}
                        disabled={(selectedDetails?.classMembers?.length ?? 0) === 0}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-orangeFpt-200 hover:text-orangeFpt-600 disabled:opacity-50"
                      >
                        <Users className="w-4 h-4" />
                        Members ({selectedDetails?.classMembers?.length ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={handleViewProjects}
                        disabled={(selectedDetails?.projectAssignments?.length ?? 0) === 0}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-orangeFpt-200 hover:text-orangeFpt-600 disabled:opacity-50"
                      >
                        <BookOpen className="w-4 h-4" />
                        Projects ({selectedDetails?.projectAssignments?.length ?? 0})
                      </button>
                      <button
                        type="button"
                        onClick={handleViewSyllabus}
                        disabled={!(selectedDetails?.subjectId || selectedDetails?.subject?.subjectId)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-orangeFpt-200 hover:text-orangeFpt-600 disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                        Syllabus
                      </button>
                    </div>
                  </div>

                  {/* ... Stats Grid ... */}
                  <div className="grid grid-cols-1 gap-4 py-5 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Lecturer</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{selectedDetails.lecturerName}</p>
                      <p className="text-xs text-slate-500">{selectedDetails.lecturerCode}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedDetails.isActive ? 'Active' : 'Inactive'}</p>
                      <p className="text-xs text-slate-500">Created {formatDate(selectedDetails.createdDate)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Stats</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{selectedDetails?.classMembers?.length ?? 0} members</p>
                      <p className="text-xs text-slate-500">{selectedDetails.teams?.length ?? 0} teams</p>
                    </div>
                  </div>

                  {/* ... Assigned Team Section ... */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Assigned Team</h3>
                    {isAssignedTeamLoading ? (
                      <div className="rounded-2xl border border-slate-200 p-4 animate-pulse text-sm text-slate-500">
                        Loading assigned team...
                      </div>
                    ) : assignedTeamCardData ? (
                      <div className="flex">
                        <ProjectCard project={assignedTeamCardData} onClick={() => handleAssignedTeamClick(assignedTeam)} />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                        No team assigned for this class.
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            ) : (
              <div className="rounded-3xl border border-slate-100 bg-white/95 p-12 text-center shadow">
                <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-900 mb-2">Select a Class</h3>
                <p className="text-slate-500">Choose a class from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentClassPage;
