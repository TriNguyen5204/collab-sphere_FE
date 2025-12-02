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
  CloudArrowDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/layout/DashboardLayout';
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
    
    subjectComponents.forEach(comp => {
      const weight = Number(comp.percentage || comp.weight || 0);
      const score = Number(finalForm.components[comp.subjectGradeComponentId]?.score || 0);
      if (!Number.isNaN(weight) && !Number.isNaN(score)) {
        total += score * (weight / 100);
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
      <div className="min-h-screen space-y-8 bg-slate-50/50 p-6 lg:p-8">
        
        {/* --- HERO HEADER --- */}
        <div className="mx-auto max-w-7xl">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                      Team Evaluation
                   </span>
                </div>
                <div>
                   <h1 className="text-3xl font-bold text-slate-900">{teamInfo?.teamName || 'Loading Team...'}</h1>
                   <p className="mt-2 text-lg text-slate-600">
                      {teamInfo?.project?.topicName || 'Evaluate project deliverables and assign final grades.'}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orangeFpt-600 transition-all shadow-sm active:scale-95"
                 >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
          
          {/* COLUMN 1: Team Context & History */}
          <div className="col-span-3 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
            {/* Team Header */}
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Team Roster</h2>
            </div>

            {/* Members */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
              {(teamInfo?.memberInfo?.members || []).map(member => (
                <div key={member.studentId} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-orangeFpt-100 flex items-center justify-center text-orangeFpt-600 font-bold text-xs">
                    {member.studentName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.studentName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {member.studentCode || member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones Timeline */}
            <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Milestones</h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {milestones.map(m => {
                  const isSelected = selectedMilestoneId === (m.teamMilestoneId || m.id);
                  const score = m.milestoneEvaluation?.score ?? m.score;
                  return (
                    <button
                      key={m.teamMilestoneId || m.id}
                      onClick={() => setSelectedMilestoneId(m.teamMilestoneId || m.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-orangeFpt-50 border-orangeFpt-200 shadow-sm ring-1 ring-orangeFpt-200' 
                          : 'bg-white border-slate-100 hover:border-orangeFpt-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-orangeFpt-900' : 'text-slate-700'}`}>
                          {m.title || m.name}
                        </span>
                        {score != null && (
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            {score}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                         <ClockIcon className="h-3 w-3" /> {formatDate(m.dueDate)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Final Eval Button */}
            <button
              onClick={() => setSelectedMilestoneId(null)}
              className={`mt-auto w-full p-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedMilestoneId === null
                  ? 'border-orangeFpt-500 bg-orangeFpt-500 text-white shadow-md shadow-orangeFpt-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600'
              }`}
            >
              <BeakerIcon className="h-5 w-5" />
              Final Evaluation
            </button>
          </div>

          {/* COLUMN 2: Grading Workspace */}
          <div className="col-span-6 flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            {selectedMilestoneId ? (
              // MODE A: Milestone Review
              <div className="flex flex-col h-full">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-orangeFpt-600 mb-1">
                     <CheckCircleIcon className="h-4 w-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Milestone Grading</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{milestoneDetail?.title || 'Loading...'}</h2>
                  <p className="text-slate-500 text-sm mt-2">{milestoneDetail?.description}</p>
                </div>

                {/* Submitted Files */}
                <div className="mb-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-slate-400" /> Artifacts
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {(milestoneDetail?.milestoneReturns || []).map((file, idx) => (
                      <div key={idx} 
                        onClick={() => handleViewFile(file)}
                        className="cursor-pointer group p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-orangeFpt-200 hover:shadow-md transition-all flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-orangeFpt-500 group-hover:scale-110 transition-transform">
                          <DocumentTextIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-orangeFpt-700">
                            {file.fileName || file.originalFileName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                             <UserCircleIcon className="h-3 w-3" /> {file.studentName}
                             <span>•</span>
                             <span>{formatDate(file.submittedAt)}</span>
                          </div>
                        </div>
                        <CloudArrowDownIcon className="h-5 w-5 text-slate-300 group-hover:text-orangeFpt-500" />
                      </div>
                    ))}
                    {(!milestoneDetail?.milestoneReturns?.length) && (
                      <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm bg-slate-50/50">
                        No artifacts submitted for this milestone.
                      </div>
                    )}
                  </div>
                </div>

                {/* Grading Form */}
                <form onSubmit={handleMilestoneSubmit} className="mt-auto space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex gap-4">
                    <div className="w-32">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Score (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        value={milestoneForm.score}
                        onChange={e => setMilestoneForm({...milestoneForm, score: e.target.value})}
                        className="w-full rounded-xl border-slate-200 px-3 py-2.5 text-xl font-bold text-center text-slate-800 focus:ring-orangeFpt-500 focus:border-orangeFpt-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Quick Feedback</label>
                      <input
                        type="text"
                        value={milestoneForm.comments}
                        onChange={e => setMilestoneForm({...milestoneForm, comments: e.target.value})}
                        placeholder="Great work on..."
                        className="w-full rounded-xl border-slate-200 px-4 py-2.5 text-sm focus:ring-orangeFpt-500 focus:border-orangeFpt-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading.submitting}
                    className="w-full py-3 rounded-xl bg-orangeFpt-500 text-white font-bold shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {loading.submitting ? 'Saving...' : 'Save Grade'}
                  </button>
                </form>
              </div>
            ) : (
              // MODE B: Final Evaluation
              <div className="flex flex-col h-full">
                <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">Final Grading</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-2">Subject Evaluation</h2>
                  </div>
                  <div className="text-right bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Weighted Total</p>
                    <p className="text-3xl font-black text-orangeFpt-600">{weightedTotal}</p>
                  </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    {subjectComponents.map(comp => {
                      const compId = comp.subjectGradeComponentId;
                      const current = finalForm.components[compId] || { score: '', comment: '' };
                      
                      return (
                        <div key={compId} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-orangeFpt-200 transition-colors">
                          <div className="flex justify-between items-center mb-3">
                            <label className="font-bold text-slate-700 text-sm">{comp.name}</label>
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                              Weight: {comp.percentage || comp.weight}%
                            </span>
                          </div>
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="Score"
                                value={current.score}
                                onChange={e => setFinalForm({
                                  ...finalForm,
                                  components: {
                                    ...finalForm.components,
                                    [compId]: { ...current, score: e.target.value }
                                  }
                                })}
                                className="w-full rounded-xl border-slate-200 px-2 py-2.5 text-center font-bold text-slate-800 focus:ring-orangeFpt-500 focus:border-orangeFpt-500 bg-slate-50 focus:bg-white transition-colors"
                              />
                            </div>
                            <div className="col-span-9">
                              <input
                                type="text"
                                placeholder="Specific feedback for this component..."
                                value={current.comment}
                                onChange={e => setFinalForm({
                                  ...finalForm,
                                  components: {
                                    ...finalForm.components,
                                    [compId]: { ...current, comment: e.target.value }
                                  }
                                })}
                                className="w-full rounded-xl border-slate-200 px-4 py-2.5 text-sm focus:ring-orangeFpt-500 focus:border-orangeFpt-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 mt-auto sticky bottom-0 bg-white pb-2">
                     <button
                        type="submit"
                        disabled={loading.submitting}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 disabled:opacity-50 transition-all active:scale-[0.98]"
                     >
                        {loading.submitting ? 'Submitting...' : 'Finalize Grades'}
                     </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* COLUMN 3: Feedback & Details */}
          <div className="col-span-3 flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              {selectedMilestoneId ? 'History & Feedback' : 'General Comments'}
            </h3>

            {selectedMilestoneId ? (
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-y-auto custom-scrollbar">
                {milestoneDetail?.milestoneEvaluation ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {formatDate(milestoneDetail.milestoneEvaluation.createdDate || milestoneDetail.milestoneEvaluation.updatedAt)}
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                          <StarIcon className="h-4 w-4 text-orangeFpt-500" />
                          <span className="text-sm font-bold text-slate-800">
                             Score: {milestoneDetail.milestoneEvaluation.score}
                          </span>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed">
                         "{milestoneDetail.milestoneEvaluation.comment || milestoneDetail.milestoneEvaluation.comments || 'No text feedback.'}"
                       </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-400">Graded by</p>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">L</div>
                         <p className="text-sm font-medium text-slate-900">
                           {milestoneDetail.milestoneEvaluation.fullName || milestoneDetail.milestoneEvaluation.lecturerName || 'Lecturer'}
                         </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                       <ChatBubbleLeftRightIcon className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No evaluation history yet.</p>
                    <p className="text-xs mt-1">Grade this milestone to see history.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <textarea
                  className="flex-1 w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm focus:ring-orangeFpt-500 focus:border-orangeFpt-500 resize-none focus:bg-white transition-colors"
                  placeholder="Enter general comments visible to the entire team..."
                  value={finalForm.comment}
                  onChange={e => setFinalForm({...finalForm, comment: e.target.value})}
                />
                <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 flex gap-2">
                   <div className="shrink-0 pt-0.5"><CheckCircleIcon className="h-4 w-4" /></div>
                   <p>This comment will be included in the final report sent to students.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerGradingDashboard;
