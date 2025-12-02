import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
  Plus, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Target,
  Flag
} from 'lucide-react';

import {
  getProjectDetail,
  updateProjectBeforeApproval,
  deleteProjectBeforeApproval,
} from '../../services/projectApi';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import ModalWrapper from '../../components/layout/ModalWrapper';
// Reuse DashboardLayout if available, or wrapping div
import DashboardLayout from '../../components/layout/DashboardLayout';

// --- Styles & Constants ---
const glassPanelClass = 'bg-white border border-slate-200 shadow-sm';

const PRIORITY_COLORS = {
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-red-50 text-red-700 border-red-200',
  MEDIUM: 'bg-orangeFpt-50 text-orangeFpt-700 border-orangeFpt-200',
  Medium: 'bg-orangeFpt-50 text-orangeFpt-700 border-orangeFpt-200',
  LOW: 'bg-slate-50 text-slate-700 border-slate-200',
  Low: 'bg-slate-50 text-slate-700 border-slate-200',
  '': 'bg-slate-50 text-slate-600 border-slate-200'
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  DENIED: { label: 'Denied', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle },
  UNKNOWN: { label: 'Unknown', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: AlertCircle },
};

const STATUS_CODE_MAP = { 0: 'PENDING', 1: 'APPROVED', 2: 'DENIED' };

// --- Helpers ---
const resolveProjectStatusKey = (project) => {
  if (!project) return 'PENDING';
  if (typeof project.status === 'string') return project.status.toUpperCase();
  if (typeof project.status === 'number') return STATUS_CODE_MAP[project.status] ?? 'PENDING';
  return 'PENDING';
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const generateTempId = () => `tmp-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;

const createEmptyMilestone = () => ({
  id: generateTempId(),
  title: '',
  description: '',
  startDate: '',
  endDate: '',
});

const createEmptyObjective = () => ({
  id: generateTempId(),
  title: '',
  description: '',
  priority: 'Medium',
  objectiveMilestones: [createEmptyMilestone()],
});

const normalizeObjectivesForDraft = (objectives) => {
  if (!Array.isArray(objectives) || objectives.length === 0) return [createEmptyObjective()];
  return objectives.map((obj) => ({
    ...obj,
    id: obj.objectiveId ?? obj.id ?? generateTempId(),
    objectiveMilestones: (obj.objectiveMilestones?.length ? obj.objectiveMilestones : [createEmptyMilestone()]).map(m => ({
      ...m,
      id: m.objectiveMilestoneId ?? m.milestoneId ?? m.id ?? generateTempId(),
      startDate: toDateInputValue(m.startDate ?? m.beginDate),
      endDate: toDateInputValue(m.endDate ?? m.dueDate)
    }))
  }));
};

// --- Sub-Components ---

const ObjectiveCard = ({ objective, index, isPending, onEdit }) => {
  const objId = objective.objectiveId || objective.id;
  return (
  <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-orangeFpt-200 hover:shadow-md">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {index + 1}
          </span>
          <h3 className="font-bold text-slate-900">
            {objective.title || `Objective ${index + 1}`}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PRIORITY_COLORS[objective.priority] || PRIORITY_COLORS.LOW}`}>
            {objective.priority || 'Normal'}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed pl-9">
          {objective.description || 'No description provided.'}
        </p>
      </div>
      
      {isPending && (
        <button 
          onClick={() => onEdit({ objectiveId: objId })}
          className="shrink-0 p-2 text-slate-400 hover:bg-slate-50 hover:text-orangeFpt-600 rounded-lg transition-colors"
        >
          <Edit3 size={18} />
        </button>
      )}
    </div>

    {/* Milestones Timeline */}
    <div className="mt-6 pl-3 sm:pl-9">
      <div className="relative border-l-2 border-slate-100 space-y-6 pb-2">
        {objective.objectiveMilestones?.map((milestone, mIdx) => {
          const msId = milestone.objectiveMilestoneId || milestone.milestoneId || milestone.id;
          return (
          <div key={mIdx} className="relative pl-6">
            {/* Timeline Dot */}
            <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-orangeFpt-400 ring-2 ring-white"></div>
            
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 group/milestone relative hover:border-orangeFpt-200 transition-colors">
              {isPending && (
                  <button 
                     onClick={() => onEdit({ objectiveId: objId, milestoneId: msId })}
                     className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-orangeFpt-600 hover:bg-white rounded-lg opacity-0 group-hover/milestone:opacity-100 transition-all"
                     title="Edit Milestone"
                  >
                     <Edit3 size={14} />
                  </button>
               )}
              <div className="flex flex-wrap justify-between gap-2 mb-1 pr-6">
                <h4 className="text-sm font-semibold text-slate-800">{milestone.title || 'Untitled Milestone'}</h4>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(milestone.startDate)} — {formatDate(milestone.endDate)}
                </span>
              </div>
              <p className="text-xs text-slate-500">{milestone.description}</p>
            </div>
          </div>
        )})}
      </div>
    </div>
  </div>
  );
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const lecturerId = useSelector((state) => state.user?.userId);
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDraft, setEditDraft] = useState({ projectName: '', description: '' });
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [structureDraft, setStructureDraft] = useState([]);
  const [structureMeta, setStructureMeta] = useState({ projectName: '', description: '' });
  const [isStructureSaving, setIsStructureSaving] = useState(false);
  const [structureError, setStructureError] = useState('');

  // Scroll to target
  const [focusTarget, setFocusTarget] = useState(null);
  const objectiveRefs = useRef({});

  useEffect(() => {
    if (structureModalOpen && focusTarget) {
      const targetId = focusTarget.milestoneId || focusTarget.objectiveId;
      if (!targetId) return;

      // Small timeout to ensure modal content is rendered
      setTimeout(() => {
        const el = objectiveRefs.current[targetId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect
          el.classList.add('ring-2', 'ring-orangeFpt-500', 'ring-offset-2');
          setTimeout(() => el.classList.remove('ring-2', 'ring-orangeFpt-500', 'ring-offset-2'), 2000);
        }
      }, 300);
    }
  }, [structureModalOpen, focusTarget]);

  // --- Fetch Data ---
  const fetchProject = useCallback(async (silent = false) => {
    if (!projectId) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await getProjectDetail(projectId);
      setProject(data);
    } catch (err) {
      toast.error('Failed to load project details.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject, reloadKey]);

  // --- Helpers ---
  const statusKey = resolveProjectStatusKey(project);
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.UNKNOWN;
  const StatusIcon = statusConfig.icon;
  const isPending = statusKey === 'PENDING';

  const breadcrumbItems = useMemo(() => [
    { label: 'Project Library', href: '/lecturer/projects' },
    { label: project?.projectName ?? 'Loading...' },
  ], [project]);

  // --- Actions ---
  const handleOpenEdit = () => {
    setEditDraft({ projectName: project.projectName, description: project.description });
    setIsEditModalOpen(true);
  };

  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    setIsEditSaving(true);
    try {
      // Preserve existing objectives to prevent deletion
      const objectivesPayload = project.objectives?.map(obj => ({
        objectiveId: obj.objectiveId || obj.id,
        title: obj.title,
        description: obj.description,
        priority: obj.priority,
        objectiveMilestones: obj.objectiveMilestones?.map(m => ({
          objectiveMilestoneId: m.objectiveMilestoneId || m.milestoneId || m.id,
          title: m.title,
          description: m.description,
          startDate: toDateInputValue(m.startDate || m.beginDate),
          endDate: toDateInputValue(m.endDate || m.dueDate)
        })) || []
      })) || [];

      await updateProjectBeforeApproval({
        projectId: project.id || project.projectId,
        ...editDraft,
        lecturerId: project.lecturerId,
        subjectId: project.subjectId,
        objectives: objectivesPayload
      });
      toast.success('Project details updated');
      await fetchProject(true);
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update project');
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleteSubmitting(true);
    try {
      await deleteProjectBeforeApproval(project.id || project.projectId);
      toast.success('Draft project deleted');
      navigate('/lecturer/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleOpenStructure = (focusObj = null) => {
    setStructureMeta({ projectName: project.projectName, description: project.description });
    setStructureDraft(normalizeObjectivesForDraft(project.objectives));
    setStructureError('');
    setFocusTarget(focusObj);
    setStructureModalOpen(true);
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    setIsStructureSaving(true);
    setStructureError('');

    // Basic Validation
    if (!structureDraft.length) {
      setStructureError('At least one objective is required.');
      setIsStructureSaving(false);
      return;
    }

    try {
      const payload = {
        projectId: project.id || project.projectId,
        ...structureMeta,
        lecturerId: project.lecturerId,
        subjectId: project.subjectId,
        objectives: structureDraft.map(obj => ({
          // Only send IDs if they are NOT temp ones (numeric)
          objectiveId: String(obj.id).startsWith('tmp') ? 0 : obj.objectiveId || obj.id,
          title: obj.title,
          description: obj.description,
          priority: obj.priority,
          objectiveMilestones: obj.objectiveMilestones.map(m => ({
            objectiveMilestoneId: String(m.id).startsWith('tmp') ? 0 : m.objectiveMilestoneId || m.id,
            title: m.title,
            description: m.description,
            startDate: m.startDate,
            endDate: m.endDate
          }))
        }))
      };

      await updateProjectBeforeApproval(payload);
      toast.success('Project structure updated');
      await fetchProject(true);
      setStructureModalOpen(false);
    } catch (error) {
      console.error(error);
      setStructureError('Failed to save structure. Check console for details.');
    } finally {
      setIsStructureSaving(false);
    }
  };

  // --- Structure Draft Helpers ---
  const updateDraftObjective = (idx, field, val) => {
    const newDraft = [...structureDraft];
    newDraft[idx][field] = val;
    setStructureDraft(newDraft);
  };

  const updateDraftMilestone = (oIdx, mIdx, field, val) => {
    const newDraft = [...structureDraft];
    newDraft[oIdx].objectiveMilestones[mIdx][field] = val;
    setStructureDraft(newDraft);
  };

  const addDraftMilestone = (oIdx) => {
    const newDraft = [...structureDraft];
    newDraft[oIdx].objectiveMilestones.push(createEmptyMilestone());
    setStructureDraft(newDraft);
  };

  const removeDraftMilestone = (oIdx, mIdx) => {
    const newDraft = [...structureDraft];
    newDraft[oIdx].objectiveMilestones.splice(mIdx, 1);
    setStructureDraft(newDraft);
  };

  const addDraftObjective = () => setStructureDraft([...structureDraft, createEmptyObjective()]);
  const removeDraftObjective = (idx) => {
    const newDraft = [...structureDraft];
    newDraft.splice(idx, 1);
    setStructureDraft(newDraft);
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orangeFpt-200 border-t-orangeFpt-500"></div>
      </div>
    </DashboardLayout>
  );

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

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50">
        
        {/* --- HEADER --- */}
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                   <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                   </div>
                </div>
                
                <div>
                   <h1 className="text-3xl font-bold text-slate-900">{project.projectName}</h1>
                   <p className="mt-2 text-lg text-slate-600 leading-relaxed">
                      {project.description || 'No description provided.'}
                   </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <BookOpen size={16} className="text-orangeFpt-500" />
                      <span className="font-semibold">{project.subjectName}</span>
                      <span className="text-slate-400">({project.subjectCode})</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <User size={16} className="text-blue-500" />
                      <span className="font-semibold">{project.lecturerName}</span>
                   </div>
                </div>
              </div>

              {/* Actions for Pending Projects */}
              {isPending && (
                <div className="flex flex-col gap-3 sm:flex-row">
                   <button 
                      onClick={handleOpenEdit}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
                   >
                      <Edit3 size={16} /> Edit Info
                   </button>
                   <button 
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 hover:border-red-300 transition-colors"
                   >
                      <Trash2 size={16} /> Delete
                   </button>
                </div>
              )}
            </div>
          </div>

        {/* --- MAIN CONTENT --- */}
        <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: Objectives */}
          <div className="space-y-6 lg:col-span-2">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <Target className="text-orangeFpt-500" />
                   Objectives & Milestones
                </h2>
                {isPending && (
                   <button 
                      onClick={() => handleOpenStructure()}
                      className="text-sm font-semibold text-orangeFpt-600 hover:underline"
                   >
                      Manage Structure
                   </button>
                )}
             </div>

             <div className="space-y-4">
                {project.objectives?.length > 0 ? (
                   project.objectives.map((obj, idx) => (
                      <ObjectiveCard 
                        key={obj.id || idx} 
                        objective={obj} 
                        index={idx} 
                        isPending={isPending}
                        onEdit={(target) => handleOpenStructure(target)}
                      />
                   ))
                ) : (
                   <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                      <p className="text-slate-500">No objectives defined yet.</p>
                      {isPending && (
                         <button 
                            onClick={() => handleOpenStructure()}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orangeFpt-600"
                         >
                            <Plus size={16} /> Add First Objective
                         </button>
                      )}
                   </div>
                )}
             </div>
          </div>

          {/* Right Column: Timeline & Meta */}
          <div className="space-y-6">
             <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Timeline</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Created</span>
                      <span className="font-medium text-slate-900">{formatDate(project.createdAt)}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Last Updated</span>
                      <span className="font-medium text-slate-900">{formatDate(project.updatedAt)}</span>
                   </div>
                   <div className="h-px bg-slate-100 my-2"></div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Milestones</span>
                      <span className="font-medium text-slate-900">
                         {project.objectives?.reduce((acc, o) => acc + (o.objectiveMilestones?.length || 0), 0) || 0}
                      </span>
                   </div>
                </div>
             </div>

             <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2">Class Context</h3>
                {project.classId ? (
                   <div>
                      <p className="text-sm text-slate-600 mb-4">This project is assigned to an active class.</p>
                      <button 
                         onClick={() => navigate(`/lecturer/classes/${project.classId}`)}
                         className="w-full rounded-xl bg-white border border-blue-200 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                         View Class
                      </button>
                   </div>
                ) : (
                   <p className="text-sm text-slate-500 italic">Not currently assigned to a specific class context.</p>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Quick Edit Modal */}
      <ModalWrapper isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project Details">
         <form onSubmit={handleUpdateBasicInfo} className="space-y-5">
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
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
               <textarea 
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                  value={editDraft.description}
                  onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
               />
            </div>
            <div className="flex justify-end gap-3 pt-2">
               <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
               >
                  Cancel
               </button>
               <button 
                  type="submit" 
                  disabled={isEditSaving}
                  className="px-4 py-2 rounded-xl bg-orangeFpt-500 text-sm font-semibold text-white hover:bg-orangeFpt-600 disabled:opacity-50"
               >
                  {isEditSaving ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
         </form>
      </ModalWrapper>

      {/* 2. Structure Modal (Full Editor) */}
      <ModalWrapper isOpen={structureModalOpen} onClose={() => setStructureModalOpen(false)} title="Edit Objectives & Milestones">
         <form onSubmit={handleSaveStructure} className="flex flex-col gap-6 overflow-y-auto pr-2">
            {structureError && (
               <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle size={16} /> {structureError}
               </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               <div className="sm:col-span-2">
                  <label className="block text-sm font-bold uppercase text-slate-500 mb-2">Project Name</label>
                  <input 
                     type="text" 
                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                     value={structureMeta.projectName}
                     onChange={(e) => setStructureMeta({ ...structureMeta, projectName: e.target.value })}
                  />
               </div>
               <div className="sm:col-span-2">
                  <label className="block text-sm font-bold uppercase text-slate-500 mb-2">Description</label>
                  <textarea 
                     rows={3} 
                     className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                     value={structureMeta.description}
                     onChange={(e) => setStructureMeta({ ...structureMeta, description: e.target.value })}
                  />
               </div>
            </div>

            <div className="space-y-8">
               {structureDraft.map((objective, oIdx) => (
                  <div 
                     key={objective.id} 
                     ref={el => objectiveRefs.current[objective.id] = el}
                     className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-6 shadow-sm transition-all duration-300"
                  >
                     {/* Objective Header */}
                     <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                           <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200">
                              {oIdx + 1}
                           </span>
                           <h4 className="text-lg font-bold text-slate-800">Objective</h4>
                        </div>
                        <button 
                           type="button" 
                           onClick={() => removeDraftObjective(oIdx)}
                           disabled={structureDraft.length === 1}
                           className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        >
                           <Trash2 size={20} />
                        </button>
                     </div>

                     {/* Objective Fields */}
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div className="sm:col-span-3">
                           <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Title</label>
                           <input 
                              type="text" 
                              placeholder="e.g. Develop Core Features"
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white shadow-sm"
                              value={objective.title}
                              onChange={(e) => updateDraftObjective(oIdx, 'title', e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Priority</label>
                           <select 
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                              value={objective.priority}
                              onChange={(e) => updateDraftObjective(oIdx, 'priority', e.target.value)}
                           >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                           </select>
                        </div>
                        <div className="sm:col-span-4">
                           <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Description</label>
                           <textarea 
                              rows={3}
                              placeholder="Describe the objective..."
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                              value={objective.description}
                              onChange={(e) => updateDraftObjective(oIdx, 'description', e.target.value)}
                           />
                        </div>
                     </div>

                     {/* Milestones */}
                     <div className="pl-6 border-l-2 border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                           <h5 className="text-sm font-bold uppercase text-slate-500 tracking-wide">Milestones</h5>
                        </div>
                        {objective.objectiveMilestones.map((milestone, mIdx) => (
                           <div 
                              key={milestone.id} 
                              ref={el => {
                                 if (milestone.id) objectiveRefs.current[milestone.id] = el;
                              }}
                              className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 relative group shadow-sm hover:shadow-md transition-shadow"
                           >
                              <button 
                                 type="button"
                                 onClick={() => removeDraftMilestone(oIdx, mIdx)}
                                 className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                              >
                                 <Trash2 size={16} />
                              </button>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">Milestone Title</label>
                                    <input 
                                       type="text" 
                                       placeholder="Milestone Title"
                                       className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                                    value={milestone.title}
                                    onChange={(e) => updateDraftMilestone(oIdx, mIdx, 'title', e.target.value)}
                                 />
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                    <div>
                                       <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                                       <input 
                                          type="date" 
                                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                                          value={milestone.startDate}
                                          onChange={(e) => updateDraftMilestone(oIdx, mIdx, 'startDate', e.target.value)}
                                       />
                                    </div>
                                    <div>
                                       <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
                                       <input 
                                          type="date" 
                                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                                          value={milestone.endDate}
                                          onChange={(e) => updateDraftMilestone(oIdx, mIdx, 'endDate', e.target.value)}
                                       />
                                    </div>
                                 </div>
                              </div>
                              <div className="mt-2">
                                 <label className="block text-xs font-semibold text-slate-400 mb-1">Deliverables</label>
                                 <textarea 
                                    rows={2}
                                    placeholder="Milestone deliverables..."
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                                    value={milestone.description}
                                    onChange={(e) => updateDraftMilestone(oIdx, mIdx, 'description', e.target.value)}
                                 />
                              </div>
                           </div>
                        ))}
                        <button 
                           type="button" 
                           onClick={() => addDraftMilestone(oIdx)}
                           className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                           <Plus size={16} /> Add Milestone
                        </button>
                     </div>
                  </div>
               ))}
               
               <button 
                  type="button" 
                  onClick={addDraftObjective}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
               >
                  <Plus size={20} /> Add New Objective
               </button>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 border-t border-slate-100 flex justify-end gap-3 pb-2">
               <button 
                  type="button" 
                  onClick={() => setStructureModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
               >
                  Cancel
               </button>
               <button 
                  type="submit" 
                  disabled={isStructureSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none"
               >
                  {isStructureSaving ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
         </form>
      </ModalWrapper>

      {/* 3. Delete Confirmation */}
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
