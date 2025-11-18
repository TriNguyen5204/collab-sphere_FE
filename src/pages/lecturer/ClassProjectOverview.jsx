import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ClassProjectOverview.module.css';
import { getClassDetail } from '../../services/userService';
import { normaliseClassDetailPayload } from './classDetailNormalizer';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clampProgress = (value) => (Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0);

const toFiniteNumber = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatDate = (value, fallback = 'TBA') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const deriveStatus = (progress) => {
  if (progress >= 85) return { label: 'Ahead', variant: 'ahead' };
  if (progress >= 60) return { label: 'On Track', variant: 'onTrack' };
  if (progress >= 40) return { label: 'At Risk', variant: 'atRisk' };
  return { label: 'Behind', variant: 'behind' };
};

const deriveRisk = (progress, dueDate) => {
  if (progress >= 75) return 'low';
  if (progress >= 45) return 'medium';
  const due = dueDate ? new Date(dueDate) : null;
  const overdue = due && !Number.isNaN(due.getTime()) && due < new Date();
  return overdue ? 'critical' : 'medium';
};

const ClassProjectOverview = () => {
  const { classId } = useParams();
  const numericClassId = useMemo(() => toNumber(classId), [classId]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const fetchDetail = async () => {
      if (!classId) {
        setDetail(null);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await getClassDetail(classId);
        if (ignore) return;
        const normalised = normaliseClassDetailPayload(response, numericClassId);
        setDetail(normalised);
      } catch (err) {
        if (ignore) return;
        console.error('Failed to load class project overview.', err);
        setDetail(null);
        setError('Unable to load class projects right now.');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [classId, numericClassId]);

  const summary = detail?.summary ?? {};
  const teams = detail?.teams ?? [];
  const students = detail?.students ?? [];
  const assignments = detail?.projectAssignments ?? [];

  const classTitle = summary?.name ?? detail?.className ?? 'Class Project Overview';
  const breadcrumbItems = useMemo(
    () => [
      { label: 'Classes', href: '/lecturer/classes' },
      { label: classTitle, href: `/lecturer/classes/${classId}` },
      { label: 'Project overview' },
    ],
    [classId, classTitle]
  );
  const subjectName = summary?.subjectName ?? detail?.subjectName ?? '';
  const subjectCode = summary?.subjectCode ?? detail?.subjectCode ?? '';
  const termLabel = summary?.term ?? detail?.semesterName ?? 'Term TBA';
  const totalStudents = summary?.totalStudents ?? detail?.memberCount ?? students.length;
  const totalTeams = summary?.totalTeams ?? detail?.teamCount ?? teams.length;
  const totalAssignments = summary?.totalAssignments ?? assignments.length;

  const assignmentLookup = useMemo(() => {
    const lookup = new Map();
    assignments.forEach((assignment) => {
      if (assignment?.projectAssignmentId !== undefined && assignment?.projectAssignmentId !== null) {
        lookup.set(assignment.projectAssignmentId, assignment);
      }
    });
    return lookup;
  }, [assignments]);

  const projectCards = useMemo(() => {
    if (!teams.length) return [];

    return teams
      .map((team, index) => {
        const rawProgress = toFiniteNumber(team?.avgProgress ?? team?.progress);
        const progress = rawProgress !== null ? clampProgress(rawProgress) : null;
        const dueDate = team?.project?.dueDate ?? team?.projectDueDate ?? team?.endDate ?? null;
        const statusMeta = progress === null ? { label: 'Awaiting data', variant: 'noData' } : deriveStatus(progress);
        const riskLevel = progress === null ? 'medium' : deriveRisk(progress, dueDate);
        const assignment = assignmentLookup.get(
          team.projectAssignmentId ?? team.projectAssignmentID ?? team.projectAssignment?.projectAssignmentId ?? null
        );
        const memberNames = Array.isArray(team?.members)
          ? team.members
              .map((member) => member?.name ?? member?.fullname ?? member?.fullName ?? member?.studentName)
              .filter(Boolean)
          : [];
        const teamId = team?.id ?? team?.teamId ?? team?.rawId ?? index;
        const teamName = team?.name ?? team?.teamName ?? `Team ${index + 1}`;
        const projectName =
          team?.project?.name ??
          team?.project?.projectName ??
          team?.projectName ??
          assignment?.projectName ??
          'Unassigned project';
        const repoLink = team?.gitLink ?? team?.repository ?? team?.repo ?? '';

        return {
          id: teamId,
          teamId,
          teamName,
          projectName,
          progress,
          dueDate,
          statusLabel: statusMeta.label,
          statusVariant: statusMeta.variant,
          riskLevel,
          memberNames,
          members: team?.members ?? [],
          repo: repoLink,
          assignment,
          hasProgress: progress !== null,
        };
      })
      .sort((a, b) => {
        const progressA = Number.isFinite(a.progress) ? a.progress : -1;
        const progressB = Number.isFinite(b.progress) ? b.progress : -1;
        return progressB - progressA;
      });
  }, [teams, assignmentLookup]);

  const aggregateStats = useMemo(() => {
    const cardsWithProgress = projectCards.filter((card) => typeof card.progress === 'number');
    if (!cardsWithProgress.length) {
      return null;
    }

    const avg = Math.round(cardsWithProgress.reduce((sum, card) => sum + (card.progress ?? 0), 0) / cardsWithProgress.length);
    const onTrack = cardsWithProgress.filter((card) => (card.progress ?? 0) >= 60).length;
    const atRisk = cardsWithProgress.filter((card) => (card.progress ?? 0) < 60).length;
    const overdue = cardsWithProgress.filter((card) => {
      if (!card.dueDate) return false;
      const due = new Date(card.dueDate);
      return !Number.isNaN(due.getTime()) && due < new Date() && (card.progress ?? 0) < 100;
    }).length;

    return { avg, onTrack, atRisk, overdue };
  }, [projectCards]);

  const showProgressStats = Boolean(aggregateStats);

  const unassignedProjects = useMemo(() => {
    if (!assignments.length) return [];
    const assignedIds = new Set(projectCards.map((card) => card.assignment?.projectAssignmentId).filter(Boolean));
    return assignments.filter((assignment) => !assignedIds.has(assignment.projectAssignmentId));
  }, [assignments, projectCards]);

  const topContributors = useMemo(() => {
    if (!students.length) return [];

    return [...students]
      .map((student) => {
        const parsedProgress = toFiniteNumber(student?.progress);
        return {
          id: student.id ?? student.studentId ?? student.classMemberId,
          name: student.name ?? student.fullname ?? student.fullName ?? 'Student',
          team: student.team ?? student.teamName ?? 'Unassigned',
          progress: parsedProgress !== null ? clampProgress(parsedProgress) : null,
        };
      })
      .sort((a, b) => {
        const scoreA = Number.isFinite(a.progress) ? a.progress : -1;
        const scoreB = Number.isFinite(b.progress) ? b.progress : -1;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  }, [students]);

  const metaChips = [termLabel, `${totalStudents} Students`, `${totalTeams} Teams`, `${totalAssignments} Assignments`];

  return (
    <DashboardLayout>
      <div className={styles.screen}>
        <header className={styles.pageHeader}>
          <LecturerBreadcrumbs items={breadcrumbItems} className={styles.breadcrumbSlot} />
          <div className={styles.headerContent}>
            <div>
              <p className={styles.eyebrow}>Lecturer workspace · Projects</p>
              <h1>{classTitle}</h1>
              {(subjectCode || subjectName) && (
                <p className={styles.subjectLine}>
                  {subjectCode && <span className={styles.subjectCode}>{subjectCode}</span>}
                  {subjectName && <span>{subjectName}</span>}
                </p>
              )}
              <p className={styles.subtitle}>Monitor every active team board, risk, and assignment for this class.</p>
              <div className={styles.metaChips}>
                {metaChips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>
            <div className={styles.headerActions}>
              <Link to={`/lecturer/classes/${classId}/project-assignments`} className={styles.primaryAction}>
                Assign projects
              </Link>
              <Link to={`/lecturer/classes/${classId}/create-project`} className={styles.secondaryAction}>
                New project
              </Link>
            </div>
          </div>
        </header>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {showProgressStats && aggregateStats && (
          <section className={styles.statStrip}>
            <div className={styles.statCard}>
              <p>Average progress</p>
              <strong>{aggregateStats.avg}%</strong>
              <span>Across all tracked teams</span>
            </div>
            <div className={styles.statCard}>
              <p>On track</p>
              <strong>{aggregateStats.onTrack}</strong>
              <span>≥ 60% completion</span>
            </div>
            <div className={styles.statCard}>
              <p>At risk</p>
              <strong>{aggregateStats.atRisk}</strong>
              <span>Need lecturer follow-up</span>
            </div>
            <div className={styles.statCard}>
              <p>Overdue</p>
              <strong>{aggregateStats.overdue}</strong>
              <span>Past due milestones</span>
            </div>
          </section>
        )}

        <div className={styles.layout}>
          <section className={styles.projectColumn}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>Active boards</p>
                <h2>Teams & linked projects</h2>
              </div>
              <span>{projectCards.length} team(s)</span>
            </div>

            {loading ? (
              <div className={styles.placeholder}>Loading class projects…</div>
            ) : projectCards.length ? (
              <div className={styles.projectGrid}>
                {projectCards.map((card) => (
                  <article key={card.id} className={styles.projectCard}>
                    <div className={styles.projectHead}>
                      <div>
                        <p className={styles.projectLabel}>{card.projectName}</p>
                        <h3>{card.teamName}</h3>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[card.statusVariant]}`}>{card.statusLabel}</span>
                    </div>
                    <dl className={styles.metaGrid}>
                      <div>
                        <dt>Due date</dt>
                        <dd>{formatDate(card.dueDate)}</dd>
                      </div>
                      <div>
                        <dt>Members</dt>
                        <dd>{card.memberNames.length || '—'}</dd>
                      </div>
                      <div>
                        <dt>Assignment</dt>
                        <dd>{card.assignment ? `#${card.assignment.projectAssignmentId}` : 'Not linked'}</dd>
                      </div>
                    </dl>
                    <div className={styles.memberRow}>
                      {card.memberNames.length ? (
                        card.memberNames.map((member) => (
                          <span key={member} className={styles.memberChip}>
                            {member}
                          </span>
                        ))
                      ) : (
                        <span className={styles.emptyChip}>Waiting for roster</span>
                      )}
                    </div>
                    <div className={styles.cardActions}>
                      <Link to={`/lecturer/classes/${classId}/team/${card.teamId}`} className={styles.primaryAction}>
                        View board
                      </Link>
                      {card.repo ? (
                        <a href={card.repo} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
                          Repository ↗
                        </a>
                      ) : (
                        <span className={styles.textMuted}>No repo linked</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.placeholder}>No team boards yet. Link a project to a team to get started.</div>
            )}
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>Assignments</p>
                  <h2>Project queue</h2>
                </div>
                <span>{assignments.length}</span>
              </div>
              {assignments.length ? (
                <ul className={styles.assignmentList}>
                  {assignments.slice(0, 5).map((assignment) => (
                    <li key={assignment.projectAssignmentId}>
                      <div>
                        <p className={styles.assignmentTitle}>{assignment.projectName}</p>
                        <span className={styles.assignmentMeta}>Assigned {formatDate(assignment.assignedDate)}</span>
                      </div>
                      <span className={styles.assignmentStatus}>
                        {unassignedProjects.find((item) => item.projectAssignmentId === assignment.projectAssignmentId)
                          ? 'Unassigned'
                          : 'Linked'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.placeholder}>No project assignments recorded.</div>
              )}
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>Roster</p>
                  <h2>Top contributors</h2>
                </div>
                <span>{students.length}</span>
              </div>
              {topContributors.length ? (
                <ul className={styles.contributorList}>
                  {topContributors.map((member) => (
                    <li key={member.id}>
                      <div>
                        <p>{member.name}</p>
                        <span>{member.team}</span>
                      </div>
                      <span className={styles.progressTag}>
                        {Number.isFinite(member.progress) ? `${member.progress}%` : 'No data'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.placeholder}>No members synced yet.</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassProjectOverview;