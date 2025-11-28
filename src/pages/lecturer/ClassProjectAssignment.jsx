import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  LockClosedIcon,
  ArrowPathIcon,
  FolderIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/DashboardLayout';
import { getLecturerProjects } from '../../services/projectApi';
import { getClassDetail } from '../../services/userService';
import { assignProjectsToClass } from '../../services/classApi';
import { toast } from 'sonner';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

// --- Helpers ---

const formatStatusLabel = (value) => {
  if (!value) return null;
  const trimmed = value.toString().trim();
  if (!trimmed) return null;
  return trimmed
    .replace(/[_\s]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const resolveStatusTone = (value) => {
  const token = value?.toString().trim().toUpperCase();
  if (!token) return null;
  if (['APPROVED', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'DONE'].includes(token)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (['PENDING', 'IN_REVIEW', 'AWAITING', 'PLANNING', 'DRAFT'].includes(token)) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (['DENIED', 'REJECTED', 'CANCELLED'].includes(token)) return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normaliseClassDetail = (payload) => {
  const base = payload ?? {};
  const summary = base.class ?? base.classInformation ?? base;
  const assignments = Array.isArray(base.projectAssignments)
    ? base.projectAssignments
    : Array.isArray(base.classProjects)
    ? base.classProjects
    : [];

  const assignedProjectIds = new Set();
  const lockedProjectIds = new Set();

  assignments.forEach((assignment) => {
    if (!assignment) return;
    const idCandidates = [
      assignment.projectId,
      assignment.projectID,
      assignment.project?.projectId,
      assignment.project?.id,
    ];
    const resolvedId = idCandidates.find((c) => c !== undefined && c !== null);
    if (resolvedId === undefined) return;
    
    const numericId = Number(resolvedId);
    if (!Number.isFinite(numericId)) return;

    assignedProjectIds.add(numericId);

    const locked =
      assignment.isAssignedToTeam === true ||
      assignment.isLocked === true ||
      (typeof assignment.teamCount === 'number' && assignment.teamCount > 0) ||
      (typeof assignment.assignedTeamsCount === 'number' && assignment.assignedTeamsCount > 0) ||
      (Array.isArray(assignment.assignedTeams) && assignment.assignedTeams.length > 0);

    if (locked) lockedProjectIds.add(numericId);
  });

  return {
    className: summary?.className ?? summary?.name ?? 'Unnamed Class',
    classCode: summary?.classCode ?? summary?.code ?? '',
    subjectName: summary?.subjectName ?? summary?.subjectTitle ?? summary?.subject?.subjectName ?? '',
    term: summary?.term ?? summary?.semester ?? summary?.period ?? '',
    assignedProjectIds,
    lockedProjectIds,
  };
};

const mapProjectRecord = (record) => {
  if (!record) return null;
  const idCandidates = [record.projectId, record.id, record.projectID, record.project?.projectId];
  const resolvedId = idCandidates.find((c) => c !== undefined && c !== null);
  if (resolvedId === undefined) return null;
  const numericId = Number(resolvedId);
  if (!Number.isFinite(numericId)) return null;

  return {
    id: numericId,
    name: record.projectName ?? record.name ?? record.title ?? 'Untitled project',
    subjectName: record.subjectName ?? record.subjectTitle ?? record.subject?.subjectName ?? '',
    subjectCode: record.subjectCode ?? record.subject?.subjectCode ?? '',
    description: record.description ?? record.summary ?? '',
    status: (record.statusString ?? record.projectStatus ?? '').toUpperCase(),
    updatedAt: record.updatedAt ?? record.lastUpdated ?? null,
    teamCount: record.teamCount ?? record.assignedTeamsCount ?? 0,
    objectives: Array.isArray(record.objectives) ? record.objectives : [],
  };
};

const formatDate = (input) => {
  if (!input) return 'Not updated yet';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Not updated yet';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const ClassProjectAssignment = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);

  const [isInitialising, setIsInitialising] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classDetail, setClassDetail] = useState(() => normaliseClassDetail(null));
  const [projects, setProjects] = useState([]);
  const [assignedProjectIds, setAssignedProjectIds] = useState(new Set());
  const [selectedProjectIds, setSelectedProjectIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    if (!classId || !lecturerId) {
      setIsInitialising(false);
      return;
    }
    setIsInitialising(true);
    try {
      const [classResponse, projectsResponse] = await Promise.all([
        getClassDetail(classId),
        getLecturerProjects(lecturerId),
      ]);

      const detail = normaliseClassDetail(classResponse);
      // Only show APPROVED projects in this list
      const projectList = extractArray(projectsResponse)
        .map(mapProjectRecord)
        .filter(p => p && p.status === 'APPROVED');

      setClassDetail(detail);
      setProjects(projectList);
      setAssignedProjectIds(new Set(detail.assignedProjectIds));
      setSelectedProjectIds(new Set());
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Unable to load assignments.');
    } finally {
      setIsInitialising(false);
    }
  }, [classId, lecturerId]);

  useEffect(() => { loadData(); }, [loadData]);

  const { assignedProjects, availableProjects } = useMemo(() => {
    const assigned = [];
    const available = [];
    projects.forEach((p) => {
      if (assignedProjectIds.has(p.id)) assigned.push(p);
      else available.push(p);
    });
    return { assignedProjects: assigned, availableProjects: available };
  }, [projects, assignedProjectIds]);

  const filteredAvailableProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return availableProjects;
    return availableProjects.filter((p) => 
      [p.name, p.subjectName, p.description].join(' ').toLowerCase().includes(term)
    );
  }, [availableProjects, searchTerm]);

  const projectSummary = useMemo(() => ({
    alreadyAssigned: assignedProjects.length,
    newlySelected: selectedProjectIds.size,
    availableToAssign: availableProjects.length,
  }), [assignedProjects.length, availableProjects.length, selectedProjectIds.size]);

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: classDetail.className || `Class ${classId}`, href: `/lecturer/classes/${classId}` },
    { label: 'Project assignments' },
  ], [classDetail.className, classId]);

  const handleToggleProject = (projectId) => {
    setSelectedProjectIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleSaveAssignments = async () => {
    if (!classId) return;
    const allAssignedIds = Array.from(new Set([...assignedProjectIds, ...selectedProjectIds]));
    setIsSaving(true);
    try {
      await assignProjectsToClass(classId, allAssignedIds);
      toast.success('Class projects updated successfully.');
      await loadData();
    } catch (error) {
      toast.error('Failed to update assignments.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSkeletonCard = (key) => (
    <div key={key} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
      <div className="h-6 w-2/3 rounded-lg bg-slate-100" />
      <div className="h-4 w-full rounded-lg bg-slate-50" />
      <div className="mt-2 flex gap-2">
        <div className="h-5 w-20 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded bg-slate-100" />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50 p-6 lg:p-8">
        
        {/* --- HEADER --- */}
        <div className="mx-auto max-w-6xl">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-col gap-2">
                   <Link to={`/lecturer/classes/${classId}`} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orangeFpt-600 transition-colors w-fit">
                      <ArrowLeftIcon className="h-4 w-4" />
                      Back to Class
                   </Link>
                   <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                         Assignment
                      </span>
                      <h1 className="text-3xl font-bold text-slate-900">Assign Projects</h1>
                   </div>
                </div>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Choose approved projects for <strong>{classDetail.className}</strong>. Students will be able to form teams around these assignments.
                </p>
              </div>

              {/* Stats Panel */}
              <div className="flex gap-3">
                 <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 p-4 min-w-[100px]">
                    <span className="text-2xl font-bold text-emerald-700">{projectSummary.alreadyAssigned}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Active</span>
                 </div>
                 <div className="flex flex-col items-center justify-center rounded-2xl bg-orangeFpt-50 border border-orangeFpt-100 p-4 min-w-[100px]">
                    <span className="text-2xl font-bold text-orangeFpt-600">{projectSummary.newlySelected}</span>
                    <span className="text-[10px] uppercase font-bold text-orangeFpt-600 tracking-wider">Selected</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* TOOLBAR */}
          <div className="sticky top-4 z-30 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between transition-all">
             <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search available projects..." 
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-3">
                <button 
                   onClick={() => navigate('/lecturer/projects')}
                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                   <FolderIcon className="h-5 w-5" />
                   Library
                </button>
                <button 
                   onClick={handleSaveAssignments}
                   disabled={isSaving || isInitialising || projectSummary.newlySelected === 0}
                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orangeFpt-500 text-sm font-semibold text-white shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                   {isSaving ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                   ) : (
                      <CheckCircleIcon className="h-5 w-5" />
                   )}
                   {isSaving ? 'Publishing...' : `Publish (${projectSummary.newlySelected})`}
                </button>
             </div>
          </div>

          {/* SECTION 1: ASSIGNED PROJECTS */}
          {assignedProjects.length > 0 && (
             <section className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                   <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                      <LockClosedIcon className="h-5 w-5" />
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-slate-800">Assigned to Class</h2>
                      <p className="text-sm text-slate-500">These projects are currently active.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                   {assignedProjects.map(project => (
                      <div key={project.id} className="group relative flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 transition-all">
                         <div>
                            <div className="mb-3 flex justify-between items-start gap-2">
                               <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                  <CheckCircleSolidIcon className="h-3.5 w-3.5" /> Assigned
                               </span>
                               {project.subjectCode && (
                                  <span className="text-xs font-semibold text-slate-400">{project.subjectCode}</span>
                               )}
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-1 mb-2" title={project.name}>{project.name}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                         </div>
                         <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                               <BookOpenIcon className="h-3.5 w-3.5" /> {project.subjectName}
                            </span>
                            {project.objectives?.length > 0 && (
                               <span className="flex items-center gap-1 font-medium text-emerald-600">
                                  <AcademicCapIcon className="h-3.5 w-3.5" /> {project.objectives.length} Objs
                               </span>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          )}

          {/* SECTION 2: AVAILABLE PROJECTS */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 px-1">
                <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                   <ClipboardDocumentListIcon className="h-5 w-5" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-slate-800">Available Library</h2>
                   <p className="text-sm text-slate-500">Select approved projects to add to this class.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {isInitialising ? (
                   Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(i))
                ) : filteredAvailableProjects.length > 0 ? (
                   filteredAvailableProjects.map(project => {
                      const isSelected = selectedProjectIds.has(project.id);
                      return (
                         <div 
                            key={project.id}
                            onClick={() => handleToggleProject(project.id)}
                            className={`group relative cursor-pointer flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${
                               isSelected 
                                  ? 'border-orangeFpt-500 bg-orangeFpt-50/40 ring-1 ring-orangeFpt-500' 
                                  : 'border-slate-200 bg-white hover:border-orangeFpt-300'
                            }`}
                         >
                            <div className="absolute top-4 right-4">
                               <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected 
                                     ? 'bg-orangeFpt-500 border-orangeFpt-500 text-white' 
                                     : 'bg-white border-slate-300 text-transparent group-hover:border-orangeFpt-300'
                               }`}>
                                  <CheckCircleSolidIcon className="h-4 w-4" />
                               </div>
                            </div>

                            <div>
                               <div className="mb-3">
                                  {project.subjectCode ? (
                                     <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {project.subjectCode}
                                     </span>
                                  ) : (
                                     <span className="text-xs font-bold text-slate-400">NO CODE</span>
                                  )}
                               </div>
                               <h3 className={`font-bold line-clamp-1 mb-2 pr-8 ${isSelected ? 'text-orangeFpt-900' : 'text-slate-900'}`} title={project.name}>
                                  {project.name}
                               </h3>
                               <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                               <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3.5 w-3.5" /> {formatDate(project.updatedAt)}
                               </span>
                               {project.objectives?.length > 0 && (
                                  <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                     <SparklesIcon className="h-3 w-3 text-orangeFpt-500" /> {project.objectives.length}
                                  </span>
                               )}
                            </div>
                         </div>
                      );
                   })
                ) : (
                   <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                      <InboxIcon className="h-12 w-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
                      <p className="text-sm text-slate-500">
                         {searchTerm ? 'Try adjusting your search terms.' : 'All approved projects are already assigned.'}
                      </p>
                   </div>
                )}
             </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassProjectAssignment;