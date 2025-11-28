const TEAM_COLOR_SWATCHES = ['#6366f1', '#0ea5e9', '#fb7185', '#22c55e', '#f97316', '#8b5cf6'];

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getInitials = (name = '') => {
  const segments = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!segments.length) {
    return 'NA';
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
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
        projectName: record.projectName ?? record.project?.projectName ?? 'Untitled project',
        description: record.description ?? record.project?.description ?? '',
        classId: toNumber(record.classId ?? record.project?.classId),
        className: record.className ?? record.project?.className ?? '',
        status: record.status ?? record.assignmentStatus ?? '',
        assignedDate: record.assignedDate ?? record.createdAt ?? null,
      };
    })
    .filter(Boolean);

export const normaliseClassDetailPayload = (payload, fallbackClassId) => {
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

  // 1. PROCESS TEAMS
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
      // Capture teamImage for the UI
      teamImage: team.teamImage ?? team.image ?? team.avatar ?? null, 
      description: team.description ?? '',
      status: team.status ?? 'ACTIVE',
      color,
      projectId,
      projectAssignmentId,
      leaderId,
      gitLink: team.gitLink ?? team.repository ?? '',
      createdDate: team.createdDate ?? team.startDate ?? team.createdAt ?? null,
      endDate: team.endDate ?? team.finishDate ?? null,
      project,
      members: [],
      avgProgress: null,
    };
  });

  const teamColorMap = new Map();
  teams.forEach((team) => {
    if (team.rawId !== null && team.rawId !== undefined) {
      teamColorMap.set(team.rawId, team.color);
    }
  });

  // 2. PROCESS STUDENTS
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
        (team) =>
          team.rawId !== null &&
          team.rawId !== undefined &&
          team.rawId === memberTeamId
      );

      const role =
        member.isLeader === true ||
        (typeof member.role === 'string' && member.role.toLowerCase().includes('leader')) ||
        (member.teamRole === 'LEADER') ||
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
      
      const fullName = member.fullname ?? member.studentName ?? member.name ?? 'Student';

      return {
        id: studentId,
        studentId,
        code: member.studentCode ?? '',
        classId: toNumber(member.classId ?? classIdentifier),
        name: fullName,
        email: member.email ?? member.studentEmail ?? '',
        team: member.teamName ?? member.team?.teamName ?? owningTeam?.name ?? null,
        teamId: memberTeamId,
        teamColor,
        progress: progressValue,
        status: normaliseMemberStatus(member.status),
        lastSubmission: member.lastSubmission ?? member.lastSubmissionAt ?? member.lastSubmissionDate ?? null,
        tasksCompleted: tasksCompleted ?? null,
        totalTasks: totalTasks ?? null,
        // Fallback initials
        avatar: getInitials(fullName), 
        // Capture specific image URL for UI
        avatarImg: member.avatarImg ?? member.avatar ?? member.imageUrl ?? null,
        role,
      };
    })
    .filter(Boolean);

  // 3. MERGE MEMBERS INTO TEAMS
  const teamsWithMembers = teams.map((team) => {
    const membersForTeam = students.filter(
      (student) =>
        student.teamId !== null &&
        student.teamId !== undefined &&
        team.rawId !== null &&
        team.rawId !== undefined &&
        student.teamId === team.rawId
    );

    const progressSamples = membersForTeam
      .map((member) => member.progress)
      .filter((value) => Number.isFinite(value));

    const avgProgress = progressSamples.length
      ? Math.round(progressSamples.reduce((total, value) => total + value, 0) / progressSamples.length)
      : null;

    const decoratedMembers = membersForTeam.map((member) => ({
      id: member.studentId,
      name: member.name,
      avatar: member.avatar,       // Initials
      avatarImg: member.avatarImg, // Image URL (Crucial for Team Card UI)
      role: member.role,
      progress: Number.isFinite(member.progress) ? member.progress : null,
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
    name: summarySource?.className ?? summarySource?.name ?? base.className ?? 'Class Detail',
    code: summarySource?.classCode ?? summarySource?.code ?? summarySource?.className ?? '',
    subjectName: summarySource?.subjectName ?? base.subjectName ?? '',
    subjectCode: summarySource?.subjectCode ?? summarySource?.courseCode ?? base.subjectCode ?? '',
    term: summarySource?.term ?? summarySource?.semester ?? summarySource?.semesterName ?? '',
    instructor: summarySource?.lecturerName ?? base.lecturerName ?? '',
    schedule: summarySource?.schedule ?? summarySource?.classSchedule ?? '',
    totalStudents: summarySource?.totalStudents ?? summarySource?.studentCount ?? base.memberCount ?? students.length,
    totalTeams: summarySource?.teamCount ?? base.teamCount ?? rawTeams.length,
    totalAssignments: summarySource?.assignmentCount ?? rawAssignments.length,
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