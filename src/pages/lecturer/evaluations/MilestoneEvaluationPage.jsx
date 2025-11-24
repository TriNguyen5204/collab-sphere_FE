import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam } from '../../../services/milestoneApi';
import { getMilestoneEvaluationsByTeam, submitMilestoneEvaluation } from '../../../services/evaluationApi';
import { toast } from 'sonner';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const formatDate = (value, fallback = '—') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const MilestoneEvaluationPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [loading, setLoading] = useState({ team: false, milestones: false, submit: false });
  const [formState, setFormState] = useState({ score: '', comments: '' });

  useEffect(() => {
    let ignore = false;
    if (!teamId) return;

    const fetchTeam = async () => {
      setLoading((prev) => ({ ...prev, team: true }));
      try {
        const detail = await getTeamDetail(teamId);
        if (!ignore) {
          setTeamInfo(detail);
        }
      } catch (error) {
        console.error('Unable to load team detail.', error);
        toast.error('Unable to load team detail.');
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

  const fetchMilestones = async () => {
    if (!teamId) return;
    setLoading((prev) => ({ ...prev, milestones: true }));
    try {
      const [milestoneList, evaluationList] = await Promise.all([
        getMilestonesByTeam(teamId),
        getMilestoneEvaluationsByTeam(teamId),
      ]);
      const normalizedMilestones = Array.isArray(milestoneList?.list)
        ? milestoneList.list
        : Array.isArray(milestoneList?.teamMilestones)
          ? milestoneList.teamMilestones
          : Array.isArray(milestoneList)
            ? milestoneList
            : [];
      setMilestones(normalizedMilestones);
      setEvaluations(Array.isArray(evaluationList) ? evaluationList : []);
      if (!selectedMilestoneId && normalizedMilestones.length) {
        const firstId = normalizedMilestones[0].teamMilestoneId ?? normalizedMilestones[0].milestoneId ?? normalizedMilestones[0].id;
        setSelectedMilestoneId(String(firstId || ''));
      }
    } catch (error) {
      console.error('Unable to load milestones.', error);
      toast.error('Unable to load milestones.');
    } finally {
      setLoading((prev) => ({ ...prev, milestones: false }));
    }
  };

  useEffect(() => {
    fetchMilestones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: teamInfo?.classInfo?.className || 'Class detail', href: `/lecturer/classes/${classId}` });
    }
    items.push({ label: teamInfo?.teamName ? `${teamInfo.teamName} milestones` : 'Milestone evaluations' });
    return items;
  }, [classId, teamInfo?.classInfo?.className, teamInfo?.teamName]);

  const selectedMilestone = useMemo(() => {
    const numericId = selectedMilestoneId ? Number(selectedMilestoneId) : null;
    return milestones.find((milestone) => {
      const id = milestone.teamMilestoneId ?? milestone.milestoneId ?? milestone.id;
      return Number(id) === numericId;
    });
  }, [milestones, selectedMilestoneId]);

  const evaluationByMilestone = useMemo(() => {
    const map = new Map();
    evaluations.forEach((evaluation) => {
      if (evaluation?.teamMilestoneId) {
        map.set(Number(evaluation.teamMilestoneId), evaluation);
      }
    });
    return map;
  }, [evaluations]);

  useEffect(() => {
    if (!selectedMilestone) return;
    const snapshot = evaluationByMilestone.get(Number(selectedMilestone.teamMilestoneId ?? selectedMilestone.milestoneId ?? selectedMilestone.id));
    if (snapshot) {
      setFormState({
        score: snapshot.score ?? '',
        comments: snapshot.comments ?? '',
      });
    } else {
      setFormState({ score: '', comments: '' });
    }
  }, [evaluationByMilestone, selectedMilestone]);

  const evaluationBasePath = useMemo(() => {
    if (!teamId) return '/lecturer/grading';
    if (classId) {
      return `/lecturer/grading/class/${classId}/team/${teamId}`;
    }
    return `/lecturer/grading/team/${teamId}`;
  }, [classId, teamId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedMilestone) {
      toast.warning('Choose a milestone before submitting.');
      return;
    }
    const milestoneId = selectedMilestone.teamMilestoneId ?? selectedMilestone.milestoneId ?? selectedMilestone.id;
    if (!milestoneId) {
      toast.error('Milestone identifier missing.');
      return;
    }

    const payload = {
      score: formState.score === '' ? null : Number(formState.score),
      comments: formState.comments?.trim() || '',
    };

    if (payload.score === null) {
      toast.warning('Score is required before submitting.');
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      await submitMilestoneEvaluation(milestoneId, payload);
      toast.success('Milestone evaluation saved.');
      setFormState({ score: '', comments: '' });
      await fetchMilestones();
    } catch (error) {
      console.error('Unable to submit milestone evaluation.', error);
      toast.error(error?.message || 'Unable to submit milestone evaluation.');
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="relative w-full px-6 py-10 space-y-10 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 translate-y-[-30%] bg-gradient-to-r from-sky-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />

          <header className={`${glassPanelClass} relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <LecturerBreadcrumbs items={breadcrumbItems} />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Lecturer workspace · Milestones</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">{teamInfo?.teamName || 'Milestone evaluations'}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Record feedback for each milestone submission and surface blockers before the next checkpoint.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/lecturer/classes/${classId}/team/${teamId}`)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  Back to team board
                </button>
                <Link
                  to={evaluationBasePath}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  Team evaluation workspace
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className={`${glassPanelClass} rounded-3xl p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Milestone queue</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Timeline</h2>
                </div>
              </div>
              {loading.milestones ? (
                <p className="mt-4 text-sm text-slate-500">Loading milestones…</p>
              ) : milestones.length ? (
                <div className="mt-6 space-y-3">
                  {milestones.map((milestone) => {
                    const id = milestone.teamMilestoneId ?? milestone.milestoneId ?? milestone.id;
                    const evaluation = evaluationByMilestone.get(Number(id));
                    return (
                      <label key={id} className={`${glassPanelClass} flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3`}>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{milestone.title || milestone.name || 'Milestone'}</p>
                          <p className="text-xs text-slate-500">
                            {formatDate(milestone.startDate ?? milestone.beginDate)} · Due {formatDate(milestone.dueDate ?? milestone.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {evaluation?.score !== undefined && evaluation?.score !== null ? `${evaluation.score} pts` : 'No evaluation'}
                          </span>
                          <input
                            type="radio"
                            name="selectedMilestone"
                            value={id}
                            checked={String(selectedMilestoneId) === String(id)}
                            onChange={(event) => setSelectedMilestoneId(event.target.value)}
                            className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No milestones are linked to this team yet.</p>
              )}
            </div>

            <div className={`${glassPanelClass} rounded-3xl p-6`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Evaluation history</p>
                <h2 className="text-2xl font-semibold text-slate-900">Latest submissions</h2>
              </div>
              {evaluations.length ? (
                <div className="mt-5 space-y-3">
                  {evaluations.map((evaluation) => (
                    <div key={evaluation.teamMilestoneId} className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">{evaluation.milestoneTitle || 'Milestone'}</p>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Score {evaluation.score ?? '—'}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(evaluation.createdDate)}</p>
                      {evaluation.comments && <p className="mt-2 text-sm text-slate-700">“{evaluation.comments}”</p>}
                      <p className="mt-3 text-xs text-slate-500">Lecturer: {evaluation.lecturerName || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-500">Submit the first milestone evaluation to populate this list.</p>
              )}
            </div>
          </section>

          <section className={`${glassPanelClass} rounded-3xl p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Evaluate submission</p>
                <h2 className="text-2xl font-semibold text-slate-900">Milestone feedback form</h2>
              </div>
            </div>
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Score (pts)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formState.score}
                    onChange={(event) => setFormState((prev) => ({ ...prev, score: event.target.value }))}
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
                  Submission window
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-600">
                    {selectedMilestone ? (
                      <span>
                        {formatDate(selectedMilestone.startDate ?? selectedMilestone.beginDate)} – {formatDate(selectedMilestone.dueDate ?? selectedMilestone.endDate)}
                      </span>
                    ) : (
                      'Select a milestone'
                    )}
                  </div>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Comments
                <textarea
                  rows={4}
                  value={formState.comments}
                  onChange={(event) => setFormState((prev) => ({ ...prev, comments: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5"
                  disabled={loading.submit}
                >
                  {loading.submit ? 'Saving…' : 'Save milestone evaluation'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MilestoneEvaluationPage;
