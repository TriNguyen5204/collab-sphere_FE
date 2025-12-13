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

import DashboardLayout from '../../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../../services/teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from '../../../services/milestoneApi';
import { getSubjectById, getClassDetail, getUserProfile } from '../../../services/userService';
import {
   getMilestoneQuestionsAnswersByQuestionId,
   patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId,
   getAvatarByPublicId,
   getDetailOfCheckpointByCheckpointId,
   patchGenerateNewCheckpointFileLinkByCheckpointIdAndFileId
} from '../../../services/studentApi';
import {
   getTeamEvaluationSummary,
   submitTeamEvaluation,
   getMemberEvaluations,
   submitMemberEvaluations
} from '../../../services/evaluationApi';
import { useSecureFileHandler } from '../../../hooks/useSecureFileHandler';
import { useAvatar } from '../../../hooks/useAvatar';

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
   const [isTeamMembersOpen, setIsTeamMembersOpen] = useState(true);
   const [activeGradingTab, setActiveGradingTab] = useState('team');

   // Final Grading Form
   const [finalForm, setFinalForm] = useState({ components: {}, teamComment: '' });
   const [finalEvaluationSummary, setFinalEvaluationSummary] = useState(null);
   const [memberScores, setMemberScores] = useState({});
   const [memberEvaluations, setMemberEvaluations] = useState(null);
   //   const [memberProfiles, setMemberProfiles] = useState({});

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
            console.log('Fetched milestones for team:', mileList);
            console.log('Team info:', team);
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

   // Fetch Member Profiles
   //   useEffect(() => {
   //     if (!teamInfo?.memberInfo?.members) return;

   //     const fetchMemberAvatars = async () => {
   //       const profiles = {};

   //       await Promise.all(teamInfo.memberInfo.members.map(async (member) => {
   //         try {
   //           const profileData = await getUserProfile(member.studentId);
   //           const user = profileData?.user;

   //           if (user) {
   //             let avatarUrl = user.avatarUrl;
   //             if (user.avatarImg) {
   //                try {
   //                  const avatarRes = await getAvatarByPublicId(user.avatarImg);
   //                  avatarUrl = avatarRes.data;
   //                } catch (e) {
   //                  console.error("Failed to fetch avatar image", e);
   //                }
   //             }
   //             profiles[member.studentId] = avatarUrl;
   //           }
   //         } catch (err) {
   //           console.error('Failed to fetch profile for', member.studentId);
   //         }
   //       }));

   //       setMemberProfiles(profiles);
   //     };

   //     fetchMemberAvatars();
   //   }, [teamInfo]);

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

            // Fetch member evaluations
            try {
               const memberEval = await getMemberEvaluations(teamId);
               console.log('Fetched member evaluations:', memberEval);
               setMemberEvaluations(memberEval);

               // Pre-fill member scores
               if (memberEval?.memberScores) {
                  const scoreMap = {};
                  memberEval.memberScores.forEach(m => {
                     scoreMap[m.classMemberId] = m.score || '';
                  });
                  setMemberScores(scoreMap);
               }
            } catch (error) {
               console.error('Failed to load member evaluations', error);
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

   // Create a map of componentId -> percentage from subjectData
   const percentageMap = useMemo(() => {
      const map = {};
      const components = subjectData?.subjectSyllabus?.subjectGradeComponents || [];
      components.forEach(c => {
         map[c.subjectGradeComponentId] = c.referencePercentage;
      });
      return map;
   }, [subjectData]);

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
         toast.error(error?.response?.data?.errorList?.[0]?.message || 'Failed to save final evaluation');
      } finally {
         setLoading(prev => ({ ...prev, submitting: false }));
      }
   };

   const handleMemberScoresSubmit = async (e) => {
      e.preventDefault();

      if (!memberEvaluations?.memberScores || memberEvaluations.memberScores.length === 0) {
         toast.error('No members to grade');
         return;
      }

      setLoading(prev => ({ ...prev, submitting: true }));
      try {
         const memberScorePayload = memberEvaluations.memberScores.map(m => ({
            classMemberId: m.classMemberId,
            score: memberScores[m.classMemberId] !== undefined && memberScores[m.classMemberId] !== ''
               ? Number(memberScores[m.classMemberId])
               : null
         }));

         await submitMemberEvaluations(teamId, memberScorePayload);
         console.log('Member scores to submit:', memberScorePayload);
         toast.success('Member scores saved successfully');

         // Refresh member evaluations
         const memberEval = await getMemberEvaluations(teamId);
         console.log('Refreshed member evaluations:', memberEval);
         setMemberEvaluations(memberEval);

      } catch (error) {
         console.error('Failed to save member scores', error);
         toast.error(error?.response?.data?.errorList?.[0]?.message || 'Failed to save member scores');
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
         <div className="flex flex-col">

            {/* --- HERO HEADER --- */}
            <div className="mx-auto w-full shrink-0 px-4 lg:px-6">
               <LecturerBreadcrumbs items={breadcrumbItems} />

               {/* <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
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
               </div> */}
            </div>

            <div className="mx-auto w-full grid grid-cols-12 gap-3 lg:gap-4 xl:gap-6 mt-3 lg:mt-4 flex-1 min-h-0 pb-2 px-4 lg:px-6">

               {/* COLUMN 1: Milestones (Left) */}
               <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-3 lg:gap-4 xl:gap-6  max-h-[700px] lg:max-h-[720px] xl:max-h-[760px]">
                  <div className="flex-1 rounded-2xl lg:rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0">
                     <div className="flex justify-between gap-2 lg:gap-3 lg:mb-4 p-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 lg:gap-2">
                           <div className="p-1.5 lg:p-2 rounded-3xl bg-indigo-100 text-indigo-600">
                              <ClockIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                           </div>
                           <h3 className="text-sm lg:text-base font-bold text-slate-800">Milestones</h3>
                        </div>
                        <Link
                           to={`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`}
                           className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl bg-white border border-indigo-200 text-indigo-600 text-xs lg:text-sm font-semibold hover:bg-indigo-50 transition-all shadow-sm"
                        >
                           Grade
                        </Link>
                     </div>
                     <div className="flex-1 overflow-y-auto px-3 space-y-1.5 lg:space-y-2 custom-scrollbar">
                        {milestones.map(m => {
                           const isSelected = selectedMilestoneId === (m.teamMilestoneId || m.id);
                           const score = m.milestoneEvaluation?.score ?? m.score;
                           return (
                              <button
                                 key={m.teamMilestoneId || m.id}
                                 onClick={() => setSelectedMilestoneId(m.teamMilestoneId || m.id)}
                                 className={`w-full text-left p-3 rounded-lg lg:rounded-xl border transition-all group ${isSelected
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
                     <div className="px-5 pb-5">
                        <button
                           onClick={() => setSelectedMilestoneId(null)}
                           className={`lg:mt-4 w-full p-2 lg:p-3 rounded-lg lg:rounded-xl border font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-1.5 lg:gap-2 ${selectedMilestoneId === null
                              ? 'border-orangeFpt-500 bg-orangeFpt-500 text-white shadow-md shadow-orangeFpt-200'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600'
                              }`}
                        >
                           <CalculatorIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                           Final Evaluation
                        </button>
                     </div>
                  </div>
               </div>

               {/* COLUMN 2: Grading Workspace (Middle) */}
               <div className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col rounded-2xl lg:rounded-3xl border border-slate-200 bg-white max-h-[700px] lg:max-h-[720px] xl:max-h-[760px]">
                  {selectedMilestoneId ? (
                     // MODE A: Milestone Details
                     <div className="h-full flex flex-col">
                        <div className="border-b border-slate-100">
                           <div className="space-y-1 p-3 lg:p-4 xl:p-5">
                              <div className="flex items-center gap-1.5 lg:gap-2 text-indigo-600 mb-1 lg:mb-2">
                                 <DocumentTextIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                 <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider">Milestone Review</span>
                              </div>
                              <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-slate-900">{milestoneDetail?.title || 'Loading...'}</h2>
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 lg:space-y-4 xl:space-y-6 p-3 lg:p-4 xl:p-5">
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
                        <div className="mb-3 lg:mb-4 xl:mb-6 border-b border-slate-100 pb-3  flex justify-between items-end px-3 lg:px-4 xl:px-5 pt-3">
                           <div>
                              <span className="text-[10px] lg:text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md">Final Grading</span>
                              <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-slate-900 mt-1 lg:mt-2">Team Evaluation</h2>
                           </div>
                           <div className="text-right bg-slate-50 p-1.5 lg:p-2 px-2 lg:px-3 rounded-lg lg:rounded-xl border border-slate-100">
                              <p className="text-[9px] lg:text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total</p>
                              <div className="flex items-baseline justify-end gap-0.5 lg:gap-1">
                                 <p className="text-xl lg:text-2xl font-black text-orangeFpt-600">{displayTotal}</p>
                                 <span className="text-base lg:text-lg text-slate-400 font-bold">/10</span>
                              </div>
                           </div>
                        </div>

                        {/* Team Progress Overview */}
                        {teamInfo?.teamProgress && (
                           <div className="mb-3 p-3 mx-3 rounded-xl lg:rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                 <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                 Team Progress Overview
                              </h4>
                              <div className="grid grid-cols-12 gap-3 lg:gap-4">
                                 {/* Overall Progress */}
                                 <div className="col-span-3 p-2 lg:p-3 rounded-lg bg-white border border-slate-100">
                                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Overall</p>
                                    <div className="flex items-baseline gap-1">
                                       <p className="text-2xl lg:text-3xl font-black text-indigo-600">{teamInfo.teamProgress.overallProgress}</p>
                                       <span className="text-lg text-slate-400 font-bold">%</span>
                                    </div>
                                 </div>

                                 {/* Milestones Progress */}
                                 <div className="col-span-5 p-2 lg:p-3 rounded-lg bg-white border border-slate-100">
                                    <div className="flex justify-between items-center mb-1">
                                       <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestones</p>
                                       <span className="text-[9px] font-bold text-blue-600">
                                          {teamInfo.teamProgress.milestonesProgress}%
                                       </span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-2">
                                       <p className="text-lg lg:text-xl font-black text-blue-600">{teamInfo.teamProgress.milestonesComplete}</p>
                                       <span className="text-xs text-slate-400 font-medium">/ {teamInfo.teamProgress.totalMilestones}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                       <div
                                          className="h-full bg-blue-500 transition-all duration-300"
                                          style={{ width: `${teamInfo.teamProgress.milestonesProgress}%` }}
                                       ></div>
                                    </div>
                                 </div>

                                 {/* Checkpoints Progress */}
                                 <div className="col-span-4 p-2 lg:p-3 rounded-lg bg-white border border-slate-100">
                                    <div className="flex justify-between items-center mb-1">
                                       <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Checkpoints</p>
                                       <span className="text-[9px] font-bold text-emerald-600">
                                          {teamInfo.teamProgress.checkPointProgress}%
                                       </span>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-2">
                                       <p className="text-lg lg:text-xl font-black text-emerald-600">{teamInfo.teamProgress.checkpointsComplete}</p>
                                       <span className="text-xs text-slate-400 font-medium">/ {teamInfo.teamProgress.totalCheckpoints}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                       <div
                                          className="h-full bg-emerald-500 transition-all duration-300"
                                          style={{ width: `${teamInfo.teamProgress.checkPointProgress}%` }}
                                       ></div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        <form onSubmit={handleFinalSubmit} className="flex-1 flex flex-col min-h-0">
                           {/* Tab Headers */}
                           <div className="flex gap-1 lg:gap-2 mb-3 lg:mb-4 border-b border-slate-200">
                              <button
                                 type="button"
                                 onClick={() => setActiveGradingTab('team')}
                                 className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-semibold transition-all rounded-t-lg ${activeGradingTab === 'team'
                                    ? 'bg-white text-orangeFpt-600 border-b-2 border-orangeFpt-600'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                              >
                                 <CalculatorIcon className="h-4 w-4" />
                                 Team Grading
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setActiveGradingTab('members')}
                                 className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm font-semibold transition-all rounded-t-lg ${activeGradingTab === 'members'
                                    ? 'bg-white text-orangeFpt-600 border-b-2 border-orangeFpt-600'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                              >
                                 <UserGroupIcon className="h-4 w-4" />
                                 Member Scoring
                                 {memberEvaluations?.memberScores && (
                                    <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                                       {memberEvaluations.memberScores.length}
                                    </span>
                                 )}
                              </button>
                           </div>

                           {/* Tab Content */}
                           <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar">
                              {/* Team Grading Tab */}
                              {activeGradingTab === 'team' && (
                                 <div className="space-y-2 lg:space-y-3 xl:space-y-4 px-3 lg:px-4 xl:px-5">
                                    {/* Subject Component Grading */}
                                    {gradingList.map(comp => {
                                       const compId = comp.subjectGradeComponentId;
                                       const current = finalForm.components[compId] || { score: '', detailComment: '' };

                                       const name = comp.subjectGradeComponentName || comp.componentName || comp.name;
                                       const percentage = percentageMap[compId];

                                       return (
                                          <div key={compId} className="p-2.5 lg:p-3 xl:p-4 rounded-xl lg:rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-orangeFpt-200">
                                             <div className="flex justify-between items-center mb-2 lg:mb-3">
                                                <label className="font-bold text-slate-800 text-sm lg:text-base">{name}</label>
                                                {percentage !== undefined && (
                                                   <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 shadow-sm">
                                                      Weight: {percentage}%
                                                   </span>
                                                )}
                                             </div>
                                             <div className="grid grid-cols-12 gap-2 lg:gap-3">
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
                                                         className="w-full rounded-lg lg:rounded-xl border border-slate-200 bg-slate-50 px-1.5 lg:px-2 py-1.5 lg:py-2 text-center text-base lg:text-lg font-bold text-slate-900 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all"
                                                      />
                                                   </div>
                                                </div>
                                                <div className="col-span-9">
                                                   <textarea
                                                      rows={2}
                                                      placeholder="Detailed feedback..."
                                                      value={current.detailComment}
                                                      onChange={e => setFinalForm({
                                                         ...finalForm,
                                                         components: {
                                                            ...finalForm.components,
                                                            [compId]: { ...current, detailComment: e.target.value }
                                                         }
                                                      })}
                                                      className="w-full rounded-lg lg:rounded-xl border border-slate-200 px-2 lg:px-3 py-1.5 lg:py-2.5 text-xs lg:text-sm focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all resize-none"
                                                   />
                                                </div>
                                             </div>
                                          </div>
                                       );
                                    })}
                                 </div>
                              )}

                              {/* Member Scoring Tab */}
                              {activeGradingTab === 'members' && (
                                 <div className="flex-1 overflow-y-auto pr-1 lg:pr-2 custom-scrollbar">
                                    {memberEvaluations?.memberScores && memberEvaluations.memberScores.length > 0 ? (
                                       <div className="space-y-2 px-3 lg:px-4 xl:px-5">
                                          {memberEvaluations.memberScores.map(member => {
                                             // Find matching member from teamInfo to get contribution data
                                             const memberProgress = (teamInfo?.memberInfo?.members || []).find(
                                                m => m.studentName === member.memberName || m.studentId === member.studentId
                                             );
                                             const questionPct = memberProgress?.milestoneAnsContributionPercentage 
                                                ? Math.round(memberProgress.milestoneAnsContributionPercentage * 100) 
                                                : 0;
                                             const checkpointPct = memberProgress?.checkpointContributionPercentage 
                                                ? Math.round(memberProgress.checkpointContributionPercentage * 100) 
                                                : 0;
                                             const isLeader = memberProgress?.teamRole === 1;
                                             
                                             return (
                                                <div key={member.classMemberId} className="p-3 lg:p-4 rounded-xl border border-slate-200 bg-white hover:border-orangeFpt-200 transition-all shadow-sm">
                                                   {/* Top Row: Avatar, Name, Score Input */}
                                                   <div className="flex items-center justify-between gap-3 mb-3">
                                                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLeader ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                                            {member.memberName?.charAt(0)?.toUpperCase()}
                                                         </div>
                                                         <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                               <span className="font-semibold text-slate-800 text-sm lg:text-base truncate">{member.memberName}</span>
                                                               {isLeader && (
                                                                  <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 uppercase">Leader</span>
                                                               )}
                                                            </div>
                                                         </div>
                                                      </div>
                                                      <div className="flex items-center gap-2 shrink-0">
                                                         <input
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            step="0.1"
                                                            placeholder="Score"
                                                            value={memberScores[member.classMemberId] || ''}
                                                            onChange={e => setMemberScores({
                                                               ...memberScores,
                                                               [member.classMemberId]: e.target.value
                                                            })}
                                                            className="w-20 rounded-lg border border-slate-300 bg-slate-50 px-2 py-2 text-center text-lg font-bold text-slate-900 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 transition-all"
                                                         />
                                                         <span className="text-sm text-slate-400 font-medium">/10</span>
                                                      </div>
                                                   </div>
                                                   
                                                   {/* Bottom Row: Contribution Stats */}
                                                   <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Contributions:</span>
                                                      <div className="flex items-center gap-2 flex-1">
                                                         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                                                            <span className="text-[10px] text-indigo-600 font-semibold">Questions</span>
                                                            <span className="text-sm font-bold text-indigo-700">{questionPct}%</span>
                                                         </div>
                                                         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                                            <span className="text-[10px] text-emerald-600 font-semibold">Checkpoints</span>
                                                            <span className="text-sm font-bold text-emerald-700">{checkpointPct}%</span>
                                                         </div>
                                                      </div>
                                                   </div>
                                                </div>
                                             );
                                          })}
                                       </div>
                                    ) : (
                                       <div className="p-3 lg:p-4 rounded-xl bg-slate-50 border border-slate-200">
                                          <div className="flex gap-2">
                                             <ExclamationCircleIcon className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                             <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-700 mb-1">No Members to Grade</p>
                                                <p className="text-xs text-slate-500">Member evaluation data will appear here once available.</p>
                                             </div>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>

                           {/* Submit Buttons - Different for each tab */}
                           <div className="p-5">
                              {activeGradingTab === 'team' && (
                                 <button
                                    type="submit"
                                    disabled={loading.submitting}
                                    className="w-full py-2 lg:py-2.5 xl:py-3 rounded-lg lg:rounded-xl bg-orangeFpt-500 text-white text-sm lg:text-base font-bold shadow-lg shadow-orangeFpt-200 hover:bg-orangeFpt-600 hover:shadow-orangeFpt-300 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 lg:gap-2"
                                 >
                                    {loading.submitting ? (
                                       <>Saving...</>
                                    ) : (
                                       <><CheckCircleIcon className="w-4 h-4 lg:w-5 lg:h-5" /> Submit Team Grading</>
                                    )}
                                 </button>
                              )}
                              {activeGradingTab === 'members' && (
                                 <button
                                    type="button"
                                    onClick={handleMemberScoresSubmit}
                                    disabled={loading.submitting}
                                    className="w-full py-2 lg:py-2.5 xl:py-3 rounded-lg lg:rounded-xl bg-indigo-500 text-white text-sm lg:text-base font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-600 hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 lg:gap-2"
                                 >
                                    {loading.submitting ? (
                                       <>Saving...</>
                                    ) : (
                                       <><CheckCircleIcon className="w-4 h-4 lg:w-5 lg:h-5" /> Save Member Scores</>
                                    )}
                                 </button>
                              )}
                           </div>
                        </form>
                     </div>
                  )}
               </div>

               {/* COLUMN 3: Team Members & Feedback (Right) */}
               <div className="col-span-12 lg:col-span-12 xl:col-span-3 flex flex-col gap-3 lg:gap-4 max-h-[700px] lg:max-h-[720px] xl:max-h-[760px]">
                  {/* Team Members Section */}
                  <div className="rounded-2xl lg:rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                     <button
                        onClick={() => setIsTeamMembersOpen(!isTeamMembersOpen)}
                        className="w-full flex items-center justify-between gap-2 p-2 lg:p-3 border-b rounded-2xl lg:rounded-3xl border-slate-100 hover:bg-slate-50 transition-colors"
                     >
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 lg:p-2 rounded-2xl lg:rounded-3xl bg-orangeFpt-100 text-orangeFpt-600">
                              <UserGroupIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                           </div>
                           <h3 className="text-sm lg:text-base font-bold text-slate-800">Team Members</h3>
                           <span className="text-xs lg:text-sm text-slate-500 font-medium">({(teamInfo?.memberInfo?.members || []).length})</span>
                        </div>
                        <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isTeamMembersOpen ? 'rotate-180' : ''}`} />
                     </button>
                     {isTeamMembersOpen && (
                        <div className="flex flex-col max-h-[280px] lg:max-h-[320px] xl:max-h-[360px] overflow-y-auto custom-scrollbar">
                           {(teamInfo?.memberInfo?.members || []).map(member => (
                              <MemberItem key={member.studentId} member={member} />
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Feedback Section */}
                  <div className="flex-1 rounded-2xl lg:rounded-3xl border border-slate-200 bg-white p-3 lg:p-4 xl:p-6 shadow-sm overflow-hidden">
                     <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 lg:mb-3 xl:mb-4 flex items-center gap-1.5 lg:gap-2">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        {selectedMilestoneId ? 'Feedback History' : 'Subject Evaluation Comments'}
                     </h3>

                     {selectedMilestoneId ? (
                        <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 h-5/6 overflow-y-auto custom-scrollbar">
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
                        <div className="flex-1 flex flex-col h-5/6">
                           <textarea
                              className="flex-1 w-full rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm focus:ring-orangeFpt-500 focus:border-orangeFpt-500 resize-none focus:bg-white transition-colors"
                              placeholder="Enter general feedback for the team here..."
                              value={finalForm.teamComment}
                              onChange={e => setFinalForm({ ...finalForm, teamComment: e.target.value })}
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
         </div>
      </DashboardLayout>
   );
};

// --- Helper Components for Collapsible Items ---

const MemberItem = ({ member }) => {
   const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(member.studentName, member.avatar);
   const isLeader = member.teamRole === 1;

   return (
      <div className="flex items-center gap-2 lg:gap-2.5 p-1.5 lg:p-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-all group">
         {/* Avatar */}
         <div className="relative shrink-0">
            {shouldShowImage ? (
               <img
                  src={member.avatar}
                  alt={member.studentName}
                  onError={() => setImageError(true)}
                  className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover border-2 ${isLeader ? 'border-yellow-400' : 'border-slate-200'}`}
               />
            ) : (
               <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-bold border-2 ${isLeader ? 'border-yellow-400' : 'border-slate-200'} ${colorClass}`}>
                  {initials}
               </div>
            )}
            {isLeader && (
               <div className="absolute -top-0.5 lg:-top-1 -right-0.5 lg:-right-1 w-3.5 h-3.5 lg:w-4 lg:h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-[7px] lg:text-[8px] font-bold text-yellow-900">★</span>
               </div>
            )}
         </div>

         {/* Name & Role */}
         <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm font-semibold text-slate-900 truncate" title={member.studentName}>
               {member.studentName}
            </p>
            <span className={`inline-block text-[9px] lg:text-[10px] font-bold uppercase tracking-wider px-1.5 lg:px-2 py-0.5 rounded ${isLeader
               ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
               : 'bg-slate-100 text-slate-600 border border-slate-200'
               }`}>
               {isLeader ? 'Leader' : 'Member'}
            </span>
         </div>
      </div>
   );
};

const CheckpointItem = ({ cp }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [checkpointDetail, setCheckpointDetail] = useState(null);
   const [loadingFiles, setLoadingFiles] = useState(false);
   const { openSecureFile } = useSecureFileHandler();

   useEffect(() => {
      if (isOpen && !checkpointDetail && cp.checkpointId) {
         const fetchCheckpointDetail = async () => {
            setLoadingFiles(true);
            try {
               const detail = await getDetailOfCheckpointByCheckpointId(cp.checkpointId);
               setCheckpointDetail(detail);
            } catch (error) {
               console.error('Failed to fetch checkpoint detail:', error);
            } finally {
               setLoadingFiles(false);
            }
         };
         fetchCheckpointDetail();
      }
   }, [isOpen, cp.checkpointId, checkpointDetail]);

   const handleOpenFile = useCallback(async (file) => {
      if (!file) return;
      const fallbackUrl = file.fileUrl;

      const secureFetcher = async () => {
         if (!cp.checkpointId || !file.fileId) return fallbackUrl;
         const refreshed = await patchGenerateNewCheckpointFileLinkByCheckpointIdAndFileId(
            cp.checkpointId,
            file.fileId
         );
         return refreshed?.fileUrl || fallbackUrl;
      };

      try {
         await openSecureFile(
            fallbackUrl,
            secureFetcher,
            Boolean(cp.checkpointId && file.fileId)
         );
      } catch (error) {
         console.error('Failed to open checkpoint file:', error);
         toast.error('Unable to open file.');
      }
   }, [cp.checkpointId, openSecureFile]);

   return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-indigo-200">
         {/* HEADER - Always Visible */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-colors"
         >
            <div className="flex items-center gap-3">
               <h5 className="text-sm font-bold text-slate-900">{cp.title}</h5>
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cp.statusString === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  cp.statusString === 'NOT_DONE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                     'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                  {cp.statusString}
               </span>
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${cp.complexity === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' :
                  cp.complexity === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                     'bg-green-50 text-green-700 border-green-100'
                  }`}>
                  {cp.complexity}
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
               {cp.description && (
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                     {cp.description}
                  </p>
               )}

               {/* Checkpoint Files */}
               {loadingFiles ? (
                  <div className="py-3 text-center">
                     <p className="text-xs text-slate-400">Loading submissions...</p>
                  </div>
               ) : checkpointDetail?.checkpointFiles && checkpointDetail.checkpointFiles.length > 0 ? (
                  <div className="mb-3">
                     <h6 className="text-[10px] text-slate-400 font-bold uppercase mb-2">Submissions</h6>
                     <div className="space-y-2">
                        {checkpointDetail.checkpointFiles.map((file) => (
                           <div
                              key={file.fileId}
                              onClick={() => handleOpenFile(file)}
                              className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all group"
                           >
                              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                 <DocumentTextIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-medium text-slate-700 truncate group-hover:text-indigo-700">
                                    {file.fileName}
                                 </p>
                                 <p className="text-[10px] text-slate-400">{file.userName}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : null}

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

export default TeamEvaluationPage;
