import React, { useCallback } from 'react';
import {
   ArrowRight,
   CheckCircle2,
   Clock,
   AlertCircle,
   FileEdit,
   FolderOpen,
   User,
   Users,
   BookOpen,
   ListChecks
} from 'lucide-react';

// Status configuration
const STATUS_CONFIG = {
   APPROVED: { label: 'APPROVED', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
   PENDING: { label: 'PENDING', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
   DENIED: { label: 'DENIED', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
   DRAFT: { label: 'DRAFT', icon: FileEdit, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' }
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
   const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
   const Icon = config.icon;

   return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.color} ${config.border}`}>
         <Icon size={10} />
         <span>{config.label}</span>
      </span>
   );
};

/**
 * Parse business rules string into count
 */
const countRules = (rulesString) => {
   if (!rulesString) return 0;
   return rulesString
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0).length;
};

/**
 * Parse actors string into count
 */
const countActors = (actorsString) => {
   if (!actorsString) return 0;
   return actorsString
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0).length;
};

/**
 * Project Card Component (Grid View)
 * Displays real API data: projectName, description, subjectCode, subjectName, lecturerName, statusString, businessRules, actors
 */
const ProjectCard = ({ project, onClick }) => {
   const handleClick = useCallback(() => {
      onClick?.(project.projectId);
   }, [onClick, project.projectId]);

   const rulesCount = countRules(project.businessRules);
   const actorsCount = countActors(project.actors);

   return (
      <div
         onClick={handleClick}
         className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300"
      >
         <div className="flex flex-col h-full p-5">
            {/* Header: Subject Code & Status */}
            <div className="flex items-start justify-between mb-3">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                     {project.subjectCode}
                  </span>
                  <StatusBadge status={project.statusString} />
               </div>
            </div>

            {/* Project Name & Description */}
            <div className="mb-2 flex-1">
               <div className="flex items-start gap-2 mb-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                     <FolderOpen size={13} className="text-indigo-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                     {project.projectName}
                  </h3>
               </div>
               <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {project.description}
               </p>
            </div>
            <div className='flex'>
               {/* Subject Name */}
               <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500">
                  <BookOpen size={12} />
                  <span className="truncate">{project.subjectName}</span>
               </div>
               <div className="text-slate-200 px-2 text-xs">|</div>
               {/* Lecturer Name */}
               <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500">
                  <User size={12} />
                  <span className="truncate">{project.lecturerName}</span>
               </div>
            </div>
            {/* Rules & Actors Count */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
               <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <ListChecks size={14} className="text-slate-400" />
                  <span className="font-medium">{rulesCount} Rules</span>
               </div>
               <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Users size={14} className="text-slate-400" />
                  <span className="font-medium">{actorsCount} Actors</span>
               </div>
            </div>

            {/* View Action */}
            {/* <div className="flex items-center justify-end pt-3 border-t border-slate-100">
               <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
               </div>
            </div> */}
         </div>
      </div>
   );
};

/**
 * Project Row Component (List View)
 * Displays real API data in horizontal layout
 */
const ProjectRow = ({ project, onClick }) => {
   const handleClick = useCallback(() => {
      onClick?.(project.projectId);
   }, [onClick, project.projectId]);

   const rulesCount = countRules(project.businessRules);
   const actorsCount = countActors(project.actors);

   return (
      <div
         onClick={handleClick}
         className="group flex items-center gap-5 cursor-pointer rounded-2xl p-5 border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300"
      >
         {/* Icon */}
         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <FolderOpen size={24} className="text-indigo-500" />
         </div>

         {/* Main Content */}
         <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
               <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {project.subjectCode}
               </span>
               <StatusBadge status={project.statusString} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
               {project.projectName}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
               {project.subjectName}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
               <User size={10} />
               <span>{project.lecturerName}</span>
            </div>
         </div>

         {/* Metrics */}
         <div className="hidden md:flex items-center gap-8 px-6 border-l border-slate-100">
            <div className="text-center">
               <span className="block text-lg font-bold text-slate-800">{rulesCount}</span>
               <span className="text-[10px] font-semibold uppercase text-slate-400">Rules</span>
            </div>
            <div className="text-center">
               <span className="block text-lg font-bold text-slate-800">{actorsCount}</span>
               <span className="text-[10px] font-semibold uppercase text-slate-400">Actors</span>
            </div>
         </div>

         {/* Action */}
         <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all group-hover:border-indigo-300 group-hover:text-indigo-600 group-hover:shadow-sm">
            <span>View</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
         </button>
      </div>
   );
};

export { ProjectCard, ProjectRow, StatusBadge };
export default ProjectCard;
