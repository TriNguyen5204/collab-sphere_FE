import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import MilestoneTimeline from '../../../components/student/milestone/MilestoneTimeline';
import MilestoneHeader from '../../../components/student/milestone/MilestoneHeader';
import CheckpointSummaryCards from '../../../components/student/milestone/CheckpointSummaryCards';
import CheckpointCard from '../../../components/student/milestone/CheckpointCard';
import CheckpointFormModal from '../../../components/student/milestone/CheckpointFormModal';
import { Plus, CheckSquare, Folder } from 'lucide-react';
import { getAllMilestonesByTeamId, getDetailOfMilestoneByMilestoneId, patchMarkDoneMilestoneByMilestoneId, postCreateCheckpoint } from '../../../services/userService';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const MilestonePage = () => {
  const { id } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [newCheckpoint, setNewCheckpoint] = useState({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
  const [activeTab, setActiveTab] = useState('in-progress');

  const role = useSelector((state) => state.user.roleName);

  const getDefaultTab = (cps = []) => {
    const inProgress = cps.filter(c => (c.status === 'in-progress' || c.status === 'pending')).length;
    const completed = cps.filter(c => c.status === 'completed').length;
    if (inProgress > 0) return 'in-progress';
    if (completed > 0) return 'completed';
    return 'in-progress';
  };

  useEffect(() => {
    setActiveTab(getDefaultTab(selectedMilestone?.checkpoints || []));
  }, [selectedMilestone]);

  const normalizeStatus = (raw) => {
    // Support numeric and boolean representations: 0/false => NOT_DONE, 1/true => DONE
    if (raw === 0 || raw === '0' || raw === false) return 'pending';
    if (raw === 1 || raw === '1' || raw === true) return 'completed';

    const s = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
    const map = {
      NOT_DONE: 'pending',
      IN_PROGRESS: 'in-progress',
      COMPLETED: 'completed',
      DONE: 'completed',
      LOCKED: 'locked',
    };
    if (s) return map[s] || s.toLowerCase();
    return 'pending';
  };

  const mapListItemToMilestone = (item) => ({
    id: item.teamMilestoneId ?? item.id,
    objectiveMilestoneId: item.objectiveMilestoneId,
    teamId: item.teamId,
    title: item.title,
    description: item.description,
    startDate: item.startDate,
    dueDate: item.endDate,
    progress: Math.round(item.progress ?? 0),
    status: normalizeStatus(item.statusString ?? item.status),
    requiredAnswers: item.milestoneQuestionCount ?? 0,
    completedAnswers: 0,
    completedDate: null,
    completedBy: null,
    questions: [],
    checkpoints: [],
    lecturerFiles: [],
    returns: [],
    evaluation: null,
    _hasDetails: false,
  });

  const mergeDetailIntoMilestone = (base, detail) => {
    const questionsRaw = detail?.milestoneQuestions || detail?.questions || [];
    const questions = questionsRaw.map((q) => {
      const answersArray = (q.answers || q.answerList || []).map((a) => ({
        content: a.content ?? a.answer ?? '',
        answeredBy: a.answeredByName ?? a.answeredBy ?? a.userName ?? '',
        answeredAt: a.answeredAt ?? a.createdAt ?? '',
      }));
      return {
        id: q.id ?? q.questionId ?? q.milestoneQuestionId,
        question: q.content ?? q.text ?? q.question ?? '',
        type: q.type ?? 'text',
        answers: answersArray,
      };
    });
    const completedAnswers = questions.filter((q) => (q.answers?.length ?? 0) > 0).length;

  const cpRaw = detail?.checkpoints || detail?.checkpointList || [];
    const checkpoints = cpRaw.map((cp) => {
      const submissions = (cp.submissions || cp.attachments || []).map((s, idx) => ({
        id: s.id ?? s.submissionId ?? idx,
        fileName: s.fileName ?? s.name ?? 'file',
        fileSize: s.fileSize ? `${s.fileSize}` : (s.size ? `${(s.size / (1024 * 1024)).toFixed(2)} MB` : ''),
        fileType: s.fileType ?? (s.fileName ? s.fileName.split('.').pop()?.toLowerCase() : ''),
        uploadedBy: s.uploadedByName ?? s.uploadedBy ?? s.userName ?? '',
        uploadedAt: s.uploadedAt ?? s.createdAt ?? '',
      }));
      const assignments = (cp.checkpointAssignments || []).map((a) => ({
        id: a.checkpointAssignmentId ?? a.id,
        checkpointId: a.checkpointId ?? cp.checkpointId ?? cp.id,
        classMemberId: a.classMemberId,
        studentId: a.studentId,
        fullname: a.fullname ?? a.fullName,
        studentCode: a.studentCode,
        avatarImg: a.avatarImg,
        teamRole: a.teamRole,
        teamRoleString: a.teamRoleString,
      }));
  // Normalize checkpoint status supporting numeric 0/1 or string variants
  const statusRaw = cp.statusString ?? cp.status ?? 'NOT_DONE';
  let statusString;
  if (statusRaw === 0 || statusRaw === '0' || statusRaw === false) statusString = 'NOT_DONE';
  else if (statusRaw === 1 || statusRaw === '1' || statusRaw === true) statusString = 'DONE';
  else statusString = typeof statusRaw === 'string' ? statusRaw : 'NOT_DONE';
  const uiStatusMap = { NOT_DONE: 'pending', IN_PROGRESS: 'in-progress', COMPLETED: 'completed', DONE: 'completed', LOCKED: 'locked' };
  const uiStatus = uiStatusMap[statusString] || (typeof statusString === 'string' ? statusString.toLowerCase() : 'pending');
      return {
        id: cp.id ?? cp.checkpointId,
        title: cp.title ?? cp.name ?? 'Checkpoint',
        description: cp.description ?? '',
        dueDate: cp.dueDate ?? cp.deadline ?? cp.endDate ?? null,
        startDate: cp.startDate ?? null,
        status: cp.status ?? null,
        statusString,
        uiStatus,
        complexity: cp.complexity ?? 'LOW',
        assignments,
        createdAt: cp.createdAt ?? '',
        submissions,
        comments: cp.comments ?? '',
      };
    });

    const lecturerFilesRaw = detail?.milestoneFiles || [];
    const lecturerFiles = lecturerFilesRaw.map((f, idx) => ({
      id: f.fileId ?? idx,
      name: f.fileName ?? f.name ?? f.type ?? 'File',
      path: f.filePath ?? f.path ?? '',
      type: f.type ?? (f.filePath ? f.filePath.split('.').pop()?.toUpperCase() : ''),
    }));

    const returnsRaw = detail?.milestoneReturns || [];
    const returns = returnsRaw.map((r, idx) => ({
      id: r.mileReturnId ?? idx,
      path: r.filePath ?? '',
      type: r.type ?? '',
      submittedAt: r.submitedDate ?? r.submittedAt ?? r.createdDate ?? '',
      student: {
        id: r.studentId ?? null,
        name: r.fullname ?? r.fullName ?? '',
        code: r.studentCode ?? '',
        avatar: r.avatarImg ?? '',
      },
    }));

    // Lecturer evaluation
    const evaluationRaw = detail?.milestoneEvaluation || null;
    const evaluation = evaluationRaw
      ? {
        score: evaluationRaw.score ?? null,
        comment: evaluationRaw.comment ?? '',
        createdDate: evaluationRaw.createdDate ?? '',
        lecturer: {
          id: evaluationRaw.lecturerId ?? null,
          name: evaluationRaw.fullName ?? '',
          code: evaluationRaw.lecturerCode ?? '',
          phone: evaluationRaw.phoneNumber ?? '',
          avatar: evaluationRaw.avatarImg ?? '',
        },
      }
      : null;

    return {
      ...base,
      progress: Math.round(detail?.progress ?? base.progress ?? 0),
      status: normalizeStatus(detail?.statusString ?? detail?.status ?? base.status),
      requiredAnswers: detail?.milestoneQuestionCount ?? questions.length ?? base.requiredAnswers ?? 0,
      completedAnswers,
      questions,
      checkpoints,
      lecturerFiles,
      returns,
      evaluation,
      _hasDetails: true,
    };
  };

  const fetchMilestones = async (teamId) => {
    try {
      setIsLoadingList(true);
      const response = await getAllMilestonesByTeamId(teamId);
      console.log("Fetched milestones:", response);
      const list = Array.isArray(response?.list)
        ? response.list
        : Array.isArray(response)
          ? response
          : (response?.data || []);
      const mapped = (list || []).map(mapListItemToMilestone);
      setMilestones(mapped);
      if (mapped.length > 0) {
        setSelectedMilestone(mapped[0]);
        fetchMilestoneDetail(mapped[0].id);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchMilestoneDetail = async (milestoneId) => {
    try {
      if (!milestoneId) return;
      setIsLoadingDetail(true);
      const detail = await getDetailOfMilestoneByMilestoneId(milestoneId);
      console.log("Fetched milestone detail:", detail);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? mergeDetailIntoMilestone(m, detail) : m)));
      setSelectedMilestone((prev) => {
        if (!prev) return prev;
        if (prev.id !== milestoneId) return prev;
        return mergeDetailIntoMilestone(prev, detail);
      });
    } catch (error) {
      console.error("Error fetching milestone detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMilestones(id);
    }
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAnswer = (questionId) => {
    if (!selectedMilestone) return;
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === selectedMilestone.id) {
        const updatedQuestions = milestone.questions.map(q => {
          if (q.id === questionId) {
            const prev = Array.isArray(q.answers) ? q.answers : [];
            const newEntry = {
              content: answers[questionId] || '',
              answeredBy: 'Current User',
              answeredAt: new Date().toISOString()
            };
            return {
              ...q,
              answers: newEntry.content ? [...prev, newEntry] : prev,
            };
          }
          return q;
        });
        const completedAnswers = updatedQuestions.filter(q => (Array.isArray(q.answers) ? q.answers.length > 0 : false)).length;
        const progress = milestone.requiredAnswers > 0 ? Math.round((completedAnswers / milestone.requiredAnswers) * 100) : 0;
        return {
          ...milestone,
          questions: updatedQuestions,
          completedAnswers,
          progress
        };
      }
      return milestone;
    });
    setMilestones(updatedMilestones);
    setSelectedMilestone(updatedMilestones.find(m => m.id === selectedMilestone.id));
    setAnswers({ ...answers, [questionId]: "" });
  };

  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return;
    if (selectedMilestone.completedAnswers < selectedMilestone.requiredAnswers) {
      alert("Please answer all questions before completing the milestone");
      return;
    }

    try {
      await patchMarkDoneMilestoneByMilestoneId(selectedMilestone.id, true);
      console.log(selectedMilestone.id);
      const updatedMilestones = milestones.map(milestone => {
        if (milestone.id === selectedMilestone.id) {
          return {
            ...milestone,
            status: "completed",
            completedDate: new Date().toISOString(),
            progress: 100
          };
        }
        return milestone;
      });
      setMilestones(updatedMilestones);
      setSelectedMilestone(updatedMilestones.find(m => m.id === selectedMilestone.id));
    } catch (error) {
      const msg = error?.response?.data?.message || 'Only leader can mark milestone as done';
      alert(msg);
    }
  };

  const selectedCheckpoints = useMemo(() => selectedMilestone?.checkpoints || [], [selectedMilestone]);

  const isMilestoneReadOnly = useMemo(() => {
    const st = selectedMilestone?.status;
    const hasEvaluation = !!selectedMilestone?.evaluation;
    return hasEvaluation || st === 'locked' || st === 'completed';
  }, [selectedMilestone]);

  const checkpointGroups = useMemo(() => {
    const byStatus = { 'in-progress': [], completed: [] };
    const toDate = (d) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);
    (selectedCheckpoints || []).forEach((cp) => {
      const key = (cp.uiStatus || cp.status) === 'completed' ? 'completed' : 'in-progress';
      byStatus[key].push(cp);
    });
    Object.keys(byStatus).forEach((k) => byStatus[k].sort((a, b) => toDate(a.dueDate) - toDate(b.dueDate)));
    return byStatus;
  }, [selectedCheckpoints]);

  const checkpointProgress = useMemo(() => {
    const total = selectedCheckpoints.length;
    const completed = selectedCheckpoints.filter((c) => (c.uiStatus || c.status) === 'completed').length;
    return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
  }, [selectedCheckpoints]);

  const handleCreateCheckpoint = async () => {
    if (!selectedMilestone) return;
    if (!newCheckpoint.title || !newCheckpoint.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot create new checkpoints.');
      return;
    }
    try {
      console.log(selectedMilestone.id, newCheckpoint);
      await postCreateCheckpoint(
        selectedMilestone.id,
        newCheckpoint.title,
        newCheckpoint.description || '',
        (newCheckpoint.complexity || 'LOW').toUpperCase(),
        newCheckpoint.startDate || null,
        newCheckpoint.dueDate
      );

      //refresh details
  await fetchMilestoneDetail(selectedMilestone.id);
  setNewCheckpoint({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
      setShowCreateModal(false);
      setActiveTab('in-progress');
    } catch (error) {
      // Prefer backend validation messages, which may be an array of { field, message }
      const data = error?.response?.data;
      let messages = [];
      if (Array.isArray(data)) {
        messages = data.map((e) => e?.message).filter(Boolean);
      } else if (typeof data === 'object' && data !== null && data.message) {
        messages = [data.message];
      } else if (typeof data === 'string') {
        messages = [data];
      } else {
        messages = ['Failed to create checkpoint'];
      }
      // Show each message via toast
      if (messages.length > 0) messages.forEach((m) => toast.error(m));
    }
  };

  const handleUpdateCheckpoint = () => {
    if (!selectedMilestone || !selectedCheckpoint) return;
    const updated = milestones.map(m => {
      if (m.id !== selectedMilestone.id) return m;
      const updatedCps = (m.checkpoints || []).map(cp =>
        cp.id === selectedCheckpoint.id ? { ...cp, ...newCheckpoint } : cp
      );
      return { ...m, checkpoints: updatedCps };
    });
    setMilestones(updated);
    setShowEditModal(false);
    setSelectedCheckpoint(null);
  setNewCheckpoint({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const handleDeleteCheckpoint = (checkpointId) => {
    if (!selectedMilestone) return;
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot delete checkpoints.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this checkpoint?')) {
      const updated = milestones.map(m =>
        m.id === selectedMilestone.id
          ? { ...m, checkpoints: (m.checkpoints || []).filter(cp => cp.id !== checkpointId) }
          : m
      );
      setMilestones(updated);
      setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
    }
  };

  const addMilestoneReturns = (files = []) => {
    if (!selectedMilestone) return;
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot upload submissions.');
      return;
    }
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    const newReturns = files.map((file, index) => ({
      id: Date.now() + index,
      path: file.name,
      type: file.name.split('.').pop()?.toUpperCase(),
      submittedAt: new Date().toISOString(),
      student: {
        id: null,
        name: 'Current User',
        code: '',
        avatar: ''
      }
    }));

    const updated = milestones.map(m =>
      m.id === selectedMilestone.id
        ? { ...m, returns: [...(m.returns || []), ...newReturns] }
        : m
    );
    setMilestones(updated);
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const handleUploadCheckpointFiles = (checkpointId, files = []) => {
    if (!selectedMilestone || !checkpointId) return;
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot upload submissions.');
      return;
    }
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    const newSubmissions = files.map((file, index) => ({
      id: Date.now() + index,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.name.split('.').pop().toLowerCase(),
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString()
    }));

    const updated = milestones.map(m => {
      if (m.id !== selectedMilestone.id) return m;
      const cps = (m.checkpoints || []).map(cp => {
        if (cp.id === checkpointId) {
          const updatedSubmissions = [...(cp.submissions || []), ...newSubmissions];
          const nextUiStatus = (cp.uiStatus || cp.status) === 'pending' ? 'in-progress' : (cp.uiStatus || cp.status);
          return {
            ...cp,
            submissions: updatedSubmissions,
            uiStatus: nextUiStatus
          };
        }
        return cp;
      });
      return { ...m, checkpoints: cps };
    });

    setMilestones(updated);
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const handleDeleteSubmission = (checkpointId, submissionId) => {
    if (!selectedMilestone) return;
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot delete submissions.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this file?')) {
      const updated = milestones.map(m => {
        if (m.id !== selectedMilestone.id) return m;
        const cps = (m.checkpoints || []).map(cp => {
          if (cp.id === checkpointId) {
            return { ...cp, submissions: (cp.submissions || []).filter(s => s.id !== submissionId) };
          }
          return cp;
        });
        return { ...m, checkpoints: cps };
      });
      setMilestones(updated);
      setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
    }
  };

  const handleMarkComplete = (checkpointId) => {
    if (!selectedMilestone) return;
    if (isMilestoneReadOnly) {
      alert('This milestone is locked or completed. You cannot change checkpoint status.');
      return;
    }

    const cp = selectedCheckpoints.find(c => c.id === checkpointId);
    if (!cp || (cp.submissions || []).length === 0) {
      alert('Please upload at least one file before marking as complete');
      return;
    }

    const updated = milestones.map(m => {
      if (m.id !== selectedMilestone.id) return m;
      const cps = (m.checkpoints || []).map(c =>
        c.id === checkpointId ? { ...c, uiStatus: 'completed' } : c
      );
      return { ...m, checkpoints: cps };
    });
    setMilestones(updated);
    setSelectedMilestone(updated.find(m => m.id === selectedMilestone.id));
  };

  const openEditModal = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
  setNewCheckpoint({ title: checkpoint.title, description: checkpoint.description, startDate: checkpoint.startDate || '', dueDate: checkpoint.dueDate });
    setShowEditModal(true);
  };

  const openAssignModal = (checkpoint) => {
    console.info('Assign checkpoint requested:', checkpoint);
  };


  const resetCheckpointUI = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCheckpoint(null);
  setNewCheckpoint({ title: '', description: '', startDate: '', dueDate: '' });
  };

  const closeModals = () => {
    resetCheckpointUI();
  };

  const handleSelectMilestone = (m) => {
    resetCheckpointUI();
    setSelectedMilestone(m);
    setActiveTab(getDefaultTab(m?.checkpoints || []));
    if (!m?._hasDetails) {
      fetchMilestoneDetail(m?.id);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />

      <main className="p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar - Milestone Timeline */}
          {isLoadingList && milestones.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mb-2" />
                        <div className="h-3 w-28 bg-gray-200 animate-pulse rounded" />
                        <div className="mt-3 h-2 w-full bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MilestoneTimeline
              milestones={milestones}
              selectedMilestone={selectedMilestone || { id: null }}
              onSelectMilestone={handleSelectMilestone}
            />
          )}

          {/* Main Content - Milestone Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedMilestone && !isLoadingDetail ? (
              <MilestoneHeader
                milestone={selectedMilestone}
                readOnly={isMilestoneReadOnly}
                onComplete={handleCompleteMilestone}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSaveAnswer={handleSaveAnswer}
                onUploadMilestoneFiles={addMilestoneReturns}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-7 w-56 bg-gray-200 animate-pulse rounded" />
                      <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
                    </div>
                    <div className="h-4 w-80 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="h-3 w-28 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            )}


            {/* Checkpoints Section */}
            <section className="space-y-4 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800">Checkpoints</h3>
                  <span className="text-sm text-gray-600">{checkpointProgress.completed}/{checkpointProgress.total} completed ({checkpointProgress.percent}%)</span>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={isMilestoneReadOnly}
                  title={isMilestoneReadOnly
                    ? 'Milestone is completed or evaluated. Creating checkpoints is disabled'
                    : undefined
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-white ${
                    isMilestoneReadOnly
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Plus size={18} />
                  Create Checkpoint
                </button>
              </div>

              {isLoadingDetail ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4">
                      <div className="h-6 w-10 bg-gray-200 animate-pulse rounded mb-2" />
                      <div className="h-7 w-10 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <CheckpointSummaryCards checkpoints={selectedCheckpoints} />
              )}

              <div className="space-y-4">
                {/* Folder Tabs */}
                <div className="flex items-center gap-3 border-b">
                  {[
                    { key: 'in-progress', label: 'In Progress', count: checkpointGroups['in-progress'].length, color: 'text-blue-700', badge: 'bg-blue-50 text-blue-700' },
                    { key: 'completed', label: 'Completed', count: checkpointGroups.completed.length, color: 'text-green-700', badge: 'bg-green-50 text-green-700' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-3 py-2 -mb-px border-b-2 ${activeTab === tab.key ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <Folder size={18} className={activeTab === tab.key ? 'text-blue-600' : 'text-gray-600'} />
                      <span className={`text-sm font-medium ${activeTab === tab.key ? 'text-blue-700' : 'text-gray-700'}`}>{tab.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${tab.badge}`}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* Active Tab Content */}
                <div className="space-y-3">
                  {isLoadingDetail ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b">
                          <div className="h-5 w-64 bg-gray-200 animate-pulse rounded mb-2" />
                          <div className="h-4 w-80 bg-gray-200 animate-pulse rounded mb-3" />
                          <div className="flex items-center gap-4">
                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="h-5 w-40 bg-gray-200 animate-pulse rounded mb-4" />
                          <div className="space-y-2">
                            <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                            <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    (checkpointGroups[activeTab] || []).map((checkpoint) => (
                      <CheckpointCard
                        key={checkpoint.id}
                        checkpoint={checkpoint}
                        readOnly={isMilestoneReadOnly || (checkpoint.uiStatus || checkpoint.status) === 'completed'}
                        onEdit={(cp) => !isMilestoneReadOnly && (checkpoint.uiStatus || checkpoint.status) !== 'completed' && openEditModal(cp)}
                        onDelete={(id) => !isMilestoneReadOnly && (checkpoint.uiStatus || checkpoint.status) !== 'completed' && handleDeleteCheckpoint(id)}
                        onUploadFiles={(id, files) => !isMilestoneReadOnly && (checkpoint.uiStatus || checkpoint.status) !== 'completed' && handleUploadCheckpointFiles(id, files)}
                        onMarkComplete={(id) => !isMilestoneReadOnly && (checkpoint.uiStatus || checkpoint.status) !== 'completed' && handleMarkComplete(id)}
                        onDeleteSubmission={(cpId, subId) => !isMilestoneReadOnly && (checkpoint.uiStatus || checkpoint.status) !== 'completed' && handleDeleteSubmission(cpId, subId)}
                        onAssign={(cp) => openAssignModal(cp)}
                      />
                    ))
                  )}
                </div>

                {selectedCheckpoints.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <CheckSquare className="mx-auto text-gray-300 mb-4" size={64} />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Checkpoints Yet</h4>
                    <p className="text-gray-600 mb-4">Create your first checkpoint for this milestone</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      disabled={isMilestoneReadOnly}
                      title={isMilestoneReadOnly
                        ? 'Milestone is completed or evaluated. Creating checkpoints is disabled'
                        : undefined
                      }
                      className={`px-6 py-2 rounded-lg transition text-white ${
                        isMilestoneReadOnly
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Create Checkpoint
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      {/* Checkpoint Modals */}
      <CheckpointFormModal
        isOpen={showCreateModal}
        title="Create Checkpoint"
        checkpoint={newCheckpoint}
        onChange={setNewCheckpoint}
        onSubmit={handleCreateCheckpoint}
        onClose={closeModals}
      />

      <CheckpointFormModal
        isOpen={showEditModal}
        title="Edit Checkpoint"
        checkpoint={newCheckpoint}
        onChange={setNewCheckpoint}
        onSubmit={handleUpdateCheckpoint}
        onClose={closeModals}
      />
    </div>



  );
};

export default MilestonePage;