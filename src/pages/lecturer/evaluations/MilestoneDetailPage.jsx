import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CloudArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestoneDetail } from '../../../services/milestoneApi';
import { submitMilestoneEvaluation } from '../../../services/evaluationApi';
import { normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';
import { toast } from 'sonner';

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const statusMetaMap = {
  completed: { label: 'Completed', className: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  'in-progress': { label: 'In progress', className: 'text-amber-600 bg-amber-50 border-amber-200' },
  pending: { label: 'Not started', className: 'text-slate-600 bg-slate-50 border-slate-200' },
  locked: { label: 'Locked', className: 'text-slate-500 bg-slate-100 border-slate-300' },
};

const formatDate = (value, options = { month: 'short', day: 'numeric' }) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, options);
};

const buildDownloadUrl = (file) => {
  if (!file) return null;
  if (file.url) return file.url;
  if (file.fileUrl) return file.fileUrl;
  if (file.path) {
    if (!apiBaseUrl) return file.path;
    return `${apiBaseUrl}${file.path.startsWith('/') ? '' : '/'}${file.path}`;
  }
  if (file.filePath) {
    if (!apiBaseUrl) return file.filePath;
    return `${apiBaseUrl}${file.filePath.startsWith('/') ? '' : '/'}${file.filePath}`;
  }
  if (file.fileId) {
    if (!apiBaseUrl) return null;
    return `${apiBaseUrl}/resource/file/${file.fileId}`;
  }
  return null;
};

const normalizeMilestoneDetailPayload = (detail = {}) => {
  const id = detail.teamMilestoneId ?? detail.milestoneId ?? detail.id ?? null;
  const statusToken = normalizeMilestoneStatus(detail?.statusString ?? detail?.status);
  const returns = (detail?.milestoneReturns || []).map((record, index) => ({
    id: record.mileReturnId ?? index,
    studentName: record.studentName ?? record.fullname ?? record.fullName ?? 'Student',
    studentCode: record.studentCode ?? '',
    submittedAt: record.submitedDate ?? record.submittedAt ?? record.createdDate ?? '',
    fileName: record.fileName ?? record.originalFileName ?? 'Submission',
    fileSize: record.fileSize ?? null,
    url: buildDownloadUrl(record),
    fileId: record.fileId ?? record.mileReturnId ?? null,
  }));

  const evaluation = detail?.milestoneEvaluation
    ? {
        score: detail.milestoneEvaluation.score ?? null,
        comments: detail.milestoneEvaluation.comment ?? detail.milestoneEvaluation.comments ?? '',
        evaluatorName: detail.milestoneEvaluation.fullName ?? detail.milestoneEvaluation.lecturerName ?? '',
        updatedAt: detail.milestoneEvaluation.createdDate ?? detail.milestoneEvaluation.updatedAt ?? '',
      }
    : null;

  return {
    id,
    title: detail.title ?? detail.name ?? 'Milestone detail',
    description: detail.description ?? '',
    startDate: detail.startDate ?? detail.beginDate ?? null,
    dueDate: detail.dueDate ?? detail.endDate ?? null,
    statusToken,
    statusLabel: statusMetaMap[statusToken]?.label || 'Not started',
    returns,
    evaluation,
  };
};

const MilestoneDetailPage = () => {
  const { classId, teamId, milestoneId } = useParams();
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState({ team: false, milestone: false, evaluation: false, submitting: false });
  const [formState, setFormState] = useState({ score: '', comments: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    let ignore = false;
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

  const fetchMilestoneData = async () => {
    if (!milestoneId) return;
    setLoading((prev) => ({ ...prev, milestone: true }));
    try {
      const detail = await getMilestoneDetail(milestoneId);
      const normalized = normalizeMilestoneDetailPayload(detail);
      setMilestone(normalized);

      if (normalized.evaluation) {
        setEvaluation(normalized.evaluation);
        setFormState({
          score: normalized.evaluation.score ?? '',
          comments: normalized.evaluation.comments ?? '',
        });
        setEditing(false);
      } else {
        setEvaluation(null);
        setFormState({ score: '', comments: '' });
        setEditing(true);
      }
    } catch (error) {
      console.error('Unable to load milestone detail.', error);
      toast.error('Unable to load milestone detail.');
    } finally {
      setLoading((prev) => ({ ...prev, milestone: false }));
    }
  };

  useEffect(() => {
    fetchMilestoneData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneId]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Grading', href: `/lecturer/grading/${classId}` });
    }
    if (teamInfo?.teamName) {
      const teamPath = classId
        ? `/lecturer/grading/class/${classId}/team/${teamId}`
        : `/lecturer/grading/team/${teamId}`;
      items.push({ label: teamInfo.teamName, href: teamPath });
      items.push({ label: 'Milestones', href: `${teamPath}/milestones` });
    } else {
      items.push({ label: 'Team', href: classId ? `/lecturer/grading/${classId}` : '/lecturer/grading' });
      items.push({ label: 'Milestones' });
    }
    items.push({ label: milestone?.title || 'Milestone detail' });
    return items;
  }, [classId, teamId, teamInfo?.teamName, milestone?.title]);

  const statusMeta = statusMetaMap[milestone?.statusToken] || statusMetaMap.pending;

  const handleBackToMilestones = () => {
    if (classId) {
      navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones`);
    } else {
      navigate(`/lecturer/grading/team/${teamId}/milestones`);
    }
  };

  const handleDownloadFile = (file) => {
    const url = file?.url || (file?.fileId && apiBaseUrl ? `${apiBaseUrl}/resource/file/${file.fileId}` : null);
    if (!url) {
      toast.error('File download is unavailable.');
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  const handleEvaluationSubmit = async (event) => {
    event.preventDefault();
    if (!milestoneId) return;
    if (formState.score === '') {
      toast.warning('Score is required to submit evaluation.');
      return;
    }

    const payload = {
      score: Number(formState.score),
      comments: formState.comments?.trim() || '',
    };

    if (!Number.isFinite(payload.score)) {
      toast.warning('Score must be a valid number.');
      return;
    }

    setLoading((prev) => ({ ...prev, submitting: true }));
    try {
      await submitMilestoneEvaluation(milestoneId, payload);
      toast.success('Milestone evaluation saved.');
      await fetchMilestoneData();
    } catch (error) {
      console.error('Unable to submit milestone evaluation.', error);
      toast.error(error?.message || 'Unable to submit milestone evaluation.');
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const milestoneStats = useMemo(() => {
    if (!milestone) return [];
    return [
      { label: 'Progress', value: milestone.progress !== null ? `${milestone.progress}%` : '—' },
      { label: 'Questions answered', value: `${milestone.completedAnswers ?? 0}/${milestone.requiredAnswers ?? 0}` },
      { label: 'Returns submitted', value: milestone.returns?.length || 0 },
      { label: 'Checkpoints', value: milestone.checkpoints?.length || 0 },
    ];
  }, [milestone]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="relative w-full px-6 py-10 space-y-10 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 translate-y-[-30%] bg-gradient-to-r from-sky-200/40 via-indigo-200/30 to-purple-200/40 blur-3xl" />

          <header className={`${glassPanelClass} relative rounded-3xl border border-indigo-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <LecturerBreadcrumbs items={breadcrumbItems} />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Milestone detail</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Milestone: {milestone?.title || 'Milestone workspace'}</h1>
                <p className="mt-2 text-sm text-slate-600">{milestone?.description || 'Add instructions so teams know what to deliver.'}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] normal-case tracking-normal text-slate-600">
                    Start date: {formatDate(milestone?.startDate)}
                  </span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] normal-case tracking-normal text-slate-600">
                    End date: {formatDate(milestone?.dueDate)}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      statusMeta.className || 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}
                  >
                    {milestone?.statusLabel || 'Not started'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBackToMilestones}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
              >
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> Back to milestones
              </button>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <div className={`${glassPanelClass} rounded-3xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Student submissions</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Files from the team</h2>
                  <p className="mt-2 text-sm text-slate-600">Review every uploaded artifact before scoring this milestone.</p>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
                  {milestone?.returns?.length ?? 0} file{(milestone?.returns?.length ?? 0) === 1 ? '' : 's'}
                </span>
              </div>

              {loading.milestone ? (
                <p className="mt-6 text-sm text-slate-500">Loading submissions…</p>
              ) : milestone?.returns?.length ? (
                <div className="mt-6 space-y-3">
                  {milestone.returns.map((submission) => (
                    <div key={submission.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white/85 p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{submission.fileName}</p>
                          <p className="text-xs text-slate-500">
                            {submission.studentName}
                            {submission.submittedAt ? ` · Submitted ${formatDate(submission.submittedAt, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(submission)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5"
                        disabled={!submission.fileId && !submission.url}
                      >
                        <CloudArrowDownIcon className="h-4 w-4" aria-hidden="true" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500">No submissions have been uploaded for this milestone yet.</p>
              )}
            </div>

            <aside className={`${glassPanelClass} rounded-3xl p-6 space-y-5`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Milestone evaluation</p>
                <h2 className="text-2xl font-semibold text-slate-900">Grade & feedback</h2>
                <p className="mt-2 text-sm text-slate-600">{'Scores align with POST /evaluate/milestone/{teamMilestoneId}.'}</p>
              </div>

              {loading.evaluation ? (
                <p className="text-sm text-slate-500">Loading evaluation…</p>
              ) : evaluation && !editing ? (
                <div className="rounded-2xl border border-slate-100 bg-white/85 p-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Current evaluation</p>
                  <p className="text-3xl font-bold text-indigo-600">{evaluation.score ?? '—'}</p>
                  {evaluation.comments && <p className="text-sm text-slate-600">“{evaluation.comments}”</p>}
                  <p className="text-xs text-slate-500">
                    {evaluation.evaluatorName ? `${evaluation.evaluatorName} · ` : ''}
                    Last updated {formatDate(evaluation.updatedAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Edit evaluation
                  </button>
                </div>
              ) : null}

              {(editing || !evaluation) && (
                <form className="space-y-4" onSubmit={handleEvaluationSubmit}>
                  <label className="flex flex-col gap-1 text-sm text-slate-700">
                    Score
                    <input
                      type="number"
                      min="0"
                      value={formState.score}
                      onChange={(event) => setFormState((prev) => ({ ...prev, score: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-700">
                    Comments
                    <textarea
                      rows={4}
                      value={formState.comments}
                      onChange={(event) => setFormState((prev) => ({ ...prev, comments: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-900 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                  </label>
                  <div className="flex justify-end gap-3">
                    {evaluation && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormState({ score: evaluation.score ?? '', comments: evaluation.comments ?? '' });
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5"
                      disabled={loading.submitting || formState.score === ''}
                    >
                      {loading.submitting ? 'Saving…' : evaluation ? 'Update evaluation' : 'Submit evaluation'}
                    </button>
                  </div>
                </form>
              )}
            </aside>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MilestoneDetailPage;
