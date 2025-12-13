import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  BeakerIcon, 
  ChatBubbleBottomCenterTextIcon, 
  StarIcon,
  ExclamationCircleIcon,
  CloudArrowDownIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from '../../../services/milestoneApi';
import { getMilestoneEvaluationsByTeam, submitMilestoneEvaluation } from '../../../services/evaluationApi';
import { getMilestoneQuestionsAnswersByQuestionId, patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId } from '../../../services/studentApi';
import { useSecureFileHandler } from '../../../hooks/useSecureFileHandler';
import { useAvatar } from '../../../hooks/useAvatar';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// --- File Helper Functions ---
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

const MilestoneEvaluationPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();
  const { openSecureFile } = useSecureFileHandler();
  
  // State
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  
  // Detailed Data State
  const [milestoneDetail, setMilestoneDetail] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({});
  
  const [loading, setLoading] = useState({ team: false, milestones: false, submit: false, detail: false });
  const [formState, setFormState] = useState({ score: '', comment: '' });

  // --- Effects ---

  useEffect(() => {
    if (!teamId) return;
    let ignore = false;

    const fetchTeam = async () => {
      setLoading((prev) => ({ ...prev, team: true }));
      try {
        const detail = await getTeamDetail(teamId);
        if (!ignore) setTeamInfo(detail);
      } catch (error) {
        toast.error('Unable to load team detail.');
      } finally {
        if (!ignore) setLoading((prev) => ({ ...prev, team: false }));
      }
    };

    fetchTeam();
    return () => { ignore = true; };
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

      const filteredMilestones = normalizedMilestones;

      setMilestones(filteredMilestones); 
      setEvaluations(Array.isArray(evaluationList) ? evaluationList : []);

      if (!selectedMilestoneId && filteredMilestones.length > 0) {
        const firstId = filteredMilestones[0].teamMilestoneId ?? filteredMilestones[0].milestoneId ?? filteredMilestones[0].id;
        setSelectedMilestoneId(String(firstId));
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to load milestones.');
    } finally {
      setLoading((prev) => ({ ...prev, milestones: false }));
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [teamId]);

  // Fetch Milestone Detail
  useEffect(() => {
    if (!selectedMilestoneId) {
      setMilestoneDetail(null);
      return;
    }

    const loadMilestoneDetail = async () => {
      setLoading((prev) => ({ ...prev, detail: true }));
      try {
        const detail = await getMilestoneDetail(selectedMilestoneId);
        setMilestoneDetail(detail);
      } catch (error) {
        console.error('Failed to load milestone detail', error);
        toast.error('Failed to load milestone details');
      } finally {
        setLoading((prev) => ({ ...prev, detail: false }));
      }
    };

    loadMilestoneDetail();
  }, [selectedMilestoneId]);

  // Fetch Answers whenever milestoneDetail changes
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

  // --- Derived State ---
  const selectedMilestoneSummary = useMemo(() => {
    if (!selectedMilestoneId) return null;
    return milestones.find((m) => {
      const id = m.teamMilestoneId ?? m.milestoneId ?? m.id;
      return String(id) === String(selectedMilestoneId);
    });
  }, [milestones, selectedMilestoneId]);

  const activeMilestone = milestoneDetail || selectedMilestoneSummary;

  const evaluationByMilestone = useMemo(() => {
    const map = new Map();
    evaluations.forEach((ev) => {
      if (ev?.teamMilestoneId) map.set(String(ev.teamMilestoneId), ev);
    });
    return map;
  }, [evaluations]);

  useEffect(() => {
    if (!selectedMilestoneId) return;
    const snapshot = evaluationByMilestone.get(String(selectedMilestoneId));
    if (snapshot) {
      setFormState({
        score: snapshot.score ?? '',
        comment: snapshot.comment ?? '',
      });
    } else {
      setFormState({ score: '', comment: '' });
    }
  }, [selectedMilestoneId, evaluationByMilestone]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Class Detail', href: `/lecturer/classes/${classId}` });
    }
    items.push({ label: 'Milestone Evaluation' });
    return items;
  }, [classId]);

  // --- Handlers ---

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
         console.error('Failed to open secure file', error);
         toast.error('Unable to open document link.');
      }
   }, [milestoneDetail, openSecureFile, selectedMilestoneId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;
    
    if (formState.score === '' || formState.score === null) {
      toast.warning('Please enter a score.');
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const payload = {
        score: Number(formState.score),
        comment: formState.comment?.trim() || '',
      };
      await submitMilestoneEvaluation(selectedMilestoneId, payload);
      toast.success('Evaluation saved successfully');
      await fetchMilestones();
    } catch (error) {
      toast.error(error?.message || 'Failed to save evaluation');
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50">
        
        {/* --- HEADER --- */}

          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                      Milestone Assessment
                   </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{teamInfo?.teamName || 'Loading Team...'}</h1>
                <p className="text-slate-600 text-base">
                  Evaluate individual milestones to track progress and provide timely feedback.
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
              </div>
            </div>
          </div>

        <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* LEFT: MILESTONE LIST */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 lg:self-start">
             <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:max-h-[calc(100vh-6rem)] flex flex-col">
                <div className="pb-4 border-b border-slate-100 mb-4">
                   <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-orangeFpt-500" />
                      Timeline
                   </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                   {loading.milestones ? (
                      <div className="py-8 text-center text-sm text-slate-400 animate-pulse">Loading milestones...</div>
                   ) : milestones.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400 italic">No milestones found.</div>
                   ) : (
                      milestones.map((m) => {
                         const id = String(m.teamMilestoneId ?? m.milestoneId ?? m.id);
                         const isSelected = selectedMilestoneId === id;
                         const evalData = evaluationByMilestone.get(id);
                         const isGraded = evalData?.score !== undefined && evalData?.score !== null;

                         return (
                            <button
                               key={id}
                               onClick={() => setSelectedMilestoneId(id)}
                               className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
                                  isSelected 
                                     ? 'bg-orangeFpt-50 border-orangeFpt-200 shadow-sm ring-1 ring-orangeFpt-200' 
                                     : 'bg-white border-slate-100 hover:border-orangeFpt-200 hover:bg-slate-50'
                               }`}
                            >
                               <div className="flex justify-between items-start mb-2">
                                  <span className={`text-sm font-bold line-clamp-1 ${isSelected ? 'text-orangeFpt-900' : 'text-slate-700'}`}>
                                     {m.title || m.name}
                                  </span>
                                  {isGraded ? (
                                     <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        <CheckCircleIcon className="h-3 w-3" /> {evalData.score}
                                     </span>
                                  ) : (
                                     <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                        Pending
                                     </span>
                                  )}
                               </div>
                               <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-slate-500">
                                  <ClockIcon className="h-3.5 w-3.5" />
                                  {formatDate(m.startDate)} - {formatDate(m.endDate)}
                               </div>
                            </button>
                         );
                      })
                   )}
                </div>
             </div>
          </div>

          {/* RIGHT: EVALUATION WORKSPACE */}
          <div className="lg:col-span-8">
             <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-full min-h-[500px] flex flex-col">
                {activeMilestone ? (
                   <>
                      <div className="mb-8 border-b border-slate-100 pb-6">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase">
                                  Selected Milestone
                                </span>
                                {loading.detail && (
                                   <span className="text-xs text-slate-400 animate-pulse ml-2">Refreshing details...</span>
                                )}
                            </div>
                         </div>
                         
                         <h2 className="text-2xl font-bold text-slate-900">
                            {activeMilestone.title}
                         </h2>

                         {/* Description */}
                         <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                            {activeMilestone.description || 'No description provided.'}
                         </p>

                         {/* Stats */}
                         <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               <ClockIcon className="h-4 w-4 text-slate-400" />
                               Due: {formatDate(activeMilestone.endDate)}
                            </span>
                            {evaluationByMilestone.get(selectedMilestoneId) && (
                               <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Last graded: {formatDate(evaluationByMilestone.get(selectedMilestoneId).createdDate)}
                               </span>
                            )}
                         </div>

                         {/* --- NEW SECTIONS START HERE --- */}

                         {/* 1. Artifacts (Returns) */}
                         <div className="mb-6">
                             <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CloudArrowDownIcon className="h-4 w-4 text-slate-400" /> Artifacts
                             </h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                {(!milestoneDetail?.milestoneReturns?.length && !loading.detail) && (
                                   <p className="text-sm text-slate-400 italic">No files submitted.</p>
                                )}
                             </div>
                         </div>

                         {/* 2. Checkpoints */}
                         {(milestoneDetail?.checkpoints || []).length > 0 && (
                            <div className="mb-6">
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

                         {/* 3. Questions */}
                         {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions || []).length > 0 && (
                             <div className="mb-2">
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
                         {/* --- NEW SECTIONS END HERE --- */}
                      </div>

                      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-1">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Score (0-10)</label>
                               <div className="relative">
                                  <input 
                                     type="number" 
                                     min="0" 
                                     max="10" 
                                     step="0.1"
                                     placeholder="0"
                                     className="w-full rounded-2xl border-slate-200 py-3 pl-4 pr-12 text-2xl font-bold text-slate-900 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 transition-all"
                                     value={formState.score}
                                     onChange={(e) => setFormState({ ...formState, score: e.target.value })}
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                                     / 10
                                  </span>
                               </div>
                            </div>
                            
                            <div className="md:col-span-3">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Feedback & Comments</label>
                               <div className="relative">
                                  <textarea 
                                     rows={6}
                                     placeholder="Provide constructive feedback for the team..."
                                     className="w-full rounded-2xl border-slate-200 p-4 text-sm text-slate-700 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 transition-all resize-none"
                                     value={formState.comment}
                                     onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                                  />
                                  <ChatBubbleBottomCenterTextIcon className="absolute right-4 bottom-4 h-5 w-5 text-slate-300" />
                               </div>
                            </div>
                         </div>

                         <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                               <ExclamationCircleIcon className="h-4 w-4" />
                               Changes are saved immediately upon clicking save.
                            </div>
                            <button
                               type="submit"
                               disabled={loading.submit}
                               className="flex items-center gap-2 px-8 py-3 rounded-xl bg-orangeFpt-500 text-white font-bold shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                               {loading.submit ? (
                                  <>Saving...</> 
                               ) : (
                                  <><StarIcon className="h-5 w-5" /> Save Evaluation</>
                               )}
                            </button>
                         </div>
                      </form>
                   </>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                         <BeakerIcon className="h-10 w-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Select a Milestone</h3>
                      <p className="text-slate-500 max-w-xs mt-2">
                         Choose a milestone from the timeline on the left to begin grading.
                      </p>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

// --- Helper Components ---

const AssigneeAvatar = ({ assignee }) => {
   const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(assignee.fullname, assignee.avatarImg);
   
   return (
      <div 
         className="relative group"
         title={`${assignee.fullname} (${assignee.teamRoleString})`}
      >
         {shouldShowImage ? (
            <img 
               src={assignee.avatarImg} 
               alt={assignee.fullname}
               onError={() => setImageError(true)}
               className="h-6 w-6 rounded-full ring-2 ring-white object-cover" 
            />
         ) : (
            <div className={`h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold ${colorClass}`}>
               {initials}
            </div>
         )}
      </div>
   );
};

const CheckpointItem = ({ cp }) => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-indigo-200">
         {/* HEADER */}
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

         {/* BODY */}
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
                           <AssigneeAvatar key={assignee.checkpointAssignmentId} assignee={assignee} />
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
   const [isOpen, setIsOpen] = useState(false);

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
                     <AnswerItem key={aIdx} ans={ans} />
                  )) : (
                     <p className="text-xs text-slate-400 italic">No answers yet.</p>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

const AnswerItem = ({ ans }) => {
   const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(ans.studentName, ans.avatar);
   const evaluations = ans.answerEvaluations || [];
   const hasEvaluations = evaluations.length > 0;
   console.log('AnswerItem ans:', ans);
   console.log('AnswerItem evaluations:', evaluations);
   // Calculate average score
   const averageScore = hasEvaluations
      ? (evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length).toFixed(1)
      : null;

   // Render stars based on average score
   const renderStars = (score) => {
      const stars = [];
      const roundedScore = Math.round(score);
      for (let i = 1; i <= 5; i++) {
         stars.push(
            <StarIcon
               key={i}
               className={`h-3 w-3 ${i <= roundedScore ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
            />
         );
      }
      return stars;
   };

   return (
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
         <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
               {shouldShowImage ? (
                  <img
                     src={ans.avatar}
                     alt={ans.studentName}
                     onError={() => setImageError(true)}
                     className="h-5 w-5 rounded-full object-cover"
                  />
               ) : (
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${colorClass}`}>
                     {initials}
                  </div>
               )}
               <span className="text-xs font-bold text-slate-700">{ans.studentName}</span>
            </div>
            {averageScore && (
               <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  {renderStars(parseFloat(averageScore))}
               </div>
            )}
         </div>
         <p className="text-sm text-slate-600 leading-relaxed mb-2">{ans.answer}</p>

         {hasEvaluations && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
               <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ratings ({evaluations.length})
               </h6>
               {evaluations.map((evaluation) => (
                  <EvaluationItem key={evaluation.answerEvaluationId} evaluation={evaluation} />
               ))}
            </div>
         )}
      </div>
   );
};

const EvaluationItem = ({ evaluation }) => {
   const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(
      evaluation.evaluatorName,
      evaluation.evaluatorAvatar
   );

   const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   return (
      <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
         {shouldShowImage ? (
            <img
               src={evaluation.evaluatorAvatar}
               alt={evaluation.evaluatorName}
               onError={() => setImageError(true)}
               className="h-6 w-6 rounded-full object-cover shrink-0"
            />
         ) : (
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${colorClass}`}>
               {initials}
            </div>
         )}
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
               <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{evaluation.evaluatorName}</p>
                  {evaluation.evaluatorCode && (
                     <p className="text-[9px] text-slate-400 uppercase tracking-wide">{evaluation.evaluatorCode}</p>
                  )}
               </div>
               <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                  {Array.from({ length: 5 }, (_, i) => (
                     <StarIcon
                        key={i}
                        className={`h-2.5 w-2.5 ${i < evaluation.score ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                     />
                  ))}
               </div>
            </div>
            {evaluation.comment && (
               <p className="text-[11px] text-slate-600 leading-relaxed mb-1">{evaluation.comment}</p>
            )}
            {evaluation.createTime && (
               <p className="text-[9px] text-slate-400 flex items-center gap-1">
                  <ClockIcon className="h-2.5 w-2.5" />
                  {formatDate(evaluation.createTime)}
               </p>
            )}
         </div>
      </div>
   );
};

export default MilestoneEvaluationPage;
