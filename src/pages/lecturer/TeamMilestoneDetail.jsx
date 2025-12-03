import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  HelpCircle,
  Loader2,
  Trash2,
  UploadCloud,
  Plus,
  Save,
  CheckCircle
} from 'lucide-react';
import { 
  ChevronDownIcon,
  DocumentTextIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

import DashboardLayout from '../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import { getTeamDetail } from '../../services/teamApi';
import {
  getMilestoneDetail,
  updateMilestone,
  postMilestoneFile,
  deleteMilestoneFile,
  patchGenerateNewMilestoneFile
} from '../../services/milestoneApi';
import {
  postMilestoneQuestion,
  deleteMilestoneQuestion
} from '../../services/questionApi';
import { 
  getMilestoneQuestionsAnswersByQuestionId,
  patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId
} from '../../services/studentApi';
import { useSecureFileHandler } from '../../hooks/useSecureFileHandler';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const extractUrlLike = (payload) => {
  if (typeof payload === 'string') return payload;
  const target = (typeof payload === 'object' && payload !== null && 'data' in payload)
      ? payload.data
      : payload;
   if (typeof target === 'string') return target;
   if (target && typeof target === 'object') {
      return target.fileUrl || target.url || target.filePath || null;
   }
  return null;
};

const CheckpointItem = ({ checkpoint }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
           <h4 className="font-bold text-slate-800">{checkpoint.title}</h4>
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              (checkpoint.statusString === 'DONE' || checkpoint.status === 1) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              (checkpoint.statusString === 'IN_PROGRESS') ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-slate-50 text-slate-600 border-slate-100'
           }`}>
              {checkpoint.statusString || (checkpoint.status === 1 ? 'DONE' : 'PENDING')}
           </span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due</p>
                <p className="text-xs font-semibold text-slate-700">{formatDate(checkpoint.dueDate)}</p>
            </div>
            <ChevronDownIcon 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-slate-100 bg-white">
           {checkpoint.complexity && (
              <div className="mb-3">
                 <span className="inline-block text-[10px] font-semibold text-slate-400 border border-slate-100 bg-slate-50 px-1.5 py-0.5 rounded">
                    Complexity: {checkpoint.complexity}
                 </span>
              </div>
           )}
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {checkpoint.description || "No description provided."}
          </p>
          
          {/* Assignees */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
             <span className="text-[10px] text-slate-400 font-bold uppercase">Assignees:</span>
             <div className="flex -space-x-2">
                {(checkpoint.checkpointAssignments || []).map((assignee) => (
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
                {(checkpoint.checkpointAssignments || []).length === 0 && (
                   <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionItem = ({ question, answers, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all hover:shadow-md">
      <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{question.question}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {answers?.length || 0} student answer(s)
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
            {onDelete && (
                <button 
                    onClick={() => onDelete(question.milestoneQuestionId || question.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Question"
                >
                    <Trash2 size={18} />
                </button>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <ChevronDownIcon 
                className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-slate-100 bg-white space-y-4">
          {/* Teacher's Answer/Guidance */}
          {question.answer && (
             <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Guidance / Expected Answer</p>
                <p className="text-sm text-slate-700">{question.answer}</p>
             </div>
          )}

          {/* Student Answers */}
          <div>
            <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <ListBulletIcon className="w-4 h-4" />
              Student Responses
            </h5>
            {answers && answers.length > 0 ? (
              <div className="space-y-3">
                {answers.map((ans, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600">{ans.answer || ans}</p>
                    {ans.studentName && (
                        <p className="text-xs text-slate-400 mt-1">— {ans.studentName}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No answers submitted yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TeamMilestoneDetail = () => {
  const { classId, teamId, milestoneId } = useParams();
  const navigate = useNavigate();
  const { openSecureFile } = useSecureFileHandler();

  const [teamInfo, setTeamInfo] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  // Questions State
  const [newQuestion, setNewQuestion] = useState('');
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState({});

  // Files State
  const [activeFileKey, setActiveFileKey] = useState(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamData, milestoneData] = await Promise.all([
          getTeamDetail(teamId),
          getMilestoneDetail(milestoneId)
        ]);
        setTeamInfo(teamData);
        setMilestone(milestoneData);
        
        setFormValues({
          title: milestoneData.title || '',
          description: milestoneData.description || '',
          startDate: toDateInputValue(milestoneData.startDate),
          endDate: toDateInputValue(milestoneData.endDate)
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teamId, milestoneId]);

  // Fetch Answers whenever milestone changes
  useEffect(() => {
    const questions = milestone?.milestoneQuestions || [];
    if (!questions.length) {
      setQuestionAnswers({});
      return;
    }
    const fetchAnswers = async () => {
      const answersMap = {};
      await Promise.all(questions.map(async (q) => {
        try {
          const qId = q.milestoneQuestionId || q.id;
          if (qId) {
            const res = await getMilestoneQuestionsAnswersByQuestionId(qId);
            answersMap[qId] = Array.isArray(res?.answersList) ? res.answersList : [];
          }
        } catch (error) {
          console.error('Failed to fetch answers for question', q, error);
        }
      }));
      setQuestionAnswers(answersMap);
    };
    fetchAnswers();
  }, [milestone]);

  const refreshMilestone = async () => {
    try {
      const data = await getMilestoneDetail(milestoneId);
      setMilestone(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        teamId: Number(teamId),
        startDate: formValues.startDate,
        endDate: formValues.endDate
      };

      await updateMilestone(milestoneId, payload);
      toast.success('Milestone updated successfully');
      refreshMilestone();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.message || 'Failed to update milestone');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers: Questions ---
  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    setIsQuestionSubmitting(true);
    try {
      await postMilestoneQuestion(milestoneId, teamId, newQuestion);
      toast.success('Question added');
      setNewQuestion('');
      refreshMilestone();
    } catch (error) {
      console.error('Add question failed:', error);
      toast.error(error.message || 'Failed to add question');
    } finally {
      setIsQuestionSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteMilestoneQuestion(qId);
      toast.success('Question deleted');
      refreshMilestone();
    } catch (error) {
      console.error('Delete question failed:', error);
      toast.error(error.message || 'Failed to delete question');
    }
  };

  // --- Handlers: Files ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading('Uploading file...');
    try {
      const formData = new FormData();
      formData.append('formFile', file);
      await postMilestoneFile(milestoneId, formData);
      toast.dismiss(toastId);
      toast.success('File uploaded');
      refreshMilestone();
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Upload failed:', error);
      toast.error(error.message || 'Upload failed');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await deleteMilestoneFile(fileId);
      toast.success('File deleted');
      refreshMilestone();
    } catch (error) {
      console.error('Delete file failed:', error);
      toast.error(error.message || 'Failed to delete file');
    }
  };

  const handleOpenFile = async (file) => {
    if (!file) return;
    const fallbackUrl = file.fileUrl || file.url;
    const resolvedFileId = file.fileId || file.id;

    const secureFetcher = async () => {
       const refreshed = await patchGenerateNewMilestoneFile(milestoneId, resolvedFileId);
       return extractUrlLike(refreshed) || fallbackUrl;
    };

    setActiveFileKey(resolvedFileId);
    try {
       await openSecureFile(fallbackUrl, secureFetcher, true);
    } finally {
       setActiveFileKey(null);
    }
 };

  const handleViewReturnFile = async (file) => {
      if (!file) return;
      const fallbackUrl = file.url || file.fileUrl;
      const resolvedReturnId = file.mileReturnId || file.mileReturnID || file.id;
      
      const secureFetcher = async () => {
         const refreshed = await patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId(
            milestoneId,
            resolvedReturnId
         );
         return extractUrlLike(refreshed) || fallbackUrl;
      };

      try {
         await openSecureFile(
            fallbackUrl,
            secureFetcher,
            true
         );
      } catch (error) {
         console.error('Failed to open secure file', error);
         toast.error('Unable to open document link.');
      }
   };

  const breadcrumbItems = useMemo(() => [
    { label: 'Classes', href: '/lecturer/classes' },
    { label: teamInfo?.classInfo?.className || 'Class', href: `/lecturer/classes/${classId}` },
    { label: teamInfo?.teamName || 'Team', href: `/lecturer/classes/${classId}/team/${teamId}` },
    { label: milestone?.title || 'Milestone Detail' }
  ], [classId, teamId, teamInfo, milestone]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orangeFpt-500" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 bg-slate-50/50 pb-20">
        <LecturerBreadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="mt-6 relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl"></div>
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">{milestone.title}</h1>
                </div>
                <p className="text-slate-600 max-w-3xl">{milestone.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(milestone.startDate)} — {formatDate(milestone.endDate)}
                    </span>
                    {milestone.score !== undefined && milestone.score !== null && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                            Score: {milestone.score}
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Artifacts & Checkpoints */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Milestone Resources Section */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <DocumentTextIcon className="w-6 h-6 text-orangeFpt-500" />
                                Milestone Resources
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Upload templates, guidelines, or reference materials for the students.
                            </p>
                        </div>
                        <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-orangeFpt-500 text-white rounded-xl text-sm font-bold hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/20 active:scale-95">
                            <UploadCloud size={18} />
                            Upload Resource
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {milestone.milestoneFiles?.length > 0 ? (
                            milestone.milestoneFiles.map((file) => (
                                <div key={file.fileId} className="group relative p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-orangeFpt-200 hover:bg-orangeFpt-50/30 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white text-orangeFpt-600 rounded-lg border border-slate-100 shadow-sm">
                                            <DocumentTextIcon className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-slate-800 truncate" title={file.fileName}>{file.fileName}</h4>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(file.fileSize / 1024).toFixed(1)} KB • {formatDate(file.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenFile(file)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            {activeFileKey === (file.fileId || file.id) ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-orangeFpt-500" />
                                            ) : (
                                                <CloudArrowDownIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteFile(file.fileId)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-slate-900 font-medium text-sm">No resources uploaded yet</p>
                                <p className="text-slate-500 text-xs mt-1">Upload files to help your students.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Student Artifacts Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CloudArrowDownIcon className="w-6 h-6 text-blue-500" />
                            Student Submissions
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {milestone.milestoneReturns?.length > 0 ? (
                            milestone.milestoneReturns.map((file, idx) => (
                                <div key={idx} onClick={() => handleViewReturnFile(file)} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <DocumentTextIcon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700">{file.fileName || 'File'}</p>
                                            <p className="text-xs text-slate-500">{file.studentName}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="text-slate-500 text-sm">No student submissions yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Checkpoints Section */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        Checkpoints
                    </h2>
                    <div className="space-y-3">
                        {(milestone.checkpoints || milestone.milestoneCheckpoints || []).length > 0 ? (
                            (milestone.checkpoints || milestone.milestoneCheckpoints).map((cp) => (
                                <CheckpointItem key={cp.id || cp.checkpointId} checkpoint={cp} />
                            ))
                        ) : (
                            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="text-slate-500 text-sm">No checkpoints defined.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Questions Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-indigo-500" />
                            Questions & Answers
                        </h2>
                    </div>

                    {/* Add Question Input */}
                    <div className="mb-6 flex gap-3">
                        <input
                            type="text"
                            placeholder="Type a new question for the team..."
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10 shadow-sm"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                        />
                        <button
                            onClick={handleAddQuestion}
                            disabled={!newQuestion.trim() || isQuestionSubmitting}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            <Plus size={18} /> Add
                        </button>
                    </div>

                    <div className="space-y-4">
                        {milestone.milestoneQuestions?.length > 0 ? (
                            milestone.milestoneQuestions.map((q) => (
                                <QuestionItem 
                                    key={q.milestoneQuestionId || q.id} 
                                    question={q} 
                                    answers={questionAnswers[q.milestoneQuestionId || q.id]}
                                    onDelete={handleDeleteQuestion}
                                />
                            ))
                        ) : (
                            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="text-slate-500 text-sm">No questions added yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Right Column: Settings/Dates */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
                    {((milestone.score !== undefined && milestone.score !== null) || (milestone.milestoneEvaluation?.score !== undefined && milestone.milestoneEvaluation?.score !== null) || milestone.status === 1) ? (
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Milestone Completed</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    This milestone is marked as completed.
                                </p>
                                {(milestone.score !== undefined && milestone.score !== null || milestone.milestoneEvaluation?.score !== undefined && milestone.milestoneEvaluation?.score !== null) && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-lg border border-green-100">
                                        Score: {milestone.score ?? milestone.milestoneEvaluation?.score}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate(`/lecturer/grading/class/${classId}/team/${teamId}/milestones/evaluate`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orangeFpt-500 text-white font-bold rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/20"
                            >
                                {(milestone.score !== undefined && milestone.score !== null || milestone.milestoneEvaluation?.score !== undefined && milestone.milestoneEvaluation?.score !== null) ? 'View Evaluation' : 'Evaluate Milestone'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Milestone Settings
                            </h3>
                            <form onSubmit={handleSaveDetails} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                                        value={formValues.startDate}
                                        onChange={e => setFormValues({ ...formValues, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-orangeFpt-500 focus:outline-none focus:ring-2 focus:ring-orangeFpt-500/10"
                                        value={formValues.endDate}
                                        onChange={e => setFormValues({ ...formValues, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orangeFpt-500 text-white font-bold rounded-xl hover:bg-orangeFpt-600 disabled:opacity-50 transition-all shadow-lg shadow-orangeFpt-500/20"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Update Dates'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamMilestoneDetail;
