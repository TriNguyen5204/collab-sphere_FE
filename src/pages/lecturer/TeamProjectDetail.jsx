import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  Github,
  Flag,
  AlertCircle,
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  HelpCircle,
  Paperclip,
  UploadCloud,
  Loader2,
  Download,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { getTeamDetail } from '../../services/teamApi';
import { getProjectDetail } from '../../services/projectApi';
import {
  getMilestonesByTeam,
  getMilestoneDetail,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../../services/milestoneApi';
import { getUserProfile } from '../../services/userService';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import TeamResources from '../../features/lecturer/components/TeamResources';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSecureFileHandler } from '../../hooks/useSecureFileHandler';
import useFileSizeFormatter from '../../hooks/useFileSizeFormatter';
import { useAvatar } from '../../hooks/useAvatar';

// --- Avatar Component ---
const Avatar = ({ src, name, className = '' }) => {
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(
    name,
    src
  );

  if (shouldShowImage) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} object-cover bg-white`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} ${colorClass} flex items-center justify-center font-bold uppercase select-none shadow-sm border border-white`}
      style={{ fontSize: '0.85em' }}
    >
      {initials}
    </div>
  );
};

// --- Helpers ---

const formatStatusLabel = status => {
  if (!status) return 'Pending';
  return status
    .toString()
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

const formatDate = value => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const getStatusColor = status => {
  const normalized = (status ?? '').toString().toLowerCase();
  if (['completed', 'done', 'success', 'approved'].includes(normalized))
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (['in progress', 'active', 'processing'].includes(normalized))
    return 'bg-blue-100 text-blue-700 border-blue-200';
  if (['at risk', 'warning'].includes(normalized))
    return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getPriorityColor = priority => {
  const normalized = (priority ?? '').toString().toLowerCase();
  if (normalized === 'high') return 'text-red-600 bg-red-50 border-red-100';
  if (normalized === 'medium')
    return 'text-orangeFpt-600 bg-orangeFpt-50 border-orangeFpt-100';
  return 'text-emerald-600 bg-emerald-50 border-emerald-100';
};

const toDateInputValue = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'NA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const extractUrlLike = payload => {
  if (!payload) return null;
  const target =
    typeof payload === 'object' && payload !== null && 'data' in payload
      ? payload.data
      : payload;
  if (typeof target === 'string') return target;
  if (typeof target === 'object' && target !== null) {
    return target.fileUrl || null;
  }
  return null;
};

const initialMilestoneForm = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
};
const MAX_VISIBLE_CHECKPOINTS = 3;

// --- Data Normalization ---

const normalizeCheckpoints = checkpointList => {
  if (!Array.isArray(checkpointList)) return [];
  return checkpointList.map((checkpoint, index) => {
    const assignments = Array.isArray(checkpoint?.assignments)
      ? checkpoint.assignments
      : Array.isArray(checkpoint?.checkpointAssignments)
        ? checkpoint.checkpointAssignments
        : [];

    const assignees = assignments
      .map(member => member?.studentName ?? member?.fullname ?? member?.name)
      .filter(Boolean);

    return {
      id: checkpoint?.checkpointId ?? checkpoint?.id ?? index,
      title: checkpoint?.title ?? `Checkpoint ${index + 1}`,
      description: checkpoint?.description ?? '',
      statusToken: (checkpoint?.statusString ?? checkpoint?.status ?? 'PENDING')
        .toString()
        .toLowerCase(),
      dueDate: checkpoint?.dueDate ?? null,
      assignees,
    };
  });
};

// --- Components ---

const Modal = ({
  title,
  onClose,
  children,
  disableClose = false,
  maxWidth = 'max-w-lg',
}) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
    <div
      className={`w-full ${maxWidth} bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]`}
    >
      <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0'>
        <h4 className='text-lg font-bold text-slate-800'>{title}</h4>
        {onClose && (
          <button
            type='button'
            onClick={onClose}
            disabled={disableClose}
            className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50'
          >
            <X size={20} />
          </button>
        )}
      </div>
      <div className='p-6 overflow-y-auto custom-scrollbar'>{children}</div>
    </div>
  </div>
);

const TeamProjectDetail = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [teamDetail, setTeamDetail] = useState(null);
  const [projectRaw, setProjectRaw] = useState(null);
  const [teamMembersRaw, setTeamMembersRaw] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [loading, setLoading] = useState({
    team: true,
    project: false,
    milestones: false,
  });
  const [errors, setErrors] = useState({});

  // Modals
  const [milestoneModal, setMilestoneModal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [milestoneFormValues, setMilestoneFormValues] =
    useState(initialMilestoneForm);
  const [confirmState, setConfirmState] = useState(null);
  const [memberProfileModal, setMemberProfileModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openMilestoneMenuId, setOpenMilestoneMenuId] = useState(null);

  // Hooks
  const { openSecureFile } = useSecureFileHandler();
  const { formatFileSize } = useFileSizeFormatter();

  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  // --- Fetch Data ---

  const fetchTeamAndProject = useCallback(async () => {
    try {
      console.log('Fetching team detail for team ID:', teamId);
      const detail = await getTeamDetail(teamId);
      console.log('Team detail fetched:', detail);
      if (!isMountedRef.current) return;
      setTeamDetail(detail);
      setTeamMembersRaw(detail?.memberInfo?.members || []);

      const projectId =
        detail?.projectInfo?.projectId || detail?.projectInfo?.id;
      if (projectId) {
        setLoading(prev => ({ ...prev, project: true }));
        try {
          const proj = await getProjectDetail(projectId);
          if (isMountedRef.current) setProjectRaw(proj);
        } catch (err) {
          console.error('Project fetch error', err);
        } finally {
          if (isMountedRef.current)
            setLoading(prev => ({ ...prev, project: false }));
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, team: error }));
    } finally {
      setLoading(prev => ({ ...prev, team: false }));
    }
  }, [teamId]);

  const fetchMilestonesList = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(prev => ({ ...prev, milestones: true }));
      try {
        const response = await getMilestonesByTeam(teamId);
        const rawList = Array.isArray(response)
          ? response
          : response?.data || response?.list || [];
        if (isMountedRef.current) setMilestones(rawList);
      } catch (error) {
        console.error('Milestone fetch error', error);
      } finally {
        if (!silent && isMountedRef.current)
          setLoading(prev => ({ ...prev, milestones: false }));
      }
    },
    [teamId]
  );

  useEffect(() => {
    fetchTeamAndProject();
    fetchMilestonesList();
  }, [fetchTeamAndProject, fetchMilestonesList]);

  useEffect(() => {
    if (milestoneModal?.mode === 'edit' && milestoneModal.milestone) {
      const m = milestoneModal.milestone;
      setMilestoneFormValues({
        title: m.title || '',
        description: m.description || '',
        startDate: toDateInputValue(m.startDate),
        endDate: toDateInputValue(m.endDate),
      });
    }
  }, [milestoneModal]);

  // --- Derived Data ---

  const projectData = useMemo(() => {
    const progress =
      teamDetail?.teamProgress?.overallProgress ?? projectRaw?.progress ?? 0;
    return {
      title:
        projectRaw?.projectName ??
        teamDetail?.projectInfo?.projectName ??
        'Team Project',
      teamName: teamDetail?.teamName ?? 'Team',
      description: projectRaw?.description ?? 'No description.',
      progress: Math.round(progress),
      status: formatStatusLabel(
        teamDetail?.teamProgress?.statusString ?? 'Pending'
      ),
      repo: teamDetail?.gitLink ?? null,
      subject: projectRaw?.subjectName ?? '—',
      class: teamDetail?.classInfo?.className ?? '—',
    };
  }, [teamDetail, projectRaw]);

  // Merge Project Objectives with Actual Team Milestones
  const viewData = useMemo(() => {
    const objectives = (projectRaw?.objectives || []).map((obj, i) => ({
      id: obj.objectiveId || obj.id || `obj-${i}`,
      title: obj.title || `Objective ${i + 1}`,
      description: obj.description,
      priority: obj.priority,
      milestones: (obj.objectiveMilestones || []).map((m, mIdx) => {
        const teamMilestone = milestones.find(
          tm => tm.objectiveMilestoneId === (m.objectiveMilestoneId || m.id)
        );
        return {
          ...m,
          ...teamMilestone,
          id:
            teamMilestone?.id ||
            m.objectiveMilestoneId ||
            m.id ||
            `ms-fallback-${i}-${mIdx}`,
          isLinked: !!teamMilestone,
          displayId:
            teamMilestone?.teamMilestoneId ||
            teamMilestone?.id ||
            m.objectiveMilestoneId ||
            m.id,
          statusToken: teamMilestone?.statusString || 'NOT_STARTED',
          isCustom: false, // Standard milestone linked to objective
        };
      }),
    }));

    // Identify Custom Milestones (Those with NO objectiveMilestoneId)
    const customMilestones = milestones
      .filter(m => !m.objectiveMilestoneId)
      .map(m => ({
        ...m,
        id: m.id || m.teamMilestoneId,
        displayId: m.teamMilestoneId || m.id,
        statusToken: m.statusString || 'NOT_STARTED',
        isCustom: true, // Custom milestone created by lecturer/team
      }));

    return { objectives, customMilestones };
  }, [projectRaw, milestones]);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Classes', href: '/lecturer/classes' },
      {
        label: teamDetail?.classInfo?.className,
        href: `/lecturer/classes/${classId}`,
      },
      { label: teamDetail?.teamName || 'Team Project' },
    ],
    [classId, teamDetail]
  );

  // --- Handlers ---

  const handleOpenMilestoneManager = (
    milestone,
    mode = 'edit',
    tab = 'details'
  ) => {
    setMilestoneModal({ mode, milestone, activeTab: tab });
    setOpenMilestoneMenuId(null);

    if (mode === 'create') {
      setMilestoneFormValues(initialMilestoneForm);
    }
  };

  const handleSaveMilestoneDetails = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Base payload (always send dates)
      const payload = {
        teamId: Number(teamId),
        startDate: milestoneFormValues.startDate,
        endDate: milestoneFormValues.endDate,
      };

      const isCustomOrNew =
        milestoneModal.mode === 'create' ||
        (milestoneModal.milestone && milestoneModal.milestone.isCustom);

      // Only include Title/Description if it's a Custom milestone or New
      if (isCustomOrNew) {
        payload.title = milestoneFormValues.title;
        payload.description = milestoneFormValues.description;
      }

      if (milestoneModal.mode === 'create') {
        await createMilestone(payload);
        toast.success('Milestone created');
        setMilestoneModal(null);
      } else {
        const id =
          milestoneModal.milestone.displayId || milestoneModal.milestone.id;
        await updateMilestone(id, payload);
        toast.success('Milestone details updated');
        setMilestoneModal(null);
      }
      fetchMilestonesList(true);
    } catch (err) {
      toast.error('Failed to save milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMilestoneMenu = milestoneId => {
    setOpenMilestoneMenuId(prev => (prev === milestoneId ? null : milestoneId));
  };

  const handleMenuBlur = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpenMilestoneMenuId(null);
    }
  };

  // --- Questions Handlers ---

  const handleDeleteMilestone = async () => {
    if (!confirmState?.item?.id) return;
    setIsSubmitting(true);
    try {
      const idToDelete = confirmState.item.displayId || confirmState.item.id;
      await deleteMilestone(idToDelete);
      toast.success('Milestone deleted');
      setConfirmState(null);
      fetchMilestonesList(true);
    } catch (error) {
      toast.error('Failed to delete milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading.team)
    return (
      <DashboardLayout>
        <div className='flex h-96 items-center justify-center'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-orangeFpt-200 border-t-orangeFpt-500'></div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className='min-h-screen space-y-8 bg-slate-50/50'>
        {/* --- HEADER --- */}
        <LecturerBreadcrumbs items={breadcrumbItems} />
        <div className='mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50'>
          <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl'></div>

          <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-4 max-w-2xl'>
              <div className='flex items-center gap-3'>
                <span className='px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider'>
                  Team Space
                </span>
              </div>
              <div>
                <h1 className='text-3xl font-bold text-slate-900'>
                  {projectData.title}
                </h1>
                <div className='flex items-center gap-2 mt-2 text-lg font-medium text-slate-600'>
                  <Users size={20} className='text-orangeFpt-500' />
                  {projectData.teamName}
                </div>
              </div>
              <p className='text-slate-500 leading-relaxed max-w-xl'>
                {projectData.description}
              </p>
            </div>

            {/* Progress */}
            <div className='flex flex-col items-center justify-center p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm'>
              <div className='relative h-20 w-20'>
                <svg className='h-full w-full -rotate-90' viewBox='0 0 36 36'>
                  <path
                    className='text-slate-200'
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='text-orangeFpt-500 transition-all duration-1000'
                    strokeDasharray={`${projectData.progress}, 100`}
                    d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='4'
                    strokeLinecap='round'
                  />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800'>
                  {projectData.progress}%
                </div>
              </div>
              <span className='mt-2 text-xs font-medium text-slate-500'>
                Progress
              </span>
            </div>
          </div>
        </div>

            {/* --- TABS --- */}
            <div className="flex items-center gap-4 mb-8">
               <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                     activeTab === 'overview'
                        ? 'bg-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-200 scale-105'
                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
               >
                  Overview
               </button>
               <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                     activeTab === 'resources'
                        ? 'bg-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-200 scale-105'
                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
               >
                  Resources
               </button>
            </div>

        {/* --- CONTENT --- */}
        {activeTab === 'resources' ? (
          <TeamResources teamId={teamId} />
        ) : (
          <div className='mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* LEFT: MILESTONES */}
            <div className='space-y-8 lg:col-span-2'>
              {/* 1. Objectives & Linked Milestones */}
              <section className='space-y-6'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600'>
                    <Target size={20} />
                  </div>
                  <h2 className='text-lg font-bold text-slate-800'>
                    Project Objectives
                  </h2>
                </div>

                <div className='space-y-6'>
                  {viewData.objectives.map((obj, idx) => (
                    <div
                      key={obj.id}
                      className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
                    >
                      <div className='mb-4 flex items-start justify-between'>
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500'>
                              {idx + 1}
                            </span>
                            <h3 className='font-bold text-slate-800'>
                              {obj.title}
                            </h3>
                          </div>
                          <p className='text-sm text-slate-500 pl-7'>
                            {obj.description}
                          </p>
                        </div>
                        {obj.priority && (
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border ${getPriorityColor(obj.priority)}`}
                          >
                            {obj.priority}
                          </span>
                        )}
                      </div>

                      <div className='space-y-3 pl-7'>
                        {obj.milestones.map(milestone => (
                          <div
                            key={milestone.id}
                            className='group flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm'
                          >
                            <div className='flex items-start justify-between'>
                              <div>
                                <h4 className='font-semibold text-slate-700 text-sm'>
                                  {milestone.title}
                                </h4>
                                <div className='flex items-center gap-3 mt-1 text-xs text-slate-500'>
                                  <span className='flex items-center gap-1'>
                                    <Calendar size={12} />{' '}
                                    {milestone.isLinked
                                      ? `${formatDate(milestone.startDate)} — ${formatDate(milestone.endDate)}`
                                      : 'Not scheduled'}
                                  </span>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(milestone.statusToken)}`}
                                >
                                  {formatStatusLabel(milestone.statusToken)}
                                </span>
                                {/* ALLOW EDITING IF LINKED */}
                                {milestone.isLinked && (
                                  <div
                                    className='relative'
                                    tabIndex={-1}
                                    onBlur={handleMenuBlur}
                                  >
                                    <button
                                      onClick={() =>
                                        toggleMilestoneMenu(milestone.displayId)
                                      }
                                      className='p-1.5 rounded-lg text-slate-400 hover:text-orangeFpt-600 hover:bg-orangeFpt-50 transition-colors'
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                    {openMilestoneMenuId ===
                                      milestone.displayId && (
                                      <div className='absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95'>
                                        <button
                                          onClick={() =>
                                            navigate(
                                              `/lecturer/classes/${classId}/team/${teamId}/milestone/${milestone.displayId || milestone.id}`
                                            )
                                          }
                                          className='w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2'
                                        >
                                          <Eye size={14} /> View Details
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleOpenMilestoneManager(
                                              milestone,
                                              'edit'
                                            )
                                          }
                                          className='w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2'
                                        >
                                          <Edit3 size={14} /> Edit
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Custom Milestones */}
              <section className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-blue-100 text-blue-600'>
                      <Flag size={20} />
                    </div>
                    <h2 className='text-lg font-bold text-slate-800'>
                      Custom Milestones
                    </h2>
                  </div>
                  <button
                    onClick={() => handleOpenMilestoneManager(null, 'create')}
                    className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-orangeFpt-50 hover:text-orangeFpt-600 transition-colors'
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className='grid gap-4'>
                  {viewData.customMilestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
                    >
                      <div className='flex justify-between items-start'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-bold text-slate-800'>
                              {milestone.title}
                            </h4>
                            <span className='px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase'>
                              Custom
                            </span>
                          </div>
                          <p className='text-sm text-slate-500 mt-1'>
                            {milestone.description}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(milestone.statusToken)}`}
                          >
                            {formatStatusLabel(milestone.statusToken)}
                          </span>
                          <div
                            className='relative'
                            tabIndex={-1}
                            onBlur={handleMenuBlur}
                          >
                            <button
                              onClick={() =>
                                toggleMilestoneMenu(milestone.displayId)
                              }
                              className='p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openMilestoneMenuId === milestone.displayId && (
                              <div className='absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95'>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/lecturer/classes/${classId}/team/${teamId}/milestone/${milestone.displayId || milestone.id}`
                                    )
                                  }
                                  className='w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2'
                                >
                                  <Eye size={14} /> View Details
                                </button>
                                <button
                                  onClick={() =>
                                    handleOpenMilestoneManager(
                                      milestone,
                                      'edit'
                                    )
                                  }
                                  className='w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2'
                                >
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmState({ item: milestone })
                                  }
                                  className='w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2'
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100'>
                        <span className='flex items-center gap-1'>
                          <Calendar size={12} />{' '}
                          {formatDate(milestone.startDate)} —{' '}
                          {formatDate(milestone.endDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {viewData.customMilestones.length === 0 && (
                    <div className='py-6 text-center text-sm text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200'>
                      No custom milestones added.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT: TEAM ROSTER */}
            <aside className='space-y-6'>
              <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-6'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-2 rounded-lg bg-emerald-100 text-emerald-600'>
                    <Users size={20} />
                  </div>
                  <h3 className='font-bold text-slate-800'>Team Roster</h3>
                </div>
                <div className='space-y-4'>
                  {teamMembersRaw.map((member, idx) => (
                    <div
                      key={idx}
                      className='flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all cursor-pointer'
                      onClick={() => setMemberProfileModal(member)}
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          className='h-9 w-9 rounded-full border border-slate-200 shadow-sm'
                        />
                        <div>
                          <p className='font-semibold text-slate-900'>
                            {member.studentName}
                          </p>
                          {member.teamRole === 1 && (
                            <span className='inline-flex items-center gap-1 text-xs font-medium text-orangeFpt-600'>
                              <GraduationCap className='h-3 w-3' /> Leader
                            </span>
                          )}
                          {member.teamRole === 0 && (
                            <span className='text-slate-500'>Member</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* --- MILESTONE MANAGEMENT MODAL --- */}
      {milestoneModal && (
        <Modal
          title={
            milestoneModal.mode === 'create'
              ? 'Create Custom Milestone'
              : 'Manage Milestone'
          }
          onClose={() => setMilestoneModal(null)}
          maxWidth='max-w-3xl'
        >
          <form onSubmit={handleSaveMilestoneDetails} className='space-y-4'>
            <div>
              <label className='block text-xs font-bold uppercase text-slate-500 mb-1'>
                Title
              </label>
              <input
                type='text'
                className='w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500'
                value={milestoneFormValues.title}
                onChange={e =>
                  setMilestoneFormValues({
                    ...milestoneFormValues,
                    title: e.target.value,
                  })
                }
                required
                disabled={
                  milestoneModal.mode === 'edit' &&
                  !milestoneModal.milestone.isCustom
                }
              />
            </div>
            <div>
              <label className='block text-xs font-bold uppercase text-slate-500 mb-1'>
                Description
              </label>
              <textarea
                rows={3}
                className='w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500'
                value={milestoneFormValues.description}
                onChange={e =>
                  setMilestoneFormValues({
                    ...milestoneFormValues,
                    description: e.target.value,
                  })
                }
                disabled={
                  milestoneModal.mode === 'edit' &&
                  !milestoneModal.milestone.isCustom
                }
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-bold uppercase text-slate-500 mb-1'>
                  Start Date
                </label>
                <input
                  type='date'
                  className='w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none'
                  value={milestoneFormValues.startDate}
                  onChange={e =>
                    setMilestoneFormValues({
                      ...milestoneFormValues,
                      startDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className='block text-xs font-bold uppercase text-slate-500 mb-1'>
                  End Date
                </label>
                <input
                  type='date'
                  className='w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-orangeFpt-500 focus:outline-none'
                  value={milestoneFormValues.endDate}
                  onChange={e =>
                    setMilestoneFormValues({
                      ...milestoneFormValues,
                      endDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className='flex justify-end pt-4'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='px-6 py-2 bg-orangeFpt-500 text-white font-semibold rounded-xl hover:bg-orangeFpt-600 disabled:opacity-50'
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmState && (
        <Modal title='Confirm Delete' onClose={() => setConfirmState(null)}>
          <div className='space-y-4'>
            <p className='text-slate-600'>
              Are you sure you want to delete this milestone? This cannot be
              undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setConfirmState(null)}
                className='px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMilestone}
                disabled={isSubmitting}
                className='px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50'
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Member Profile Modal */}
      {memberProfileModal && (
        <Modal
          title='Student Profile'
          onClose={() => setMemberProfileModal(null)}
        >
          <div className='flex flex-col items-center mb-6'>
            <div className='h-20 w-20 rounded-full bg-orangeFpt-100 text-orangeFpt-600 flex items-center justify-center text-2xl font-bold mb-3'>
              {getInitials(
                memberProfileModal.fullName || memberProfileModal.studentName
              )}
            </div>
            <h3 className='text-lg font-bold text-slate-900'>
              {memberProfileModal.fullName || memberProfileModal.studentName}
            </h3>
            <p className='text-sm text-slate-500'>
              {memberProfileModal.studentCode}
            </p>
          </div>
          <div className='grid gap-3 text-sm'>
            <div className='flex justify-between py-2 border-b border-slate-100'>
              <span className='text-slate-500 flex items-center gap-2'>
                <Mail size={14} /> Email
              </span>
              <span className='font-medium text-slate-800'>
                {memberProfileModal.email}
              </span>
            </div>
            <div className='flex justify-between py-2 border-b border-slate-100'>
              <span className='text-slate-500 flex items-center gap-2'>
                <Phone size={14} /> Phone
              </span>
              <span className='font-medium text-slate-800'>
                {memberProfileModal.phoneNumber || '—'}
              </span>
            </div>
            <div className='flex justify-between py-2 border-b border-slate-100'>
              <span className='text-slate-500 flex items-center gap-2'>
                <GraduationCap size={14} /> Major
              </span>
              <span className='font-medium text-slate-800'>
                {memberProfileModal.major || '—'}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default TeamProjectDetail;
