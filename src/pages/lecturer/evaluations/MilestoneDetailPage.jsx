import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CloudArrowDownIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from '../../../services/milestoneApi';
import { submitMilestoneEvaluation } from '../../../services/evaluationApi';
import { normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';
import useTeam from '../../../context/useTeam';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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

const getStatusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'done') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (s === 'in_progress' || s === 'inprogress') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s === 'late' || s === 'overdue') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const MilestoneDetailPage = () => {
  const { classId, teamId, milestoneId } = useParams();
  const navigate = useNavigate();
  const { teamBoard } = useTeam();
  
  // State
  const [teamInfo, setTeamInfo] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [milestoneDetail, setMilestoneDetail] = useState(null);
  const [loading, setLoading] = useState({ team: false, list: false, detail: false, submit: false });
  
  // Form State
  const [formState, setFormState] = useState({ score: '', comments: '' });
  const [isEditing, setIsEditing] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (!teamId) return;
    let ignore = false;

    const fetchTeamAndList = async () => {
      setLoading(prev => ({ ...prev, team: true, list: true }));
      try {
        const [teamData, milestonesData] = await Promise.all([
          getTeamDetail(teamId),
          getMilestonesByTeam(teamId)
        ]);

        if (!ignore) {
          setTeamInfo(teamData);
          
          let list = [];
          if (Array.isArray(milestonesData?.teamMilestones)) list = milestonesData.teamMilestones;
          else if (Array.isArray(milestonesData?.list)) list = milestonesData.list;
          else if (Array.isArray(milestonesData?.data)) list = milestonesData.data;
          else if (Array.isArray(milestonesData)) list = milestonesData;
          setMilestones(list);
        }
      } catch (error) {
        console.error('Failed to load team context', error);
        if (!ignore) toast.error('Failed to load team data.');
      } finally {
        if (!ignore) setLoading(prev => ({ ...prev, team: false, list: false }));
      }
    };

    fetchTeamAndList();
    return () => { ignore = true; };
  }, [teamId]);

  useEffect(() => {
    if (!milestoneId) return;
    let ignore = false;

    const fetchDetail = async () => {
      setLoading(prev => ({ ...prev, detail: true }));
      try {
        const detail = await getMilestoneDetail(milestoneId);
        if (!ignore) {
          setMilestoneDetail(detail);
          // Pre-fill form
          const evalData = detail?.milestoneEvaluation;
          if (evalData) {
            setFormState({
              score: evalData.score ?? '',
              comments: evalData.comment ?? evalData.comments ?? ''
            });
            setIsEditing(false);
          } else {
            setFormState({ score: '', comments: '' });
            setIsEditing(true);
          }
        }
      } catch (error) {
        console.error('Failed to load milestone detail', error);
        if (!ignore) toast.error('Failed to load milestone details.');
      } finally {
        if (!ignore) setLoading(prev => ({ ...prev, detail: false }));
      }
    };

    fetchDetail();
    return () => { ignore = true; };
  }, [milestoneId]);

  // --- Handlers ---

  const handleNavigateMilestone = (id) => {
    if (id === milestoneId) return;
    if (classId) navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones/${id}`);
    else navigate(`/lecturer/grading/team/${teamId}/milestones/${id}`);
  };

  const handleDownload = (file) => {
    const url = buildDownloadUrl(file);
    if (url) window.open(url, '_blank');
    else toast.error('Download URL unavailable');
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (formState.score === '') {
      toast.warning('Please enter a score.');
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    try {
      await submitMilestoneEvaluation(milestoneId, {
        score: Number(formState.score),
        comments: formState.comments
      });
      toast.success('Evaluation saved successfully');
      
      if (teamBoard) {
        const linkForTeamMember = `/student/project/milestones&checkpoints/${teamId}`;
        await teamBoard.broadcastMilestoneEvaluated(teamId, milestoneId, linkForTeamMember);
      }

      // Refresh detail to show read-only view
      const updated = await getMilestoneDetail(milestoneId);
      setMilestoneDetail(updated);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save evaluation');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Classes', href: '/lecturer/classes' }];
    if (classId) {
      items.push({ label: 'Grading', href: `/lecturer/grading/${classId}` });
    }
    if (teamInfo) {
       const teamLabel = teamInfo.teamName || 'Team';
       if (classId) items.push({ label: teamLabel, href: `/lecturer/grading/class/${classId}/team/${teamId}/milestones` });
       else items.push({ label: teamLabel, href: `/lecturer/grading/team/${teamId}/milestones` });
    }
    items.push({ label: milestoneDetail?.title || 'Milestone Detail' });
    return items;
  }, [classId, teamId, teamInfo, milestoneDetail]);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
        
        {/* --- HERO HEADER --- */}
        <div className="mx-auto max-w-6xl">
          <LecturerBreadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-0.5 rounded-lg bg-orangeFpt-50 text-orangeFpt-700 text-xs font-bold border border-orangeFpt-200 uppercase tracking-wider">
                      Milestone Detail
                   </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {milestoneDetail?.title || 'Loading Milestone...'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                   <span className="flex items-center gap-1.5">
                      <ClockIcon className="h-4 w-4" />
                      Due: {formatDate(milestoneDetail?.dueDate || milestoneDetail?.endDate)}
                   </span>
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(milestoneDetail?.statusString)}`}>
                      {milestoneDetail?.statusString || 'Pending'}
                   </span>
                </div>
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
          
          {/* LEFT: TIMELINE NAV */}
          <div className="lg:col-span-4 space-y-6">
             <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm h-[calc(100vh-24rem)] flex flex-col">
                <div className="pb-4 border-b border-slate-100 mb-4">
                   <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-orangeFpt-500" />
                      Timeline
                   </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                   {milestones.map((m) => {
                      const id = String(m.teamMilestoneId ?? m.milestoneId ?? m.id);
                      const isSelected = id === milestoneId;
                      const score = m.milestoneEvaluation?.score ?? m.score;
                      
                      return (
                         <button
                            key={id}
                            onClick={() => handleNavigateMilestone(id)}
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
                               {score != null && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                     {score}
                                  </span>
                               )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-slate-500">
                               <ClockIcon className="h-3.5 w-3.5" />
                               {formatDate(m.endDate || m.dueDate)}
                            </div>
                         </button>
                      );
                   })}
                </div>
             </div>
          </div>

          {/* RIGHT: DETAIL & GRADING */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Milestone Info Card */}
             <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <DocumentTextIcon className="h-4 w-4 text-slate-400" /> Description
                </h3>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                   {milestoneDetail?.description || 'No description provided.'}
                </div>

                {/* Submissions */}
                <div className="mt-8">
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CloudArrowDownIcon className="h-4 w-4 text-slate-400" /> Submissions
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(milestoneDetail?.milestoneReturns || []).map((file, idx) => (
                         <div key={idx} 
                            onClick={() => handleDownload(file)}
                            className="cursor-pointer group p-4 rounded-2xl border border-slate-200 bg-white hover:border-orangeFpt-200 hover:shadow-md transition-all flex items-center gap-3"
                         >
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                               <DocumentTextIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-700 transition-colors">
                                  {file.fileName || file.originalFileName || 'Submission'}
                               </p>
                               <p className="text-xs text-slate-400 mt-0.5">
                                  {file.studentName} • {formatDate(file.submittedAt)}
                               </p>
                            </div>
                            <CloudArrowDownIcon className="h-5 w-5 text-slate-300 group-hover:text-blue-500" />
                         </div>
                      ))}
                      {(!milestoneDetail?.milestoneReturns?.length) && (
                         <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 text-sm">
                            No submissions uploaded yet.
                         </div>
                      )}
                   </div>
                </div>
                
                {/* Q&A Preview (if exists) */}
                {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions || []).length > 0 && (
                   <div className="mt-8">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                         <QuestionMarkCircleIcon className="h-4 w-4 text-slate-400" /> Questions
                      </h3>
                      <div className="space-y-3">
                         {(milestoneDetail?.questions || milestoneDetail?.milestoneQuestions).map((q, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-700 font-medium">
                               {q.question}
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             {/* Grading Card */}
             <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                   <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BeakerIcon className="h-5 w-5 text-orangeFpt-500" /> Evaluation
                   </h3>
                   {!isEditing && milestoneDetail?.milestoneEvaluation && (
                      <button 
                         onClick={() => setIsEditing(true)}
                         className="text-sm font-semibold text-indigo-600 hover:underline"
                      >
                         Edit Grade
                      </button>
                   )}
                </div>

                {isEditing || !milestoneDetail?.milestoneEvaluation ? (
                   <form onSubmit={handleSubmitEvaluation} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                         <div className="sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Score (0-10)</label>
                            <div className="relative">
                               <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  placeholder="0.0"
                                  value={formState.score}
                                  onChange={(e) => setFormState({ ...formState, score: e.target.value })}
                                  className="w-full rounded-2xl border-slate-200 py-3 pl-4 pr-12 text-2xl font-bold text-slate-900 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 transition-all text-center"
                               />
                               <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">/10</span>
                            </div>
                         </div>
                         <div className="sm:col-span-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Feedback</label>
                            <textarea
                               rows={3}
                               placeholder="Write constructive feedback..."
                               value={formState.comments}
                               onChange={(e) => setFormState({ ...formState, comments: e.target.value })}
                               className="w-full rounded-2xl border-slate-200 p-4 text-sm text-slate-700 focus:border-orangeFpt-500 focus:ring-4 focus:ring-orangeFpt-500/10 transition-all resize-none"
                            />
                         </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                         {milestoneDetail?.milestoneEvaluation && (
                            <button
                               type="button"
                               onClick={() => {
                                  setIsEditing(false);
                                  setFormState({
                                     score: milestoneDetail.milestoneEvaluation.score,
                                     comments: milestoneDetail.milestoneEvaluation.comment || ''
                                  });
                               }}
                               className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                               Cancel
                            </button>
                         )}
                         <button
                            type="submit"
                            disabled={loading.submit}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-orangeFpt-500 text-white font-bold shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 transition-all active:scale-95"
                         >
                            {loading.submit ? 'Saving...' : 'Save Evaluation'}
                         </button>
                      </div>
                   </form>
                ) : (
                   <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <span className="text-xl font-bold text-orangeFpt-600">{milestoneDetail.milestoneEvaluation.score}</span>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Graded</p>
                            <p className="text-xs text-slate-500">
                               by {milestoneDetail.milestoneEvaluation.fullName || 'Lecturer'} on {formatDate(milestoneDetail.milestoneEvaluation.createdDate)}
                            </p>
                         </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                         <p className="text-sm text-slate-700 italic">
                            "{milestoneDetail.milestoneEvaluation.comment || milestoneDetail.milestoneEvaluation.comments || 'No text feedback provided.'}"
                         </p>
                      </div>
                   </div>
                )}
             </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default MilestoneDetailPage;
