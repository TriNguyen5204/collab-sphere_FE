import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  BeakerIcon, 
  ChatBubbleLeftRightIcon,
  CloudArrowDownIcon,
  CalculatorIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ListBulletIcon,
  ChevronDownIcon, // Added
  ChevronUpIcon    // Added
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from '../../../services/milestoneApi';
import { getSubjectById, getClassDetail } from '../../../services/userService';
import { getMilestoneQuestionsAnswersByQuestionId,
   patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId
 } from '../../../services/studentApi';
import { 
  getTeamEvaluationSummary, 
  submitTeamEvaluation 
} from '../../../services/evaluationApi';
import { useSecureFileHandler } from '../../../hooks/useSecureFileHandler';

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

const resolveReturnFileId = (file) => file?.mileReturnId ?? file?.mileReturnID ?? file?.id ?? null;

const extractUrlLike = (payload) => {
   if (!payload) return null;
   if (typeof payload === 'string') return payload;
   const target = (typeof payload === 'object' && payload !== null && 'data' in payload)
      ? payload.data
      : payload;
   if (typeof target === 'string') return target;
   if (target && typeof target === 'object') {
      return target.fileUrl || target.url || buildDownloadUrl(target) || null;
   }
   return null;
};

const TeamEvaluationPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();
   const { openSecureFile } = useSecureFileHandler();

  // --- State ---
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [subjectData, setSubjectData] = useState(null);
  
  // Selection
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [milestoneDetail, setMilestoneDetail] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({}); 

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

  // 2. Fetch Subject (Backup structure)
  useEffect(() => {
    if (!teamInfo) return;

    const loadSubject = async () => {
      setLoading(prev => ({ ...prev, subject: true }));
      try {
        let subjectId = teamInfo?.classInfo?.subjectId || teamInfo?.subjectInfo?.subjectId;
        if (!subjectId && teamInfo?.classInfo?.classId) {
          try {
            const classData = await getClassDetail(teamInfo.classInfo.classId);
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

  // 3. Fetch Final Eval Summary (PRIMARY DATA SOURCE)
  useEffect(() => {
    if (!teamId) return;
    const loadFinalEval = async () => {
      try {
        const summary = await getTeamEvaluationSummary(teamId);
        setFinalEvaluationSummary(summary);
        
        // Pre-fill form state from the summary
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
        console.log('Fetched milestone detail:', detail);
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

  // 5. Fetch Answers
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

  // --- Derived Data ---

  const gradingList = useMemo(() => {
    if (finalEvaluationSummary?.evaluateDetails?.length > 0) {
      return finalEvaluationSummary.evaluateDetails;
    }
    return subjectData?.subjectSyllabus?.subjectGradeComponents || [];
  }, [finalEvaluationSummary, subjectData]);

  // UPDATED: Strictly use finalGrade from summary
  const displayTotal = useMemo(() => {
    if (finalEvaluationSummary?.finalGrade !== undefined && finalEvaluationSummary?.finalGrade !== null) {
        return finalEvaluationSummary.finalGrade;
    }
    return 0;
  }, [finalEvaluationSummary]);

  // --- Handlers ---

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      const details = gradingList.map(comp => {
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
      
      const summary = await getTeamEvaluationSummary(teamId);
      setFinalEvaluationSummary(summary);

    } catch (error) {
      console.error('Submit error', error);
      toast.error('Failed to save final evaluation');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

   const handleViewFile = useCallback(async (file) => {
      if (!file) return;
      const fallbackUrl = buildDownloadUrl(file);
      const resolvedMilestoneId = milestoneDetail?.teamMilestoneId || milestoneDetail?.milestoneId || selectedMilestoneId;
      const resolvedReturnId = resolveReturnFileId(file);
      const shouldRefresh = Boolean(resolvedMilestoneId && resolvedReturnId);

      const secureFetcher = async () => {
         if (!shouldRefresh) return fallbackUrl;
         const refreshed = await patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId(
            resolvedMilestoneId,
            resolvedReturnId
         );
         return extractUrlLike(refreshed) || fallbackUrl;
      };

      try {
         await openSecureFile(
            fallbackUrl,
            secureFetcher,
            shouldRefresh || !fallbackUrl
         );
      } catch (error) {
         console.error('Failed to open secure file from evaluation page', error);
         toast.error('Unable to open document link.');
      }
   }, [milestoneDetail, openSecureFile, selectedMilestoneId]);

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: 'Grading', href: classId ? `/lecturer/grading/${classId}` : '/lecturer/grading' },
    { label: teamInfo?.teamName || 'Team Grading' }
  ], [classId, teamInfo]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
        
        {/* --- HERO HEADER --- */}
        <div className="mx-auto max-w-[1600px]">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                      Final Evaluation
                   </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{teamInfo?.teamName || 'Loading Team...'}</h1>
                <p className="text-slate-600 text-base">
                  Review milestone submissions and input final grades for the team.
                </p>
              </div>

              <div className="flex items-center gap-3">
                 <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-orangeFpt-600 transition-all shadow-sm active:scale-95"
                 >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                 </button>
                 <Link 
                    to={`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-all shadow-sm"
                 >
                    <BeakerIcon className="w-4 h-4" />
                    Grade Milestones
                 </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-6 mt-8 min-h-[600px]">
          
          {/* COLUMN 1: Team & Milestones (Left) */}
          <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
             <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                   <div className="p-2 rounded-lg bg-orangeFpt-100 text-orangeFpt-600">
                      <UserGroupIcon className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-slate-800">Team Roster</h3>
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {(teamInfo?.memberInfo?.members || []).map(member => (
                    <div key={member.studentId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs ring-2 ring-white shadow-sm">
                        {member.studentName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.studentName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{member.studentCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col max-h-[500px]">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                   <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                      <ClockIcon className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-slate-800">Milestones</h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar max-h-[500px]">
                   {milestones.map(m => {
                      const isSelected = selectedMilestoneId === (m.teamMilestoneId || m.id);
                      const score = m.milestoneEvaluation?.score ?? m.score;
                      return (
                         <button
                            key={m.teamMilestoneId || m.id}
                            onClick={() => setSelectedMilestoneId(m.teamMilestoneId || m.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all group ${
                               isSelected 
                                  ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                                  : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                            }`}
                         >
                            <div className="flex justify-between items-start mb-1">
                               <span className={`text-sm font-semibold line-clamp-1 ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                  {m.title || m.name}
                               </span>
                               {score != null && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                     {score}
                                  </span>
                               )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                               <ClockIcon className="h-3 w-3" />
                               <span>{formatDate(m.endDate || m.dueDate)}</span>
                            </div>
                         </button>
                      );
                   })}
                </div>
                <button
                   onClick={() => setSelectedMilestoneId(null)}
                   className={`mt-4 w-full p-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      selectedMilestoneId === null
                         ? 'border-orangeFpt-500 bg-orangeFpt-500 text-white shadow-md shadow-orangeFpt-200'
                         : 'border-slate-200 bg-white text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600'
                   }`}
                >
                   <CalculatorIcon className="h-5 w-5" />
                   Final Evaluation
                </button>
             </div>
          </div>

          {/* COLUMN 2: Grading Workspace (Middle) */}
          <div className="col-span-12 xl:col-span-5 flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full overflow-hidden">
             {selectedMilestoneId ? (
                // MODE A: Milestone Details
                <div className="h-full flex flex-col">
                   <div className="mb-6 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-indigo-600 mb-2">
                         <DocumentTextIcon className="h-4 w-4" />
                         <span className="text-xs font-bold uppercase tracking-wider">Milestone Review</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{milestoneDetail?.title || 'Loading...'}</h2>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                      {/* Description */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h4>
                         <p className="text-sm text-slate-700 leading-relaxed">{milestoneDetail?.description || 'No description.'}</p>
                      </div>

                      {/* Files */}
                      <div>
                         <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CloudArrowDownIcon className="h-4 w-4 text-slate-400" /> Artifacts
                         </h4>
                         <div className="space-y-2">
                            {(milestoneDetail?.milestoneReturns || []).map((file, idx) => (
                               <div key={idx} onClick={() => handleViewFile(file)} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all group">
                                  <div className="flex items-center gap-3 min-w-0">
                                     <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <DocumentTextIcon className="h-5 w-5" />
                                     </div>
                                     <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700">{file.fileName || 'File'}</p>
                                        <p className="text-[10px] text-slate-400">{file.studentName}</p>
                                     </div>
                                  </div>
                               </div>
                            ))}
                            {(!milestoneDetail?.milestoneReturns?.length) && (
                               <p className="text-sm text-slate-400 italic">No files submitted.</p>
                            )}
                         </div>
                      </div>


                      {/* CHECKPOINTS SECTION (COLLAPSIBLE) */}
                      {(milestoneDetail?.checkpoints || []).length > 0 && (
                        <div>
                           <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <ListBulletIcon className="h-4 w-4 text-slate-400" /> Checkpoints
                           </h4>
                           <div className="grid grid-cols-1 gap-3">
                              {milestoneDetail.checkpoints.map((cp) => (
                                 <CheckpointItem key={cp.checkpointId} cp={cp} />
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Q&A SECTION (COLLAPSIBLE) */}
                      {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions || []).length > 0 && (
                         <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                               <QuestionMarkCircleIcon className="h-4 w-4 text-slate-400" /> Questions & Answers
                            </h4>
                            <div className="space-y-3">
                               {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions).map((q, idx) => {
                                  const qId = q.id || q.milestoneQuestionId;
                                  const answers = questionAnswers[qId] || [];
                                  return <QuestionItem key={idx} q={q} answers={answers} />;
                               })}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             ) : (
                // MODE B: Final Grading Form
                <div className="h-full flex flex-col">
                   <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-end">
                      <div>
                         <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">Final Grading</span>
                         <h2 className="text-2xl font-bold text-slate-900 mt-2">Subject Evaluation</h2>
                      </div>
                      <div className="text-right bg-slate-50 p-2 px-3 rounded-xl border border-slate-100">
                         <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</p>
                         <div className="flex items-baseline justify-end gap-1">
                            <p className="text-2xl font-black text-orangeFpt-600">{displayTotal}</p>
                            <span className="text-lg text-slate-400 font-bold">/10</span>
                         </div>
                      </div>
                   </div>

                   <form onSubmit={handleFinalSubmit} className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                         {gradingList.map(comp => {
                            const compId = comp.subjectGradeComponentId;
                            const current = finalForm.components[compId] || { score: '', detailComment: '' };
                            
                            const name = comp.subjectGradeComponentName || comp.componentName || comp.name;

                            return (
                               <div key={compId} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-orangeFpt-200">
                                  <div className="flex justify-between items-center mb-3">
                                     <label className="font-bold text-slate-700 text-sm">{name}</label>
                                  </div>
                                  <div className="grid grid-cols-12 gap-3">
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
                                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center text-lg font-bold text-slate-900 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all"
                                           />
                                        </div>
                                     </div>
                                     <div className="col-span-9">
                                        <input
                                           type="text"
                                           placeholder="Feedback..."
                                           value={current.detailComment}
                                           onChange={e => setFinalForm({
                                              ...finalForm,
                                              components: { 
                                                  ...finalForm.components, 
                                                  [compId]: { ...current, detailComment: e.target.value } 
                                              }
                                           })}
                                           className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all"
                                        />
                                     </div>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-slate-100">
                         <button
                            type="submit"
                            disabled={loading.submitting}
                            className="w-full py-3 rounded-xl bg-orangeFpt-500 text-white font-bold shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                         >
                            {loading.submitting ? (
                               <>Saving...</>
                            ) : (
                               <><CheckCircleIcon className="w-5 h-5" /> Submit Final Grades</>
                            )}
                         </button>
                      </div>
                   </form>
                </div>
             )}
          </div>

          {/* COLUMN 3: Feedback (Right) */}
          <div className="col-span-12 xl:col-span-4 flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
               <ChatBubbleLeftRightIcon className="h-4 w-4" />
               {selectedMilestoneId ? 'Feedback History' : 'General Comments'}
            </h3>

            {selectedMilestoneId ? (
               <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-y-auto custom-scrollbar">
                  {milestoneDetail?.milestoneEvaluation ? (
                     <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                           <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                              <StarIcon className="h-4 w-4 text-orangeFpt-500" />
                              <span className="text-sm font-bold text-slate-800">
                                 Score: {milestoneDetail.milestoneEvaluation.score}
                              </span>
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed italic">
                              "{milestoneDetail.milestoneEvaluation.comment || 'No comment'}"
                           </p>
                        </div>
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                        <p className="text-sm font-medium">Not yet graded.</p>
                        <Link 
                           to={`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`}
                           className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                        >
                           Go to Evaluation Page
                        </Link>
                     </div>
                  )}
               </div>
            ) : (
               <div className="flex-1 flex flex-col">
                  <textarea
                     className="flex-1 w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm focus:ring-orangeFpt-500 focus:border-orangeFpt-500 resize-none focus:bg-white transition-colors"
                     placeholder="Enter general feedback for the team here..."
                     value={finalForm.teamComment}
                     onChange={e => setFinalForm({...finalForm, teamComment: e.target.value})}
                  />
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 flex gap-2">
                     <div className="shrink-0 pt-0.5"><ExclamationCircleIcon className="h-4 w-4" /></div>
                     <p>This comment will be visible to students in their final report.</p>
                  </div>
               </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

// --- Helper Components for Collapsible Items ---

const CheckpointItem = ({ cp }) => {
   const [isOpen, setIsOpen] = useState(false); // Default minimized

   return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-indigo-200">
         {/* HEADER - Always Visible */}
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-colors"
         >
            <div className="flex items-center gap-3">
               <h5 className="text-sm font-bold text-slate-900">{cp.title}</h5>
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  cp.statusString === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  cp.statusString === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-slate-50 text-slate-600 border-slate-100'
               }`}>
                  {cp.statusString}
               </span>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due</p>
                  <p className="text-xs font-semibold text-slate-700">{formatDate(cp.dueDate)}</p>
               </div>
               <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
         </button>

         {/* BODY - Collapsible */}
         {isOpen && (
            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30">
               {cp.complexity && (
                  <div className="mt-3 mb-2">
                     <span className="inline-block text-[10px] font-semibold text-slate-400 border border-slate-100 bg-white px-1.5 py-0.5 rounded">
                        Complexity: {cp.complexity}
                     </span>
                  </div>
               )}
               {cp.description && (
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                     {cp.description}
                  </p>
               )}
               <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-slate-400 font-bold uppercase">Assignees:</span>
                     <div className="flex -space-x-2">
                        {(cp.checkpointAssignments || []).map((assignee) => (
                           <div 
                              key={assignee.checkpointAssignmentId} 
                              className="relative group"
                              title={`${assignee.fullname} (${assignee.teamRoleString})`}
                           >
                              {assignee.avatarImg ? (
                                 <img 
                                    src={assignee.avatarImg} 
                                    alt={assignee.fullname}
                                    className="h-6 w-6 rounded-full ring-2 ring-white object-cover" 
                                 />
                              ) : (
                                 <div className="h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                                    {assignee.fullname?.charAt(0)}
                                 </div>
                              )}
                           </div>
                        ))}
                        {(cp.checkpointAssignments || []).length === 0 && (
                           <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

const QuestionItem = ({ q, answers }) => {
   const [isOpen, setIsOpen] = useState(false); // Default minimized

   return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden">
         {/* HEADER */}
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-100 transition-colors"
         >
            <p className="text-sm font-semibold text-slate-900 pr-4">{q.question}</p>
            <div className="flex items-center gap-3 shrink-0">
               <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {answers.length} Ans
               </span>
               <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
         </button>

         {/* BODY */}
         {isOpen && (
            <div className="p-4 pt-0 border-t border-slate-100">
               <div className="space-y-3 pl-3 border-l-2 border-indigo-100 mt-3">
                  {answers.length > 0 ? answers.map((ans, aIdx) => (
                     <div key={aIdx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                           <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                              {ans.studentName?.charAt(0)}
                           </div>
                           <span className="text-xs font-bold text-slate-700">{ans.studentName}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{ans.answer}</p>
                     </div>
                  )) : (
                     <p className="text-xs text-slate-400 italic">No answers yet.</p>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export default TeamEvaluationPage;