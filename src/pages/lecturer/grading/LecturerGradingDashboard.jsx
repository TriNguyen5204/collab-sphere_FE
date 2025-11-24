import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  UserCircleIcon, 
  CheckCircleIcon,
  ClockIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from '../../../services/milestoneApi';
import { getSubjectById } from '../../../services/userService';
import { 
  getTeamEvaluationSummary, 
  submitTeamEvaluation, 
  submitMilestoneEvaluation 
} from '../../../services/evaluationApi';
import { normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const glassPanelClass = 'backdrop-blur-[18px] bg-white/85 border border-white/70 shadow-[0_10px_45px_rgba(15,23,42,0.08)]';

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

const LecturerGradingDashboard = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [subjectData, setSubjectData] = useState(null);
  
  // Mode: null = Final Evaluation, string = Milestone ID
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  
  // Data for modes
  const [milestoneDetail, setMilestoneDetail] = useState(null);
  const [finalEvaluationSummary, setFinalEvaluationSummary] = useState(null);

  // Forms
  const [milestoneForm, setMilestoneForm] = useState({ score: '', comments: '' });
  const [finalForm, setFinalForm] = useState({ components: {}, comment: '' });

  const [loading, setLoading] = useState({
    team: false,
    milestones: false,
    subject: false,
    detail: false,
    submitting: false
  });

  // --- Effects ---

  // 1. Fetch Team & Milestones
  useEffect(() => {
    if (!teamId) return;
    const loadContext = async () => {
      setLoading(prev => ({ ...prev, team: true, milestones: true }));
      try {
        const [team, mileList] = await Promise.all([
          getTeamDetail(teamId),
          getMilestonesByTeam(teamId)
        ]);
        setTeamInfo(team);
        
        let mList = [];
        if (Array.isArray(mileList?.teamMilestones)) mList = mileList.teamMilestones;
        else if (Array.isArray(mileList?.list)) mList = mileList.list;
        else if (Array.isArray(mileList?.data)) mList = mileList.data;
        else if (Array.isArray(mileList)) mList = mileList;
        setMilestones(mList);

      } catch (error) {
        console.error('Failed to load team context', error);
        toast.error('Failed to load team data');
      } finally {
        setLoading(prev => ({ ...prev, team: false, milestones: false }));
      }
    };
    loadContext();
  }, [teamId]);

  // 2. Fetch Subject (for Final Eval)
  useEffect(() => {
    const subjectId = teamInfo?.classInfo?.subjectId || teamInfo?.subjectInfo?.subjectId;
    if (!subjectId) return;

    const loadSubject = async () => {
      setLoading(prev => ({ ...prev, subject: true }));
      try {
        const data = await getSubjectById(Number(subjectId));
        setSubjectData(data);
      } catch (error) {
        console.error('Failed to load subject', error);
      } finally {
        setLoading(prev => ({ ...prev, subject: false }));
      }
    };
    loadSubject();
  }, [teamInfo]);

  // 3. Fetch Final Eval Summary (to pre-fill)
  useEffect(() => {
    if (!teamId) return;
    const loadFinalEval = async () => {
      try {
        const summary = await getTeamEvaluationSummary(teamId);
        setFinalEvaluationSummary(summary);
        if (summary) {
          const compMap = {};
          (summary.evaluateDetails || []).forEach(d => {
            compMap[d.subjectGradeComponentId] = {
              score: d.score,
              comment: d.comment || ''
            };
          });
          setFinalForm({
            components: compMap,
            comment: summary.comment || ''
          });
        }
      } catch (error) {
        console.error('Failed to load final evaluation', error);
      }
    };
    loadFinalEval();
  }, [teamId]);

  // 4. Fetch Milestone Detail when selected
  useEffect(() => {
    if (!selectedMilestoneId) {
      setMilestoneDetail(null);
      return;
    }

    const loadMilestone = async () => {
      setLoading(prev => ({ ...prev, detail: true }));
      try {
        const detail = await getMilestoneDetail(selectedMilestoneId);
        setMilestoneDetail(detail);
        
        // Pre-fill form
        const evalData = detail?.milestoneEvaluation;
        setMilestoneForm({
          score: evalData?.score ?? '',
          comments: evalData?.comment ?? evalData?.comments ?? ''
        });
      } catch (error) {
        console.error('Failed to load milestone detail', error);
        toast.error('Failed to load milestone detail');
      } finally {
        setLoading(prev => ({ ...prev, detail: false }));
      }
    };
    loadMilestone();
  }, [selectedMilestoneId]);

  // --- Handlers ---

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;

    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      await submitMilestoneEvaluation(selectedMilestoneId, {
        score: Number(milestoneForm.score),
        comments: milestoneForm.comments
      });
      toast.success('Milestone evaluation saved');
      
      // Refresh detail
      const detail = await getMilestoneDetail(selectedMilestoneId);
      setMilestoneDetail(detail);
      
      // Refresh list to update scores in sidebar
      const mileList = await getMilestonesByTeam(teamId);
      let mList = [];
      if (Array.isArray(mileList?.teamMilestones)) mList = mileList.teamMilestones;
      else if (Array.isArray(mileList?.list)) mList = mileList.list;
      else if (Array.isArray(mileList?.data)) mList = mileList.data;
      else if (Array.isArray(mileList)) mList = mileList;
      setMilestones(mList);

    } catch (error) {
      toast.error('Failed to save evaluation');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      const details = Object.entries(finalForm.components).map(([compId, val]) => ({
        subjectGradeComponentId: Number(compId),
        score: Number(val.score),
        comment: val.comment
      }));

      await submitTeamEvaluation(teamId, {
        evaluateDetails: details,
        comment: finalForm.comment
      });
      toast.success('Final evaluation saved');
      
      // Refresh summary
      const summary = await getTeamEvaluationSummary(teamId);
      setFinalEvaluationSummary(summary);

    } catch (error) {
      toast.error('Failed to save final evaluation');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleViewFile = (file) => {
    const url = buildDownloadUrl(file);
    if (url) window.open(url, '_blank');
    else toast.error('File URL not available');
  };

  // --- Derived Data ---

  const subjectComponents = useMemo(() => {
    return subjectData?.subjectSyllabus?.subjectGradeComponents || [];
  }, [subjectData]);

  const weightedTotal = useMemo(() => {
    if (!subjectComponents.length) return 0;
    let total = 0;
    let totalWeight = 0;
    
    subjectComponents.forEach(comp => {
      const weight = Number(comp.percentage || comp.weight || 0);
      const score = Number(finalForm.components[comp.subjectGradeComponentId]?.score || 0);
      if (!Number.isNaN(weight) && !Number.isNaN(score)) {
        total += score * (weight / 100);
        totalWeight += weight;
      }
    });
    
    return total.toFixed(2);
  }, [subjectComponents, finalForm.components]);

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: 'Grading', href: classId ? `/lecturer/grading/${classId}` : '/lecturer/grading' },
    { label: teamInfo?.teamName || 'Team Grading' }
  ], [classId, teamInfo]);

  // --- Render ---

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="mb-6">
          <LecturerBreadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
          
          {/* COLUMN 1: Team Context & History */}
          <div className={`col-span-3 flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-xl ${glassPanelClass}`}>
            {/* Team Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">{teamInfo?.teamName || 'Loading...'}</h2>
              <p className="text-sm text-slate-500 truncate">{teamInfo?.project?.topicName || 'No topic assigned'}</p>
            </div>

            {/* Members */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Members</h3>
              {(teamInfo?.memberInfo?.members || []).map(member => (
                <div key={member.studentId} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-white/80 transition">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {member.studentName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.studentName}</p>
                    <p className="text-xs text-slate-500 truncate group-hover:text-indigo-600 transition">
                      {member.studentCode || member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones Timeline */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Milestones</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {milestones.map(m => {
                  const isSelected = selectedMilestoneId === (m.teamMilestoneId || m.id);
                  const score = m.milestoneEvaluation?.score ?? m.score;
                  return (
                    <button
                      key={m.teamMilestoneId || m.id}
                      onClick={() => setSelectedMilestoneId(m.teamMilestoneId || m.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {m.title || m.name}
                        </span>
                        {score != null && (
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            {score}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Due: {formatDate(m.dueDate)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Final Eval Button */}
            <button
              onClick={() => setSelectedMilestoneId(null)}
              className={`mt-auto w-full p-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedMilestoneId === null
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
              }`}
            >
              <BeakerIcon className="h-5 w-5" />
              Final Evaluation
            </button>
          </div>

          {/* COLUMN 2: Grading Workspace */}
          <div className={`col-span-6 flex flex-col rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl ${glassPanelClass} overflow-y-auto`}>
            {selectedMilestoneId ? (
              // MODE A: Milestone Review
              <>
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Milestone Review</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">{milestoneDetail?.title || 'Loading...'}</h2>
                  <p className="text-slate-500 text-sm mt-1">{milestoneDetail?.description}</p>
                </div>

                {/* Submitted Files */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" /> Submitted Artifacts
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(milestoneDetail?.milestoneReturns || []).map((file, idx) => (
                      <div key={idx} 
                        onClick={() => handleViewFile(file)}
                        className="cursor-pointer group p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <DocumentTextIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700">
                              {file.fileName || file.originalFileName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {file.studentName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!milestoneDetail?.milestoneReturns?.length) && (
                      <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                        No files submitted for this milestone.
                      </div>
                    )}
                  </div>
                </div>

                {/* Grading Form */}
                <form onSubmit={handleMilestoneSubmit} className="mt-auto space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex gap-4">
                    <div className="w-32">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Score (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        value={milestoneForm.score}
                        onChange={e => setMilestoneForm({...milestoneForm, score: e.target.value})}
                        className="w-full rounded-xl border-slate-200 px-3 py-2 text-lg font-bold text-center focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Feedback</label>
                      <input
                        type="text"
                        value={milestoneForm.comments}
                        onChange={e => setMilestoneForm({...milestoneForm, comments: e.target.value})}
                        placeholder="Quick feedback..."
                        className="w-full rounded-xl border-slate-200 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading.submitting}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
                  >
                    {loading.submitting ? 'Saving...' : 'Save Milestone Grade'}
                  </button>
                </form>
              </>
            ) : (
              // MODE B: Final Evaluation
              <>
                <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Final Grading</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">Subject Evaluation</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase">Weighted Total</p>
                    <p className="text-3xl font-black text-indigo-600">{weightedTotal}</p>
                  </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {subjectComponents.map(comp => {
                      const compId = comp.subjectGradeComponentId;
                      const current = finalForm.components[compId] || { score: '', comment: '' };
                      
                      return (
                        <div key={compId} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold text-slate-700">{comp.name}</label>
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                              {comp.percentage || comp.weight}%
                            </span>
                          </div>
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="0-10"
                                value={current.score}
                                onChange={e => setFinalForm({
                                  ...finalForm,
                                  components: {
                                    ...finalForm.components,
                                    [compId]: { ...current, score: e.target.value }
                                  }
                                })}
                                className="w-full rounded-xl border-slate-200 text-center font-bold focus:ring-indigo-500"
                              />
                            </div>
                            <div className="col-span-9">
                              <input
                                type="text"
                                placeholder="Component feedback..."
                                value={current.comment}
                                onChange={e => setFinalForm({
                                  ...finalForm,
                                  components: {
                                    ...finalForm.components,
                                    [compId]: { ...current, comment: e.target.value }
                                  }
                                })}
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={loading.submitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-500 disabled:opacity-50 transition transform hover:-translate-y-0.5"
                  >
                    {loading.submitting ? 'Submitting Final Grades...' : 'Submit Final Evaluation'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* COLUMN 3: Feedback & Details */}
          <div className={`col-span-3 flex flex-col rounded-3xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-xl ${glassPanelClass}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              {selectedMilestoneId ? 'Evaluation History' : 'General Feedback'}
            </h3>

            {selectedMilestoneId ? (
              <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 overflow-y-auto">
                {milestoneDetail?.milestoneEvaluation ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <ClockIcon className="h-4 w-4" />
                      {formatDate(milestoneDetail.milestoneEvaluation.createdDate || milestoneDetail.milestoneEvaluation.updatedAt)}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {milestoneDetail.milestoneEvaluation.comment || milestoneDetail.milestoneEvaluation.comments || 'No comments provided.'}
                    </p>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400">Graded by</p>
                      <p className="text-sm font-medium text-slate-900">
                        {milestoneDetail.milestoneEvaluation.fullName || milestoneDetail.milestoneEvaluation.lecturerName || 'Lecturer'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                    <ChatBubbleLeftRightIcon className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No evaluation history yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <textarea
                  className="flex-1 w-full rounded-2xl border-slate-200 bg-white p-4 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Enter general comments for the team here..."
                  value={finalForm.comment}
                  onChange={e => setFinalForm({...finalForm, comment: e.target.value})}
                />
                <p className="text-xs text-slate-400 mt-2 text-center">
                  This comment will be visible to the team in their final report.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerGradingDashboard;
