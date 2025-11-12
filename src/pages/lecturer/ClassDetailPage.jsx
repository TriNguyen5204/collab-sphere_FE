import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ClassDetailPage.module.css';
import {
  UserGroupIcon,
  BookOpenIcon,
  FolderIcon,
  ChartBarIcon,
  PlayIcon,
  Cog6ToothIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  CloudArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  TagIcon,
  AcademicCapIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { getClassProjects } from '../../services/projectApi';
import { getClassDetail } from '../../services/userService';
import { createTeam } from '../../services/teamApi';

const PROJECT_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #fb7185 0%, #f97316 100%)',
  'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
];

const resolveProjectGradient = (index) => PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];

const formatStatusMeta = (value) => {
  if (!value) {
    return { label: 'Pending', token: 'pending' };
  }

  const base = value.toString().trim();
  if (!base.length) {
    return { label: 'Pending', token: 'pending' };
  }

  const token = base.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const label = token
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

  return {
    label: label || base,
    token: token || base.toLowerCase(),
  };
};

const formatDateLabel = (input, fallback = 'TBA') => {
  if (!input) {
    return fallback;
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const toValidDate = (input) => {
  if (!input) {
    return null;
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const hasValue = (input) => input !== null && input !== undefined;

const isStudentAssignedToTeam = (student) => {
  if (!student || typeof student !== 'object') {
    return false;
  }

  if (student.team && Object.keys(student.team).length > 0) {
    return true;
  }

  if (hasValue(student.teamId) || hasValue(student.team_id)) {
    return true;
  }

  const memberRecord = student.classMember ?? student.class_member;
  if (!memberRecord || typeof memberRecord !== 'object') {
    return false;
  }

  return hasValue(memberRecord.teamId) || hasValue(memberRecord.team_id);
};

const FieldStatusBadge = ({ isValid, validText = 'Ready', invalidText = 'Required', className = '' }) => {
  const statusClass = isValid ? styles.fieldStatusOk : styles.fieldStatusWarn;
  return (
    <span className={`${styles.fieldStatus} ${statusClass} ${className}`.trim()}>
      {isValid ? (
        <CheckCircleIcon className={styles.fieldStatusIcon} aria-hidden="true" />
      ) : (
        <ExclamationTriangleIcon className={styles.fieldStatusIcon} aria-hidden="true" />
      )}
      <span>{isValid ? validText : invalidText}</span>
    </span>
  );
};

const pickFirstFinite = (candidates) => {
  for (const candidate of candidates) {
    const parsed = toNumber(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
};

const resolveStatusVariant = (token) => {
  const normalised = (token ?? '').toString().trim().toLowerCase();

  if (!normalised) {
    return 'upcoming';
  }

  if (['completed', 'complete', 'done', 'finished', 'approved'].includes(normalised)) {
    return 'completed';
  }

  if (['active', 'in_progress', 'ongoing', 'current', 'assigned', 'progress'].includes(normalised)) {
    return 'active';
  }

  if (['archived', 'cancelled', 'canceled', 'denied', 'rejected', 'inactive'].includes(normalised)) {
    return 'archived';
  }

  if (['draft', 'on_hold', 'paused'].includes(normalised)) {
    return 'draft';
  }

  if (['upcoming', 'pending', 'planning', 'planned', 'scheduled', 'review', 'discovery', 'awaiting', 'new'].includes(normalised)) {
    return 'upcoming';
  }

  return 'draft';
};

const clampPercentage = (value) => Math.max(0, Math.min(Math.round(value), 100));

const extractProjectStats = (project, fallbackTotal) => {
  const completed = pickFirstFinite([
    project?.completedStudents,
    project?.studentsCompleted,
    project?.completedMembers,
    project?.learnersCompleted,
  ]) ?? 0;

  const total = pickFirstFinite([
    project?.totalStudents,
    project?.studentsTotal,
    project?.totalMembers,
    project?.learnersTotal,
    fallbackTotal,
  ]) ?? (fallbackTotal ?? 0);

  const resources = pickFirstFinite([
    project?.resourcesCount,
    project?.resources,
    project?.totalResources,
    project?.resourceTotal,
  ]) ?? 0;

  const assignments = pickFirstFinite([
    project?.assignmentsCount,
    project?.assignments,
    project?.totalAssignments,
  ]) ?? 0;

  const estimated = pickFirstFinite([
    project?.estimatedHours,
    project?.estimatedTime,
    project?.expectedHours,
  ]);

  return {
    completed,
    total,
    resources,
    assignments,
    estimated,
  };
};

const calculateProjectProgress = (project, stats, fallbackTotal) => {
  const directPercentage = pickFirstFinite([
    project?.progress,
    project?.progressPercentage,
    project?.progressPercent,
    project?.completionRate,
  ]);

  if (directPercentage !== null) {
    return clampPercentage(directPercentage);
  }

  const ratioValue = pickFirstFinite([project?.progressRatio, project?.completionRatio]);
  if (ratioValue !== null) {
    return clampPercentage(ratioValue * 100);
  }

  const denominator = stats?.total ?? fallbackTotal ?? 0;
  const numerator = stats?.completed ?? 0;

  if (denominator > 0) {
    return clampPercentage((numerator / denominator) * 100);
  }

  return 0;
};

const PROGRESS_COLOR_BY_STATUS = {
  completed: '#10b981',
  active: '#3b82f6',
  upcoming: '#f59e0b',
  draft: '#94a3b8',
  archived: '#94a3b8',
};

const normaliseClassProject = (item, index, assignmentLookup = new Map()) => {
  if (!item) {
    return null;
  }

  const rawId = item.projectId ?? item.id;
  const id = Number(rawId);

  if (!Number.isFinite(id)) {
    return null;
  }

  const { label, token } = formatStatusMeta(item.statusString ?? item.status);
  const tags = [];

  if (item.subjectCode) {
    tags.push(item.subjectCode);
  }

  if (item.subjectName) {
    tags.push(item.subjectName);
  }

  if (item.lecturerName) {
    tags.push(item.lecturerName);
  }

  const summary = item.description?.trim?.() ? item.description : 'Description updating soon.';

  const assignmentCandidates = [
    item.projectAssignmentId,
    item.projectAssignmentID,
    item.assignmentId,
    item.projectAssignment?.projectAssignmentId,
    item.projectAssignment?.id,
  ];

  let projectAssignmentId = null;
  for (const candidate of assignmentCandidates) {
    const parsed = toNumber(candidate);
    if (parsed !== null) {
      projectAssignmentId = parsed;
      break;
    }
  }

  if (projectAssignmentId === null && assignmentLookup instanceof Map && assignmentLookup.has(id)) {
    projectAssignmentId = assignmentLookup.get(id);
  }

  return {
    id,
    name: item.projectName ?? 'Untitled project',
    summary,
    status: label,
    statusToken: token,
    dueDate: item.dueDate ?? null,
    updatedAt: item.updatedAt ?? null,
    gradient: resolveProjectGradient(index),
    tags,
    subjectName: item.subjectName ?? '',
    subjectCode: item.subjectCode ?? '',
    lecturerName: item.lecturerName ?? '',
    objectives: Array.isArray(item.objectives) ? item.objectives : [],
    projectAssignmentId,
  };
};

const extractProjectList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.list)) {
    return payload.list;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const TEAM_COLOR_SWATCHES = ['#6366f1', '#0ea5e9', '#fb7185', '#22c55e', '#f97316', '#8b5cf6'];

const DEFAULT_CLASS_SUMMARY = {
  id: null,
  name: '',
  term: '',
  instructor: '',
  schedule: '',
  totalStudents: 0,
  totalModules: 0,
  totalResources: 0,
  avgScore: null,
  completionRate: null,
  activeLearningHours: null,
  description: '',
};

const createEmptyTeamForm = (accent) => ({
  name: '',
  color: accent,
  projectId: '',
  memberIds: [],
  leaderId: '',
  description: '',
  enrolKey: '',
  gitLink: '',
  createdDate: '',
  endDate: '',
});

const getInitials = (name = '') => {
  const segments = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (segments.length === 0) {
    return 'NA';
  }

  if (segments.length === 1) {
    return segments[0].charAt(0).toUpperCase();
  }

  const first = segments[0].charAt(0) || '';
  const last = segments[segments.length - 1].charAt(0) || '';
  const initials = `${first}${last}`.toUpperCase();

  return initials || segments[0].slice(0, 2).toUpperCase();
};

const normaliseMemberStatus = (status) => {
  if (status === null || status === undefined) {
    return 'active';
  }

  if (typeof status === 'string') {
    const token = status.trim().toLowerCase();
    if (!token) {
      return 'active';
    }
    if (['active', 'behind'].includes(token)) {
      return token;
    }
    if (['pending', 'awaiting', 'on_hold'].includes(token)) {
      return 'pending';
    }
    if (['inactive', 'disabled', 'removed'].includes(token)) {
      return 'inactive';
    }
    return token;
  }

  const numeric = Number(status);
  if (!Number.isFinite(numeric)) {
    return 'active';
  }
  if (numeric === 0) {
    return 'pending';
  }
  if (numeric === 1) {
    return 'active';
  }
  if (numeric === 2) {
    return 'inactive';
  }
  return 'active';
};

const normaliseResourceRecords = (records) =>
  (Array.isArray(records) ? records : [])
    .map((record, index) => {
      const identifier =
        record.classFileId ??
        record.fileId ??
        record.id ??
        record.resourceId ??
        index;

      if (identifier === undefined || identifier === null) {
        return null;
      }

      const uploadDate =
        record.uploadDate ??
        record.uploadedDate ??
        record.createdAt ??
        record.createdDate ??
        record.uploadedAt ??
        null;

      return {
        id: identifier,
        title: record.fileName ?? record.title ?? 'Resource',
        type: (record.type ?? record.fileType ?? '').toLowerCase(),
        category: record.category ?? record.fileCategory ?? '',
        size: record.size ?? record.fileSize ?? '',
        downloads: toNumber(record.downloads ?? record.downloadCount ?? record.accessCount) ?? 0,
        views: toNumber(record.views ?? record.viewCount) ?? 0,
        visits: toNumber(record.visits ?? record.visitCount) ?? 0,
        duration: record.duration ?? null,
        uploadDate,
        description: record.description ?? record.summary ?? '',
        tags: Array.isArray(record.tags) ? record.tags : [],
        url: record.url ?? record.fileUrl ?? record.link ?? '',
      };
    })
    .filter(Boolean);

const normaliseProjectAssignments = (records) =>
  (Array.isArray(records) ? records : [])
    .map((record) => {
      const projectAssignmentId = toNumber(
        record.projectAssignmentId ??
        record.projectAssignmentID ??
        record.id ??
        record.assignmentId
      );
      const projectId = toNumber(
        record.projectId ??
        record.project?.projectId ??
        record.project?.id ??
        record.projectID
      );

      if (projectAssignmentId === null || projectId === null) {
        return null;
      }

      return {
        projectAssignmentId,
        projectId,
        status: record.status ?? record.assignmentStatus ?? '',
        assignedDate: record.assignedDate ?? record.createdAt ?? null,
      };
    })
    .filter(Boolean);

const normaliseClassDetailPayload = (payload, fallbackClassId) => {
  const base = payload ?? {};
  const summarySource =
    base.class ??
    base.classInformation ??
    base.classInfo ??
    base.summary ??
    base;

  const classIdentifier = toNumber(
    summarySource?.classId ??
    summarySource?.id ??
    base.classId ??
    fallbackClassId
  );

  const rawTeams = Array.isArray(base.teams) ? base.teams : [];
  const rawMembers = Array.isArray(base.classMembers) ? base.classMembers : [];
  const rawResources = Array.isArray(base.classFiles) ? base.classFiles : [];
  const rawAssignments = normaliseProjectAssignments(base.projectAssignments);

  const teams = rawTeams.map((team, index) => {
    const rawId = toNumber(team.teamId ?? team.id ?? team.TeamId);
    const color = TEAM_COLOR_SWATCHES[index % TEAM_COLOR_SWATCHES.length];

    const projectAssignmentId = toNumber(
      team.projectAssignmentId ??
      team.projectAssignmentID ??
      team.projectAssignment?.projectAssignmentId ??
      team.projectAssignment?.id
    );

    const projectId = toNumber(
      team.projectId ??
      team.project?.projectId ??
      team.project?.id ??
      team.projectID
    );

    const leaderId = toNumber(
      team.leaderId ??
      team.leader?.studentId ??
      team.leader?.leaderId ??
      team.leader?.id
    );

    const project = projectId
      ? {
          id: projectId,
          name: team.projectName ?? team.project?.projectName ?? team.project?.name ?? '',
          dueDate: team.project?.dueDate ?? team.dueDate ?? null,
        }
      : null;

    return {
      id: rawId ?? `team-${index}`,
      rawId,
      name: team.teamName ?? team.name ?? `Team ${index + 1}`,
      color,
      projectId,
      projectAssignmentId,
      leaderId,
      gitLink: team.gitLink ?? team.repository ?? '',
      createdDate: team.createdDate ?? team.startDate ?? team.createdAt ?? null,
      endDate: team.endDate ?? team.finishDate ?? null,
      project,
      members: [],
      avgProgress: 0,
    };
  });

  const teamColorMap = new Map();
  teams.forEach((team) => {
    if (team.rawId !== null && team.rawId !== undefined) {
      teamColorMap.set(team.rawId, team.color);
    }
  });

  const students = rawMembers
    .map((member) => {
      const studentId = toNumber(
        member.studentId ??
        member.student?.studentId ??
        member.student?.id ??
        member.uId ??
        member.userId ??
        member.id
      );

      if (studentId === null) {
        return null;
      }

      const memberTeamId = toNumber(member.teamId ?? member.team?.teamId ?? member.team?.id);
      const teamColor = memberTeamId !== null ? teamColorMap.get(memberTeamId) ?? null : null;

      const owningTeam = teams.find(
        (team) => team.rawId !== null && team.rawId !== undefined && team.rawId === memberTeamId
      );

      const role =
        member.isLeader === true ||
        (typeof member.role === 'string' && member.role.toLowerCase().includes('leader')) ||
        (owningTeam?.leaderId !== null && owningTeam?.leaderId === studentId)
          ? 'leader'
          : 'member';

      const progressValue = toNumber(
        member.progress ??
        member.progressPercentage ??
        member.progressValue ??
        member.completionRate
      );

      const tasksCompleted = toNumber(member.tasksCompleted);
      const totalTasks = toNumber(member.totalTasks);

      return {
        id: studentId,
        studentId,
        classId: toNumber(member.classId ?? classIdentifier),
        name: member.fullname ?? member.studentName ?? member.name ?? 'Student',
        email: member.email ?? member.studentEmail ?? '',
        team: member.teamName ?? member.team?.teamName ?? owningTeam?.name ?? null,
        teamId: memberTeamId,
        teamColor,
        progress: progressValue ?? 0,
        status: normaliseMemberStatus(member.status),
        lastSubmission: member.lastSubmission ?? member.lastSubmissionAt ?? member.lastSubmissionDate ?? null,
        tasksCompleted: tasksCompleted ?? null,
        totalTasks: totalTasks ?? null,
        avatar: getInitials(member.fullname ?? member.studentName ?? member.name),
        role,
      };
    })
    .filter(Boolean);

  const teamsWithMembers = teams.map((team) => {
    const membersForTeam = students.filter(
      (student) =>
        student.teamId !== null &&
        student.teamId !== undefined &&
        team.rawId !== null &&
        team.rawId !== undefined &&
        student.teamId === team.rawId
    );

    const avgProgress = membersForTeam.length
      ? Math.round(
          membersForTeam.reduce((total, member) => total + (member.progress ?? 0), 0) / membersForTeam.length
        )
      : 0;

    const decoratedMembers = membersForTeam.map((member) => ({
      id: member.studentId,
      name: member.name,
      avatar: member.avatar,
      role: member.role,
      progress: member.progress ?? 0,
      teamColor: team.color,
      studentId: member.studentId,
    }));

    return {
      ...team,
      members: decoratedMembers,
      avgProgress,
    };
  });

  const resources = normaliseResourceRecords(rawResources);
  const projectAssignments = rawAssignments;

  const summary = {
    id: classIdentifier,
    name: summarySource?.className ?? summarySource?.name ?? 'Class Detail',
    term: summarySource?.term ?? summarySource?.semester ?? summarySource?.semesterName ?? '',
    instructor: summarySource?.lecturerName ?? base.lecturerName ?? '',
    schedule: summarySource?.schedule ?? summarySource?.classSchedule ?? '',
    totalStudents: summarySource?.totalStudents ?? summarySource?.studentCount ?? students.length,
    totalModules: summarySource?.totalModules ?? projectAssignments.length,
    totalResources: summarySource?.totalResources ?? resources.length,
    avgScore: toNumber(summarySource?.avgScore ?? summarySource?.averageScore),
    completionRate: toNumber(summarySource?.completionRate ?? summarySource?.completionPercentage),
    activeLearningHours: toNumber(summarySource?.activeLearningHours ?? summarySource?.learningHours),
    description: summarySource?.description ?? '',
  };

  return {
    summary,
    students,
    teams: teamsWithMembers,
    projectAssignments,
    resources,
  };
};

const ClassDetailPage = () => {
  const { classId } = useParams();
  const lecturerId = useSelector((state) => state.user?.userId);
  const numericClassId = useMemo(() => toNumber(classId), [classId]);
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState([]);
  const [classProjects, setClassProjects] = useState([]);
  const [isClassProjectsLoading, setIsClassProjectsLoading] = useState(false);
  const [classProjectsError, setClassProjectsError] = useState('');
  const [teams, setTeams] = useState([]);
  const [classSummary, setClassSummary] = useState(DEFAULT_CLASS_SUMMARY);
  const [projectAssignments, setProjectAssignments] = useState([]);
  const [resourcesData, setResourcesData] = useState([]);
  const [isClassDetailLoading, setIsClassDetailLoading] = useState(false);
  const [classDetailError, setClassDetailError] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [teamFormError, setTeamFormError] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [showTeamToast, setShowTeamToast] = useState(false);
  const [isCreateTeamSubmitting, setIsCreateTeamSubmitting] = useState(false);
  const [teamForm, setTeamForm] = useState(() => createEmptyTeamForm(TEAM_COLOR_SWATCHES[0]));
  const [hasAttemptedCreateTeam, setHasAttemptedCreateTeam] = useState(false);

  const projectAssignmentLookup = useMemo(() => {
    const lookup = new Map();
    projectAssignments.forEach((assignment) => {
      if (
        assignment &&
        assignment.projectId !== null &&
        assignment.projectId !== undefined &&
        assignment.projectAssignmentId !== null &&
        assignment.projectAssignmentId !== undefined
      ) {
        lookup.set(assignment.projectId, assignment.projectAssignmentId);
      }
    });
    return lookup;
  }, [projectAssignments]);

  const refreshClassDetail = useCallback(
    async (isMounted = () => true) => {
      if (!classId) {
        if (isMounted()) {
          setClassSummary(DEFAULT_CLASS_SUMMARY);
          setStudents([]);
          setTeams([]);
          setProjectAssignments([]);
          setResourcesData([]);
        }
        return;
      }

      const response = await getClassDetail(classId);
      if (!isMounted()) {
        return;
      }

      const detail = normaliseClassDetailPayload(response, numericClassId);
      if (!isMounted()) {
        return;
      }

      setClassSummary(detail.summary);
      setStudents(detail.students);
      setTeams(detail.teams);
      setProjectAssignments(detail.projectAssignments);
      setResourcesData(detail.resources);
      setSelectedStudents(new Set());
    },
    [classId, numericClassId]
  );

  const refreshClassProjects = useCallback(
    async (isMounted = () => true) => {
      if (!classId) {
        if (isMounted()) {
          setClassProjects([]);
        }
        return;
      }

      const response = await getClassProjects(classId);
      const projects = extractProjectList(response)
        .map((item, index) => normaliseClassProject(item, index, projectAssignmentLookup))
        .filter((project) => project !== null);

      if (!isMounted()) {
        return;
      }

      setClassProjects(projects);
    },
    [classId, projectAssignmentLookup]
  );

  useEffect(() => {
    if (!showTeamToast) {
      return undefined;
    }
    const timeout = setTimeout(() => setShowTeamToast(false), 3200);
    return () => clearTimeout(timeout);
  }, [showTeamToast]);

  useEffect(() => {
    let isSubscribed = true;
    const isMounted = () => isSubscribed;

    const loadClassDetail = async () => {
      if (isMounted()) {
        setIsClassDetailLoading(true);
        setClassDetailError('');
      }

      try {
        await refreshClassDetail(isMounted);
      } catch (error) {
        console.error('Failed to load class details from /api/class.', error);
        if (isMounted()) {
          setClassDetailError('Unable to load class details right now.');
          setClassSummary(DEFAULT_CLASS_SUMMARY);
          setStudents([]);
          setTeams([]);
          setProjectAssignments([]);
          setResourcesData([]);
        }
      } finally {
        if (isMounted()) {
          setIsClassDetailLoading(false);
        }
      }
    };

    loadClassDetail();

    return () => {
      isSubscribed = false;
    };
  }, [refreshClassDetail]);

  useEffect(() => {
    let isSubscribed = true;
    const isMounted = () => isSubscribed;

    const loadClassProjects = async () => {
      if (isMounted()) {
        setIsClassProjectsLoading(true);
        setClassProjectsError('');
      }

      try {
        await refreshClassProjects(isMounted);
      } catch (error) {
        console.error('Failed to load class projects from /project/class.', error);
        if (isMounted()) {
          setClassProjects([]);
          setClassProjectsError('Unable to load class projects right now.');
        }
      } finally {
        if (isMounted()) {
          setIsClassProjectsLoading(false);
        }
      }
    };

    loadClassProjects();

    return () => {
      isSubscribed = false;
    };
  }, [refreshClassProjects]);

  useEffect(() => {
    if (!classProjects.length) {
      return;
    }

    setTeamForm((current) => {
      if (current.projectId !== '' && current.projectId !== null && current.projectId !== undefined) {
        return current;
      }

      const firstProjectId = classProjects[0]?.id;
      if (firstProjectId === undefined || firstProjectId === null) {
        return current;
      }

      return {
        ...current,
        projectId: firstProjectId,
      };
    });
  }, [classProjects]);

  const classTotalStudents = classSummary.totalStudents ?? students.length;

  const sortedProjectsByDueDate = [...classProjects].sort((a, b) => {
    const left = toValidDate(a.dueDate) ?? new Date(8640000000000000);
    const right = toValidDate(b.dueDate) ?? new Date(8640000000000000);
    return left - right;
  });

  const moduleProgressSparkline = (() => {
    const sparkline = sortedProjectsByDueDate.slice(0, 6).map((project) => {
      const stats = extractProjectStats(project, classTotalStudents);
      return calculateProjectProgress(project, stats, classTotalStudents);
    });

    if (sparkline.length === 0) {
      return [24, 32, 18, 28, 22, 30];
    }

    return sparkline;
  })();

  const unassignedStudents = useMemo(
    () => students.filter((student) => !isStudentAssignedToTeam(student)),
    [students]
  );

  const totalTeams = teams.length;
  const behindCount = students.filter((student) => student.status === 'behind').length;
  const unassignedCount = unassignedStudents.length;
  const averageTeamProgress = totalTeams
    ? Math.round(
        teams.reduce((total, team) => total + (team.avgProgress || 0), 0) / totalTeams
      )
    : 0;
  const placementMessage = unassignedCount > 0
    ? `${unassignedCount} students need team placement.`
    : 'Every student is already placed into a team.';

  const leadersCount = students.filter((student) => student.role === 'leader').length;
  const activeProjectsCount = classProjects.filter((project) =>
    ['approved', 'in_progress', 'active', 'ongoing'].includes(project.statusToken)
  ).length;
  const discoveryProjectsCount = classProjects.filter((project) =>
    ['planning', 'review', 'draft', 'discovery', 'pending'].includes(project.statusToken)
  ).length;
  const nextProjectDue = classProjects.reduce((soonest, project) => {
    const dueDate = toValidDate(project.dueDate);
    if (!dueDate) {
      return soonest;
    }
    if (!soonest || dueDate < soonest) {
      return dueDate;
    }
    return soonest;
  }, null);
  const nextProjectDueLabel = nextProjectDue
    ? nextProjectDue.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'TBD';
  const recentResourceCount = resourcesData.filter((resource) => {
    const uploaded = new Date(resource.uploadDate);
    const diffDays = (Date.now() - uploaded.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 60;
  }).length;
  const latestResource = resourcesData.reduce((latest, resource) => {
    if (!latest) {
      return resource;
    }
    return new Date(resource.uploadDate) > new Date(latest.uploadDate) ? resource : latest;
  }, null);
  const latestResourceLabel = latestResource ? latestResource.title : 'Upload your first resource';
  const latestResourceDateLabel = latestResource
    ? new Date(latestResource.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';
  const averageTaskCompletionRate = students.length
    ? Math.round(
        (students.reduce((total, student) => {
          if (!student.totalTasks) {
            return total;
          }
          return total + student.tasksCompleted / student.totalTasks;
        }, 0) /
          students.length) *
          100
      )
    : 0;
  const teamLeadLabel = leadersCount === 1 ? 'team lead' : 'team leads';
  const flaggedLabel = behindCount === 1 ? 'learner flagged' : 'learners flagged';
  const discoveryLabel = discoveryProjectsCount === 1 ? 'project in discovery' : 'projects in discovery';
  const recentResourceLabel = recentResourceCount === 1 ? 'asset' : 'assets';
  const projectStatusBreakdown = classProjects.reduce((acc, project) => {
    const key = project.statusToken ?? 'unknown';

    if (!acc[key]) {
      acc[key] = { label: project.status ?? 'Unknown', count: 0 };
    } else {
      acc[key].label = project.status ?? acc[key].label;
    }

    acc[key].count += 1;
    return acc;
  }, {});
  const projectStatusList = Object.values(projectStatusBreakdown).sort((a, b) => b.count - a.count);
  const mostAccessedResource = resourcesData.reduce((top, resource) => {
    const engagement = resource.downloads ?? resource.views ?? resource.visits ?? 0;
    const currentTop = top ? (top.downloads ?? top.views ?? top.visits ?? 0) : -1;
    return engagement > currentTop ? resource : top;
  }, null);
  const mostAccessedResourceEngagement = mostAccessedResource
    ? mostAccessedResource.downloads ?? mostAccessedResource.views ?? mostAccessedResource.visits ?? 0
    : 0;
  const mostAccessedResourceMetric = mostAccessedResource
    ? `${mostAccessedResourceEngagement} ${
        (mostAccessedResource.downloads && 'downloads') ||
        (mostAccessedResource.views && 'views') ||
        (mostAccessedResource.visits && 'visits')
      }`
    : 'Awaiting engagement';
  const mostAccessedResourceLabel = mostAccessedResource ? mostAccessedResource.title : 'No resource engagement yet';
  const getStatusClassName = (status) => (status || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const activeStudentCount = students.filter((student) => student.status === 'active').length;
  const averageStudentProgress = students.length
    ? Math.round(students.reduce((total, student) => total + (student.progress || 0), 0) / students.length)
    : 0;
  const assignmentCoverage = students.length
    ? Math.round(((students.length - unassignedCount) / students.length) * 100)
    : 0;
  const rosterSignalMessage = behindCount > 0 ? 'Coaching recommended' : 'Momentum sustained';

  const classData = useMemo(
    () => ({
      ...classSummary,
      totalStudents: classSummary.totalStudents ?? students.length,
      totalModules: classSummary.totalModules ?? projectAssignments.length,
      totalResources: classSummary.totalResources ?? resourcesData.length,
      avgScore: (classSummary.avgScore ?? null) === null ? averageStudentProgress : classSummary.avgScore,
      completionRate:
        (classSummary.completionRate ?? null) === null ? averageTeamProgress : classSummary.completionRate,
      activeLearningHours: classSummary.activeLearningHours ?? 0,
      description: classSummary.description ?? '',
    }),
    [
      classSummary,
      students.length,
      projectAssignments.length,
      resourcesData.length,
      averageStudentProgress,
      averageTeamProgress,
    ]
  );

  // Filter students
  const filteredStudents = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const nameValue = (student.name ?? '').toLowerCase();
      const emailValue = (student.email ?? '').toLowerCase();
      const statusValue = (student.status ?? '').toLowerCase();
      const matchesSearch = !searchValue || nameValue.includes(searchValue) || emailValue.includes(searchValue);
      const matchesTeam =
        teamFilter === 'all' ||
        (teamFilter === 'unassigned' && !student.team) ||
        student.team === teamFilter;
      const matchesStatus = statusFilter === 'all' || statusValue === statusFilter;
      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [students, searchTerm, teamFilter, statusFilter]);

  const filteredMemberOptions = useMemo(() => {
    const searchValue = memberSearchTerm.trim().toLowerCase();
    return unassignedStudents.filter((student) => {
      if (!searchValue) {
        return true;
      }
      const nameValue = (student.name ?? '').toLowerCase();
      const emailValue = (student.email ?? '').toLowerCase();
      return nameValue.includes(searchValue) || emailValue.includes(searchValue);
    });
  }, [memberSearchTerm, unassignedStudents]);

  const filteredProjectOptions = useMemo(() => {
    const searchValue = projectSearchTerm.trim().toLowerCase();
    return classProjects.filter((project) => {
      if (!searchValue) {
        return true;
      }
      const haystack = [
        project.name,
        project.summary,
        project.status,
        project.subjectName,
        project.subjectCode,
        project.lecturerName,
        ...(project.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchValue);
    });
  }, [projectSearchTerm, classProjects]);

  const trimmedTeamName = useMemo(() => teamForm.name.trim(), [teamForm.name]);
  const isTeamNameLengthValid = trimmedTeamName.length >= 3 && trimmedTeamName.length <= 100;
  const hasLeaderSelected = teamForm.leaderId !== '' && teamForm.leaderId !== null && teamForm.leaderId !== undefined;
  const resolvedClassIdentifier = useMemo(
    () => toNumber(classSummary.id ?? numericClassId ?? classId),
    [classSummary.id, numericClassId, classId]
  );
  const resolvedLecturerId = useMemo(() => toNumber(lecturerId), [lecturerId]);
  const isClassContextValid = resolvedClassIdentifier !== null;
  const isLecturerContextValid = resolvedLecturerId !== null;

  const hasSelectedProject =
    teamForm.projectId !== '' && teamForm.projectId !== null && teamForm.projectId !== undefined;
  const canSubmitTeam = Boolean(
    isTeamNameLengthValid &&
      teamForm.memberIds.length >= 2 &&
      hasSelectedProject &&
      teamForm.enrolKey.trim() &&
      hasLeaderSelected &&
      teamForm.createdDate &&
      teamForm.endDate &&
      isClassContextValid &&
      isLecturerContextValid &&
      !isCreateTeamSubmitting
  );

  const openCreateTeamPanel = () => {
    const today = new Date();
    const defaultProjectId = classProjects[0]?.id ?? '';
    const accent = TEAM_COLOR_SWATCHES[teams.length % TEAM_COLOR_SWATCHES.length];
    setTeamForm({
      ...createEmptyTeamForm(accent),
      projectId: defaultProjectId,
      createdDate: today.toISOString().slice(0, 10),
    });
    setMemberSearchTerm('');
    setProjectSearchTerm('');
    setTeamFormError('');
    setIsCreateTeamSubmitting(false);
    setHasAttemptedCreateTeam(false);
    setIsCreateTeamOpen(true);
  };

  const closeCreateTeamPanel = () => {
    setIsCreateTeamOpen(false);
    setTeamFormError('');
    setIsCreateTeamSubmitting(false);
    setHasAttemptedCreateTeam(false);
  };

  const handleTeamInputChange = (field) => (event) => {
    const value = event.target.value;
    setTeamForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorSwatchSelect = (color) => {
    setTeamForm((prev) => ({ ...prev, color }));
  };

  const handleMemberToggle = (studentId) => {
    const candidateId = toNumber(studentId) ?? studentId;
    setTeamForm((prev) => {
      const alreadySelected = prev.memberIds.includes(candidateId);
      const memberIds = alreadySelected
        ? prev.memberIds.filter((id) => id !== candidateId)
        : [...prev.memberIds, candidateId];
      const currentLeaderId = toNumber(prev.leaderId);
      const leaderId = alreadySelected && currentLeaderId === candidateId
        ? memberIds[0] || ''
        : prev.leaderId || (!alreadySelected && memberIds.length === 1 ? candidateId : prev.leaderId);
      return {
        ...prev,
        memberIds,
        leaderId,
      };
    });
  };

  const handleLeaderSelect = (studentId) => {
    const candidateId = toNumber(studentId) ?? studentId;
    setTeamForm((prev) => ({ ...prev, leaderId: candidateId }));
  };

  const handleProjectSelect = (projectId) => {
    const candidateId = toNumber(projectId) ?? projectId;
    setTeamForm((prev) => ({ ...prev, projectId: candidateId }));
  };

  const handleCreateTeam = async () => {
    if (isCreateTeamSubmitting) {
      return;
    }

    setHasAttemptedCreateTeam(true);

    const trimmedName = teamForm.name.trim();

    if (!trimmedName) {
      setTeamFormError('Provide a team name to continue.');
      return;
    }
    if (trimmedName.length < 3 || trimmedName.length > 100) {
      setTeamFormError('Team name must be between 3 and 100 characters.');
      return;
    }
    if (!teamForm.enrolKey.trim()) {
      setTeamFormError('Provide an enrollment key for this team.');
      return;
    }
    if (teamForm.memberIds.length < 2) {
      setTeamFormError('Select at least two members for the new team.');
      return;
    }
    if (!hasSelectedProject) {
      setTeamFormError('Choose a project from the class pool.');
      return;
    }
    if (!teamForm.createdDate) {
      setTeamFormError('Select a start date for the team.');
      return;
    }
    if (!teamForm.endDate) {
      setTeamFormError('Select an end date for the team.');
      return;
    }

    const selectedProject = classProjects.find((project) => project.id === teamForm.projectId) || null;
    const projectAssignmentId = toNumber(
      selectedProject?.projectAssignmentId ?? projectAssignmentLookup.get(selectedProject?.id)
    );

    if (selectedProject && projectAssignmentId === null) {
      setTeamFormError('Selected project is missing its class assignment reference.');
      return;
    }

    const leaderId = toNumber(teamForm.leaderId || teamForm.memberIds[0]);
    if (leaderId === null) {
      setTeamFormError('Assign a team leader before continuing.');
      return;
    }
    if (!teamForm.memberIds.includes(leaderId)) {
      setTeamFormError('The selected leader must also be a team member.');
      return;
    }

    const selectedMembers = students.filter((student) => teamForm.memberIds.includes(student.id));
    const memberPayload = selectedMembers
      .map((member) => {
        const memberStudentId = toNumber(member.studentId ?? member.id);
        const memberClassId = toNumber(
          member.classId ?? resolvedClassIdentifier ?? numericClassId ?? classSummary.id
        );
        if (memberStudentId === null || memberClassId === null) {
          return null;
        }
        return {
          studentId: memberStudentId,
          classId: memberClassId,
        };
      })
      .filter(Boolean);

    if (memberPayload.length !== selectedMembers.length) {
      setTeamFormError('Unable to resolve identifiers for one or more selected students.');
      return;
    }

    if (resolvedClassIdentifier === null) {
      setTeamFormError('Class identifier is missing. Please reopen the class and try again.');
      return;
    }

    if (resolvedLecturerId === null) {
      setTeamFormError('Lecturer context is missing. Please sign in again.');
      return;
    }

    if (projectAssignmentId === null) {
      setTeamFormError('Select a project that is assigned to this class.');
      return;
    }

    const payload = {
      teamName: trimmedName,
      enrolKey: teamForm.enrolKey.trim(),
      description: teamForm.description.trim(),
      gitLink: teamForm.gitLink.trim(),
      leaderId,
      classId: resolvedClassIdentifier,
      projectAssignmentId,
      lecturerId: resolvedLecturerId,
      createdDate: teamForm.createdDate,
      endDate: teamForm.endDate,
      studentList: memberPayload,
    };

    try {
      setIsCreateTeamSubmitting(true);
      setTeamFormError('');
      await createTeam(payload);
      toast.success('Team created successfully.');
      setShowTeamToast(true);
      setIsCreateTeamOpen(false);
      setTeamForm(createEmptyTeamForm(TEAM_COLOR_SWATCHES[teams.length % TEAM_COLOR_SWATCHES.length]));
      setMemberSearchTerm('');
      setProjectSearchTerm('');
    setSelectedStudents(new Set());
      setHasAttemptedCreateTeam(false);
      await refreshClassDetail();
      await refreshClassProjects();
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Unable to create team right now.';
      setTeamFormError(message);
      toast.error(message);
    } finally {
      setIsCreateTeamSubmitting(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return '#22c55e';
    if (progress >= 75) return '#3b82f6';
    if (progress >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const ProgressRing = ({ progress, size = 56 }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <div className={styles.progressRing} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            stroke={getProgressColor(progress)}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className={styles.ringText}>{progress}%</div>
      </div>
    );
  };

  const renderStudentsTab = () => (
    <section className={styles.rosterSection}>
      <header className={styles.rosterHeader}>
        <div className={styles.rosterTitleGroup}>
          <h3>Class Roster</h3>
          <p>{averageStudentProgress}% course momentum • {assignmentCoverage}% assigned • {rosterSignalMessage}</p>
        </div>
        <div className={styles.rosterQuickGlance}>
          <div className={styles.glanceCard}>
            <span className={styles.glanceLabel}>Active</span>
            <span className={styles.glanceValue}>{activeStudentCount}</span>
          </div>
          <div className={`${styles.glanceCard} ${behindCount > 0 ? styles.glanceWarning : ''}`}>
            <span className={styles.glanceLabel}>Behind</span>
            <span className={styles.glanceValue}>{behindCount}</span>
          </div>
          <div className={styles.glanceCard}>
            <span className={styles.glanceLabel}>Unassigned</span>
            <span className={styles.glanceValue}>{unassignedCount}</span>
          </div>
        </div>
      </header>

      <div className={styles.toolbarGrid}>
        <div className={styles.searchPanel}>
          <div className={styles.searchField}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, or team"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filterPills}>
            <button
              type="button"
              className={`${styles.filterPill} ${teamFilter === 'all' ? styles.filterPillActive : ''}`}
              onClick={() => setTeamFilter('all')}
            >
              All teams
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${teamFilter === 'unassigned' ? styles.filterPillActive : ''}`}
              onClick={() => setTeamFilter('unassigned')}
            >
              Unassigned
            </button>
            {teams.slice(0, 4).map((team) => (
              <button
                key={team.id}
                type="button"
                className={`${styles.filterPill} ${teamFilter === team.name ? styles.filterPillActive : ''}`}
                onClick={() => setTeamFilter(team.name)}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlPanel}>
          <label className={styles.controlSelect}>
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="behind">Behind</option>
            </select>
          </label>
          <label className={styles.controlSelect}>
            <span>Team</span>
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              <option value="all">Any</option>
              <option value="unassigned">Unassigned</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.primaryToolbarButton} onClick={() => setIsCreateTeamOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Create team
          </button>
        </div>
      </div>

      {selectedStudents.size > 0 && (
        <div className={styles.bulkToolbar}>
          <input
            type="checkbox"
            checked={selectedStudents.size === filteredStudents.length}
            onChange={selectAllStudents}
            className={styles.checkbox}
          />
          <span className={styles.bulkCount}>
            {selectedStudents.size} of {filteredStudents.length} selected
          </span>
          <button className={styles.bulkAction}>Message</button>
          <button className={styles.bulkAction}>Generate brief</button>
          <button className={styles.bulkAction}>Export CSV</button>
        </div>
      )}

      <div className={styles.studentsTable}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={selectAllStudents}
                    className={styles.checkbox}
                  />
                </th>
                <th>Student</th>
                <th>Team</th>
                <th>Progress</th>
                <th>Last submission</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const progressValue = clampPercentage(student.progress ?? 0);
                const completedTasks = Number.isFinite(Number(student.tasksCompleted))
                  ? Number(student.tasksCompleted)
                  : null;
                const totalTaskCount = Number.isFinite(Number(student.totalTasks))
                  ? Number(student.totalTasks)
                  : null;
                const taskSummary =
                  completedTasks !== null && totalTaskCount !== null
                    ? `${completedTasks}/${totalTaskCount}`
                    : '—';
                const lastSubmissionLabel = student.lastSubmission
                  ? new Date(student.lastSubmission).toLocaleDateString()
                  : '—';

                return (
                  <tr
                    key={student.id}
                    className={`${styles.tableRow} ${selectedStudents.has(student.id) ? styles.selected : ''}`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className={`${styles.checkbox} ${selectedStudents.has(student.id) ? styles.checked : ''}`}
                      />
                    </td>
                    <td>
                      <div className={styles.studentIdentity}>
                        <div
                          className={styles.avatar}
                          style={{ backgroundColor: student.teamColor || '#94a3b8' }}
                        >
                          {student.avatar}
                        </div>
                        <div className={styles.studentMeta}>
                          <span className={styles.studentName}>{student.name}</span>
                          <span className={styles.studentEmail}>{student.email || 'No email on file'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {student.team ? (
                        <span
                          className={styles.teamBadge}
                          style={{ '--team-color': student.teamColor }}
                        >
                          <span className={styles.teamBadgeDot} style={{ backgroundColor: student.teamColor }} />
                          {student.team}
                          {student.role === 'leader' && (
                            <span className={styles.leaderBadge}>Leader</span>
                          )}
                        </span>
                      ) : (
                        <span className={styles.unassignedBadge}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.progressCell}>
                        <div className={styles.progressBarContainer}>
                          <div
                            className={styles.progressBarFill}
                            style={{
                              width: `${progressValue}%`,
                              backgroundColor: getProgressColor(progressValue),
                            }}
                          />
                        </div>
                        <span className={styles.progressText}>
                          {progressValue}% · {taskSummary}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.lastSubmission}>
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{lastSubmissionLabel}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status-${student.status}`] || ''}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className={styles.rowActions}>
                      <button type="button" className={styles.rowActionButton}>
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                      <button type="button" className={styles.rowActionButton}>
                        <ShareIcon className="w-4 h-4" />
                        Notify
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderTeamsTab = () => (
    <div className={styles.sectionSurface}>
      <div className={styles.sectionHeaderRowLarge}>
        <div>
          <h3 className={styles.sectionTitle}>Teams Overview</h3>
          <p className={styles.sectionSubtitle}>Monitor team readiness, fill open seats, and link projects in a single glance.</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreateTeamPanel}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Team
        </button>
      </div>

      <div className={styles.teamOverviewGrid}>
        <div className={`${styles.utilityCard} ${styles.utilityCardTall}`}>
          <div className={styles.utilityHeader}>
            <div>
              <span className={styles.utilityEyebrow}>Roster</span>
              <h4 className={styles.utilityTitle}>Unassigned Students</h4>
            </div>
            <span className={styles.utilityCount}>{unassignedStudents.length}</span>
          </div>
          <p className={styles.utilityDescription}>
            Select students who still need a team and bundle them into a new group.
          </p>
          <div className={styles.unassignedList}>
            {unassignedStudents.length === 0 ? (
              <span className={styles.emptyState}>All students are currently grouped.</span>
            ) : (
              unassignedStudents.slice(0, 5).map((student) => (
                <div key={student.id} className={styles.unassignedItem}>
                  <div className={styles.avatarSmall}>{student.avatar}</div>
                  <div className={styles.unassignedMeta}>
                    <p>{student.name}</p>
                    <span>{student.email}</span>
                  </div>
                  <span className={styles.statusPill}>{student.status}</span>
                </div>
              ))
            )}
          </div>
          <button
            className={styles.utilityAction}
            onClick={openCreateTeamPanel}
            disabled={unassignedStudents.length === 0}
          >
            <PlusIcon className="w-4 h-4" />
            Create from selection
          </button>
        </div>

        <div className={`${styles.utilityCard} ${styles.utilityCardWide}`}>
          <div className={styles.utilityHeader}>
            <div>
              <span className={styles.utilityEyebrow}>Projects</span>
              <h4 className={styles.utilityTitle}>Project Pool</h4>
            </div>
            <span className={styles.utilityCount}>{classProjects.length}</span>
          </div>
          <p className={styles.utilityDescription}>
            Projects already approved for this class. Link one when creating a team.
          </p>
          <div className={styles.projectPoolGrid}>
            {isClassProjectsLoading ? (
              <span className={styles.emptyState}>Loading class projects…</span>
            ) : classProjects.length > 0 ? (
              classProjects.map((project) => {
                const timelineLabel = project.dueDate
                  ? `Due ${formatDateLabel(project.dueDate)}`
                  : `Updated ${formatDateLabel(project.updatedAt, 'Awaiting update')}`;

                return (
                  <div
                    key={project.id}
                    className={styles.projectChip}
                    style={{ background: project.gradient }}
                  >
                    <div className={styles.projectChipHeader}>
                      <span className={styles.projectChipName}>{project.name}</span>
                      <span className={styles.projectChipStatus}>{project.status}</span>
                    </div>
                    <p className={styles.projectChipSummary}>{project.summary}</p>
                    <div className={styles.projectChipMeta}>
                      <CalendarIcon className="w-3 h-3" />
                      <span>{timelineLabel}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <span className={styles.emptyState}>
                {classProjectsError || 'No projects assigned to this class yet.'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.teamsGrid}>
        {teams.map((team) => (
          <div key={team.id} className={styles.teamCard}>
            <div
              className={styles.teamAccent}
              style={{ background: team.color }}
              aria-hidden="true"
            />
            <div className={styles.teamCardInner}>
              <div className={styles.teamHeader}>
                <div>
                  <span className={styles.teamEyebrow}>Team</span>
                  <h4 className={styles.teamName}>{team.name}</h4>
                  <p className={styles.memberCount}>{team.members.length} members</p>
                </div>
                <div className={styles.teamProgressWrap}>
                  <ProgressRing progress={team.avgProgress} size={52} />
                </div>
              </div>

              <div className={styles.teamMembers}>
                {team.members.map((member) => (
                  <div key={member.id} className={styles.memberItem}>
                    <div
                      className={styles.avatar}
                      style={{
                        backgroundColor: `${member.teamColor || team.color}`,
                        width: '28px',
                        height: '28px',
                        fontSize: '12px',
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div className={styles.memberDetails}>
                      <span className={styles.memberNameText}>{member.name}</span>
                      <span className={styles.memberRoleText}>{member.role === 'leader' ? 'Leader' : 'Member'}</span>
                    </div>
                    <span className={styles.memberProgressValue}>{member.progress}%</span>
                  </div>
                ))}
              </div>

              <div className={styles.teamFooterRow}>
                <div className={styles.teamProjectMeta}>
                  <span className={styles.projectLabel}>Project</span>
                  <span className={styles.projectName}>{team.project?.name || 'Not assigned'}</span>
                </div>
                <div className={styles.teamDeadlineMeta}>
                  <CalendarIcon className={styles.deadlineIcon} />
                  <span>
                    {team.project?.dueDate
                      ? new Date(team.project.dueDate).toLocaleDateString()
                      : 'Set a deadline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModulesTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Course Projects</h3>
        <Link
          to={`/lecturer/classes/${classId}/project-assignments`}
          className={styles.btnPrimary}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Assign Projects
        </Link>
      </div>

      <div className="space-y-4">
        {isClassProjectsLoading ? (
          <div className={styles.moduleState}>
            <span className={styles.emptyState}>Loading class projects…</span>
          </div>
        ) : classProjects.length === 0 ? (
          <div className={styles.moduleState}>
            <span className={styles.emptyState}>
              {classProjectsError || 'No projects assigned to this class yet.'}
            </span>
          </div>
        ) : (
          classProjects.map((project, index) => {
            const stats = extractProjectStats(project, classTotalStudents);
            const progressPercent = calculateProjectProgress(project, stats, classTotalStudents);
            const completionLabel = stats.total > 0
              ? `${Math.min(stats.completed, stats.total)}/${stats.total} completed`
              : `${stats.completed} completed`;
            const dueDateLabel = project.dueDate ? formatDateLabel(project.dueDate) : 'TBA';
            const estimatedLabel = stats.estimated ? `${stats.estimated} hrs` : null;
            const statusVariant = resolveStatusVariant(project.statusToken ?? project.status);
            const progressColor = PROGRESS_COLOR_BY_STATUS[statusVariant] ?? '#3b82f6';
            const resourcesLabel = `${stats.resources} resource${stats.resources === 1 ? '' : 's'}`;
            const assignmentsLabel = `${stats.assignments} assignment${stats.assignments === 1 ? '' : 's'}`;

            return (
              <div key={project.id ?? index} className={styles.moduleCard}>
                <div className="flex items-start gap-4 flex-1">
                  <div className={`${styles.moduleIndex} ${styles[`status-${statusVariant}`]}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className={styles.moduleTitle}>{project.name}</h4>
                      <span className={`${styles.statusBadge} ${styles[`status-${statusVariant}`]}`}>
                        {project.status}
                      </span>
                      {(project.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className={styles.projectBadge}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className={styles.moduleDescription}>{project.summary}</p>

                    <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{completionLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FolderIcon className="w-4 h-4" />
                        <span>{resourcesLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{assignmentsLabel}</span>
                      </div>
                      {estimatedLabel && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{estimatedLabel}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Due: {dueDateLabel}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Progress</span>
                        <span className="text-sm font-medium text-slate-900">{progressPercent}%</span>
                      </div>
                      <div className={styles.progressBarContainer}>
                        <div
                          className={styles.progressBarFill}
                          style={{
                            width: `${progressPercent}%`,
                            backgroundColor: progressColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className={styles.iconButton} aria-label={`View ${project.name} project`}>
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className={styles.iconButton} aria-label={`Edit ${project.name} project`}>
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className={styles.iconButton} aria-label={`Share ${project.name} project`}>
                    <ShareIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Resource Library</h3>
        <div className="flex items-center gap-3">
          <select className={styles.filterSelect}>
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="video">Videos</option>
            <option value="link">External Links</option>
            <option value="zip">Archives</option>
          </select>
          <button className={styles.btnPrimary}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Upload Resource
          </button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resourcesData.map((resource) => (
          <div key={resource.id} className={styles.resourceCard}>
            <div className="flex items-start justify-between mb-3">
              <div className={`${styles.resourceIcon} ${styles[`type-${resource.type}`]}`}>
                {resource.type === 'pdf' && <DocumentTextIcon className="w-5 h-5" />}
                {resource.type === 'video' && <VideoCameraIcon className="w-5 h-5" />}
                {resource.type === 'link' && <LinkIcon className="w-5 h-5" />}
                {resource.type === 'zip' && <FolderIcon className="w-5 h-5" />}
              </div>
              <div className="flex items-center gap-1">
                <button className={styles.iconButton}>
                  <CloudArrowDownIcon className="w-4 h-4" />
                </button>
                <button className={styles.iconButton}>
                  <ShareIcon className="w-4 h-4" />
                </button>
                <button className={styles.iconButton}>
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h4 className={styles.resourceTitle}>{resource.title}</h4>
            <p className={styles.resourceDescription}>{resource.description}</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
              {resource.size && (
                <span>{resource.size}</span>
              )}
              {resource.duration && (
                <span>{resource.duration}</span>
              )}
              {resource.downloads && (
                <span>{resource.downloads} downloads</span>
              )}
              {resource.views && (
                <span>{resource.views} views</span>
              )}
              {resource.visits && (
                <span>{resource.visits} visits</span>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className={styles.resourceTag}>
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 2 && (
                  <span className={styles.resourceTag}>
                    +{resource.tags.length - 2}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {new Date(resource.uploadDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Class Performance Analytics</h3>
      
      {/* Enhanced Analytics Cards */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.avgScore}%</div>
          <div className={styles.analyticsLabel}>Average Score</div>
        </div>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.completionRate}%</div>
          <div className={styles.analyticsLabel}>Completion Rate</div>
        </div>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.totalStudents - 4}</div>
          <div className={styles.analyticsLabel}>Active Students</div>
        </div>
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsValue}>{classData.activeLearningHours}</div>
          <div className={styles.analyticsLabel}>Learning Hours</div>
        </div>
      </div>
      
      {/* Activity Heatmap */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Activity Heatmap</h4>
        <div className={styles.heatmap}>
          {Array.from({ length: 98 }, (_, i) => (
            <div
              key={i}
              className={`${styles.heatmapCell} ${styles[`level${Math.floor(Math.random() * 4) + 1}`]}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={styles.heatmapCell}></div>
            <div className={`${styles.heatmapCell} ${styles.level1}`}></div>
            <div className={`${styles.heatmapCell} ${styles.level2}`}></div>
            <div className={`${styles.heatmapCell} ${styles.level3}`}></div>
            <div className={`${styles.heatmapCell} ${styles.level4}`}></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students': return renderStudentsTab();
      case 'modules': return renderModulesTab();
      case 'resources': return renderResourcesTab();
      case 'teams': return renderTeamsTab();
      case 'analytics': return renderAnalyticsTab();
      default: return renderStudentsTab();
    }
  };

  const renderCreateTeamPanel = () => {
    if (!isCreateTeamOpen) {
      return null;
    }

    const selectedMembersList = students.filter((student) => teamForm.memberIds.includes(student.id));
    const selectedLeader = selectedMembersList.find((student) => student.id === teamForm.leaderId) || null;
    const linkedProject = classProjects.find((project) => project.id === teamForm.projectId) || null;
    const accentHex = teamForm.color ? teamForm.color.toUpperCase() : '--';
    const enrolKeyValue = teamForm.enrolKey.trim();
    const repositoryLabel = teamForm.gitLink.trim() || 'Link optional';
    const startDateLabel = teamForm.createdDate || 'Select date';
    const endDateLabel = teamForm.endDate || 'Select date';
    const enrolKeyValid = enrolKeyValue.length > 0;
    const memberCountValid = teamForm.memberIds.length >= 2;
    const timelineValid = Boolean(teamForm.createdDate && teamForm.endDate);
    const teamSnapshotReady = memberCountValid && hasLeaderSelected && hasSelectedProject;

    return (
      <div className={styles.teamOverlay}>
        <div
          className={styles.teamOverlayBackdrop}
          onClick={closeCreateTeamPanel}
          aria-hidden="true"
        />
        <div
          className={styles.teamPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
          aria-describedby="create-team-subtitle"
        >
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle} id="create-team-title">Create a Team</h3>
              <p className={styles.panelSubtitle} id="create-team-subtitle">Bundle unassigned students and attach a class project in one flow.</p>
            </div>
            <button className={styles.closeButton} onClick={closeCreateTeamPanel} aria-label="Close">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.panelSection}>
              <div className={styles.fieldHeaderRow}>
                <label className={styles.sectionLabel} htmlFor="team-name">Team name</label>
                <FieldStatusBadge
                  isValid={isTeamNameLengthValid}
                  validText=""
                  invalidText={trimmedTeamName.length === 0 ? 'Required' : '3-100 chars'}
                />
              </div>
              <input
                id="team-name"
                type="text"
                value={teamForm.name}
                onChange={handleTeamInputChange('name')}
                placeholder="e.g. Team Delta"
                className={`${styles.panelInput} ${
                  hasAttemptedCreateTeam && !isTeamNameLengthValid ? styles.inputInvalid : ''
                }`}
              />
              {hasAttemptedCreateTeam && !isTeamNameLengthValid && (
                <p className={styles.fieldErrorMessage}>Team name must be between 3 and 100 characters.</p>
              )}
            </div>

            <div className={styles.panelSection}>
              <div className={styles.fieldHeaderRow}>
                <label className={styles.sectionLabel} htmlFor="team-enrol-key">Enrollment key</label>
                <FieldStatusBadge
                  isValid={enrolKeyValid}
                  validText=""
                  invalidText="Required"
                />
              </div>
              <input
                id="team-enrol-key"
                type="text"
                value={teamForm.enrolKey}
                onChange={handleTeamInputChange('enrolKey')}
                placeholder="e.g. TEAM-2025-A"
                className={`${styles.panelInput} ${
                  hasAttemptedCreateTeam && !enrolKeyValid ? styles.inputInvalid : ''
                }`}
              />
              {hasAttemptedCreateTeam && !enrolKeyValid && (
                <p className={styles.fieldErrorMessage}>Provide an enrollment key for this team.</p>
              )}
            </div>

            <div className={styles.panelSection}>
              <label className={styles.sectionLabel} htmlFor="team-description">Team Description</label>
              <textarea
                id="team-description"
                value={teamForm.description}
                onChange={handleTeamInputChange('description')}
                placeholder="Set the tone for how this team will collaborate."
                className={styles.panelTextarea}
                rows={3}
              />
            </div>

            <div className={styles.panelSection}>
              <label className={styles.sectionLabel} htmlFor="team-git-link">Repository URL</label>
              <input
                id="team-git-link"
                type="url"
                value={teamForm.gitLink}
                onChange={handleTeamInputChange('gitLink')}
                placeholder="https://github.com/org/repo"
                className={styles.panelInput}
              />
            </div>

            <div className={`${styles.panelSection} ${styles.panelSectionFull}`}>
              <div className={styles.fieldHeaderRow}>
                <span className={styles.sectionLabel}>Timeline</span>
                <FieldStatusBadge
                  isValid={timelineValid}
                  validText=""
                  invalidText="Set dates"
                />
              </div>
              <div className={styles.dateGrid}>
                <label className={styles.dateField} htmlFor="team-start-date">
                  <span>Start date</span>
                  <input
                    id="team-start-date"
                    type="date"
                    value={teamForm.createdDate}
                    onChange={handleTeamInputChange('createdDate')}
                    className={`${styles.panelInput} ${
                      hasAttemptedCreateTeam && !teamForm.createdDate ? styles.inputInvalid : ''
                    }`}
                  />
                </label>
                <label className={styles.dateField} htmlFor="team-end-date">
                  <span>End date</span>
                  <input
                    id="team-end-date"
                    type="date"
                    value={teamForm.endDate}
                    onChange={handleTeamInputChange('endDate')}
                    className={`${styles.panelInput} ${
                      hasAttemptedCreateTeam && !teamForm.endDate ? styles.inputInvalid : ''
                    }`}
                  />
                </label>
              </div>
              {hasAttemptedCreateTeam && !timelineValid && (
                <p className={styles.fieldErrorMessage}>Set both start and end dates for this team.</p>
              )}
            </div>

            <div className={`${styles.panelSection} ${styles.panelSectionFull}`}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.sectionLabelGroup}>
                  <span className={styles.sectionLabel}>Select members</span>
                  <span className={styles.sectionHint}>{teamForm.memberIds.length} selected</span>
                </div>
                <FieldStatusBadge
                  isValid={memberCountValid && hasLeaderSelected}
                  validText=""
                  invalidText={memberCountValid ? 'Assign leader' : 'Pick 2+'}
                />
              </div>
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(event) => setMemberSearchTerm(event.target.value)}
                placeholder="Search unassigned students..."
                className={styles.panelSearch}
              />
              <div className={styles.memberGrid}>
                {filteredMemberOptions.length === 0 ? (
                  <div className={styles.emptyPanelState}>No unassigned students available right now.</div>
                ) : (
                  filteredMemberOptions.map((student) => {
                    const isSelected = teamForm.memberIds.includes(student.id);
                    const isLeader = teamForm.leaderId === student.id;
                    return (
                      <div
                        key={student.id}
                        role="button"
                        tabIndex={0}
                        className={`${styles.memberOption} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleMemberToggle(student.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleMemberToggle(student.id);
                          }
                        }}
                      >
                        <div className={styles.memberAvatar}>{student.avatar}</div>
                        <div className={styles.memberMetaBlock}>
                          <span className={styles.memberName}>{student.name}</span>
                          <span className={styles.memberEmail}>{student.email}</span>
                          <span className={styles.memberProgress}>{student.progress}% course progress</span>
                        </div>
                        {isLeader ? (
                          <span className={styles.leaderChip}>Leader</span>
                        ) : (
                          isSelected && (
                            <span
                              role="button"
                              tabIndex={0}
                              className={styles.assignLeaderBtn}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleLeaderSelect(student.id);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleLeaderSelect(student.id);
                                }
                              }}
                            >
                              Make leader
                            </span>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {hasAttemptedCreateTeam && memberCountValid === false && (
                <p className={styles.fieldErrorMessage}>Pick at least two students to form a new team.</p>
              )}
              {hasAttemptedCreateTeam && !hasLeaderSelected && (
                <p className={styles.fieldErrorMessage}>Assign a leader from the selected members.</p>
              )}
            </div>

            <div className={`${styles.panelSection} ${styles.panelSectionFull}`}>
              <div className={styles.sectionHeaderRow}>
                <div className={styles.sectionLabelGroup}>
                  <span className={styles.sectionLabel}>Link a project</span>
                </div>
                <FieldStatusBadge
                  isValid={hasSelectedProject}
                  validText=""
                  invalidText="Select project"
                />
              </div>
              <input
                type="text"
                value={projectSearchTerm}
                onChange={(event) => setProjectSearchTerm(event.target.value)}
                placeholder="Search class projects..."
                className={styles.panelSearch}
              />
              <div className={styles.projectPickerGrid}>
                {filteredProjectOptions.map((project) => {
                  const isActive = teamForm.projectId === project.id;
                  return (
                    <div
                      key={project.id}
                      role="button"
                      tabIndex={0}
                      className={`${styles.projectOption} ${isActive ? styles.selected : ''}`}
                      onClick={() => handleProjectSelect(project.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleProjectSelect(project.id);
                        }
                      }}
                    >
                      <div className={styles.projectOptionHeader}>
                        <span className={styles.projectOptionName}>{project.name}</span>
                        <span className={styles.projectOptionStatus}>{project.status}</span>
                      </div>
                      <p className={styles.projectOptionSummary}>{project.summary}</p>
                      <div className={styles.projectOptionMeta}>
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.projectOptionTags}>
                        {project.tags.map((tag) => (
                          <span key={tag} className={styles.projectTag}>
                            <TagIcon className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.panelFooter}>
            {teamFormError && <span className={styles.errorText}>{teamFormError}</span>}
            <div className={styles.footerActions}>
              <button type="button" className={styles.btnGhost} onClick={closeCreateTeamPanel}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleCreateTeam}
                disabled={!canSubmitTeam}
              >
                {isCreateTeamSubmitting ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* GitHub-inspired Header */}
        <div className={styles.header}>
          <div className={styles.headerNav}>
            <a href="/lecturer/classes" className={styles.backButton}>
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Classes
            </a>
          </div>

          <div className={styles.headerGrid}>
            <div className={styles.headerPrimary}>
              <div className={styles.headerBadges}>
                <span className={styles.termChip}>
                  <CalendarIcon className="w-4 h-4" />
                  {classData.term}
                </span>
                <span className={styles.termChip}>
                  <ClockIcon className="w-4 h-4" />
                  {classData.schedule}
                </span>
              </div>

              <h1 className={styles.title}>
                {classData.name}
              </h1>
              <p className={styles.description}>{classData.description}</p>

              <div className={styles.metaCards}>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>Instructor</span>
                  <span className={styles.metaValue}>{classData.instructor}</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>Active teams</span>
                  <span className={styles.metaValue}>{totalTeams}</span>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>Learning hours</span>
                  <span className={styles.metaValue}>{classData.activeLearningHours}</span>
                </div>
              </div>

              <div className={styles.tagCluster}>
                <span className={styles.tagChip}>
                  <UserGroupIcon className="w-4 h-4" />
                  {classData.totalStudents} students
                </span>
                <span className={styles.tagChip}>
                  <BookOpenIcon className="w-4 h-4" />
                  {classData.totalModules} modules
                </span>
                <span className={styles.tagChip}>
                  <AcademicCapIcon className="w-4 h-4" />
                  {classProjects.length} active projects
                </span>
                <span className={styles.tagChip}>
                  <ChartBarIcon className="w-4 h-4" />
                  {averageTeamProgress}% avg team progress
                </span>
              </div>

              <div className={styles.headerActions}>
                <button className={styles.btnSecondary}>
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Manage settings
                </button>
                <Link
                  to={`/lecturer/classes/${classId}/projects`}
                  className={styles.btnSecondary}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  <FolderIcon className="w-4 h-4 mr-2" />
                  Project workspace
                </Link>
                <button className={styles.btnGhost}>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share brief
                </button>
                <button className={styles.btnGradient}>
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Launch session
                </button>
              </div>
            </div>


          </div>
        </div>

        {/* Overview Metrics */}
        <section className={styles.metricsStage} aria-label="Class analytics overview">
          <div className={styles.metricsGrid}>
            <article className={styles.metricCard} data-tone="indigo">
              <div className={styles.metricTop}>
                <div className={styles.metricIconOrbit}>
                  <UserGroupIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={styles.metricLabel}>Roster health</span>
                  <p className={styles.metricSubtitle}>{placementMessage}</p>
                </div>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricFigure}>
                  <span className={styles.metricNumber}>{classData.totalStudents}</span>
                  <span className={styles.metricUnit}>students</span>
                </div>
                <div className={styles.metricChips}>
                  <span className={styles.metricChipPositive}>{leadersCount} {teamLeadLabel} active</span>
                  <span className={behindCount > 0 ? styles.metricChipWarning : styles.metricChipNeutral}>
                    {behindCount > 0 ? `${behindCount} ${flaggedLabel}` : 'All on track'}
                  </span>
                </div>
              </div>
            </article>

            <article className={styles.metricCard} data-tone="sunset">
              <div className={styles.metricTop}>
                <div className={styles.metricIconOrbit}>
                  <BookOpenIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={styles.metricLabel}>Project pipeline</span>
                  <p className={styles.metricSubtitle}>Next review {nextProjectDueLabel}</p>
                </div>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricFigure}>
                  <span className={styles.metricNumber}>{activeProjectsCount}</span>
                  <span className={styles.metricUnit}>active projects</span>
                </div>
                <ul className={styles.metricLegend}>
                  {projectStatusList.map((status) => (
                    <li key={status.label} className={styles.metricLegendItem}>
                      <span
                        className={`${styles.metricLegendDot} ${styles[`statusDot${getStatusClassName(status.label)}`] || ''}`}
                      />
                      <span className={styles.metricLegendLabel}>
                        {status.count} {status.label.toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <footer className={styles.metricFooter}>
                <span className={styles.metricFootnote}>Discovery</span>
                <div className={styles.metricFooterActions}>
                  <span className={styles.metricFootnoteValue}>{discoveryProjectsCount} {discoveryLabel}</span>
                  <Link
                    to={`/lecturer/classes/${classId}/projects`}
                    className={styles.metricFootnoteAction}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Open tracker
                  </Link>
                </div>
              </footer>
            </article>

            <article className={styles.metricCard} data-tone="lagoon">
              <div className={styles.metricTop}>
                <div className={styles.metricIconOrbit}>
                  <FolderIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={styles.metricLabel}>Resource hub</span>
                  <p className={styles.metricSubtitle}>{recentResourceCount} {recentResourceLabel} added in 60 days</p>
                </div>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricFigure}>
                  <span className={styles.metricNumber}>{classData.totalResources}</span>
                  <span className={styles.metricUnit}>assets</span>
                </div>
                <div className={styles.metricStack}>
                  <div className={styles.metricStackRow}>
                    <span className={styles.metricStackLabel}>Latest upload</span>
                    <span className={styles.metricStackValue}>{latestResourceLabel}</span>
                  </div>
                  <div className={styles.metricStackRow}>
                    <span className={styles.metricStackLabel}>Engagement</span>
                    <span className={styles.metricStackValue}>{mostAccessedResourceMetric}</span>
                  </div>
                </div>
              </div>
              <footer className={styles.metricFooter}>
                <span className={styles.metricFootnote}>Updated</span>
                <span className={styles.metricFootnoteValue}>{latestResourceDateLabel || '—'}</span>
              </footer>
            </article>
          </div>
        </section>

        {/* MD3 Tabs */}
        <div className={styles.md3Tabs}>
          {[
            { id: 'students', label: 'Students', icon: UserGroupIcon },
            { id: 'modules', label: 'Projects', icon: BookOpenIcon },
            { id: 'resources', label: 'Resources', icon: FolderIcon },
            { id: 'teams', label: 'Teams', icon: AcademicCapIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.md3Tab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white">
          {renderTabContent()}
        </div>
      </div>
      {renderCreateTeamPanel()}
      {showTeamToast && (
        <div className={styles.teamToast} role="status">
          <CheckIcon className="w-4 h-4" />
          <span>Team created and synced with project pool.</span>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClassDetailPage;