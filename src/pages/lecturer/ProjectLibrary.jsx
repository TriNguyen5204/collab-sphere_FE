import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
   Search,
   Plus,
   ChevronDown,
   PenSquare,
   Cpu,
   List,
   LayoutGrid,
   ChevronLeft,
   ChevronRight,
   BookOpen,
   CheckCircle2,
   FileText,
   Users,
   ClipboardList,
   Sparkles,
   Zap,
   TrendingUp
} from 'lucide-react';
import { getLecturerProjects, getProjects } from '../../services/projectApi';
import { ProjectCard, ProjectRow } from '../../features/lecturer/components/ProjectCard';

const ProjectLibrary = () => {
   const navigate = useNavigate();
   const lecturerId = useSelector((state) => state.user?.userId);

   const [projects, setProjects] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [ownerFilter, setOwnerFilter] = useState('all'); // 'all' | 'my'
   const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
   const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
   const createMenuRef = useRef(null);
   const [pagination, setPagination] = useState({
      pageNum: 1,
      pageSize: 12,
      pageCount: 1,
      totalItems: 0
   });

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
            const params = {
               pageNum: 1,
               pageSize: 1000
            };

            let payload;
            if (ownerFilter === 'my') {
               payload = await getLecturerProjects(lecturerId, params);
            } else {
               payload = await getProjects(params);
            }

            if (!isMounted) return;

            if (payload && (payload.list || Array.isArray(payload))) {
               const list = payload.list || (Array.isArray(payload) ? payload : []);
               setProjects(list);
            } else {
               setProjects([]);
            }
         } catch (err) {
            console.error("Failed to fetch projects", err);
            setProjects([]);
         } finally {
            if (isMounted) setIsLoading(false);
         }
      };
      fetchData();
      return () => { isMounted = false; };
   }, [lecturerId, ownerFilter]);

   // --- Derived State ---
   const filteredProjects = useMemo(() => {
      const lowerSearch = searchTerm.trim().toLowerCase();
      const searchTerms = lowerSearch.split(/\s+/).filter(Boolean);

      return projects.filter(p => {
         const matchSearch =
            searchTerms.length === 0 ||
            searchTerms.some((term) =>
               (p.projectName || '').toLowerCase().includes(term) ||
               (p.subjectCode || '').toLowerCase().includes(term) ||
               (p.subjectName || '').toLowerCase().includes(term)
            );
         const matchStatus = statusFilter === 'all' || 
            (statusFilter === 'success' && p.statusString === 'APPROVED') ||
            (statusFilter === 'warning' && p.statusString === 'PENDING') ||
            (statusFilter === 'draft' && p.statusString === 'DRAFT');
         return matchSearch && matchStatus;
      });
   }, [projects, searchTerm, statusFilter]);

   // Reset pagination when filters change
   useEffect(() => {
      setPagination(prev => ({ ...prev, pageNum: 1 }));
   }, [searchTerm, statusFilter, ownerFilter]);

   const paginatedProjects = useMemo(() => {
      const start = (pagination.pageNum - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filteredProjects.slice(start, end);
   }, [filteredProjects, pagination.pageNum, pagination.pageSize]);

   const totalPages = Math.ceil(filteredProjects.length / pagination.pageSize) || 1;

   // Helper functions for counting
   const countRules = (rulesString) => {
      if (!rulesString) return 0;
      return rulesString.split('\n').map(r => r.trim()).filter(r => r.length > 0).length;
   };
   const countActors = (actorsString) => {
      if (!actorsString) return 0;
      return actorsString.split(',').map(a => a.trim()).filter(a => a.length > 0).length;
   };

   const stats = useMemo(() => {
      const approvedCount = projects.filter(p => p.statusString === 'APPROVED').length;
      const totalBusinessRules = projects.reduce((acc, p) => acc + countRules(p.businessRules), 0);
      const totalActors = projects.reduce((acc, p) => acc + countActors(p.actors), 0);
      return {
         total: projects.length,
         approved: approvedCount,
         totalBusinessRules,
         totalActors
      };
   }, [projects]);

   // Handle project card click
   const handleProjectClick = (projectId) => {
      navigate(`/lecturer/projects/${projectId}`);
   };

   return (
      <DashboardLayout>
         <div className="min-h-screen space-y-8">

            {/* --- HERO SECTION --- */}
            <header className="relative z-20 rounded-3xl border border-white/60 backdrop-blur-xl bg-white/70 p-8 shadow-xl shadow-slate-200/30">
               {/* Background effects */}
               <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-orange-300/30 to-rose-300/20 blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-gradient-to-tr from-blue-300/20 to-purple-300/20 blur-3xl"></div>
               </div>

               <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4 max-w-2xl">
                     <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/10 to-rose-500/10 backdrop-blur-sm px-3 py-1 mb-3">
                           <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                           <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Lecturer Workspace</p>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Library</h1>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                           Manage your project templates, track approval statuses, and organize learning objectives for your classes.
                        </p>
                     </div>
                  </div>

                  {/* Create Button with Dropdown */}
                  <div className="relative" ref={createMenuRef}>
                     <button
                        onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
                     >
                        <Plus className="h-5 w-5" />
                        <span>New Project</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
                     </button>

                     {isCreateMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-white/60 backdrop-blur-xl bg-white/90 p-2 shadow-2xl shadow-slate-900/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                           <button
                              onClick={() => navigate('/lecturer/create-project')}
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-orange-50/80 transition-all group"
                           >
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-orange-600 group-hover:shadow-md transition-all">
                                 <PenSquare className="h-5 w-5" />
                              </div>
                              <div>
                                 <div className="font-semibold">Create Manually</div>
                                 <div className="text-xs text-slate-500">Build from scratch</div>
                              </div>
                           </button>

                           <button
                              onClick={() => navigate('/lecturer/projects/create-with-ai')}
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50/80 transition-all group"
                           >
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500 group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-md transition-all">
                                 <Cpu className="h-5 w-5" />
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

            {/* --- MAIN CONTENT AREA --- */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">

               {/* LEFT: PROJECT LIST */}
               <div className="col-span-1 xl:col-span-8 2xl:col-span-9">
                  
                  {/* Tabs with Glassmorphism */}
                  <div className="mb-6 rounded-2xl border border-white/60 backdrop-blur-xl bg-white/50 p-1.5">
                     <div className="flex gap-2">
                        <button
                           onClick={() => {
                              setOwnerFilter('all');
                              setPagination(prev => ({ ...prev, pageNum: 1 }));
                           }}
                           className={`relative flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              ownerFilter === 'all'
                                 ? 'bg-white text-slate-900 shadow-md'
                                 : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                           }`}
                        >
                           All Approved Projects
                        </button>
                        <button
                           onClick={() => {
                              setOwnerFilter('my');
                              setPagination(prev => ({ ...prev, pageNum: 1 }));
                           }}
                           className={`relative flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              ownerFilter === 'my'
                                 ? 'bg-white text-slate-900 shadow-md'
                                 : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                           }`}
                        >
                           Personal Projects
                        </button>
                     </div>
                  </div>

                  {/* Toolbar with Glassmorphism */}
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                     <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                           type="text"
                           placeholder="Search projects, subjects, domains..."
                           className="w-full rounded-xl border border-white/60 backdrop-blur-xl bg-white/70 py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center gap-3">
                        <select
                           className="rounded-xl border border-white/60 backdrop-blur-xl bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                           value={statusFilter}
                           onChange={(e) => setStatusFilter(e.target.value)}
                        >
                           <option value="all">All Statuses</option>
                           <option value="success">Approved</option>
                           <option value="warning">Pending</option>
                           <option value="draft">Draft</option>
                        </select>
                        <div className="h-8 w-px bg-slate-200/50 mx-1"></div>
                        <div className="flex rounded-xl border border-white/60 backdrop-blur-xl bg-white/50 p-1">
                           <button
                              onClick={() => setViewMode('list')}
                              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'text-orange-600 bg-white shadow-sm' : 'text-slate-400 hover:text-orange-500'}`}
                           >
                              <List className="h-5 w-5" />
                           </button>
                           <button
                              onClick={() => setViewMode('grid')}
                              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'text-orange-600 bg-white shadow-sm' : 'text-slate-400 hover:text-orange-500'}`}
                           >
                              <LayoutGrid className="h-5 w-5" />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Content Area */}
                  {isLoading ? (
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                           <div key={i} className="h-72 rounded-2xl border border-white/60 backdrop-blur-xl bg-gradient-to-br from-white/50 to-slate-50/50 animate-pulse">
                              <div className="p-5 space-y-4">
                                 <div className="flex justify-between">
                                    <div className="h-5 w-16 rounded-lg bg-slate-200/50"></div>
                                    <div className="h-10 w-10 rounded-full bg-slate-200/50"></div>
                                 </div>
                                 <div className="h-4 w-3/4 rounded bg-slate-200/50"></div>
                                 <div className="h-3 w-full rounded bg-slate-100/50"></div>
                                 <div className="h-3 w-2/3 rounded bg-slate-100/50"></div>
                                 <div className="flex gap-2 mt-4">
                                    <div className="h-5 w-16 rounded-md bg-slate-100/50"></div>
                                    <div className="h-5 w-20 rounded-md bg-slate-100/50"></div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : filteredProjects.length === 0 ? (
                     <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/50 backdrop-blur-xl bg-white/30 py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-lg">
                           <ClipboardList className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
                           Try adjusting your search or filters, or create a new project to get started.
                        </p>
                        <button
                           onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                              setOwnerFilter('all');
                           }}
                           className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 text-sm font-semibold text-orange-600 hover:bg-white hover:shadow-md transition-all"
                        >
                           <Zap className="h-4 w-4" />
                           Clear all filters
                        </button>
                     </div>
                  ) : (
                     <>
                        {viewMode === 'grid' ? (
                           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {paginatedProjects.map((project) => (
                                 <ProjectCard
                                    key={project.projectId}
                                    project={project}
                                    onClick={handleProjectClick}
                                 />
                              ))}
                           </div>
                        ) : (
                           <div className="flex flex-col gap-4">
                              {paginatedProjects.map((project) => (
                                 <ProjectRow
                                    key={project.projectId}
                                    project={project}
                                    onClick={handleProjectClick}
                                 />
                              ))}
                           </div>
                        )}
                     </>
                  )}

                  {!isLoading && totalPages > 1 && (
                     <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/60 backdrop-blur-xl bg-white/50 p-4">
                        <p className="text-sm text-slate-500">
                           Showing page <span className="font-bold text-slate-900">{pagination.pageNum}</span> of{' '}
                           <span className="font-bold text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                           <button
                              onClick={() => setPagination((prev) => ({ ...prev, pageNum: Math.max(1, prev.pageNum - 1) }))}
                              disabled={pagination.pageNum === 1}
                              className="inline-flex items-center justify-center rounded-xl border border-white/60 backdrop-blur-xl bg-white/70 p-2.5 text-slate-600 shadow-sm transition-all hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <ChevronLeft className="h-5 w-5" />
                           </button>
                           <button
                              onClick={() => setPagination((prev) => ({ ...prev, pageNum: Math.min(totalPages, prev.pageNum + 1) }))}
                              disabled={pagination.pageNum === totalPages}
                              className="inline-flex items-center justify-center rounded-xl border border-white/60 backdrop-blur-xl bg-white/70 p-2.5 text-slate-600 shadow-sm transition-all hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <ChevronRight className="h-5 w-5" />
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* RIGHT: SIDEBAR with Enhanced Glassmorphism */}
               <aside className="xl:col-span-4 2xl:col-span-3 space-y-6">
                  {/* AI Assistance Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/60 backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 p-6 shadow-lg">
                     <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-2xl"></div>
                        <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-tr from-pink-400/20 to-rose-400/20 blur-2xl"></div>
                     </div>
                     <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
                              <Sparkles className="h-5 w-5 text-white" />
                           </div>
                           <h3 className="text-lg font-bold text-slate-800">AI Assistance</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                           Need help drafting milestones? Our AI tool can generate structure from a simple PDF syllabus.
                        </p>
                        <button
                           onClick={() => navigate('/lecturer/projects/create-with-ai')}
                           className="w-full rounded-xl bg-white/80 backdrop-blur-sm py-2.5 text-sm font-semibold text-indigo-600 hover:bg-white hover:shadow-md transition-all border border-indigo-100"
                        >
                           Try AI Generation
                        </button>
                     </div>
                  </div>

                  {/* Quick Tips Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/60 backdrop-blur-xl bg-white/70 p-6 shadow-lg">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                           <TrendingUp className="h-4 w-4 text-amber-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">Improve Project Health</h3>
                     </div>
                     <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-xs text-slate-600">
                           <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-600">1</span>
                           <span>Add detailed business rules (5+ recommended)</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-slate-600">
                           <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">2</span>
                           <span>Define all system actors clearly</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-slate-600">
                           <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">3</span>
                           <span>Write comprehensive descriptions (200+ chars)</span>
                        </li>
                     </ul>
                  </div>
               </aside>

            </div>
         </div>
      </DashboardLayout>
   );
};

export default ProjectLibrary;
