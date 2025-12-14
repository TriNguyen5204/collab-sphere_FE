import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Loader2, Check, XCircle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('submission');
  const [pendingEvaluations, setPendingEvaluations] = useState({});
  const [submissionProgress, setSubmissionProgress] = useState({
    isOpen: false,
    items: [],
    currentIndex: 0,
    completedIds: [],
    failedIds: [],
    isFinished: false
  });

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
    
    // Check if we have a pending draft first
    if (pendingEvaluations[selectedMilestoneId]) {
      setFormState(pendingEvaluations[selectedMilestoneId]);
      return;
    }

    const snapshot = evaluationByMilestone.get(String(selectedMilestoneId));
    if (snapshot) {
      setFormState({
        score: snapshot.score ?? '',
        comment: snapshot.comment ?? '',
      });
    } else {
      setFormState({ score: '', comment: '' });
    }
  }, [selectedMilestoneId, evaluationByMilestone, pendingEvaluations]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Class Detail', href: `/lecturer/classes/${classId}` });
    }
    items.push({ label: 'Milestone Evaluation' });
    return items;
  }, [classId]);

  // --- Handlers ---

  const handleMilestoneSwitch = (newId) => {
    if (selectedMilestoneId) {
        const currentEvalData = evaluationByMilestone.get(String(selectedMilestoneId));
        const isPreviouslyGraded = currentEvalData?.score !== undefined && currentEvalData?.score !== null;
        
        if (isPreviouslyGraded) {
            if (formState.score === '' || formState.score === null || formState.score === undefined) {
                toast.error("This milestone is already graded. You cannot remove the grade. Please enter a valid score before switching.");
                return;
            }
        }
    }
    setSelectedMilestoneId(newId);
  };

  const handleFormChange = (field, value) => {
    if (!selectedMilestoneId) return;

    if (field === 'score' && (value === '' || value === null)) {
        const currentEvalData = evaluationByMilestone.get(String(selectedMilestoneId));
        const isPreviouslyGraded = currentEvalData?.score !== undefined && currentEvalData?.score !== null;
        
        if (isPreviouslyGraded) {
            toast.warning("Warning: You are clearing a grade that has already been submitted.");
        }
    }
    
    const newState = { ...formState, [field]: value };
    setFormState(newState);
    
    // Update pending evaluations immediately
    setPendingEvaluations(prev => ({
      ...prev,
      [selectedMilestoneId]: newState
    }));
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
  }, [milestoneDetail, selectedMilestoneId, openSecureFile]);

  const handleSubmitAll = async () => {
    const draftIds = Object.keys(pendingEvaluations);
    if (draftIds.length === 0) {
      toast.info('No pending evaluations to submit.');
      return;
    }

    const itemsToSubmit = draftIds.map(id => {
        const m = milestones.find(m => String(m.teamMilestoneId ?? m.milestoneId ?? m.id) === id);
        return {
            id,
            title: m?.title || m?.name || 'Unknown Milestone'
        };
    });

    setSubmissionProgress({
        isOpen: true,
        items: itemsToSubmit,
        currentIndex: 0,
        completedIds: [],
        failedIds: [],
        isFinished: false
    });

    setLoading((prev) => ({ ...prev, submit: true }));
    const successfulIds = [];

    try {
      for (let i = 0; i < draftIds.length; i++) {
          const mId = draftIds[i];
          setSubmissionProgress(prev => ({ ...prev, currentIndex: i }));
          
          const draft = pendingEvaluations[mId];
          
          if (draft.score === '' || draft.score === null) {
             setSubmissionProgress(prev => ({ 
                ...prev, 
                failedIds: [...prev.failedIds, mId] 
             }));
             continue;
          }

          try {
            const payload = {
                score: Number(draft.score),
                comment: draft.comment?.trim() || '',
            };
            
            // Small delay for UX
            await new Promise(r => setTimeout(r, 800));

            await submitMilestoneEvaluation(mId, payload);
            successfulIds.push(mId);
            
            setSubmissionProgress(prev => ({ 
                ...prev, 
                completedIds: [...prev.completedIds, mId] 
            }));
          } catch (err) {
            console.error(`Failed to submit for milestone ${mId}`, err);
            setSubmissionProgress(prev => ({ 
                ...prev, 
                failedIds: [...prev.failedIds, mId] 
            }));
          }
      }

      if (successfulIds.length > 0) {
        setPendingEvaluations(prev => {
            const next = { ...prev };
            successfulIds.forEach(id => delete next[id]);
            return next;
        });
        await fetchMilestones();
      }

    } catch (error) {
      toast.error('An error occurred during submission.');
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
      setSubmissionProgress(prev => ({ ...prev, isFinished: true }));
    }
  };

  const pendingCount = Object.keys(pendingEvaluations).length;

  return (
    <DashboardLayout>
       <div className="h-[calc(100vh-84px)] flex">
          {/* --- LEFT PANEL: LIST --- */}
          <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white z-10">
             {/* Header */}
             <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                   <button onClick={() => navigate(-1)} className="hover:text-slate-600 transition-colors">
                      <ArrowLeftIcon className="h-4 w-4" />
                   </button>
                   <span className="text-xs font-bold uppercase tracking-wider">Milestones</span>
                </div>
                <div className="flex items-center justify-between">
                   <h2 className="text-lg font-bold text-slate-800">Team Milestones</h2>
                   <div className="flex items-center gap-3">
                       {pendingCount > 0 && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 animate-pulse">
                             {pendingCount} Draft{pendingCount !== 1 ? 's' : ''} Pending
                          </span>
                       )}
                   </div>
                </div>
             </div>

             {/* List */}
           <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
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
                    const isDraft = pendingEvaluations[id] !== undefined;

                    return (
                       <button
                          key={id}
                          onClick={() => handleMilestoneSwitch(id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                             isSelected 
                                ? 'bg-[#fcd8b6]/20 border-[#fb8239] shadow-sm' 
                                : 'bg-white border-slate-200 hover:border-[#fcd8b6] hover:shadow-md'
                          }`}
                       >
                          {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e75710]" />}
                          <div className="flex justify-between items-start mb-1.5 pl-2">
                             <span className={`text-sm font-bold line-clamp-1 ${isSelected ? 'text-[#450b00]' : 'text-slate-700'}`}>
                                {m.title || m.name}
                             </span>
                             {isDraft ? (
                                <span className="text-[10px] font-bold bg-[#fcd8b6] text-[#a51200] px-2 py-0.5 rounded-full animate-pulse">
                                   Draft
                                </span>
                             ) : isGraded ? (
                                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                             ) : (
                                <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5" />
                             )}
                          </div>
                          <div className="flex items-center justify-between pl-2">
                             <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-500">
                                <ClockIcon className="h-3.5 w-3.5" />
                                {formatDate(m.endDate)}
                             </div>
                             {isGraded && !isDraft && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                   Score: {evalData.score}
                                </span>
                             )}
                          </div>
                       </button>
                    );
                 })
              )}
           </div>
        </div>

        {/* --- RIGHT PANEL: WORKSPACE --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
           {activeMilestone ? (
              <>
                 {/* Sticky Header */}
                 <div className="flex-shrink-0 px-8 py-5 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div>
                       <h1 className="text-2xl font-bold text-[#450b00] truncate max-w-2xl">{activeMilestone.title}</h1>
                       <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1.5">
                             <ClockIcon className="h-4 w-4" />
                             Due: {formatDate(activeMilestone.endDate)}
                          </span>
                          {loading.detail && (
                             <span className="flex items-center gap-1.5 text-[#e75710] animate-pulse">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#e75710]" />
                                Syncing...
                             </span>
                          )}
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-colors">
                          Save Draft
                       </button>
                    </div>
                 </div>

                 {/* Tabs */}
                 <div className="flex-shrink-0 px-8 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex gap-8">
                       <button 
                          onClick={() => setActiveTab('submission')}
                          className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                             activeTab === 'submission' 
                                ? 'border-[#e75710] text-[#e75710]' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                          }`}
                       >
                          <CloudArrowDownIcon className="h-4 w-4" />
                          Student Submission
                       </button>
                       <button 
                          onClick={() => setActiveTab('grading')}
                          className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                             activeTab === 'grading' 
                                ? 'border-[#e75710] text-[#e75710]' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                          }`}
                       >
                          <StarIcon className="h-4 w-4" />
                          Grading Form
                       </button>
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    {activeTab === 'submission' ? (
                       <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          
                          {/* Description */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                             <p className="text-slate-700 leading-relaxed">
                                {activeMilestone.description || 'No description provided.'}
                             </p>
                          </div>

                          {/* 1. Artifacts (Returns) */}
                          <div>
                              <h4 className="text-lg font-bold text-[#450b00] mb-4 flex items-center gap-2">
                                 <CloudArrowDownIcon className="h-5 w-5 text-[#e75710]" /> 
                                 Submitted Artifacts
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {(milestoneDetail?.milestoneReturns || []).map((file, idx) => (
                                    <div key={idx} onClick={() => handleViewFile(file)} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-[#fcd8b6] hover:shadow-md cursor-pointer transition-all group">
                                       <div className="flex items-center gap-4 min-w-0">
                                          <div className="h-10 w-10 rounded-lg bg-[#fcd8b6]/20 flex items-center justify-center text-[#e75710] group-hover:scale-110 transition-transform">
                                             <DocumentTextIcon className="h-6 w-6" />
                                          </div>
                                          <div className="min-w-0">
                                             <p className="text-sm font-bold text-slate-800 truncate group-hover:text-[#e75710] transition-colors">{file.fileName || 'File'}</p>
                                             <p className="text-xs text-slate-500 mt-0.5">By {file.studentName}</p>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                                 {(!milestoneDetail?.milestoneReturns?.length && !loading.detail) && (
                                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                       <CloudArrowDownIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                       <p className="text-slate-500 font-medium">No files submitted yet.</p>
                                    </div>
                                 )}
                              </div>
                          </div>

                          {/* 2. Checkpoints */}
                          {(milestoneDetail?.checkpoints || []).length > 0 && (
                             <div>
                                <h4 className="text-lg font-bold text-[#450b00] mb-4 flex items-center gap-2">
                                   <ListBulletIcon className="h-5 w-5 text-[#e75710]" /> 
                                   Checkpoints
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
                              <div>
                                 <h4 className="text-lg font-bold text-[#450b00] mb-4 flex items-center gap-2">
                                    <QuestionMarkCircleIcon className="h-5 w-5 text-[#e75710]" /> 
                                    Q&A Responses
                                 </h4>
                                 <div className="space-y-4">
                                    {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions).map((q, idx) => {
                                       const qId = q.id || q.milestoneQuestionId;
                                       const answers = questionAnswers[qId] || [];
                                       return <QuestionItem key={idx} q={q} answers={answers} />;
                                    })}
                                 </div>
                              </div>
                          )}
                       </div>
                    ) : (
                       <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                             <h3 className="text-xl font-bold text-[#450b00] mb-6 flex items-center gap-2">
                                <StarIcon className="h-6 w-6 text-[#fb8239]" />
                                Evaluation & Feedback
                             </h3>
                             
                             <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                                <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-3">Score Awarded</label>
                                   <div className="flex items-center gap-4">
                                      <div className="relative w-40">
                                         <input 
                                            type="number" 
                                            min="0" 
                                            max="10" 
                                            step="0.1"
                                            placeholder="0.0"
                                            className="w-full rounded-2xl border-slate-200 py-4 pl-6 pr-12 text-3xl font-bold text-[#e75710] focus:border-[#fb8239] focus:ring-4 focus:ring-[#fb8239]/10 transition-all"
                                            value={formState.score}
                                            onChange={(e) => handleFormChange('score', e.target.value)}
                                         />
                                         <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                            / 10
                                         </span>
                                      </div>
                                      <div className="text-sm text-slate-500 max-w-xs">
                                         Enter a score between 0 and 10 based on the rubric and submitted artifacts.
                                      </div>
                                   </div>
                                </div>
                                
                                <div>
                                   <label className="block text-sm font-bold text-slate-700 mb-3">Detailed Feedback</label>
                                   <div className="relative">
                                      <textarea 
                                         rows={8}
                                         placeholder="Provide constructive feedback for the team. Mention specific strengths and areas for improvement..."
                                         className="w-full rounded-2xl border-slate-200 p-5 text-base text-slate-700 focus:border-[#fb8239] focus:ring-4 focus:ring-[#fb8239]/10 transition-all resize-none leading-relaxed"
                                         value={formState.comment}
                                         onChange={(e) => handleFormChange('comment', e.target.value)}
                                      />
                                      <div className="absolute right-4 bottom-4 p-2 bg-slate-50 rounded-lg text-slate-400">
                                         <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                                      </div>
                                   </div>
                                </div>
                             </form>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Footer */}
                 <div className="flex-shrink-0 px-8 py-5 border-t border-slate-200 bg-white flex justify-between items-center z-20">
                    <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
                       <ExclamationCircleIcon className="h-4 w-4" />
                       {pendingCount > 0 ? 'Drafts are saved locally. Submit to finalize.' : 'Changes are saved immediately upon submission.'}
                    </div>
                    <button
                       onClick={handleSubmitAll}
                       disabled={loading.submit || pendingCount === 0}
                       className="flex items-center gap-2 px-8 py-3.5 bg-[#e75710] text-white font-bold rounded-xl hover:bg-[#a51200] transition-all shadow-lg shadow-[#fcd8b6] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {loading.submit ? (
                          <>
                             <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Submitting {pendingCount}...
                          </>
                       ) : (
                          <>Submit {pendingCount > 0 ? `${pendingCount} Grades` : 'Grade'} <ArrowLeftIcon className="h-4 w-4 rotate-180" /></>
                       )}
                    </button>
                 </div>
              </>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                    <BeakerIcon className="h-10 w-10 text-slate-300" />
                 </div>
                 <h3 className="text-xl font-bold text-[#450b00]">Select a Milestone</h3>
                 <p className="text-slate-500 max-w-xs mt-2 leading-relaxed">
                    Choose a milestone from the timeline on the left to view submissions and start grading.
                 </p>
              </div>
           )}
        </div>

      </div>

      <AnimatePresence>
         {submissionProgress.isOpen && (
            <GradingProgressModal 
                items={submissionProgress.items}
                currentIndex={submissionProgress.currentIndex}
                completedIds={submissionProgress.completedIds}
                failedIds={submissionProgress.failedIds}
                isFinished={submissionProgress.isFinished}
                onClose={() => setSubmissionProgress(prev => ({ ...prev, isOpen: false }))}
            />
         )}
      </AnimatePresence>
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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-[#fcd8b6]">
         {/* HEADER */}
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-colors"
         >
            <div className="flex items-center gap-3">
               <h5 className="text-sm font-bold text-[#450b00]">{cp.title}</h5>
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
            <p className="text-sm font-semibold text-[#450b00] pr-4">{q.question}</p>
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
               <div className="space-y-3 pl-3 border-l-2 border-[#fcd8b6] mt-3">
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

const GradingProgressModal = ({ 
  items, 
  currentIndex, 
  completedIds,
  failedIds,
  onClose,
  isFinished
}) => {
  const total = items.length;
  const progress = ((completedIds.length + failedIds.length) / total) * 100;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#a51200] via-[#e75710] to-[#fb8239]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
          <div className="relative px-6 py-5 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Submitting Grades</h2>
            <p className="text-orange-100 text-sm mt-1">
              {completedIds.length + failedIds.length} of {total} processed
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-[#a51200] via-[#e75710] to-[#fb8239]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {items.map((item, idx) => {
              const isCompleted = completedIds.includes(item.id);
              const isFailed = failedIds.includes(item.id);
              const isCurrent = idx === currentIndex && !isFinished;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCompleted 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : isFailed
                      ? 'bg-rose-50 border border-rose-200'
                      : isCurrent 
                      ? 'bg-[#fcd8b6]/20 border border-[#fb8239]' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isFailed
                      ? 'bg-rose-500 text-white'
                      : isCurrent 
                      ? 'bg-[#e75710] text-white' 
                      : 'bg-slate-300 text-white'
                  }`}>
                    {isCompleted ? (
                      <Check size={14} strokeWidth={3} />
                    ) : isFailed ? (
                      <XCircle size={14} strokeWidth={3} />
                    ) : isCurrent ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isCompleted ? 'text-emerald-700' : isFailed ? 'text-rose-700' : isCurrent ? 'text-[#a51200]' : 'text-slate-600'
                    }`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isCompleted ? 'Submitted successfully' : isFailed ? 'Failed to submit' : isCurrent ? 'Submitting...' : 'Waiting...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {isFinished && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
             >
                <button 
                   onClick={onClose}
                   className="w-full py-3 bg-[#450b00] text-white font-bold rounded-xl hover:bg-[#a51200] transition-all"
                >
                   Close
                </button>
             </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default MilestoneEvaluationPage;
