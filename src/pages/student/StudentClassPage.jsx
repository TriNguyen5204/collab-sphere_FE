import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Calendar, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getClassesByStudentId, getClassDetailsById, getAssignedTeamByClassId } from '../../services/studentApi';
import { EnrolledClassesSkeleton, ClassDetailsSkeleton } from '../../components/skeletons/StudentSkeletons';
import { useSelector } from 'react-redux';
import StudentLayout from '../../components/layout/StudentLayout';
import ProjectCard from '../../components/student/ProjectCard';

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

  const handleViewMembers = () => {
    if (!selectedClass) return;
    const slug = slugify(selectedClass.className);
    navigate(`/student/${slug}/members`, { state: { details: selectedDetails } });
  };

  const handleViewProjects = () => {
    if (!selectedClass) return;
    const slug = slugify(selectedClass.className);
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
      setAssignedTeamByClassId((prev) => ({ ...prev, [classId]: team }));
      return team;
    } catch (error) {
      // toast.error(error.response?.data?.errorList?.[0]?.message || 'Failed to load assigned team');
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
      const list = await getClassesByStudentId(studentId);
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

  const handleAssignedTeamClick = (team) => {
    const teamId = team?.teamId;
    const projectId = team?.projectId;
    const projectName = team?.projectName || 'project';
    if (!teamId || !projectId) return;
    navigate(`/student/project/${projectId}/${encodeURIComponent(projectName)}/${teamId}/team-workspace`);
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">View your assigned classes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Assigned Classes ({classes.length})
                  </h2>
                  <button
                    onClick={() =>
                      toast.promise(fetchClasses(), {
                        loading: 'Refreshing classes...',
                        success: (list) => `Loaded ${list?.length ?? 0} classes`,
                        error: 'Failed to refresh classes',
                      })
                    }
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
                    disabled={loadingList}
                  >
                    {loadingList ? 'Loading…' : 'Refresh'}
                  </button>
                </div>

                {loadingList ? (
                  <EnrolledClassesSkeleton count={3} />
                ) : (
                  <div className="space-y-3">
                    {classes.map((c) => (
                      <div
                        key={c.classId}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedClassId === c.classId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedClassId(c.classId)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{c.subjectCode}</h3>
                            <p className="text-sm text-gray-600">{c.className}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded border font-semibold ${
                              c.isActive
                                ? 'text-green-900 bg-green-100 border-green-300'
                                : 'text-gray-700 bg-gray-100 border-gray-300'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Users className="w-3 h-3" />
                          <span>{c.memberCount ?? 0} members</span>
                        </div>
                      </div>
                    ))}
                    {!classes.length && !loadingList && (
                      <div className="text-sm text-gray-500">No classes found.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Class details */}
            <div className="lg:col-span-2">
              {selectedClass ? (
                loadingDetails && !selectedDetails ? (
                  <ClassDetailsSkeleton />
                ) : selectedDetails ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedDetails.className}</h2>
                        <p className="text-gray-600">
                          {selectedDetails.subjectCode} — {selectedDetails.subjectName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleViewMembers}
                          disabled={(selectedDetails?.classMembers?.length ?? 0) === 0}
                          className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View members"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Members ({selectedDetails?.classMembers?.length ?? 0})
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={handleViewProjects}
                          disabled={(selectedDetails?.projectAssignments?.length ?? 0) === 0}
                          className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View projects"
                        >
                          <span className="inline-flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Projects ({selectedDetails?.projectAssignments?.length ?? 0})
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={handleViewSyllabus}
                          disabled={!(selectedDetails?.subjectId || selectedDetails?.subject?.subjectId)}
                          className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View syllabus"
                        >
                          <span className="inline-flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Syllabus
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
                      {/* Lecturer */}
                      <div>
                        <p className="text-sm text-gray-500">Lecturer</p>
                        <p className="font-medium text-gray-900">{selectedDetails.lecturerName} - {selectedDetails.lecturerCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">
                          {selectedDetails.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Members</p>
                        <p className="font-medium text-gray-900">
                          {selectedDetails?.classMembers?.length ?? 0}
                        </p>
                      </div>

                      {/* Teams */}
                      <div>
                        <p className="text-sm text-gray-500">Teams</p>
                        <p className="font-medium text-gray-900">{selectedDetails.teams?.length ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Projects</p>
                        <p className="font-medium text-gray-900">
                          {selectedDetails?.projectAssignments?.length ?? 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedDetails.createdDate)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned Team</h3>
                      {isAssignedTeamLoading ? (
                        <div className="rounded-md border border-gray-200 p-4 animate-pulse text-sm text-gray-500">
                          Loading assigned team...
                        </div>
                      ) : assignedTeamCardData ? (
                        <div className="flex">
                          <ProjectCard project={assignedTeamCardData} onClick={() => handleAssignedTeamClick(assignedTeam)} />
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                          No team assigned for this class.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600">No details found for this class.</p>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Class</h3>
                  <p className="text-gray-600">Choose a class from the list to view details</p>
                </div>
              )}
            </div>
          </div>
    </StudentLayout>
  );
};

export default StudentClassPage;