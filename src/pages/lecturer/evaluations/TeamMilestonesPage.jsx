import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam } from '../../../services/milestoneApi';
import { toast } from 'sonner';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getStatusChip = (statusString) => {
  switch ((statusString || '').toUpperCase()) {
    case 'COMPLETED':
      return { label: 'Completed', dotClass: 'bg-emerald-500', textClass: 'text-emerald-600 bg-emerald-50' };
    case 'INPROGRESS':
      return { label: 'In progress', dotClass: 'bg-amber-400', textClass: 'text-amber-600 bg-amber-50' };
    default:
      return { label: 'Not done', dotClass: 'bg-slate-300', textClass: 'text-slate-600 bg-slate-100' };
  }
};

const TeamMilestonesPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState({ team: false, milestones: false });

  useEffect(() => {
    let ignore = false;
    if (!teamId) return () => {
      ignore = true;
    };

    const fetchTeam = async () => {
      setLoading((prev) => ({ ...prev, team: true }));
      try {
        const detail = await getTeamDetail(teamId);
        if (!ignore) {
          setTeamInfo(detail);
        }
      } catch (error) {
        console.error('Unable to load team detail.', error);
        if (!ignore) {
          toast.error('Unable to load team detail.');
        }
      } finally {
        if (!ignore) {
          setLoading((prev) => ({ ...prev, team: false }));
        }
      }
    };

    fetchTeam();
    return () => {
      ignore = true;
    };
  }, [teamId]);

  useEffect(() => {
    let ignore = false;
    if (!teamId) return () => {
      ignore = true;
    };

    const fetchMilestones = async () => {
      setLoading((prev) => ({ ...prev, milestones: true }));
      try {
        const response = await getMilestonesByTeam(teamId);
        let list = [];
        if (Array.isArray(response?.teamMilestones)) list = response.teamMilestones;
        else if (Array.isArray(response?.list)) list = response.list;
        else if (Array.isArray(response?.data)) list = response.data;
        else if (Array.isArray(response)) list = response;
        if (!ignore) {
          setMilestones(list);
        }
      } catch (error) {
        console.error('Unable to load milestones for this team.', error);
        if (!ignore) {
          toast.error('Unable to load team milestones.');
          setMilestones([]);
        }
      } finally {
        if (!ignore) {
          setLoading((prev) => ({ ...prev, milestones: false }));
        }
      }
    };

    fetchMilestones();
    return () => {
      ignore = true;
    };
  }, [teamId]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Grading overview', href: `/lecturer/grading/${classId}` });
    }
    items.push({ label: teamInfo?.teamName ? `${teamInfo.teamName} milestones` : 'Team milestones' });
    return items;
  }, [classId, teamInfo?.teamName]);

  const handleBackToClassGrading = () => {
    if (classId) {
      navigate(`/lecturer/grading/${classId}`);
    } else {
      navigate('/lecturer/classes');
    }
  };

  const handleOpenMilestoneEvaluationWorkspace = () => {
    if (classId) {
      navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`);
    } else {
      navigate(`/lecturer/grading/team/${teamId}/milestones/evaluate`);
    }
  };

  const handleOpenMilestone = (milestoneId) => {
    if (!milestoneId) return;
    if (classId) {
      navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones/${milestoneId}`);
    } else {
      navigate(`/lecturer/grading/team/${teamId}/milestones/${milestoneId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="relative w-full px-6 py-10 space-y-10 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 translate-y-[-30%] bg-gradient-to-r from-sky-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />

          <header className={`${glassPanelClass} relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <LecturerBreadcrumbs items={breadcrumbItems} />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Group details · Milestones</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  {teamInfo?.teamName ? `Team ${teamInfo.teamName} — Milestones` : 'Team milestones'}
                </h1>
                <p className="mt-2 text-sm text-slate-600">Review every milestone before drilling into submissions and grading.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleOpenMilestoneEvaluationWorkspace}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  Go to evaluation workspace
                </button>
                <button
                  type="button"
                  onClick={handleBackToClassGrading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Back to class grading
                </button>
              </div>
            </div>
          </header>

          <section className={`${glassPanelClass} rounded-3xl p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Milestone list</p>
                <h2 className="text-2xl font-semibold text-slate-900">Timeline</h2>
              </div>
              <p className="text-xs text-slate-500">Source: GET /milestone/team/&#123;teamId&#125;</p>
            </div>

            {loading.milestones ? (
              <p className="mt-6 text-sm text-slate-500">Loading milestones…</p>
            ) : milestones.length ? (
              <div className="mt-6 space-y-3">
                {milestones.map((milestone) => {
                  const id = milestone.teamMilestoneId ?? milestone.milestoneId ?? milestone.id;
                  const status = getStatusChip(milestone.statusString);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleOpenMilestone(id)}
                      className={`${glassPanelClass} w-full rounded-2xl border border-transparent px-5 py-4 text-left transition hover:-translate-y-1 hover:border-indigo-200`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{milestone.title || 'Untitled milestone'}</p>
                          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{milestone.description || 'No description provided.'}</p>
                        </div>
                        <div className="text-sm text-slate-500 md:text-right">
                          <p>{formatDate(milestone.startDate)} – {formatDate(milestone.endDate)}</p>
                          <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.textClass}`}>
                            <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                        View milestone details
                        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">No milestones available for this team yet.</p>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamMilestonesPage;
