import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
   Calendar,
   User,
   BookOpen,
   Clock,
   Edit3,
   Trash2,
   CheckCircle2,
   AlertCircle,
   Users,
   Zap,
   ShieldCheck,
   RotateCw,
   BellRing,
   Lock,
   UserCircle,
   Stethoscope,
   HeartHandshake,
   LineChart,
   Server,
   Activity,
   FileText,
   ChevronRight,
   ChevronDown,
   ListChecks,
   Plus,
   X,
   ScrollText
} from 'lucide-react';

import {
   getProjectDetail,
   updateProjectBeforeApproval,
   deleteProjectBeforeApproval,
} from '../../services/projectApi';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import ModalWrapper from '../../components/layout/ModalWrapper';
import DashboardLayout from '../../components/layout/DashboardLayout';

// --- Status Configuration ---
const STATUS_CONFIG = {
   PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500', icon: Clock },
   APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', icon: CheckCircle2 },
   DENIED: { label: 'Denied', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', icon: AlertCircle },
   REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', icon: AlertCircle },
   UNKNOWN: { label: 'Unknown', color: 'bg-slate-50 text-slate-700 border-slate-200', dotColor: 'bg-slate-500', icon: AlertCircle },
};

const STATUS_CODE_MAP = { 0: 'PENDING', 1: 'APPROVED', 2: 'DENIED' };

// --- Business Rule Icons Mapping ---
const RULE_ICONS = [
   { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
   { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
   { icon: RotateCw, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
   { icon: BellRing, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
   { icon: Lock, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
   { icon: CheckCircle2, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
   { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
];

// --- Actor Icons Mapping ---
const ACTOR_CONFIG = {
   'executive': { icon: UserCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
   'healthcare': { icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
   'provider': { icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
   'wellness': { icon: HeartHandshake, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
   'coach': { icon: HeartHandshake, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
   'analyst': { icon: LineChart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
   'data': { icon: LineChart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
   'admin': { icon: Server, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
   'system': { icon: Server, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
   'student': { icon: UserCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
   'lecturer': { icon: UserCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
   'user': { icon: UserCircle, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
   'default': { icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

// --- Helpers ---
const resolveProjectStatusKey = (project) => {
   if (!project) return 'PENDING';
   if (project.statusString) return project.statusString.toUpperCase();
   if (typeof project.status === 'string') return project.status.toUpperCase();
   if (typeof project.status === 'number') return STATUS_CODE_MAP[project.status] ?? 'PENDING';
   return 'PENDING';
};

const formatDate = (value) => {
   if (!value) return '—';
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const parseBusinessRules = (rulesString) => {
   if (!rulesString) return [];
   return rulesString
      .split('\n')
      .map(r => r.trim().replace(/^[-•]\s*/, ''))
      .filter(r => r.length > 0);
};

const parseActors = (actorsString) => {
   if (!actorsString) return [];
   return actorsString
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);
};

const getActorConfig = (actorName) => {
   const lowerName = actorName.toLowerCase();
   for (const [key, config] of Object.entries(ACTOR_CONFIG)) {
      if (lowerName.includes(key)) return config;
   }
   return ACTOR_CONFIG.default;
};

const extractTeamSize = (description) => {
   const match = description?.match(/(\d+)\s*members?/i);
   return match ? parseInt(match[1], 10) : null;
};

// --- Main Component ---
const ProjectDetail = () => {
   const { projectId } = useParams();
   const navigate = useNavigate();
   const lecturerId = useSelector((state) => state.user?.userId);

   const [project, setProject] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isDescExpanded, setIsDescExpanded] = useState(false);

   // Modals
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editDraft, setEditDraft] = useState({ projectName: '', description: '' });
   const [editBusinessRulesArray, setEditBusinessRulesArray] = useState([]);
   const [editActorsArray, setEditActorsArray] = useState([]);
   const [newRuleInput, setNewRuleInput] = useState('');
   const [newActorInput, setNewActorInput] = useState('');
   const [isEditSaving, setIsEditSaving] = useState(false);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

   // --- Fetch Data ---
   const fetchProject = useCallback(async (silent = false) => {
      if (!projectId) return;
      if (!silent) setIsLoading(true);
      try {
         const data = await getProjectDetail(projectId);
         console.log('API Response - Project Detail:', data);
         setProject(data);
      } catch (err) {
         toast.error('Failed to load project details.');
      } finally {
         if (!silent) setIsLoading(false);
      }
   }, [projectId]);

   useEffect(() => { fetchProject(); }, [fetchProject]);

   // --- Derived Values ---
   const statusKey = resolveProjectStatusKey(project);
   const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.UNKNOWN;
   const StatusIcon = statusConfig.icon;
   const isPending = statusKey === 'PENDING';

   const businessRules = useMemo(() => parseBusinessRules(project?.businessRules), [project?.businessRules]);
   const actors = useMemo(() => parseActors(project?.actors), [project?.actors]);
   const teamSize = useMemo(() => extractTeamSize(project?.description), [project?.description]);

   const breadcrumbItems = useMemo(() => [
      { label: 'Project Library', href: '/lecturer/projects' },
      { label: project?.subjectCode || 'Subject' },
      { label: project?.projectName ?? 'Loading...' },
   ], [project]);

   // --- Actions ---
   const handleOpenEdit = () => {
      // Parse existing business rules (remove '- ' prefix from each rule)
      const existingRules = project.businessRules
         ? project.businessRules.split('\n').map(r => r.replace(/^-\s*/, '').trim()).filter(Boolean)
         : [];
      
      // Parse existing actors (comma separated)
      const existingActors = project.actors
         ? project.actors.split(',').map(a => a.trim()).filter(Boolean)
         : [];
      
      setEditDraft({ 
         projectName: project.projectName, 
         description: project.description
      });
      setEditBusinessRulesArray(existingRules);
      setEditActorsArray(existingActors);
      setNewRuleInput('');
      setNewActorInput('');
      setIsEditModalOpen(true);
   };

   // Business Rules Edit Handlers
   const handleAddEditBusinessRule = (rule) => {
      const trimmedRule = rule.trim();
      if (trimmedRule && !editBusinessRulesArray.includes(trimmedRule)) {
         setEditBusinessRulesArray(prev => [...prev, trimmedRule]);
         setNewRuleInput('');
      }
   };

   const handleRemoveEditBusinessRule = (ruleToRemove) => {
      setEditBusinessRulesArray(prev => prev.filter(rule => rule !== ruleToRemove));
   };

   // Actors Edit Handlers
   const handleAddEditActor = (actor) => {
      const trimmedActor = actor.trim();
      if (trimmedActor && !editActorsArray.includes(trimmedActor)) {
         setEditActorsArray(prev => [...prev, trimmedActor]);
         setNewActorInput('');
      }
   };

   const handleRemoveEditActor = (actorToRemove) => {
      setEditActorsArray(prev => prev.filter(actor => actor !== actorToRemove));
   };

   const handleUpdateBasicInfo = async (e) => {
      e.preventDefault();
      
      // Format business rules with '- ' prefix for API
      const formattedBusinessRules = editBusinessRulesArray.map(rule => `- ${rule}`).join('\n');
      // Format actors as comma-separated string for API
      const formattedActors = editActorsArray.join(', ');
      
      const payload = {
         projectId: project.projectId || project.id,
         projectName: editDraft.projectName.trim(),
         description: editDraft.description.trim(),
         subjectId: project.subjectId,
         businessRules: formattedBusinessRules,
         actors: formattedActors,
      };
      
      console.log('Update Project Payload:', payload);
      
      setIsEditSaving(true);
      try {
         await updateProjectBeforeApproval(payload);
         toast.success('Project details updated');
         await fetchProject(true);
         setIsEditModalOpen(false);
      } catch (error) {
         console.error('Update Project Error:', error);
         console.error('Error Response:', error?.response?.data);
         toast.error(error?.response?.data?.message || 'Failed to update project');
      } finally {
         setIsEditSaving(false);
      }
   };

   const handleDeleteProject = async () => {
      setIsDeleteSubmitting(true);
      try {
         await deleteProjectBeforeApproval(project.projectId || project.id);
         toast.success('Project deleted successfully');
         navigate('/lecturer/projects');
      } catch (err) {
         toast.error('Failed to delete project');
      } finally {
         setIsDeleteSubmitting(false);
      }
   };

   // --- Loading State ---
   if (isLoading) return (
      <DashboardLayout>
         <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeFpt-200 border-t-orangeFpt-500"></div>
         </div>
      </DashboardLayout>
   );

   // --- Not Found State ---
   if (!project) return (
      <DashboardLayout>
         <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-700">Project Not Found</h2>
            <button onClick={() => navigate('/lecturer/projects')} className="mt-4 text-orangeFpt-600 hover:underline">
               Return to Library
            </button>
         </div>
      </DashboardLayout>
   );

   // Truncate description for preview
   const descriptionPreview = project.description?.length > 200 
      ? project.description.slice(0, 200) + '...' 
      : project.description;

   return (
      <DashboardLayout>
         <div className="min-h-screen space-y-6">

            {/* --- BREADCRUMBS --- */}
            <LecturerBreadcrumbs items={breadcrumbItems} />

            {/* --- HERO HEADER --- */}
            <header className="relative z-20 overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
               {/* Aurora Background */}
               <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-teal-200/40 to-cyan-200/30 blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 blur-3xl"></div>
               </div>

               <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4 max-w-3xl">
                     {/* Status & Subject Badge */}
                     <div className="flex flex-wrap items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                           <span className={`relative flex h-2 w-2`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dotColor} opacity-75`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dotColor}`}></span>
                           </span>
                           {statusConfig.label}
                        </div>
                        <button 
                           onClick={() => navigate('/lecturer/projects')}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition-colors"
                        >
                           <BookOpen size={12} />
                           {project.subjectCode}
                        </button>
                     </div>

                     {/* Project Title */}
                     <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {project.projectName}
                     </h1>

                     {/* Subject & Lecturer Info */}
                     <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                           <BookOpen size={16} className="text-teal-500" />
                           <span>{project.subjectName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                           <User size={16} className="text-blue-500" />
                           <span>{project.lecturerName}</span>
                        </div>
                     </div>
                  </div>

                  {/* Quick Actions */}
                  {isPending && (
                     <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                           onClick={handleOpenEdit}
                           className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all"
                        >
                           <Edit3 size={16} /> Edit Project
                        </button>
                        <button
                           onClick={() => setDeleteModalOpen(true)}
                           className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 transition-colors"
                        >
                           <Trash2 size={16} /> Delete
                        </button>
                     </div>
                  )}
               </div>
            </header>

            {/* --- BENTO GRID CONTENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

               {/* === ZONE A: Overview Card (Spans 2 cols) === */}
               <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-5">
                     <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 shadow-sm">
                        <Activity size={28} className="text-teal-600" />
                     </div>
                     <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Project Overview</h2>
                        <p className="text-sm text-slate-500">
                           A predictive health analytics platform integrating IoT data for executives.
                        </p>
                     </div>
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                     <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" />
                        Description
                     </h3>
                     <p className="text-sm text-slate-600 leading-relaxed">
                        {isDescExpanded ? project.description : descriptionPreview}
                     </p>
                     {project.description?.length > 200 && (
                        <button
                           onClick={() => setIsDescExpanded(!isDescExpanded)}
                           className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                        >
                           {isDescExpanded ? 'Show Less' : 'Read More'}
                           <ChevronDown size={14} className={`transition-transform ${isDescExpanded ? 'rotate-180' : ''}`} />
                        </button>
                     )}
                  </div>

                  {/* Key Metrics */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                     {teamSize && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                           <Users size={18} className="text-indigo-500" />
                           <div>
                              <p className="text-xs text-slate-500">Team Size</p>
                              <p className="text-sm font-bold text-slate-900">{teamSize} Members</p>
                           </div>
                        </div>
                     )}
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                        <Calendar size={18} className="text-teal-500" />
                        <div>
                           <p className="text-xs text-slate-500">Created</p>
                           <p className="text-sm font-bold text-slate-900">{formatDate(project.createdAt)}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                        <Clock size={18} className="text-blue-500" />
                        <div>
                           <p className="text-xs text-slate-500">Updated</p>
                           <p className="text-sm font-bold text-slate-900">{formatDate(project.updatedAt)}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                        <ListChecks size={18} className="text-amber-500" />
                        <div>
                           <p className="text-xs text-slate-500">Business Rules</p>
                           <p className="text-sm font-bold text-slate-900">{businessRules.length} Rules</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                        <Users size={18} className="text-pink-500" />
                        <div>
                           <p className="text-xs text-slate-500">System Actors</p>
                           <p className="text-sm font-bold text-slate-900">{actors.length} Actors</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* === ZONE C: System Actors (Right Column) === */}
               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                     <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                        <Users size={18} className="text-purple-600" />
                     </div>
                     <h2 className="text-lg font-bold text-slate-900">System Actors</h2>
                  </div>

                  <div className="space-y-3">
                     {actors.length > 0 ? (
                        actors.map((actor, idx) => {
                           const config = getActorConfig(actor);
                           const ActorIcon = config.icon;
                           return (
                              <div
                                 key={idx}
                                 className={`flex items-center gap-3 p-3 rounded-xl border ${config.border} ${config.bg} transition-all hover:shadow-sm cursor-default`}
                              >
                                 <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm`}>
                                    <ActorIcon size={20} className={config.color} />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{actor}</p>
                                    <p className="text-xs text-slate-500">System Role</p>
                                 </div>
                                 <ChevronRight size={16} className="text-slate-300" />
                              </div>
                           );
                        })
                     ) : (
                        <div className="text-center py-8 text-slate-400">
                           <Users size={32} className="mx-auto mb-2 opacity-50" />
                           <p className="text-sm">No actors defined</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* === ZONE B: Business Rules (Full Width) - Academic Style === */}
               <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
                              <FileText size={20} className="text-slate-600" />
                           </div>
                           <div>
                              <h2 className="text-lg font-bold text-slate-900">Business Rules & Constraints</h2>
                              <p className="text-xs text-slate-500">Functional requirements governing system behavior</p>
                           </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                           <span className="text-xs font-medium text-slate-500">Total Rules:</span>
                           <span className="text-sm font-bold text-slate-900">{businessRules.length}</span>
                        </div>
                     </div>
                  </div>

                  {/* Rules Content */}
                  <div className="p-6">
                     {businessRules.length > 0 ? (
                        <div className="space-y-0 divide-y divide-slate-100">
                           {businessRules.map((rule, idx) => (
                              <div
                                 key={idx}
                                 className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors"
                              >
                                 {/* Rule Number */}
                                 <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 group-hover:bg-indigo-100 group-hover:border-indigo-200 transition-colors">
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700 transition-colors">
                                       {String(idx + 1).padStart(2, '0')}
                                    </span>
                                 </div>
                                 
                                 {/* Rule Content */}
                                 <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                       {rule}
                                    </p>
                                 </div>

                                 {/* Category Tag */}
                                 <div className="hidden lg:flex flex-shrink-0 items-center">
                                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 rounded border border-slate-100">
                                       BR-{String(idx + 1).padStart(3, '0')}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-16">
                           <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
                              <FileText size={28} className="text-slate-400" />
                           </div>
                           <p className="text-sm font-semibold text-slate-600">No Business Rules Defined</p>
                           <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                              Business rules define the constraints and requirements that govern system behavior.
                           </p>
                        </div>
                     )}
                  </div>

                  {/* Footer Note */}
                  {businessRules.length > 0 && (
                     <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                           <AlertCircle size={12} />
                           All business rules must be implemented and validated during system development.
                        </p>
                     </div>
                  )}
               </div>

            </div>
         </div>

         {/* --- MODALS --- */}

         {/* Edit Modal */}
         <ModalWrapper isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project Details">
            <form onSubmit={handleUpdateBasicInfo} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
               {/* Project Name */}
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                  <input
                     type="text"
                     required
                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                     value={editDraft.projectName}
                     onChange={(e) => setEditDraft({ ...editDraft, projectName: e.target.value })}
                  />
               </div>

               {/* Description */}
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                     rows={3}
                     required
                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                     value={editDraft.description}
                     onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                  />
               </div>

               {/* Business Rules - Array Input */}
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <ScrollText size={16} className="text-orangeFpt-500" />
                     <label className="text-sm font-semibold text-slate-700">Business Rules</label>
                     <span className="text-xs text-slate-400">({editBusinessRulesArray.length} rules)</span>
                  </div>
                  
                  {/* Add Rule Input */}
                  <div className="flex gap-2 mb-3">
                     <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orangeFpt-500 font-medium text-sm">-</span>
                        <input
                           type="text"
                           className="w-full rounded-xl border border-slate-200 pl-7 pr-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                           placeholder="Enter a business rule..."
                           value={newRuleInput}
                           onChange={(e) => setNewRuleInput(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                 e.preventDefault();
                                 handleAddEditBusinessRule(newRuleInput);
                              }
                           }}
                        />
                     </div>
                     <button
                        type="button"
                        onClick={() => handleAddEditBusinessRule(newRuleInput)}
                        disabled={!newRuleInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-orangeFpt-500 text-white hover:bg-orangeFpt-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <Plus size={18} />
                     </button>
                  </div>

                  {/* Rules List */}
                  {editBusinessRulesArray.length > 0 ? (
                     <div className="space-y-2 max-h-40 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200">
                        {editBusinessRulesArray.map((rule, index) => (
                           <div
                              key={index}
                              className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-slate-100 group"
                           >
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orangeFpt-100 text-orangeFpt-600 text-xs font-bold flex items-center justify-center mt-0.5">
                                 {index + 1}
                              </span>
                              <p className="flex-1 text-sm text-slate-700 leading-relaxed">{rule}</p>
                              <button
                                 type="button"
                                 onClick={() => handleRemoveEditBusinessRule(rule)}
                                 className="flex-shrink-0 p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-400">
                        No rules added. Enter a rule above and press Enter or click Add.
                     </div>
                  )}
               </div>

               {/* Actors - Array Input */}
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <Users size={16} className="text-blue-500" />
                     <label className="text-sm font-semibold text-slate-700">System Actors</label>
                     <span className="text-xs text-slate-400">({editActorsArray.length} actors)</span>
                  </div>
                  
                  {/* Add Actor Input */}
                  <div className="flex gap-2 mb-3">
                     <input
                        type="text"
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                        placeholder="Enter actor name (e.g., Admin, User, System)..."
                        value={newActorInput}
                        onChange={(e) => setNewActorInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEditActor(newActorInput);
                           }
                        }}
                     />
                     <button
                        type="button"
                        onClick={() => handleAddEditActor(newActorInput)}
                        disabled={!newActorInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <Plus size={18} />
                     </button>
                  </div>

                  {/* Actors List */}
                  {editActorsArray.length > 0 ? (
                     <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[48px]">
                        {editActorsArray.map((actor, index) => (
                           <span
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700"
                           >
                              {actor}
                              <button
                                 type="button"
                                 onClick={() => handleRemoveEditActor(actor)}
                                 className="hover:text-red-500 transition-colors"
                              >
                                 <X size={14} />
                              </button>
                           </span>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-sm text-slate-400">
                        No actors added. Enter an actor name above and press Enter or click Add.
                     </div>
                  )}
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                     type="button"
                     onClick={() => setIsEditModalOpen(false)}
                     className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isEditSaving || editBusinessRulesArray.length === 0 || editActorsArray.length === 0}
                     className="px-4 py-2 rounded-xl bg-orangeFpt-500 text-sm font-semibold text-white hover:bg-orangeFpt-600 disabled:opacity-50"
                  >
                     {isEditSaving ? 'Saving...' : 'Save Changes'}
                  </button>
               </div>
            </form>
         </ModalWrapper>

         {/* Delete Confirmation Modal */}
         <ModalWrapper isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Project">
            <div className="space-y-4">
               <p className="text-slate-600">
                  Are you sure you want to delete <span className="font-bold text-slate-900">{project.projectName}</span>?
                  This action cannot be undone.
               </p>
               <div className="flex justify-end gap-3">
                  <button
                     onClick={() => setDeleteModalOpen(false)}
                     className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleDeleteProject}
                     disabled={isDeleteSubmitting}
                     className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                     {isDeleteSubmitting ? 'Deleting...' : 'Delete Permanently'}
                  </button>
               </div>
            </div>
         </ModalWrapper>

      </DashboardLayout>
   );
};

export default ProjectDetail;
