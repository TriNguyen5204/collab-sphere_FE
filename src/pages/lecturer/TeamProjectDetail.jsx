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
  PenTool,
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
  ChevronRight,
  ChevronDown,
  ListChecks,
  ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';
import { getTeamDetail, updateTeam } from '../../services/teamApi';
import { getProjectDetail } from '../../services/projectApi';
import {
  getMilestonesByTeam,
  getMilestoneDetail,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../../services/milestoneApi';
import { getClassDetail, getUserProfile } from '../../services/userService';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import TeamResources from '../../features/lecturer/components/TeamResources';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSecureFileHandler } from '../../hooks/useSecureFileHandler';
import useFileSizeFormatter from '../../hooks/useFileSizeFormatter';
import { useAvatar } from '../../hooks/useAvatar';
import useTeam from '../../context/useTeam';
import { getSemester } from '../../services/userService';

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

const getActorConfig = (actorName) => {
  const lowerName = (actorName || '').toLowerCase();
  for (const [key, config] of Object.entries(ACTOR_CONFIG)) {
    if (lowerName.includes(key)) return config;
  }
  return ACTOR_CONFIG.default;
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

const extractTeamSize = (description) => {
  const match = description?.match(/(\d+)\s*members?/i);
  return match ? parseInt(match[1], 10) : null;
};

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

const normalizeMemberRecord = (member, fallbackClassId) => {
  if (!member) return null;
  const rawId =
    member.studentId ??
    member.userId ??
    member.id ??
    member.memberId ??
    member.student?.studentId;
  const parsedId = Number(rawId);
  if (!Number.isFinite(parsedId)) return null;

  const rawClassId =
    member.classId ??
    member.classID ??
    member.student?.classId ??
    fallbackClassId;
  const parsedClassId = Number(rawClassId ?? fallbackClassId ?? 0);

  const name =
    member.studentName ??
    member.fullName ??
    member.fullname ??
    member.name ??
    member.student?.fullName ??
    'Student';
  const code =
    member.studentCode ??
    member.code ??
    member.student?.studentCode ??
    '';
  const avatar =
    member.avatar ??
    member.avatarImg ??
    member.profileImage ??
    member.student?.avatar ??
    null;

  const roleToken = Number(member.teamRole ?? (member.isLeader ? 1 : 0));

  return {
    studentId: parsedId,
    classId: Number.isFinite(parsedClassId) ? parsedClassId : Number(fallbackClassId ?? 0),
    studentName: name,
    studentCode: code,
    avatar,
    teamRole: Number.isFinite(roleToken) ? roleToken : 0,
  };
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
  const classIdNumber = Number.isFinite(Number(classId)) ? Number(classId) : 0;

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

  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [rosterDraft, setRosterDraft] = useState([]);
  const [benchStudents, setBenchStudents] = useState([]);
  const [rosterLeaderId, setRosterLeaderId] = useState(null);
  const [rosterTab, setRosterTab] = useState('current');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSaving, setRosterSaving] = useState(false);
  const { teamBoard } = useTeam();
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [semesterEndDate, setSemesterEndDate] = useState(null);
  const [semesterStartDate, setSemesterStartDate] = useState(null);

  // Hooks
  const { openSecureFile } = useSecureFileHandler();
  const { formatFileSize } = useFileSizeFormatter();

  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const buildNormalizedMembers = useCallback(
    (records) =>
      (Array.isArray(records) ? records : [])
        .map((record) => normalizeMemberRecord(record, classIdNumber))
        .filter(Boolean),
    [classIdNumber]
  );

  const handleOpenRosterModal = useCallback(async () => {
    const normalizedRoster = buildNormalizedMembers(teamMembersRaw);
    setRosterDraft(normalizedRoster);
    setRosterLeaderId(
      normalizedRoster.find((member) => member.teamRole === 1)?.studentId ??
      normalizedRoster[0]?.studentId ??
      null
    );
    setBenchStudents([]);
    setRosterTab('current');
    setRosterSearch('');
    setRosterModalOpen(true);
    setRosterLoading(true);
    try {
      const detail = await getClassDetail(classId);
      const benchRaw = (detail?.classMembers || []).filter((member) => {
        const assignedTeam = Number(member?.teamId ?? member?.teamID ?? member?.team?.teamId);
        return !assignedTeam || assignedTeam === 0;
      });
      const normalizedBench = buildNormalizedMembers(benchRaw).filter(
        (student) => !normalizedRoster.some((member) => member.studentId === student.studentId)
      );
      setBenchStudents(normalizedBench);
    } catch (error) {
      console.error('Failed to load class roster', error);
      toast.error('Unable to load class roster.');
      setBenchStudents([]);
    } finally {
      setRosterLoading(false);
    }
  }, [buildNormalizedMembers, classId, teamMembersRaw]);

  const handleCloseRosterModal = (force = false) => {
    if (rosterSaving && !force) return;
    setRosterModalOpen(false);
    setBenchStudents([]);
    setRosterDraft([]);
    setRosterLeaderId(null);
    setRosterSearch('');
  };

  const handleAddStudentToRoster = (student) => {
    if (!student) return;
    if (rosterDraft.length >= 6) {
      toast.error('A team can only have a maximum of 6 members.');
      return;
    }
    setBenchStudents((prev) => prev.filter((candidate) => candidate.studentId !== student.studentId));
    setRosterDraft((prev) => {
      if (prev.some((member) => member.studentId === student.studentId)) {
        return prev;
      }
      return [...prev, { ...student, teamRole: student.teamRole ?? 0 }];
    });
    setRosterLeaderId((current) => current ?? student.studentId);
  };

  const handleRemoveStudentFromRoster = (studentId) => {
    setRosterDraft((prev) => {
      if (prev.length <= 1) {
        toast.error('A team must keep at least one member.');
        return prev;
      }
      const target = prev.find((member) => member.studentId === studentId);
      if (!target) return prev;
      setBenchStudents((bench) => {
        if (bench.some((student) => student.studentId === studentId)) {
          return bench;
        }
        return [...bench, { ...target, teamRole: 0 }];
      });
      if (studentId === rosterLeaderId) {
        setRosterLeaderId(null);
        toast.info('Leader removed. Please pick a new leader before saving.');
      }
      return prev.filter((member) => member.studentId !== studentId);
    });
  };

  const handleChooseLeader = (studentId) => {
    setRosterLeaderId(studentId);
    setRosterDraft((prev) =>
      prev.map((member) => ({
        ...member,
        teamRole: member.studentId === studentId ? 1 : 0,
      }))
    );
  };

  const filteredBench = useMemo(() => {
    const query = rosterSearch.trim().toLowerCase();
    const sorted = [...benchStudents].sort((a, b) => a.studentName.localeCompare(b.studentName));
    if (!query) return sorted;
    return sorted.filter((student) =>
      student.studentName.toLowerCase().includes(query) ||
      (student.studentCode || '').toLowerCase().includes(query)
    );
  }, [benchStudents, rosterSearch]);

  const handleSaveRoster = async () => {
    if (!rosterDraft.length) {
      toast.error('Add at least one member to the team.');
      return;
    }
    if (rosterDraft.length > 6) {
      toast.error('A team can only have a maximum of 6 members.');
      return;
    }
    if (!rosterLeaderId || !rosterDraft.some((member) => member.studentId === rosterLeaderId)) {
      toast.error('Select a leader before saving.');
      return;
    }
    setRosterSaving(true);
    let shouldClose = false;
    try {
      const payload = {
        teamId: Number(teamId),
        teamName: teamDetail?.teamName ?? '',
        leaderId: Number(rosterLeaderId),
        studentList: rosterDraft
          .filter((member) => member.studentId !== Number(rosterLeaderId))
          .map((member) => ({
            studentId: Number(member.studentId),
            classId: Number(member.classId || classIdNumber || 0),
          })),
      };
      console.log('Updating team roster with payload:', payload);
      await updateTeam(Number(teamId), payload);
      toast.success('Team roster updated.');
      shouldClose = true;
      await fetchTeamAndProject();
    } catch (error) {
      const payload = error?.response?.data;
      if (payload?.errorList && Array.isArray(payload.errorList) && payload.errorList.length) {
        toast.error(payload.errorList.map((item) => item.message).join('\n'));
      } else {
        toast.error(payload?.message || error?.message || 'Unable to update team roster.');
      }
    } finally {
      setRosterSaving(false);
      if (shouldClose) {
        handleCloseRosterModal(true);
      }
    }
  };

  // --- Fetch Data ---

  const fetchTeamAndProject = useCallback(async () => {
    try {
      console.log('Fetching team detail for team ID:', teamId);
      const detail = await getTeamDetail(teamId);
      console.log('Team detail fetched:', detail);
      if (!isMountedRef.current) return;
      setTeamDetail(detail);
      setTeamMembersRaw(detail?.memberInfo?.members || []);
      try {
        const semesterList = await getSemester();
        const currentSemester = semesterList.find(sem => sem.semesterName === detail.semesterName);
        setSemesterEndDate(currentSemester ? new Date(currentSemester.endDate) : null);
        setSemesterStartDate(currentSemester ? new Date(currentSemester.startDate) : null);
      } catch (semError) {
        console.error('Error fetching semester data', semError);
      }
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

  const isRosterLocked = projectData.progress > 0;

  // Merge Project Objectives with Actual Team Milestones
  const viewData = useMemo(() => {
    // Identify Syllabus Milestones (Those with syllabusMilestoneId)
    const syllabusMilestones = milestones
      .filter(m => m.syllabusMilestoneId)
      .map(m => ({
        ...m,
        id: m.id || m.teamMilestoneId,
        displayId: m.teamMilestoneId || m.id,
        statusToken: m.statusString || 'NOT_STARTED',
        isCustom: false, // Syllabus milestone
        isLinked: true,
      }));

    // Identify Custom Milestones (Those with NO syllabusMilestoneId)
    const customMilestones = milestones
      .filter(m => !m.syllabusMilestoneId)
      .map(m => ({
        ...m,
        id: m.id || m.teamMilestoneId,
        displayId: m.teamMilestoneId || m.id,
        statusToken: m.statusString || 'NOT_STARTED',
        isCustom: true, // Custom milestone created by lecturer/team
      }));

    const businessRules = parseBusinessRules(teamDetail?.projectInfo?.projectBusinessRule);
    const actors = parseActors(teamDetail?.projectInfo?.projectActors);
    const teamSize = extractTeamSize(teamDetail?.projectInfo?.projectDescription);

    return { syllabusMilestones, customMilestones, businessRules, actors, teamSize };
  }, [projectRaw, milestones, teamDetail]);

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: teamDetail?.classInfo?.className, href: `/lecturer/classes/${classId}` },
    { label: teamDetail?.teamName || 'Team Project' }

  ], [classId, teamDetail]);

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
      console.log('Saving milestone with payload:', payload);
      if (milestoneModal.mode === 'create') {
        const response = await createMilestone(payload);
        toast.success('Milestone created');
        console.log('Milestone created with response:', response);
        const teamMilestoneId = response?.data?.teamMilestoneId;
        setMilestoneModal(null);
        try {
          if (teamBoard) {
            const linkForTeamMember = `/student/project/milestones&checkpoints/${teamMilestoneId}/${teamId}`;
            console.log('Broadcasting new milestone to team members:', teamId, teamMilestoneId, linkForTeamMember);
            await teamBoard.broadcastMilestoneCreate(teamId, teamMilestoneId, linkForTeamMember);
          }
        } catch (broadcastError) {
          console.error('Error broadcasting new milestone:', broadcastError);
        }
      } else {
        const id = milestoneModal.milestone.displayId || milestoneModal.milestone.id;
        const response = await updateMilestone(id, payload);
        console.log('Milestone updated with response:', response);
        toast.success('Milestone details updated');
        setMilestoneModal(null);
        try {
          if (teamBoard) {
            const linkForTeamMember = `/student/project/milestones&checkpoints/${id}/${teamId}`;
            await teamBoard.broadcastMilestoneUpdate(teamId, id, linkForTeamMember);
          }
        } catch (broadcastError) {
          console.error('Error broadcasting milestone update:', broadcastError);
        }
      }
      fetchMilestonesList(true);
    } catch (err) {
      console.error('Milestone save error', err);
      console.error('Milestone save error', err.response);
      toast.error(err.message || err.errors.message || 'Failed to save milestone details');
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
      if (teamBoard) {
        const linkForTeamMember = `/student/project/milestones&checkpoints/${idToDelete}/${teamId}`;
        await teamBoard.broadcastMilestoneDelete(teamId, idToDelete, linkForTeamMember);
      }
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

        {/* --- MILESTONE MANAGEMENT MODAL --- */}
        {/* --- TABS --- */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${activeTab === 'overview'
              ? 'bg-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-200 scale-105'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${activeTab === 'resources'
              ? 'bg-orangeFpt-500 text-white shadow-lg shadow-orangeFpt-200 scale-105'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
          >
            Resources
          </button>
          <button
            onClick={() => navigate(`/whiteboard?teamId=${teamId}`)}
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 flex items-center gap-2"
          >
            <PenTool size={16} />
            Whiteboard
          </button>
          <button
            onClick={() => navigate(`/text-editor?teamId=${teamId}`)}
            className="px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 flex items-center gap-2"
          >
            <FileText size={16} />
            Text Editor
          </button>
        </div>

        {/* --- CONTENT --- */}
        {activeTab === 'resources' ? (
          <TeamResources teamId={teamId} />
        ) : (
          <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* LEFT: MILESTONES */}
            <div className="space-y-8 lg:col-span-2">

              {/* 1. Project Overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 shadow-sm">
                    <Activity size={28} className="text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Project Overview</h2>
                    <p className="text-sm text-slate-500">
                      {teamDetail?.projectInfo?.projectName}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    Description
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {isDescExpanded ? teamDetail?.projectInfo?.projectDescription : (teamDetail?.projectInfo?.projectDescription?.slice(0, 200) + (teamDetail?.projectInfo?.projectDescription?.length > 200 ? '...' : ''))}
                  </p>
                  {teamDetail?.projectInfo?.projectDescription?.length > 200 && (
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
                  {viewData.teamSize && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                      <Users size={18} className="text-indigo-500" />
                      <div>
                        <p className="text-xs text-slate-500">Team Size</p>
                        <p className="text-sm font-bold text-slate-900">{viewData.teamSize} Members</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <ListChecks size={18} className="text-amber-500" />
                    <div>
                      <p className="text-xs text-slate-500">Business Rules</p>
                      <p className="text-sm font-bold text-slate-900">{viewData.businessRules.length} Rules</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <Users size={18} className="text-pink-500" />
                    <div>
                      <p className="text-xs text-slate-500">System Actors</p>
                      <p className="text-sm font-bold text-slate-900">{viewData.actors.length} Actors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Business Rules */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                      <span className="text-sm font-bold text-slate-900">{viewData.businessRules.length}</span>
                    </div>
                  </div>
                </div>

                {/* Rules Content */}
                <div className="p-6">
                  {viewData.businessRules.length > 0 ? (
                    <div className="space-y-0 divide-y divide-slate-100">
                      {viewData.businessRules.map((rule, idx) => (
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
              </div>

              {/* 2.5 Syllabus Milestones */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600"><Target size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-800">Syllabus Milestones</h2>
                </div>

                <div className="grid gap-4">
                  {viewData.syllabusMilestones.map(milestone => (
                    <div key={milestone.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">{milestone.title}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orangeFpt-50 text-orangeFpt-600 uppercase">Syllabus</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(milestone.statusToken)}`}>
                            {formatStatusLabel(milestone.statusToken)}
                          </span>
                          <div className="relative" tabIndex={-1} onBlur={handleMenuBlur}>
                            <button
                              onClick={() => toggleMilestoneMenu(milestone.displayId)}
                              className="p-1.5 text-slate-400 hover:text-orangeFpt-600 hover:bg-orangeFpt-50 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openMilestoneMenuId === milestone.displayId && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => navigate(`/lecturer/classes/${classId}/team/${teamId}/milestone/${milestone.displayId || milestone.id}`)}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Eye size={14} /> View Details
                                </button>
                                <button
                                  onClick={() => handleOpenMilestoneManager(milestone, 'edit')}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Edit3 size={14} /> Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(milestone.startDate)} — {formatDate(milestone.endDate)}</span>
                      </div>
                    </div>
                  ))}
                  {viewData.syllabusMilestones.length === 0 && (
                    <div className="py-6 text-center text-sm text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      No syllabus milestones found.
                    </div>
                  )}
                </div>
              </section>

              {/* 3. Custom Milestones */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Flag size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-800">Custom Milestones</h2>
                  </div>
                  <button
                    onClick={() => handleOpenMilestoneManager(null, 'create')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-orangeFpt-50 hover:text-orangeFpt-600 transition-colors"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="grid gap-4">
                  {viewData.customMilestones.map(milestone => (
                    <div key={milestone.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">{milestone.title}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">Custom</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(milestone.statusToken)}`}>
                            {formatStatusLabel(milestone.statusToken)}
                          </span>
                          <div className="relative" tabIndex={-1} onBlur={handleMenuBlur}>
                            <button
                              onClick={() => toggleMilestoneMenu(milestone.displayId)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openMilestoneMenuId === milestone.displayId && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => navigate(`/lecturer/classes/${classId}/team/${teamId}/milestone/${milestone.displayId || milestone.id}`)}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Eye size={14} /> View Details
                                </button>
                                <button
                                  onClick={() => handleOpenMilestoneManager(milestone, 'edit')}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                                >
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => setConfirmState({ item: milestone })}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(milestone.startDate)} — {formatDate(milestone.endDate)}</span>
                      </div>
                    </div>
                  ))}
                  {viewData.customMilestones.length === 0 && (
                    <div className="py-6 text-center text-sm text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      No custom milestones added.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT: TEAM ROSTER & ACTORS */}
            <aside className="space-y-6">
              {/* Team Roster */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><Users size={20} /></div>
                  <h3 className="font-bold text-slate-800">Team Roster</h3>
                  <button
                    type="button"
                    onClick={handleOpenRosterModal}
                    className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Manage
                  </button>
                </div>
                <div className="space-y-4">
                  {teamMembersRaw.map((member, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatar}
                          name={member.studentName}
                          className="h-9 w-9 rounded-full border border-slate-200 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{member.studentName}</p>
                          {member.teamRole === 1 && (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-orangeFpt-600">
                              Leader
                            </span>
                          )}
                          {member.teamRole === 0 && <span className="inline-flex items-center gap-1 text-sm text-slate-500">Member</span>}
                        </div>
                      </div>

                      {/* Contribution Stats */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 w-full">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Contributions:</span>
                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">
                            <span className="text-[10px] text-indigo-600 font-semibold">Question</span>
                            <span className="text-xs font-bold text-indigo-700">
                              {member.milestoneAnsContributionPercentage ? Math.round(member.milestoneAnsContributionPercentage * 100) : 0}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="text-[10px] text-emerald-600 font-semibold">Checkpoint</span>
                            <span className="text-xs font-bold text-emerald-700">
                              {member.checkpointContributionPercentage ? Math.round(member.checkpointContributionPercentage * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Actors */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                    <Users size={18} className="text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">System Actors</h2>
                </div>

                <div className="space-y-3">
                  {viewData.actors.length > 0 ? (
                    viewData.actors.map((actor, idx) => {
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
            </aside>
          </div>
        )}
      </div>

      {/* --- ROSTER MANAGEMENT MODAL --- */}
      {rosterModalOpen && (
        <Modal
          title="Manage Team Roster"
          onClose={handleCloseRosterModal}
          disableClose={rosterSaving}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className=" flex rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p>
                Adjust the members of <span className="font-semibold text-slate-900">{teamDetail?.teamName || 'this team'}</span>. Keep at least one member and make sure a leader is selected before saving.
              </p>
            </div>

            {isRosterLocked && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertCircle size={20} className="shrink-0" />
                <p>
                  <span className="font-bold">Roster Locked:</span> Team progress has started ({projectData.progress}%). You can only change the leader, but cannot add or remove members.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-500">
              {['current', 'available'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRosterTab(tab)}
                  className={`flex-1 rounded-2xl px-4 py-2 transition ${rosterTab === tab
                    ? 'bg-white text-slate-900 shadow'
                    : 'hover:text-slate-700'
                    }`}
                >
                  {tab === 'current' ? 'Current Roster' : 'Available Students'}
                </button>
              ))}
            </div>

            {rosterLoading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orangeFpt-500" />
              </div>
            ) : rosterTab === 'current' ? (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {rosterDraft.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center text-sm text-slate-500">
                    No team members selected. Add students from the Available tab.
                  </div>
                ) : (
                  rosterDraft.map((member) => (
                    <div
                      key={member.studentId}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatar}
                          name={member.studentName}
                          className="h-10 w-10 rounded-full border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{member.studentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleChooseLeader(member.studentId)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${rosterLeaderId === member.studentId
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-600'
                            }`}
                        >
                          {rosterLeaderId === member.studentId ? 'Leader' : 'Make Leader'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStudentFromRoster(member.studentId)}
                          disabled={isRosterLocked}
                          className={`rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold transition ${isRosterLocked
                            ? 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-100'
                            : 'text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                            }`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search by name or code"
                      className="w-full bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {filteredBench.length} student{filteredBench.length === 1 ? '' : 's'} available
                  </span>
                </div>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredBench.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center text-sm text-slate-500">
                      No unassigned students for this class.
                    </div>
                  ) : (
                    filteredBench.map((student) => (
                      <div
                        key={student.studentId}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.avatar}
                            name={student.studentName}
                            className="h-10 w-10 rounded-full border border-slate-200"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{student.studentName}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddStudentToRoster(student)}
                          disabled={isRosterLocked}
                          className={`rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold transition ${isRosterLocked
                            ? 'opacity-50 cursor-not-allowed text-emerald-700 bg-emerald-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseRosterModal}
                disabled={rosterSaving}
                className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoster}
                disabled={rosterSaving || rosterLoading}
                className="rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {rosterSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

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
                minLength={3}
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
                required
                minLength={3}
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
                  min={semesterStartDate ? semesterStartDate.toISOString().split('T')[0] : undefined}
                  max={
                    milestoneFormValues.endDate ||
                    (semesterEndDate ? semesterEndDate.toISOString().split('T')[0] : undefined)
                  }
                  onChange={e => {
                    let newStart = e.target.value;
                    const semStart = semesterStartDate ? semesterStartDate.toISOString().split('T')[0] : undefined;
                    const semEnd = semesterEndDate ? semesterEndDate.toISOString().split('T')[0] : undefined;

                    if (semStart && newStart < semStart) newStart = semStart;
                    if (semEnd && newStart > semEnd) newStart = semEnd;

                    let newEnd = milestoneFormValues.endDate;
                    if (newEnd && newEnd < newStart) {
                      newEnd = newStart;
                    }

                    setMilestoneFormValues({
                      ...milestoneFormValues,
                      startDate: newStart,
                      endDate: newEnd,
                    });
                  }}
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
                  min={
                    milestoneFormValues.startDate ||
                    (semesterStartDate ? semesterStartDate.toISOString().split('T')[0] : undefined)
                  }
                  max={semesterEndDate ? semesterEndDate.toISOString().split('T')[0] : undefined}
                  onChange={e => {
                    let newEnd = e.target.value;
                    const semStart = semesterStartDate ? semesterStartDate.toISOString().split('T')[0] : undefined;
                    const semEnd = semesterEndDate ? semesterEndDate.toISOString().split('T')[0] : undefined;

                    if (semStart && newEnd < semStart) newEnd = semStart;
                    if (semEnd && newEnd > semEnd) newEnd = semEnd;

                    let newStart = milestoneFormValues.startDate;
                    if (newStart && newEnd < newStart) {
                      newStart = newEnd;
                    }

                    setMilestoneFormValues({
                      ...milestoneFormValues,
                      endDate: newEnd,
                      startDate: newStart,
                    });
                  }}
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
