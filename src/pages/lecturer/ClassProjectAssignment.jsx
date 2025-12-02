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
   UserIcon,
   FunnelIcon,
   InboxIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getClassProjects, getProjects } from '../../services/projectApi';
import { getClassDetail } from '../../services/userService';
import { assignProjectsToClass } from '../../services/classApi';
import { toast } from 'sonner';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

// --- Helpers ---

const extractArray = (payload) => {
   if (Array.isArray(payload)) return payload;
   if (Array.isArray(payload?.list)) return payload.list;
   if (Array.isArray(payload?.data)) return payload.data;
   if (Array.isArray(payload?.items)) return payload.items;
   return [];
};

const formatDate = (input) => {
   if (!input) return 'Not updated yet';
   const date = new Date(input);
   if (Number.isNaN(date.getTime())) return 'Not updated yet';
   return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const normaliseProject = (record) => {
   if (!record) return null;
   const idCandidates = [record.projectId, record.id, record.projectID, record.project?.projectId];
   const resolvedId = idCandidates.find((c) => c !== undefined && c !== null);
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
      objectives: Array.isArray(record.objectives) ? record.objectives : [],
      lecturerName: record.lecturerName ?? '',
   };
};

const ClassProjectAssignment = () => {
   const { classId } = useParams();
   const navigate = useNavigate();
   const lecturerId = useSelector((state) => state.user?.userId);

   const [isInitialising, setIsInitialising] = useState(true);
   const [isSaving, setIsSaving] = useState(false);

   // Data State
   const [classDetail, setClassDetail] = useState(null);
   const [assignedProjects, setAssignedProjects] = useState([]); // Projects ALREADY in the class
   const [candidateProjects, setCandidateProjects] = useState([]); // Projects available to pick from

   // UI State
   const [selectedProjectIds, setSelectedProjectIds] = useState(new Set());
   const [searchTerm, setSearchTerm] = useState('');
   const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' (Subject) | 'MY' (Lecturer specific)

   // --- 1. Load Data Strategy ---
   const loadData = useCallback(async () => {
      if (!classId || !lecturerId) {
         setIsInitialising(false);
         return;
      }
      setIsInitialising(true);
      try {
         // Step A: Get Class Details (we need the subjectId)
         const classResponse = await getClassDetail(classId);
         const subjectId = classResponse?.subjectId;

         if (!subjectId) {
            toast.error('Class subject not found. Cannot load projects.');
            setClassDetail(classResponse);
            return;
         }

         // Step B: Prepare Query based on Filter Mode
         // If 'ALL': Get all projects for this subject
         // If 'MY': Get projects for this subject AND this lecturer
         // const candidateQuery = { subjectIds: subjectId };
         // if (filterMode === 'MY') {
         //   candidateQuery.lecturerIds = lecturerId;
         // }
         let candidateQuery = {};
         switch (filterMode) {
            case 'MY':
               candidateQuery = { subjectIds: subjectId, lecturerIds: lecturerId };
               break;
            case 'ALL':
            default:
               candidateQuery = { subjectIds: subjectId };
               break;
         }


         // Step C: Fetch lists in parallel
         const [assignedData, candidateData] = await Promise.all([
            getClassProjects(classId),
            getProjects(candidateQuery)
         ]);
         console.log('Raw assigned projects data:', assignedData);
         console.log('Raw candidate projects data:', candidateData);

         // Step D: Update State
         setClassDetail(classResponse);
         setAssignedProjects(extractArray(assignedData).map(normaliseProject).filter(Boolean));
         setCandidateProjects(extractArray(candidateData).map(normaliseProject).filter(Boolean));

         // Reset selections on reload to prevent stale IDs
         setSelectedProjectIds(new Set());

      } catch (error) {
         console.error('Failed to load assignment data', error);
         toast.error('Unable to load assignments.');
      } finally {
         setIsInitialising(false);
      }
   }, [classId, lecturerId, filterMode]); // Added filterMode dependency

   useEffect(() => { loadData(); }, [loadData]);

   // --- 2. Derived State for UI ---

   // Determine which projects are truly "Available"
   // Logic: Take Candidate Projects -> Filter out anything that appears in Assigned Projects
   const availableProjects = useMemo(() => {
      const assignedIds = new Set(assignedProjects.map(p => p.id));
      return candidateProjects.filter(p => !assignedIds.has(p.id));
   }, [assignedProjects, candidateProjects]);

   // Filter available projects by search term
   const filteredAvailableProjects = useMemo(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return availableProjects;
      return availableProjects.filter((p) =>
         [p.name, p.subjectName, p.description, p.lecturerName].join(' ').toLowerCase().includes(term)
      );
   }, [availableProjects, searchTerm]);

   const stats = useMemo(() => ({
      assignedCount: assignedProjects.length,
      selectedCount: selectedProjectIds.size,
      availableCount: availableProjects.length
   }), [assignedProjects.length, selectedProjectIds.size, availableProjects.length]);

   const breadcrumbItems = useMemo(() => [
      { label: 'Classes', href: '/lecturer/classes' },
      { label: classDetail?.className || `Class ${classId}`, href: `/lecturer/classes/${classId}` },
      { label: 'Project assignments' },
   ], [classDetail, classId]);

   // --- 3. Handlers ---

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

      const existingIds = assignedProjects.map(p => p.id);
      const newIds = Array.from(selectedProjectIds);
      const allIdsToAssign = [...existingIds, ...newIds];

      setIsSaving(true);
      try {
         await assignProjectsToClass(classId, allIdsToAssign);
         toast.success(`Successfully assigned ${newIds.length} new project(s).`);
         await loadData();
      } catch (error) {
         console.error(error);
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
         <div className="min-h-screen space-y-8 bg-slate-50/50">
            {/* --- HEADER --- */}
            <LecturerBreadcrumbs items={breadcrumbItems} />
            <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
               <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>

               <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4 max-w-2xl">
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <h1 className="text-3xl font-bold text-slate-900">Assign Projects</h1>
                        </div>
                     </div>
                     <p className="text-lg text-slate-500 leading-relaxed">
                        Manage projects for <strong>{classDetail?.className || '...'}</strong> ({classDetail?.subjectCode}).
                        Projects assigned here will be available for student teams.
                     </p>
                  </div>

                  {/* Stats Panel */}
                  <div className="flex gap-3">
                     <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 p-4 min-w-[100px]">
                        <span className="text-2xl font-bold text-emerald-700">{stats.assignedCount}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Assigned</span>
                     </div>
                     <div className="flex flex-col items-center justify-center rounded-2xl bg-orangeFpt-50 border border-orangeFpt-100 p-4 min-w-[100px]">
                        <span className="text-2xl font-bold text-orangeFpt-600">{stats.selectedCount}</span>
                        <span className="text-[10px] uppercase font-bold text-orangeFpt-600 tracking-wider">Selected</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className=" flex flex-col gap-10 mx-auto">

               {/* SECTION 1: CURRENTLY ASSIGNED (Moved Above Toolbar) */}
               <section className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                     <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                        <LockClosedIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-slate-800">Assigned to Class</h2>
                        <p className="text-sm text-slate-500">These projects are active in <strong>{classDetail?.className}</strong>.</p>
                     </div>
                  </div>

                  {isInitialising ? (
                     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 2 }).map((_, i) => renderSkeletonCard(`assigned-skel-${i}`))}
                     </div>
                  ) : assignedProjects.length > 0 ? (
                     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {assignedProjects.map(project => (
                           <div key={project.id} className="group relative flex flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 transition-all">
                              <div>
                                 <div className="mb-3 flex justify-between items-start gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                       <CheckCircleSolidIcon className="h-3.5 w-3.5" /> Assigned
                                    </span>
                                    {project.lecturerName && (
                                       <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                          <UserIcon className="h-3 w-3" /> {project.lecturerName}
                                       </span>
                                    )}
                                 </div>
                                 <h3 className="font-bold text-slate-900 line-clamp-1 mb-2" title={project.name}>{project.name}</h3>
                                 <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                              </div>
                              <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center text-xs text-slate-500">
                                 <span className="flex items-center gap-1">
                                    <BookOpenIcon className="h-3.5 w-3.5" /> {project.subjectCode || 'No Code'}
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
                  ) : (
                     <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                        <p className="text-sm text-slate-500">No projects currently assigned.</p>
                     </div>
                  )}
               </section>

               {/* TOOLBAR & SEARCH */}
               <div className="sticky top-4 z-30 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between transition-all">

                  {/* Filter Tabs */}
                  <div className="flex rounded-lg bg-slate-100 p-1">
                     <button
                        onClick={() => setFilterMode('ALL')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterMode === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                           }`}
                     >
                        All Projects
                     </button>
                     <button
                        onClick={() => setFilterMode('MY')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterMode === 'MY' ? 'bg-white text-orangeFpt-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                           }`}
                     >
                        My Projects
                     </button>
                  </div>

                  <div className="flex items-center gap-3">
                     <div className="relative flex-1 max-w-md">
                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                     <input
                        type="text"
                        placeholder="Search library..."
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                     <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                     >
                        <ArrowPathIcon className={`h-5 w-5 ${isInitialising ? 'animate-spin' : ''}`} />
                        Refresh
                     </button>
                     <button
                        onClick={handleSaveAssignments}
                        disabled={isSaving || isInitialising || stats.selectedCount === 0}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl bg-orangeFpt-500 text-sm font-semibold text-white shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                     >
                        {isSaving ? (
                           <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        ) : (
                           <CheckCircleIcon className="h-5 w-5" />
                        )}
                        {isSaving ? 'Saving...' : `Assign (${stats.selectedCount})`}
                     </button>
                  </div>
               </div>

               {/* SECTION 2: AVAILABLE TO ASSIGN */}
               <section className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                     <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                        <ClipboardDocumentListIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-slate-800">Available Library</h2>
                        <p className="text-sm text-slate-500">
                           {filterMode === 'ALL' ? 'Showing all projects for this subject' : 'Showing only your projects'}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                     {isInitialising ? (
                        Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(`avail-skel-${i}`))
                     ) : filteredAvailableProjects.length > 0 ? (
                        filteredAvailableProjects.map(project => {
                           const isSelected = selectedProjectIds.has(project.id);
                           return (
                              <div
                                 key={project.id}
                                 onClick={() => handleToggleProject(project.id)}
                                 className={`group relative cursor-pointer flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${isSelected
                                       ? 'border-orangeFpt-500 bg-orangeFpt-50/40 ring-1 ring-orangeFpt-500'
                                       : 'border-slate-200 bg-white hover:border-orangeFpt-300'
                                    }`}
                              >
                                 <div className="absolute top-4 right-4">
                                    <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${isSelected
                                          ? 'bg-orangeFpt-500 border-orangeFpt-500 text-white'
                                          : 'bg-white border-slate-300 text-transparent group-hover:border-orangeFpt-300'
                                       }`}>
                                       <CheckCircleSolidIcon className="h-4 w-4" />
                                    </div>
                                 </div>

                                 <div>
                                    <div className="mb-3 flex gap-2">
                                       <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                                          {project.subjectCode || 'No Code'}
                                       </span>
                                       {project.lecturerName && (
                                          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 border border-slate-100">
                                             <UserIcon className="h-3 w-3 mr-1" /> {project.lecturerName}
                                          </span>
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
                                          <SparklesIcon className="h-3 w-3 text-orangeFpt-500" />Objectives {project.objectives.length}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           );
                        })
                     ) : (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                           <InboxIcon className="h-12 w-12 text-slate-300 mb-4" />
                           <h3 className="text-lg font-semibold text-slate-900">No available projects found</h3>
                           <p className="text-sm text-slate-500">
                              {searchTerm
                                 ? 'Try adjusting your search terms.'
                                 : 'All projects are already assigned or none exist for this filter.'}
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
