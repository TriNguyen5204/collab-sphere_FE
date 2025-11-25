import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  UserCircleIcon, 
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowDownIcon,
  CalculatorIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from '../../../services/milestoneApi';
import { getSubjectById, getClassDetail } from '../../../services/userService';
import { getMilestoneQuestionsAnswersByQuestionId } from '../../../services/studentApi';
import { 
  getTeamEvaluationSummary, 
  submitTeamEvaluation 
} from '../../../services/evaluationApi';

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

const TeamEvaluationPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [subjectData, setSubjectData] = useState(null);
  
  // Selection
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [milestoneDetail, setMilestoneDetail] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({}); // { questionId: [answers] }

  // Final Grading Form
  const [finalForm, setFinalForm] = useState({ components: {}, teamComment: '' });
  const [finalEvaluationSummary, setFinalEvaluationSummary] = useState(null);

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
    if (!teamInfo) return;

    const loadSubject = async () => {
      setLoading(prev => ({ ...prev, subject: true }));
      try {
        let subjectId = teamInfo?.classInfo?.subjectId || teamInfo?.subjectInfo?.subjectId;

        // If subjectId is missing, try to fetch it from Class Detail
        if (!subjectId && teamInfo?.classInfo?.classId) {
          try {
            const classData = await getClassDetail(teamInfo.classInfo.classId);
            // Check where subjectId is located in classData
            subjectId = classData?.subjectId || classData?.class?.subjectId; 
          } catch (err) {
            console.error('Failed to fetch class detail for subjectId', err);
          }
        }

        if (subjectId) {
          const data = await getSubjectById(Number(subjectId));
          setSubjectData(data);
        }
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
              detailComment: d.detailComment || d.comment || ''
            };
          });
          setFinalForm({
            components: compMap,
            teamComment: summary.teamComment || summary.comment || ''
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
      } catch (error) {
        console.error('Failed to load milestone detail', error);
        toast.error('Failed to load milestone detail');
      } finally {
        setLoading(prev => ({ ...prev, detail: false }));
      }
    };
    loadMilestone();
  }, [selectedMilestoneId]);

  // 5. Fetch Answers for Questions
  useEffect(() => {
    const questions = milestoneDetail?.questions || milestoneDetail?.milestoneQuestions || [];
    if (!questions.length) {
      setQuestionAnswers({});
      return;
    }

    const fetchAnswers = async () => {
      const answersMap = {};
      await Promise.all(questions.map(async (q) => {
        try {
          const qId = q.id || q.milestoneQuestionId;
          if (qId) {
            const res = await getMilestoneQuestionsAnswersByQuestionId(qId);
            console.log(res)
            answersMap[qId] = Array.isArray(res?.answersList) ? res.answersList : [];
          }
        } catch (err) {
          console.error('Failed to fetch answers for question', q);
        }
      }));
      setQuestionAnswers(answersMap);
    };
    fetchAnswers();
  }, [milestoneDetail]);

  // --- Handlers ---

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      const details = subjectComponents.map(comp => {
        const compId = comp.subjectGradeComponentId;
        const val = finalForm.components[compId] || {};
        return {
          subjectGradeComponentId: Number(compId),
          score: val.score !== undefined && val.score !== '' ? Number(val.score) : 0,
          detailComment: val.detailComment || ''
        };
      });

      const payload = {
        teamComment: finalForm.teamComment || '',
        evaluateDetails: details
      };

      await submitTeamEvaluation(teamId, payload);
      toast.success('Final evaluation saved');
      
      // Refresh summary
      const summary = await getTeamEvaluationSummary(teamId);
      setFinalEvaluationSummary(summary);

    } catch (error) {
      console.error('Submit error', error);
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
      const weight = Number(comp.referencePercentage || comp.percentage || comp.weight || 0);
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
        <div className="mb-6 flex justify-between items-center">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          <Link 
            to={`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors text-sm font-medium shadow-sm"
          >
            <CalculatorIcon className="w-4 h-4" />
            Evaluate Milestones
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
          
          {/* COLUMN 1: Context (Left) */}
          <div className={`col-span-3 flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-xl ${glassPanelClass}`}>
            {/* Team Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">{teamInfo?.teamName || 'Loading...'}</h2>
              <p className="text-sm text-slate-500 truncate">{teamInfo?.projectInfo?.projectName || 'No topic assigned'}</p>
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
                      {member.studentCode || member.email || (member.teamRole === 1 ? 'Leader' : 'Member')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones List */}
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
                      <p className="text-xs text-slate-400 mt-1">Due: {formatDate(m.endDate || m.dueDate)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Final Grading Calculator (Middle) */}
          <div className={`col-span-5 flex flex-col rounded-3xl ${glassPanelClass} p-6 overflow-y-auto`}>
            {/* Header Section */}
            <div className="mb-8 flex items-end justify-between border-b border-indigo-50 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Final Grading</span>
                  {finalEvaluationSummary && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wide border border-amber-200">
                      Edit Mode
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Subject Evaluation</h2>
                <p className="mt-1 text-sm text-slate-500">Input scores for each component below.</p>
              </div>
              
              {/* Weighted Total Card */}
              <div className={`rounded-2xl p-4 ${glassPanelClass} bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Weighted Total</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-indigo-600 tracking-tight">{weightedTotal}</span>
                  <span className="text-sm font-medium text-slate-400">/ 10</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="space-y-4">
                {subjectComponents.map(comp => {
                  const compId = comp.subjectGradeComponentId;
                  const current = finalForm.components[compId] || { score: '', detailComment: '' };
                  
                  return (
                    <div key={compId} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/20 p-5 transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <CalculatorIcon className="h-4 w-4" />
                          </div>
                          <label className="font-semibold text-slate-700">{comp.componentName || comp.name}</label>
                        </div>
                        <span className="rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-bold text-indigo-600">
                          {comp.referencePercentage || comp.percentage || comp.weight}% Weight
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="0.0"
                              value={current.score}
                              onChange={e => setFinalForm({
                                ...finalForm,
                                components: {
                                  ...finalForm.components,
                                  [compId]: { ...current, score: e.target.value }
                                }
                              })}
                              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-center text-lg font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">pts</span>
                          </div>
                        </div>
                        <div className="col-span-9">
                          <input
                            type="text"
                            placeholder="Add specific feedback for this component..."
                            value={current.detailComment}
                            onChange={e => setFinalForm({
                              ...finalForm,
                              components: {
                                ...finalForm.components,
                                [compId]: { ...current, detailComment: e.target.value }
                              }
                            })}
                            className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white/50 p-6">
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  General Team Feedback
                </label>
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Write an overall assessment of the team's performance..."
                  value={finalForm.teamComment}
                  onChange={e => setFinalForm({ ...finalForm, teamComment: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading.submitting}
                className="group relative w-full overflow-hidden rounded-2xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 transition-all duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                
                <div className="relative flex items-center justify-center gap-2 py-4 text-white backdrop-blur-[2px]">
                  {loading.submitting ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="font-bold">Submitting...</span>
                    </>
                  ) : (
                    <span className="font-bold tracking-wide">
                      {finalEvaluationSummary ? 'Update Final Grade' : 'Finalize Grade'}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
              </button>
            </form>
          </div>

          {/* COLUMN 3: Submission Viewer (Right) */}
          <div className={`col-span-4 flex flex-col rounded-3xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-xl ${glassPanelClass}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Milestone Details
            </h3>

            {selectedMilestoneId ? (
              <div className="flex-1 flex flex-col">
                {/* Header & Status */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 leading-tight">{milestoneDetail?.title || 'Loading...'}</h4>
                    <div className="flex flex-col items-end gap-1">
                      {milestoneDetail?.statusString && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          milestoneDetail.statusString === 'DONE' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {milestoneDetail.statusString.replace('_', ' ')}
                        </span>
                      )}
                      {milestoneDetail?.milestoneEvaluation?.score != null && (
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                          Score: {milestoneDetail.milestoneEvaluation.score}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span>{formatDate(milestoneDetail?.startDate)}</span>
                    <span>→</span>
                    <span>{formatDate(milestoneDetail?.endDate)}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    {milestoneDetail?.description || 'No description provided.'}
                  </p>

                  {/* Evaluation Comment */}
                  {milestoneDetail?.milestoneEvaluation?.comment && (
                    <div className="mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                      <span className="font-bold block mb-1 text-indigo-700">Lecturer Comment:</span>
                      {milestoneDetail.milestoneEvaluation.comment}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-center">
                      <div className="text-lg font-bold text-indigo-600">{milestoneDetail?.progress || 0}%</div>
                      <div className="text-[10px] text-indigo-400 uppercase font-bold">Progress</div>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 text-center">
                      <div className="text-lg font-bold text-purple-600">{milestoneDetail?.checkpointCount || 0}</div>
                      <div className="text-[10px] text-purple-400 uppercase font-bold">Checkpoints</div>
                    </div>
                    <div className="p-2 rounded-lg bg-pink-50 border border-pink-100 text-center">
                      <div className="text-lg font-bold text-pink-600">{milestoneDetail?.milestoneQuestionCount || 0}</div>
                      <div className="text-[10px] text-pink-400 uppercase font-bold">Questions</div>
                    </div>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Submissions</h5>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
                  {(milestoneDetail?.milestoneReturns || []).map((file, idx) => (
                    <div key={idx} 
                      onClick={() => handleViewFile(file)}
                      className="cursor-pointer group p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <DocumentTextIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate group-hover:text-indigo-700">
                            {file.fileName || file.originalFileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {file.studentName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!milestoneDetail?.milestoneReturns?.length) && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      No files submitted.
                    </div>
                  )}
                </div>

                {/* Questions Section */}
                {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions || []).length > 0 && (
                  <div className="mt-6 flex-1 flex flex-col min-h-0">
                    <h5 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                      <QuestionMarkCircleIcon className="h-4 w-4" />
                      Questions & Answers
                    </h5>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions).map((q, idx) => {
                        const qId = q.id || q.milestoneQuestionId;
                        const answers = questionAnswers[qId] || [];
                        
                        return (
                          <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-800 mb-3">{q.question}</p>
                            
                            <div className="space-y-3 pl-3 border-l-2 border-indigo-100">
                              {answers.length > 0 ? (
                                answers.map((ans, aIdx) => (
                                  <div key={aIdx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    {/* Student Info Header */}
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                                      {ans.studentAvatar ? (
                                        <img src={ans.studentAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                                      ) : (
                                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                          {ans.studentName?.charAt(0)}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold text-slate-900 truncate">{ans.studentName}</span>
                                          <span className="text-[10px] text-slate-400">{formatDate(ans.createTime)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500">{ans.studentCode}</p>
                                      </div>
                                    </div>

                                    {/* Answer Content */}
                                    <p className="text-xs text-slate-700 whitespace-pre-wrap mb-3 leading-relaxed">
                                      {ans.answer}
                                    </p>

                                    {/* Answer Evaluations */}
                                    {ans.answerEvaluations && ans.answerEvaluations.length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {ans.answerEvaluations.map((evalItem, eIdx) => (
                                          <div key={eIdx} className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-1">
                                              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                                {evalItem.evaluatorName?.charAt(0)}
                                              </div>
                                              <div className="flex-1 flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-emerald-800">{evalItem.evaluatorName}</span>
                                                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 rounded">
                                                  {evalItem.score}/10
                                                </span>
                                              </div>
                                            </div>
                                            <p className="text-[10px] text-emerald-700 pl-7 italic">
                                              "{evalItem.comment}"
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic">No answers yet.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <CloudArrowDownIcon className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">No Milestone Selected</p>
                <p className="text-xs mt-1">Click a milestone on the left to view details.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamEvaluationPage;
