import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './ClassDetailPage.module.css';
import { getClassDetail } from '../../services/userService';
import { normaliseClassDetailPayload } from './classDetailNormalizer';

const formatDate = (value, fallback = '—') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const assignmentStatusMeta = (status) => {
  if (status === 1) return { label: 'Approved', token: 'approved' };
  if (status === 2) return { label: 'Denied', token: 'denied' };
  return { label: 'Pending', token: 'pending' };
};

const teamStatusMeta = (status) => {
  if (status === 2) return { label: 'Inactive', token: 'inactive' };
  return { label: 'Active', token: 'active' };
};

const roleLabel = (role) => (role === 1 ? 'Leader' : 'Member');

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

const ClassDetailPage = () => {
  const { classId } = useParams();
  const numericClassId = Number.isFinite(Number(classId)) ? Number(classId) : undefined;
  const [detail, setDetail] = useState(null);
  const [normalisedDetail, setNormalisedDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadDetail = async () => {
      if (!classId) {
        setDetail(null);
        setNormalisedDetail(null);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await getClassDetail(classId);
        if (ignore) {
          return;
        }
        setDetail(response);
        setNormalisedDetail(normaliseClassDetailPayload(response, numericClassId));
      } catch (err) {
        if (ignore) {
          return;
        }
        console.error('Failed to load class workspace.', err);
        setDetail(null);
        setNormalisedDetail(null);
        setError('Unable to load this class right now.');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [classId, numericClassId]);

  const summaryStats = useMemo(() => {
    if (!detail) {
      return [];
    }

    const assignmentTotal = detail.projectAssignments ? detail.projectAssignments.length : 0;

    return [
      { label: 'Students', value: detail.memberCount ?? normalisedDetail?.summary?.totalStudents ?? 0, helper: 'Enrolled' },
      { label: 'Teams', value: detail.teamCount ?? normalisedDetail?.summary?.totalTeams ?? 0, helper: 'Formed teams' },
      { label: 'Assignments', value: assignmentTotal, helper: 'Project queue' },
      { label: 'Status', value: detail.isActive ? 'Active' : 'Inactive', helper: 'Class state' },
    ];
  }, [detail, normalisedDetail]);

  const teams = detail?.teams ?? [];
  const assignments = detail?.projectAssignments ?? [];
  const members = detail?.classMembers ?? [];

  const breadcrumbs = [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: detail?.className ?? 'Class workspace', href: `/lecturer/classes/${classId}` },
  ];

  const showEmptyState = !loading && !detail && !error;

  return (
    <DashboardLayout>
      <div className={styles.screen}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {crumb.href ? <Link to={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
              {index < breadcrumbs.length - 1 && <span className={styles.separator}>›</span>}
            </React.Fragment>
          ))}
        </nav>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {loading && <div className={styles.placeholder}>Loading class workspace…</div>}
        {showEmptyState && <div className={styles.placeholder}>Select a class to view its workspace.</div>}

        {detail && !loading && (
          <>
            <header className={styles.heroCard}>
              <div>
                <p className={styles.eyebrow}>Lecturer workspace · Class overview</p>
                <h1>{detail.className}</h1>
                {(detail.subjectCode || detail.subjectName) && (
                  <p className={styles.subjectLine}>
                    {detail.subjectCode && <span className={styles.subjectCode}>{detail.subjectCode}</span>}
                    {detail.subjectName && <span>{detail.subjectName}</span>}
                  </p>
                )}
                <p className={styles.helper}>Review roster, teams, and project assignments for this class.</p>
                <div className={styles.metaChips}>
                  {detail.semesterName && <span>{detail.semesterName}</span>}
                  <span>{detail.memberCount ?? members.length} Students</span>
                  <span>{teams.length} Teams</span>
                  <span>{assignments.length} Assignments</span>
                </div>
              </div>
              <div className={styles.heroMeta}>
                <div>
                  <p>Lecturer</p>
                  <strong>{detail.lecturerName ?? '—'}</strong>
                </div>
                <div>
                  <p>Enrol key</p>
                  <strong>{detail.enrolKey ?? '—'}</strong>
                </div>
                <div>
                  <p>Created</p>
                  <strong>{formatDate(detail.createdDate)}</strong>
                </div>
                <Link to={`/lecturer/classes/${classId}/projects`} className={styles.primaryAction}>
                  Open project overview
                </Link>
              </div>
            </header>

            <section className={styles.statsGrid}>
              {summaryStats.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <p>{stat.label}</p>
                  <strong>{stat.value}</strong>
                  <span>{stat.helper}</span>
                </div>
              ))}
            </section>

            <div className={styles.contentGrid}>
              <section className={styles.card}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.eyebrow}>Teams</p>
                    <h2>Active teams</h2>
                  </div>
                  <span>{teams.length}</span>
                </div>
                {teams.length ? (
                  <ul className={styles.teamList}>
                    {teams.map((team) => {
                      const status = teamStatusMeta(team.status);
                      return (
                        <li key={team.teamId} className={styles.teamRow}>
                          <div>
                            <p className={styles.teamName}>{team.teamName}</p>
                            <span className={styles.teamProject}>{team.projectName ?? 'Unlinked project'}</span>
                          </div>
                          <div className={styles.teamMeta}>
                            <div>
                              <p>Project assignment</p>
                              <strong>{team.projectAssignmentId ? `#${team.projectAssignmentId}` : '—'}</strong>
                            </div>
                            <div>
                              <p>Due date</p>
                              <strong>{formatDate(team.endDate)}</strong>
                            </div>
                            <div>
                              <p>Status</p>
                              <span className={`${styles.statusBadge} ${styles[status.token]}`}>{status.label}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className={styles.placeholder}>No teams created for this class.</div>
                )}
              </section>

              <section className={styles.card}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.eyebrow}>Assignments</p>
                    <h2>Project queue</h2>
                  </div>
                  <span>{assignments.length}</span>
                </div>
                {assignments.length ? (
                  <div className={styles.assignmentScroller}>
                    {assignments.map((assignment) => {
                      const status = assignmentStatusMeta(assignment.status);
                      return (
                        <article key={assignment.projectAssignmentId} className={styles.assignmentCard}>
                          <div className={styles.assignmentHeader}>
                            <span className={styles.assignmentId}>#{assignment.projectAssignmentId}</span>
                            <span className={`${styles.statusBadge} ${styles[status.token]}`}>{status.label}</span>
                          </div>
                          <h3>{assignment.projectName}</h3>
                          <p className={styles.assignmentDescription}>{assignment.description ?? 'Description updating soon.'}</p>
                          <dl className={styles.assignmentMetaGrid}>
                            <div>
                              <dt>Assigned</dt>
                              <dd>{formatDate(assignment.assignedDate)}</dd>
                            </div>
                            <div>
                              <dt>Project</dt>
                              <dd>{assignment.projectId ?? '—'}</dd>
                            </div>
                          </dl>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.placeholder}>No project assignments recorded.</div>
                )}
              </section>
            </div>

            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.eyebrow}>Roster</p>
                  <h2>Class members</h2>
                </div>
                <span>{members.length}</span>
              </div>
              {members.length ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.rosterTable}>
                    <thead>
                      <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Student code</th>
                        <th scope="col">Team</th>
                        <th scope="col">Role</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.classMemberId}>
                          <td>
                            <div className={styles.personCell}>
                              {member.avatarImg ? (
                                <img src={member.avatarImg} alt={member.fullname} />
                              ) : (
                                <span className={styles.avatarFallback}>{getInitials(member.fullname)}</span>
                              )}
                              <div>
                                <p>{member.fullname}</p>
                                <span>{member.email ?? ''}</span>
                              </div>
                            </div>
                          </td>
                          <td>{member.studentCode ?? '—'}</td>
                          <td>{member.teamName ?? 'Unassigned'}</td>
                          <td>{roleLabel(member.teamRole)}</td>
                          <td>{member.phoneNumber ?? '—'}</td>
                          <td>{member.address ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.placeholder}>This class has no enrolled students yet.</div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassDetailPage;
