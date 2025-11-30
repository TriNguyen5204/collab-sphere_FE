import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  BeakerIcon, 
  ChatBubbleBottomCenterTextIcon, 
  StarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import DashboardLayout from '../../../components/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam } from '../../../services/milestoneApi';
import { getMilestoneEvaluationsByTeam, submitMilestoneEvaluation } from '../../../services/evaluationApi';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const MilestoneEvaluationPage = () => {
  const { classId, teamId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  
  const [loading, setLoading] = useState({ team: false, milestones: false, submit: false });
  const [formState, setFormState] = useState({ score: '', comments: '' });

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

      setMilestones(normalizedMilestones);
      setEvaluations(Array.isArray(evaluationList) ? evaluationList : []);

      // Auto-select first milestone if none selected
      if (!selectedMilestoneId && normalizedMilestones.length > 0) {
        const firstId = normalizedMilestones[0].teamMilestoneId ?? normalizedMilestones[0].milestoneId ?? normalizedMilestones[0].id;
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

  // --- Derived State ---

  const selectedMilestone = useMemo(() => {
    if (!selectedMilestoneId) return null;
    return milestones.find((m) => {
      const id = m.teamMilestoneId ?? m.milestoneId ?? m.id;
      return String(id) === String(selectedMilestoneId);
    });
  }, [milestones, selectedMilestoneId]);

  const evaluationByMilestone = useMemo(() => {
    const map = new Map();
    evaluations.forEach((ev) => {
      if (ev?.teamMilestoneId) map.set(String(ev.teamMilestoneId), ev);
    });
    return map;
  }, [evaluations]);

  // Update form when selection changes
  useEffect(() => {
    if (!selectedMilestone) return;
    const id = String(selectedMilestone.teamMilestoneId ?? selectedMilestone.milestoneId ?? selectedMilestone.id);
    const snapshot = evaluationByMilestone.get(id);
    
    if (snapshot) {
      setFormState({
        score: snapshot.score ?? '',
        comments: snapshot.comments ?? '',
      });
    } else {
      setFormState({ score: '', comments: '' });
    }
  }, [selectedMilestone, evaluationByMilestone]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Class Detail', href: `/lecturer/classes/${classId}` });
    }
    items.push({ label: 'Milestone Evaluation' });
    return items;
  }, [classId]);

  // --- Handlers ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    
    const milestoneId = selectedMilestone.teamMilestoneId ?? selectedMilestone.milestoneId ?? selectedMilestone.id;
    if (!milestoneId) return;

    if (formState.score === '' || formState.score === null) {
      toast.warning('Please enter a score.');
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const payload = {
        score: Number(formState.score),
        comments: formState.comments?.trim() || '',
      };
      
      await submitMilestoneEvaluation(milestoneId, payload);
      toast.success('Evaluation saved successfully');
      await fetchMilestones(); // Refresh data
    } catch (error) {
      toast.error(error?.message || 'Failed to save evaluation');
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
        
        {/* --- HEADER --- */}
        <div className="mx-auto max-w-6xl">
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
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* LEFT: MILESTONE LIST */}
          <div className="lg:col-span-4 space-y-6">
             <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm h-[calc(100vh-24rem)] flex flex-col">
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
                {selectedMilestone ? (
                   <>
                      <div className="mb-8 border-b border-slate-100 pb-6">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase">
                               Selected Milestone
                            </span>
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900">{selectedMilestone.title}</h2>
                         <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                            {selectedMilestone.description || 'No description provided.'}
                         </p>
                         <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               <ClockIcon className="h-4 w-4 text-slate-400" />
                               Due: {formatDate(selectedMilestone.endDate)}
                            </span>
                            {evaluationByMilestone.get(selectedMilestoneId) && (
                               <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" />
                                  Last graded: {formatDate(evaluationByMilestone.get(selectedMilestoneId).createdDate)}
                               </span>
                            )}
                         </div>
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
                                     value={formState.comments}
                                     onChange={(e) => setFormState({ ...formState, comments: e.target.value })}
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

export default MilestoneEvaluationPage;