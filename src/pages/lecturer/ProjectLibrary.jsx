import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
   BookOpenIcon,
   ClipboardDocumentListIcon,
   MagnifyingGlassIcon,
   CalendarDaysIcon,
   CheckCircleIcon,
   PlusIcon,
   SparklesIcon,
   ChevronDownIcon,
   PencilSquareIcon,
   CpuChipIcon,
   ListBulletIcon,
   Squares2X2Icon,
   ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getLecturerProjects } from '../../services/projectApi';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

// --- Constants & Helpers ---

const STATUS_LABELS = {
   APPROVED: 'Approved',
   PENDING: 'Pending',
   REJECTED: 'Rejected',
   UNKNOWN: 'Unknown'
};

const getStatusColor = (status) => {
   switch (status) {
      case 'APPROVED':
         return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING':
         return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'REJECTED':
         return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
         return 'bg-slate-100 text-slate-600 border-slate-200';
   }
};

// --- Normalization Logic ---
const normaliseStatus = (rawStatus, fallback) => {
   if (typeof rawStatus === 'string' && rawStatus.trim().length > 0) return rawStatus.trim().toUpperCase();
   if (typeof rawStatus === 'number') {
      const map = { 0: 'PENDING', 1: 'APPROVED', 2: 'REJECTED' };
      return map[rawStatus] ?? fallback;
   }
   return fallback;
};

const mapApiProjectToViewModel = (rawProject = {}) => {
   const statusValue = normaliseStatus(rawProject.statusString ?? rawProject.status, 'UNKNOWN');
   const objectives = Array.isArray(rawProject.objectives) ? rawProject.objectives : [];

   const milestoneCount = objectives.reduce((acc, obj) => {
      return acc + (Array.isArray(obj.objectiveMilestones) ? obj.objectiveMilestones.length : 0);
   }, 0);

   return {
      projectId: rawProject.projectId ?? rawProject.id,
      projectName: rawProject.projectName ?? rawProject.name ?? 'Untitled',
      description: rawProject.description ?? 'No description.',
      lecturerName: rawProject.lecturerName ?? rawProject.lecturer?.fullName ?? '—',
      subjectCode: rawProject.subjectCode ?? rawProject.subject?.code ?? '—',
      subjectName: rawProject.subjectName ?? rawProject.subject?.name ?? '—',
      status: statusValue,
      statusLabel: STATUS_LABELS[statusValue] ?? statusValue,
      objectives,
      hasObjectives: objectives.length > 0,
      milestoneCount
   };
};

const ProjectLibrary = () => {
   const navigate = useNavigate();
   const lecturerId = useSelector((state) => state.user?.userId);

   const [projects, setProjects] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
   const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
   const createMenuRef = useRef(null);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
            setIsCreateMenuOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   useEffect(() => {
      if (!lecturerId) return;
      let isMounted = true;
      const fetchData = async () => {
         setIsLoading(true);
         try {
            const payload = await getLecturerProjects(lecturerId);
            if (!isMounted) return;
            console.log("Raw lecturer projects payload:", payload);
            const rawList = payload.list || [];
            const mapped = rawList.map(mapApiProjectToViewModel);
            setProjects(mapped);
         } catch (err) {
            console.error("Failed to fetch projects", err);
         } finally {
            if (isMounted) setIsLoading(false);
         }
      };
      fetchData();
      return () => { isMounted = false; };
   }, [lecturerId]);

   // --- Derived State ---
   const filteredProjects = useMemo(() => {
      const lowerSearch = searchTerm.toLowerCase();
      return projects.filter(p => {
         const matchSearch =
            p.projectName.toLowerCase().includes(lowerSearch) ||
            p.subjectCode.toLowerCase().includes(lowerSearch);
         const matchStatus = statusFilter === 'all' || p.status === statusFilter;
         return matchSearch && matchStatus;
      });
   }, [projects, searchTerm, statusFilter]);

   const stats = useMemo(() => {
      return {
         total: projects.length,
         withObjectives: projects.filter(p => p.hasObjectives).length,
         totalObjectives: projects.reduce((acc, p) => acc + p.objectives.length, 0),
         totalMilestones: projects.reduce((acc, p) => acc + p.milestoneCount, 0),
      };
   }, [projects]);

   return (
      <DashboardLayout>
         <div className="min-h-screen space-y-8 bg-slate-50/50">

            {/* --- HERO SECTION --- */}
            <header className="relative rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
               <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
               </div>

               <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4 max-w-2xl">
                     <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer workspace</p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Project Library</h1>
                        <p className="mt-1 text-sm text-slate-600">
                           Manage your project templates, track approval statuses, and organize learning objectives for your classes.
                        </p>
                     </div>
                  </div>

                  {/* Create Button with Dropdown */}
                  <div className="relative" ref={createMenuRef}>
                     <button
                        onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                        className="flex items-center gap-2 rounded-xl bg-orangeFpt-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orangeFpt-200 transition-all hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 active:scale-95"
                     >
                        <PlusIcon className="h-5 w-5" />
                        <span>New Project</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
                     </button>

                     {isCreateMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95">
                           <button
                              onClick={() => navigate('/lecturer/create-project')}
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-orangeFpt-50 hover:text-orangeFpt-700 transition-colors group"
                           >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-orangeFpt-600">
                                 <PencilSquareIcon className="h-4 w-4" />
                              </div>
                              <div>
                                 <div className="font-semibold">Create Manually</div>
                                 <div className="text-xs text-slate-500">Build from scratch</div>
                              </div>
                           </button>

                           <button
                              onClick={() => navigate('/lecturer/projects/create-with-ai')}
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                           >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 group-hover:bg-white">
                                 <CpuChipIcon className="h-4 w-4" />
                              </div>
                              <div>
                                 <div className="font-semibold">Create with AI</div>
                                 <div className="text-xs text-slate-500">Generate from PDF</div>
                              </div>
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </header>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
               <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpenIcon className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Total Projects</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                     </div>
                  </div>
               </div>
               <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircleIcon className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Valid Objectives</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.withObjectives}</p>
                     </div>
                  </div>
               </div>
               <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orangeFpt-50 text-orangeFpt-600">
                        <SparklesIcon className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Objectives Tracked</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalObjectives}</p>
                     </div>
                  </div>
               </div>
               <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <CalendarDaysIcon className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Milestones</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalMilestones}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">

               {/* LEFT: PROJECT LIST */}
               <div className="xl:col-span-8 2xl:col-span-9 space-y-6">

                  {/* Filter Bar */}
                  <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                     <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                           type="text"
                           placeholder="Search projects..."
                           className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center gap-3">
                        <select
                           className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-orangeFpt-500 focus:outline-none"
                           value={statusFilter}
                           onChange={(e) => setStatusFilter(e.target.value)}
                        >
                           <option value="all">All Statuses</option>
                           <option value="APPROVED">Approved</option>
                           <option value="PENDING">Pending</option>
                           <option value="REMOVED">Removed</option>
                        </select>
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
                        <button
                           onClick={() => setViewMode('list')}
                           className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'text-orangeFpt-600 bg-orangeFpt-50' : 'text-slate-400 hover:text-orangeFpt-500'}`}
                        >
                           <ListBulletIcon className="h-6 w-6" />
                        </button>
                        <button
                           onClick={() => setViewMode('grid')}
                           className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'text-orangeFpt-600 bg-orangeFpt-50' : 'text-slate-400 hover:text-orangeFpt-500'}`}
                        >
                           <Squares2X2Icon className="h-6 w-6" />
                        </button>
                     </div>
                  </div>

                  {/* Content Area */}
                  {isLoading ? (
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                           <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse"></div>
                        ))}
                     </div>
                  ) : filteredProjects.length === 0 ? (
                     <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
                        <ClipboardDocumentListIcon className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
                        <p className="text-sm text-slate-500">Try adjusting your filters or create a new project.</p>
                     </div>
                  ) : (
                     <>
                        {viewMode === 'grid' ? (
                           /* --- GRID VIEW (Updated) --- */
                           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {filteredProjects.map((project) => (
                                 <div key={project.projectId} className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-orangeFpt-200 hover:shadow-lg">
                                    <div className="mb-4 flex items-start justify-between">
                                       <div className="space-y-1">
                                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                             {project.subjectCode}
                                          </span>
                                          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-orangeFpt-600 transition-colors" title={project.projectName}>
                                             {project.projectName}
                                          </h3>
                                       </div>
                                       <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border ${getStatusColor(project.status)}`}>
                                          {project.statusLabel}
                                       </span>
                                    </div>

                                    <p className="mb-4 text-xs text-slate-500 line-clamp-2 flex-1">
                                       {project.description}
                                    </p>

                                    <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2">
                                       <div className="text-center">
                                          <p className="text-[10px] font-semibold uppercase text-slate-400">Objectives</p>
                                          <p className="text-sm font-bold text-slate-800">{project.objectives.length}</p>
                                       </div>
                                       <div className="text-center border-l border-slate-200">
                                          <p className="text-[10px] font-semibold uppercase text-slate-400">Milestones</p>
                                          <p className="text-sm font-bold text-slate-800">{project.milestoneCount}</p>
                                       </div>
                                    </div>

                                    {/* Updated Button Section (Grid) */}
                                    <div className="mt-auto pt-2">
                                       <button
                                          onClick={() => navigate(`/lecturer/projects/${project.projectId}`)}
                                          className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-orangeFpt-200 hover:bg-orangeFpt-50 hover:text-orangeFpt-700 active:scale-[0.98]"
                                       >
                                          <span>View Details</span>
                                          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           /* --- LIST VIEW (Updated) --- */
                           <div className="flex flex-col gap-4">
                              {filteredProjects.map((project) => (
                                 <div key={project.projectId} className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-orangeFpt-200 hover:shadow-md sm:flex-row sm:items-center">

                                    {/* Left: Info */}
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-3 mb-1">
                                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                             {project.subjectCode}
                                          </span>
                                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${getStatusColor(project.status)}`}>
                                             {project.statusLabel}
                                          </span>
                                       </div>
                                       <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-orangeFpt-600 transition-colors">
                                          {project.projectName}
                                       </h3>
                                       <p className="text-xs text-slate-500 truncate max-w-lg">
                                          {project.description}
                                       </p>
                                    </div>

                                    {/* Middle: Stats */}
                                    <div className="flex items-center gap-6 px-4 sm:border-l sm:border-r border-slate-100">
                                       <div className="text-center">
                                          <span className="block text-lg font-bold text-slate-800">{project.objectives.length}</span>
                                          <span className="text-[10px] font-bold uppercase text-slate-400">Objectives</span>
                                       </div>
                                       <div className="text-center">
                                          <span className="block text-lg font-bold text-slate-800">{project.milestoneCount}</span>
                                          <span className="text-[10px] font-bold uppercase text-slate-400">Milestones</span>
                                       </div>
                                    </div>

                                    {/* Right: Actions (Updated) */}
                                    <div className="flex sm:w-auto w-full">
                                       <button
                                          onClick={() => navigate(`/lecturer/projects/${project.projectId}`)}
                                          className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-orangeFpt-200 hover:bg-orangeFpt-50 hover:text-orangeFpt-700 sm:w-auto active:scale-[0.98]"
                                       >
                                          <span>View Details</span>
                                          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </>
                  )}
               </div>

               {/* RIGHT: SIDEBAR */}
               <aside className="xl:col-span-4 2xl:col-span-3 space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                     <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                        <CheckCircleIcon className="h-5 w-5 text-orangeFpt-500" />
                        Quick Checklist
                     </h3>
                     <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-slate-600">
                           <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orangeFpt-500" />
                           <span>Ensure projects have at least <strong>1 objective</strong> before assigning.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                           <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orangeFpt-500" />
                           <span>Check that milestone dates align with the semester schedule.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-600">
                           <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orangeFpt-500" />
                           <span>Review description clarity for student readability.</span>
                        </li>
                     </ul>
                  </div>

                  <div className="rounded-3xl border border-orangeFpt-100 bg-gradient-to-br from-orangeFpt-50/50 via-white to-orangeFpt-50/20 p-6 shadow-sm">
                     <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-2">
                        <SparklesIcon className="h-5 w-5 text-orangeFpt-500" />
                        AI Assistance
                     </h3>
                     <p className="text-sm text-slate-600 mb-4">
                        Need help drafting milestones? Our AI tool can generate structure from a simple PDF syllabus.
                     </p>
                     <button
                        onClick={() => navigate('/lecturer/projects/create-with-ai')}
                        className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-orangeFpt-600 hover:bg-orangeFpt-50 transition-all border border-orangeFpt-200 shadow-sm"
                     >
                        Try AI Generation
                     </button>
                  </div>
               </aside>

            </div>
         </div>
      </DashboardLayout>
   );
};

export default ProjectLibrary;
