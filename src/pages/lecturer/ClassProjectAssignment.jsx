import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
   CheckCircleIcon,
   ClipboardDocumentListIcon,
   MagnifyingGlassIcon,
   SparklesIcon,
   AcademicCapIcon,
   BookOpenIcon,
   CalendarIcon,
   ArrowPathIcon,
   UserIcon,
   InboxIcon,
   ChevronLeftIcon,
   ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getClassProjects, getProjects } from '../../services/projectApi';
import { getClassDetail } from '../../services/userService';
import { assignProjectsToClass } from '../../services/classApi';
import { toast } from 'sonner';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

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

   const [classDetail, setClassDetail] = useState(null);
   const [assignedProjects, setAssignedProjects] = useState([]);
   const [candidateProjects, setCandidateProjects] = useState([]);

   const [selectedProjectIds, setSelectedProjectIds] = useState(new Set());
   const [projectsToRemove, setProjectsToRemove] = useState(new Set());
   const [projectErrors, setProjectErrors] = useState({});
   const [searchTerm, setSearchTerm] = useState('');
   const [filterMode, setFilterMode] = useState('ALL');
   const [pagination, setPagination] = useState({
      pageNum: 1,
      pageSize: 12,
      pageCount: 1,
      totalItems: 0
   });

   const loadData = useCallback(async () => {
      if (!classId || !lecturerId) {
         setIsInitialising(false);
         return;
      }
      setIsInitialising(true);
      try {
         const classResponse = await getClassDetail(classId);
         const subjectId = classResponse?.subjectId;

         if (!subjectId) {
            toast.error('Class subject not found. Cannot load projects.');
            setClassDetail(classResponse);
            return;
         }

         let candidateQuery = {
            pageNum: 1,
            pageSize: 1000, // Fetch all for client-side filtering
            // searchTerm: searchTerm, // Don't filter on server
            status: 'APPROVED'
         };

         switch (filterMode) {
            case 'MY':
               candidateQuery = { ...candidateQuery, lecturerIds: lecturerId };
               break;
            case 'ALL':
            default:
               break;
         }

         const [assignedData, candidateData] = await Promise.all([
            getClassProjects(classId),
            getProjects(candidateQuery)
         ]);
         console.log('Raw assigned projects data:', assignedData);
         console.log('Raw candidate projects data:', candidateData);

         setClassDetail(classResponse);
         setAssignedProjects(extractArray(assignedData).map(normaliseProject).filter(Boolean));

         const candidateList = extractArray(candidateData);
         // setPagination(prev => ({
         //    ...prev,
         //    pageCount: candidateData?.pageCount || 1,
         //    totalItems: candidateData?.itemCount || candidateList.length
         // }));

         const allCandidates = candidateList.map(normaliseProject).filter(Boolean);
         const approvedCandidates = allCandidates.filter(p => p.status === 'APPROVED');
         setCandidateProjects(approvedCandidates);

      } catch (error) {
         console.error('Failed to load assignment data', error);
         toast.error('Unable to load assignments.');
      } finally {
         setIsInitialising(false);
      }
   }, [classId, lecturerId, filterMode]); // Removed pagination/search dependencies

   useEffect(() => { loadData(); }, [loadData]);

   // Reset pagination when filters change
   useEffect(() => {
      setPagination(prev => ({ ...prev, pageNum: 1 }));
   }, [searchTerm, filterMode]);

   const availableProjects = useMemo(() => {
      const assignedIds = new Set(assignedProjects.map(p => p.id));
      return candidateProjects.filter(p => !assignedIds.has(p.id));
   }, [assignedProjects, candidateProjects]);

   const filteredAvailableProjects = useMemo(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return availableProjects;
      return availableProjects.filter((p) =>
         [p.name, p.subjectName, p.description, p.lecturerName].join(' ').toLowerCase().includes(term)
      );
   }, [availableProjects, searchTerm]);

   const paginatedAvailableProjects = useMemo(() => {
      const start = (pagination.pageNum - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filteredAvailableProjects.slice(start, end);
   }, [filteredAvailableProjects, pagination.pageNum, pagination.pageSize]);

   const totalPages = Math.ceil(filteredAvailableProjects.length / pagination.pageSize) || 1;
   const stats = useMemo(() => ({
      assignedCount: assignedProjects.length,
      selectedCount: selectedProjectIds.size,
      removedCount: projectsToRemove.size,
      availableCount: availableProjects.length
   }), [assignedProjects.length, selectedProjectIds.size, projectsToRemove.size, availableProjects.length]);

   const assignedMatchingCount = useMemo(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return assignedProjects.length;
      return assignedProjects.filter((p) =>
         [p.name, p.subjectName, p.description, p.lecturerName].join(' ').toLowerCase().includes(term)
      ).length;
   }, [assignedProjects, searchTerm]);

   const breadcrumbItems = useMemo(() => [
      { label: 'Classes', href: '/lecturer/classes' },
      { label: classDetail?.className || `Class ${classId}`, href: `/lecturer/classes/${classId}` },
      { label: 'Project assignments' },
   ], [classDetail, classId]);

   const handleToggleProject = (projectId) => {
      setSelectedProjectIds((current) => {
         const next = new Set(current);
         if (next.has(projectId)) next.delete(projectId);
         else next.add(projectId);
         return next;
      });
   };

   const handleToggleRemove = (projectId) => {
      setProjectsToRemove((current) => {
         const next = new Set(current);
         if (next.has(projectId)) next.delete(projectId);
         else next.add(projectId);
         return next;
      });
   };

   const handleSaveAssignments = async () => {
      if (!classId) return;

      setProjectErrors({});

      const existingIds = assignedProjects.map(p => p.id);
      const idsToKeep = existingIds.filter(id => !projectsToRemove.has(id));
      const newIds = Array.from(selectedProjectIds);
      const allIdsToAssign = [...idsToKeep, ...newIds];

      setIsSaving(true);
      try {
         await assignProjectsToClass(classId, allIdsToAssign);
         toast.success(`Class with ID '${classId}'. Assigned ${newIds.length} project(s). Removed ${projectsToRemove.size} project(s)`);
         await loadData();
      } catch (error) {
         console.error(error);
         const errorList = error.response?.data?.errorList;
         const errorMsg = error.response?.data?.message;

         const newProjectErrors = {};
         const extractProjectIds = (text) => {
            if (typeof text !== 'string') return [];
            const match = text.match(/Project IDs:?\s*([\d,\s]+)/i);
            if (match && match[1]) {
               return match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
            }
            return [];
         };

         const processErrorText = (text) => {
            const ids = extractProjectIds(text);
            ids.forEach(id => {
               newProjectErrors[id] = text;
            });
         };

         if (errorMsg) processErrorText(errorMsg);
         if (Array.isArray(errorList)) {
            errorList.forEach(err => {
               const text = typeof err === 'object' ? (err.message || '') : String(err);
               processErrorText(text);
            });
         }

         if (Object.keys(newProjectErrors).length > 0) {
            setProjectErrors(newProjectErrors);
            toast.warning('Some projects could not be updated. Please check the highlighted items.');
         }

         if (Array.isArray(errorList) && errorList.length > 0) {
            toast.error('Assignment Failed', {
               description: (
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                     {errorList.map((err, idx) => (
                        <li key={idx}>
                           {typeof err === 'object' ? (err.message || JSON.stringify(err)) : err}
                        </li>
                     ))}
                  </ul>
               ),
               duration: 5000,
            });
         } else if (errorMsg) {
            toast.error(errorMsg);
         } else {
            toast.error('Failed to update assignments.');
         }
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

            <div className=" flex flex-col gap-10 mx-auto">

               <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           <CheckCircleSolidIcon className="h-6 w-6 text-emerald-500" />
                           Assigned Projects
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                           These projects are currently active for this class.
                        </p>
                     </div>
                     {projectsToRemove.size > 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600 border border-rose-100">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                           </span>
                           {projectsToRemove.size} marked for removal
                        </span>
                     )}
                  </div>

                  {isInitialising ? (
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 2 }).map((_, i) => renderSkeletonCard(`assigned-skel-${i}`))}
                     </div>
                  ) : assignedProjects.length > 0 ? (
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {assignedProjects.map(project => {
                           const isRemoved = projectsToRemove.has(project.id);
                           const error = projectErrors[project.id];
                           return (
                              <div key={project.id} className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${error ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : isRemoved ? 'border-rose-200 bg-rose-50/30' : 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-200 hover:shadow-sm'}`}>
                                 <div>
                                    <div className="mb-3 flex justify-between items-start gap-2">
                                       <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${error ? 'bg-red-100 text-red-700' : isRemoved ? 'bg-rose-100 text-rose-700' : 'bg-white text-emerald-700 border border-emerald-100 shadow-sm'}`}>
                                          {error ? 'Error' : isRemoved ? 'To Remove' : 'Active'}
                                       </span>
                                       <button
                                          onClick={() => handleToggleRemove(project.id)}
                                          className={`p-1.5 rounded-lg transition-colors ${isRemoved ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100'}`}
                                          title={isRemoved ? "Undo removal" : "Remove assignment"}
                                       >
                                          {isRemoved ? (
                                             <ArrowPathIcon className="h-4 w-4" />
                                          ) : (
                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                             </svg>
                                          )}
                                       </button>
                                    </div>
                                    <h3 className={`font-bold text-sm mb-1 ${isRemoved ? 'text-slate-400 line-through decoration-slate-400' : 'text-slate-900'}`} title={project.name}>
                                       {project.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>

                                    {error && (
                                       <div className="mt-2 rounded-lg bg-red-100 p-2 text-xs text-red-700 font-medium border border-red-200">
                                          <div className="flex gap-1.5 items-start">
                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                             </svg>
                                             <span>{error}</span>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                                 <div className={`mt-3 pt-3 border-t flex justify-between items-center text-[10px] font-medium ${error ? 'border-red-200 text-red-600' : isRemoved ? 'border-rose-100 text-slate-400' : 'border-emerald-100/50 text-slate-500'}`}>
                                    <span className="flex items-center gap-1">
                                       <BookOpenIcon className="h-3 w-3" /> {project.subjectCode || 'No Code'}
                                    </span>
                                    {project.objectives?.length > 0 && (
                                       <span className={`flex items-center gap-1 ${isRemoved ? 'text-slate-400' : 'text-emerald-600'}`}>
                                          <AcademicCapIcon className="h-3 w-3" /> {project.objectives.length} Objs
                                       </span>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                           <InboxIcon className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">No projects assigned yet</p>
                        <p className="text-xs text-slate-500 mt-1">Select projects from the library below to get started.</p>
                     </div>
                  )}
               </section>

               <div className="sticky top-4 z-30 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between transition-all">

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

                  <div className="flex items-center gap-3 flex-1 justify-end">
                     <div className="relative w-full max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                           type="text"
                           placeholder={filterMode === 'ALL' ? "Search all approved projects..." : "Search my projects..."}
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
                     </button>
                  </div>
               </div>

               <section className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                     <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                        <ClipboardDocumentListIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-slate-800">Available Library</h2>
                        <p className="text-sm text-slate-500">
                           {filterMode === 'ALL' ? 'Showing all approved projects' : 'Showing your approved projects'}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                     {isInitialising ? (
                        Array.from({ length: 3 }).map((_, i) => renderSkeletonCard(`avail-skel-${i}`))
                     ) : paginatedAvailableProjects.length > 0 ? (
                        paginatedAvailableProjects.map((project) => {
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

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
                     <div className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-900">{paginatedAvailableProjects.length}</span> of <span className="font-medium text-slate-900">{filteredAvailableProjects.length}</span> available projects
                     </div>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => setPagination(prev => ({ ...prev, pageNum: Math.max(1, prev.pageNum - 1) }))}
                           disabled={pagination.pageNum === 1 || isInitialising}
                           className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                           <ChevronLeftIcon className="h-4 w-4" />
                           Previous
                        </button>

                        <span className="text-sm font-medium text-slate-600 px-2">
                           Page {pagination.pageNum} of {totalPages}
                        </span>

                        <button
                           onClick={() => setPagination(prev => ({ ...prev, pageNum: Math.min(totalPages, prev.pageNum + 1) }))}
                           disabled={pagination.pageNum === totalPages || isInitialising}
                           className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                           Next
                           <ChevronRightIcon className="h-4 w-4" />
                        </button>
                     </div>
                  </div>
               </section>

            </div>

            <div className={`fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/80 backdrop-blur-lg p-4 transition-transform duration-300 ${stats.selectedCount > 0 || stats.removedCount > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
               <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                        <span>Changes:</span>
                        {stats.selectedCount > 0 && <span className="text-emerald-600">+{stats.selectedCount} to add</span>}
                        {stats.selectedCount > 0 && stats.removedCount > 0 && <span className="text-slate-300">|</span>}
                        {stats.removedCount > 0 && <span className="text-rose-600">-{stats.removedCount} to remove</span>}
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button
                        onClick={() => {
                           setSelectedProjectIds(new Set());
                           setProjectsToRemove(new Set());
                        }}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSaveAssignments}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-orangeFpt-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orangeFpt-200 transition-all hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isSaving ? (
                           <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        ) : (
                           <CheckCircleIcon className="h-5 w-5" />
                        )}
                        {isSaving ? 'Saving Changes...' : 'Confirm Changes'}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </DashboardLayout>
   );
};

export default ClassProjectAssignment;
