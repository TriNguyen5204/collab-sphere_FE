import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import MilestoneTimeline from '../../../components/student/milestone/MilestoneTimeline';
import MilestoneHeader from '../../../components/student/milestone/MilestoneHeader';
import CheckpointSummaryCards from '../../../components/student/milestone/CheckpointSummaryCards';
import CheckpointCard from '../../../components/student/milestone/CheckpointCard';
import CheckpointFormModal from '../../../components/student/milestone/CheckpointFormModal';
import { Plus, Folder } from 'lucide-react';
import {
  getAllMilestonesByTeamId,
  getDetailOfMilestoneByMilestoneId,
  patchMarkDoneMilestoneByMilestoneId,
  postCreateCheckpoint,
  postAssignMembersToCheckpoint,
  postUploadCheckpointFilebyCheckpointId,
  deleteCheckpointFileByCheckpointIdAndFileId,
  deleteCheckpointByCheckpointId,
  patchGenerateNewCheckpointFileLinkByCheckpointIdAndFileId,
  patchMarkDoneCheckpointByCheckpointId,
  putUpdateCheckpointByCheckpointId,
  postUploadMilestoneFilebyMilestoneId,
  deleteMilestoneFileByMilestoneIdAndMileReturnId,
  patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId,
} from '../../../services/studentApi';
import { normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const MilestonePage = () => {
  const { teamId } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCheckpoint, setNewCheckpoint] = useState({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
  const [activeTab, setActiveTab] = useState('all');

  const role = useSelector((state) => state.user.roleName);

  const normalizeCheckpointStatus = (statusValue) => {
    if (statusValue === null || statusValue === undefined) return 'PROCESSING';
    if (typeof statusValue === 'number') {
      return statusValue === 1 ? 'COMPLETED' : 'PROCESSING';
    }
    if (typeof statusValue === 'boolean') {
      return statusValue ? 'COMPLETED' : 'PROCESSING';
    }
    const normalized = statusValue.toString().trim().toUpperCase();
    if (['1', 'DONE', 'COMPLETED', 'FINISHED', 'TRUE'].includes(normalized)) return 'COMPLETED';
    if (['0', 'NOT_DONE', 'NOT_STARTED', 'PROCESSING', 'IN_PROGRESS', 'PENDING', 'FALSE', ''].includes(normalized)) return 'PROCESSING';
    return normalized || 'PROCESSING';
  };

  const resolveCheckpointUiStatus = (statusString) => {
    const normalized = (statusString || '').toString().trim().toUpperCase();
    if (['COMPLETED', 'DONE', '1', 'TRUE'].includes(normalized)) return 'completed';
    return 'processing';
  };

  const getCheckpointUiStatus = (checkpoint) => {
    const raw = checkpoint?.uiStatus ?? checkpoint?.statusString ?? checkpoint?.status;
    if (typeof raw === 'string') return raw.toLowerCase();
    return raw === 1 ? 'completed' : 'processing';
  };

  const getMilestoneId = (milestone) => milestone?.teamMilestoneId ?? milestone?.id ?? milestone?.milestoneId ?? null;

  const getDefaultTab = () => 'all';

  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [selectedMilestone]);

  const extractErrorMessages = (error, fallbackMessage) => {
    const data = error?.response?.data;
    if (Array.isArray(data)) {
      const messages = data
        .map((entry) => (typeof entry === 'string' ? entry : entry?.message))
        .filter(Boolean);
      if (messages.length > 0) {
        return messages;
      }
    } else if (data && typeof data === 'object' && data.message) {
      return [data.message];
    } else if (typeof data === 'string') {
      return [data];
    }

    if (error?.message) {
      return [error.message];
    }

    return [fallbackMessage];
  };

  const mergeDetailIntoMilestone = (base, detail) => {
    const questionsRaw = detail?.milestoneQuestions || detail?.questions || [];
    const questions = questionsRaw.map((q) => {
      const rawAnswers = Array.isArray(q.answers || q.answerList)
        ? (q.answers || q.answerList)
        : [];
      const answersArray = rawAnswers.map((a) => ({
        id: a.id ?? a.answerId ?? a.milestoneQuestionAnsId ?? null,
        content: a.content ?? a.answer ?? '',
        answeredBy: a.answeredByName ?? a.answeredBy ?? a.userName ?? a.studentName ?? '',
        answeredAt: a.answeredAt ?? a.createdAt ?? a.createTime ?? '',
      }));
      const answerCount = typeof q.answerCount === 'number' ? q.answerCount : answersArray.length;
      return {
        id: q.id ?? q.questionId ?? q.milestoneQuestionId,
        question: q.content ?? q.text ?? q.question ?? '',
        type: q.type ?? 'text',
        answers: answersArray,
        answerCount,
      };
    });
    const completedAnswers = questions.filter((q) => (q.answerCount ?? q.answers?.length ?? 0) > 0).length;

    const cpRaw = detail?.checkpoints || detail?.checkpointList || [];
    const checkpoints = cpRaw.map((cp) => {
      const submissions = (cp.submissions || cp.attachments || cp.checkpointFiles || []).map((s, idx) => {
        const submissionId = s.fileId ?? s.checkpointFileId ?? s.submissionId ?? s.id ?? idx;
        return {
          id: submissionId,
          fileId: submissionId,
          fileName: s.fileName ?? s.name ?? 'file',
          fileSize: s.fileSize ? `${s.fileSize}` : (s.size ? `${(s.size / (1024 * 1024)).toFixed(2)} MB` : ''),
          fileType: s.fileType ?? (s.fileName ? s.fileName.split('.').pop()?.toLowerCase() : ''),
          url: s.fileUrl ?? s.url ?? s.downloadUrl ?? s.path ?? s.filePath ?? null,
          uploadedBy: s.uploadedByName ?? s.uploadedBy ?? s.userName ?? '',
          uploadedAt: s.uploadedAt ?? s.createdAt ?? '',
        };
      });
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
      const statusRaw = cp.statusString ?? cp.status ?? 0;
      const statusString = normalizeCheckpointStatus(statusRaw);
      const uiStatus = resolveCheckpointUiStatus(statusString);
      const numericStatus = typeof cp.status === 'number' ? cp.status : (statusString === 'COMPLETED' ? 1 : 0);
      return {
        id: cp.id ?? cp.checkpointId,
        title: cp.title ?? cp.name ?? 'Checkpoint',
        description: cp.description ?? '',
        dueDate: cp.dueDate ?? cp.deadline ?? cp.endDate ?? null,
        startDate: cp.startDate ?? null,
        status: numericStatus,
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
      path: r.filePath ?? r.fileUrl ?? r.path ?? '',
      fileUrl: r.fileUrl ?? r.path ?? '',
      fileName: r.fileName ?? r.originalFileName ?? '',
      fileSize: r.fileSize ?? null,
      type: r.type ?? '',
      urlExpireTime: r.urlExpireTime ?? r.expireTime ?? '',
      submittedAt: r.submitedDate ?? r.submittedAt ?? r.createdDate ?? '',
      studentName: r.studentName ?? r.fullname ?? r.fullName ?? '',
      studentCode: r.studentCode ?? '',
      avatarImg: r.avatarImg ?? '',
      student: {
        id: r.studentId ?? null,
        name: r.studentName ?? r.fullname ?? r.fullName ?? '',
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

    const normalizedStatus = normalizeMilestoneStatus(detail?.statusString ?? detail?.status ?? base?.statusString ?? base?.status);
    const requiredAnswers = detail?.milestoneQuestionCount ?? questions.length ?? base?.requiredAnswers ?? base?.milestoneQuestionCount ?? 0;

    return {
      ...base,
      progress: Math.round(detail?.progress ?? base?.progress ?? 0),
      status: normalizedStatus,
      statusString: detail?.statusString ?? base?.statusString ?? normalizedStatus,
      requiredAnswers,
      milestoneQuestionCount: detail?.milestoneQuestionCount ?? base?.milestoneQuestionCount ?? questions.length ?? 0,
      completedAnswers,
      questions,
      checkpoints,
      lecturerFiles,
      returns,
      evaluation,
      dueDate: detail?.dueDate ?? detail?.endDate ?? base?.dueDate ?? base?.endDate ?? null,
      endDate: detail?.endDate ?? base?.endDate ?? base?.dueDate ?? null,
      startDate: detail?.startDate ?? base?.startDate ?? null,
      completedDate: detail?.completedDate ?? base?.completedDate ?? null,
      _hasDetails: true,
    };
  };

  // Fetch milestones list
  const fetchMilestones = async (teamId) => {
    try {
      setIsLoadingList(true);
      const response = await getAllMilestonesByTeamId(teamId);
      const list = Array.isArray(response?.list)
        ? response.list
        : Array.isArray(response)
          ? response
          : (response?.data || []);
      const normalizedList = Array.isArray(list) ? list : [];
      setMilestones(normalizedList);
      if (normalizedList.length > 0) {
        const first = normalizedList[0];
        setSelectedMilestone(first);
        const firstId = getMilestoneId(first);
        if (firstId) {
          fetchMilestoneDetail(firstId);
        }
      } else {
        setSelectedMilestone(null);
      }
    } catch (error) {
      console.error("Error fetching milestones:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchMilestoneDetail = async (milestoneId) => {
    if (!milestoneId) return null;
    let mergedFromList = null;
    let mergedFromSelected = null;
    try {
      setIsLoadingDetail(true);
      const detail = await getDetailOfMilestoneByMilestoneId(milestoneId);
      console.log(detail);
      setMilestones((prev) => prev.map((m) => {
        if (getMilestoneId(m) !== milestoneId) return m;
        const merged = mergeDetailIntoMilestone(m, detail);
        mergedFromList = merged;
        return merged;
      }));
      setSelectedMilestone((prev) => {
        if (!prev) return prev;
        if (getMilestoneId(prev) !== milestoneId) return prev;
        const merged = mergeDetailIntoMilestone(prev, detail);
        mergedFromSelected = merged;
        return merged;
      });
      return mergedFromSelected || mergedFromList;
    } catch (error) {
      console.error("Error fetching milestone detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
    return mergedFromSelected || mergedFromList;
  };

  useEffect(() => {
    if (teamId) {
      fetchMilestones(teamId);
    }
  }, [teamId]);

  const handleCompleteMilestone = async () => {
    if (!selectedMilestone) return;
    const totalRequired = selectedMilestone?.requiredAnswers ?? selectedMilestone?.milestoneQuestionCount ?? 0;
    const completedAns = selectedMilestone?.completedAnswers ?? 0;
    if (completedAns < totalRequired) {
      alert("Please answer all questions before completing the milestone");
      return;
    }

    try {
      const milestoneId = getMilestoneId(selectedMilestone);
      if (!milestoneId) return;
      await patchMarkDoneMilestoneByMilestoneId(milestoneId, true);
      const updatedMilestones = milestones.map(milestone => {
        if (getMilestoneId(milestone) === milestoneId) {
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
      setSelectedMilestone(updatedMilestones.find(m => getMilestoneId(m) === milestoneId));
    } catch (error) {
      const msg = error?.response?.data?.message || 'Only leader can mark milestone as done';
      alert(msg);
    }
  };

  const handleQuestionAnswered = async () => {
    if (!selectedMilestone) return;
    const milestoneId = getMilestoneId(selectedMilestone);
    if (!milestoneId) return;
    await fetchMilestoneDetail(milestoneId);
  };

  const selectedCheckpoints = useMemo(() => selectedMilestone?.checkpoints || [], [selectedMilestone]);

  const checkpointGroups = useMemo(() => {
    const groups = { all: [], processing: [], completed: [] };
    const toDate = (d) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);

    (selectedCheckpoints || []).forEach((cp) => {
      const statusKey = getCheckpointUiStatus(cp) === 'completed' ? 'completed' : 'processing';
      groups.all.push(cp);
      groups[statusKey].push(cp);
    });

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].slice().sort((a, b) => toDate(a.dueDate) - toDate(b.dueDate));
    });

    return groups;
  }, [selectedCheckpoints]);

  const checkpointProgress = useMemo(() => {
    const total = selectedCheckpoints.length;
    const completed = selectedCheckpoints.filter((cp) => getCheckpointUiStatus(cp) === 'completed').length;
    return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
  }, [selectedCheckpoints]);

  const handleCreateCheckpoint = async () => {
    if (!selectedMilestone) return;
    if (!newCheckpoint.title || !newCheckpoint.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const milestoneId = getMilestoneId(selectedMilestone);
      if (!milestoneId) return;
      await postCreateCheckpoint(
        milestoneId,
        newCheckpoint.title,
        newCheckpoint.description || '',
        (newCheckpoint.complexity || 'LOW').toUpperCase(),
        newCheckpoint.startDate || null,
        newCheckpoint.dueDate,
      );

      //refresh details
      await fetchMilestoneDetail(milestoneId);
      setNewCheckpoint({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
      setShowCreateModal(false);
      setActiveTab('all');
    } catch (error) {
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

  const handleUpdateCheckpoint = async (checkpointId, payload = {}) => {
    if (!checkpointId) {
      toast.error('Unable to update checkpoint: missing identifier');
      return;
    }

    const fallbackMilestoneId = getMilestoneId(selectedMilestone);
    const finalPayload = {
      ...payload,
      teamMilestoneId: payload?.teamMilestoneId ?? fallbackMilestoneId,
      title: (payload?.title ?? '').trim(),
      description: (payload?.description ?? '').trim(),
      complexity: (payload?.complexity ?? 'LOW').toString().toUpperCase(),
      startDate: payload?.startDate || null,
      dueDate: payload?.dueDate ?? '',
    };

    if (!finalPayload.teamMilestoneId) {
      toast.error('Unable to update checkpoint: missing team milestone reference');
      return;
    }

    if (!finalPayload.title) {
      toast.error('Checkpoint title is required');
      return;
    }

    if (!finalPayload.dueDate) {
      toast.error('Checkpoint due date is required');
      return;
    }

    try {
      await putUpdateCheckpointByCheckpointId(checkpointId, finalPayload);
      toast.success('Checkpoint updated');

      const milestoneId = finalPayload.teamMilestoneId;
      if (milestoneId) {
        await fetchMilestoneDetail(milestoneId);
      }
    } catch (error) {
      const messages = extractErrorMessages(error, 'Failed to update checkpoint');
      if (messages.length > 0) {
        messages.forEach((message) => toast.error(message));
      }
      const combinedMessage = messages.join('\n');
      const wrappedError = new Error(combinedMessage || 'Failed to update checkpoint');
      wrappedError.response = error?.response;
      throw wrappedError;
    }
  };

  const handleDeleteCheckpoint = async (checkpointId) => {
    if (!checkpointId) {
      toast.error('Unable to delete checkpoint: missing identifier');
      return;
    }

    const milestoneId = getMilestoneId(selectedMilestone);

    try {
      await deleteCheckpointByCheckpointId(checkpointId);
      toast.success('Checkpoint deleted');

      setMilestones((prev) =>
        prev.map((milestone) => {
          if (getMilestoneId(milestone) !== milestoneId) {
            return milestone;
          }
          const filtered = (milestone.checkpoints || []).filter((cp) => cp.id !== checkpointId);
          return { ...milestone, checkpoints: filtered };
        })
      );

      setSelectedMilestone((prev) => {
        if (!prev) {
          return prev;
        }
        if (getMilestoneId(prev) !== milestoneId) {
          return prev;
        }
        const filtered = (prev.checkpoints || []).filter((cp) => cp.id !== checkpointId);
        return { ...prev, checkpoints: filtered };
      });

      if (milestoneId) {
        await fetchMilestoneDetail(milestoneId);
      }
    } catch (error) {
      const messages = extractErrorMessages(error, 'Failed to delete checkpoint');
      if (messages.length > 0) {
        messages.forEach((message) => toast.error(message));
      }
      const combinedMessage = messages.join('\n');
      const wrappedError = new Error(combinedMessage || 'Failed to delete checkpoint');
      wrappedError.response = error?.response;
      throw wrappedError;
    }
  };

  const handleUploadMilestoneReturns = async (files = []) => {
    if (!selectedMilestone) return;
    if (!Array.isArray(files) || files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    const milestoneId = getMilestoneId(selectedMilestone);
    if (!milestoneId) {
      toast.error('Unable to upload files: missing milestone reference');
      return;
    }

    const formData = new FormData();
    let appended = false;
    files.forEach((file) => {
      if (file != null) {
        formData.append('formFile', file);
        appended = true;
      }
    });

    if (!appended) {
      toast.error('Files could not be prepared for upload');
      return;
    }

    try {
      await postUploadMilestoneFilebyMilestoneId(milestoneId, formData);
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
      await fetchMilestoneDetail(milestoneId);
      return true;
    } catch (error) {
      const responseData = error?.response?.data;
      let message = error?.message ?? 'Failed to upload milestone submissions';
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData && typeof responseData === 'object' && responseData.message) {
        message = responseData.message;
      }
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteMilestoneReturn = async (mileReturnId) => {
    if (!selectedMilestone) return;
    if (mileReturnId == null) {
      toast.error('Unable to delete submission: missing identifier');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this submission?');
    if (!confirmed) {
      return;
    }

    const milestoneId = getMilestoneId(selectedMilestone);
    if (!milestoneId) {
      toast.error('Unable to delete submission: missing milestone reference');
      return;
    }

    try {
      await deleteMilestoneFileByMilestoneIdAndMileReturnId(milestoneId, mileReturnId);
      toast.success('Submission deleted');
      await fetchMilestoneDetail(milestoneId);
      return true;
    } catch (error) {
      const responseData = error?.response?.data;
      let message = error?.message ?? 'Failed to delete submission';
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData && typeof responseData === 'object' && responseData.message) {
        message = responseData.message;
      }
      toast.error(message);
      throw error;
    }
  };

  const handleRegenerateMilestoneReturnLink = async (mileReturnId) => {
    if (!selectedMilestone) return;
    if (mileReturnId == null) {
      toast.error('Unable to refresh link: missing submission identifier');
      return;
    }

    const milestoneId = getMilestoneId(selectedMilestone);
    if (!milestoneId) {
      toast.error('Unable to refresh link: missing milestone reference');
      return;
    }

    try {
      await patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId(milestoneId, mileReturnId);
      toast.success('A new download link has been generated');
      const updated = await fetchMilestoneDetail(milestoneId);
      const refreshed = updated?.returns?.find((item) => item.id === mileReturnId);
      return refreshed?.url || refreshed?.path || '';
    } catch (error) {
      const responseData = error?.response?.data;
      let message = error?.message ?? 'Failed to refresh link';
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (responseData && typeof responseData === 'object' && responseData.message) {
        message = responseData.message;
      }
      toast.error(message);
      throw error;
    }
  };

  const handleUploadCheckpointFiles = async (checkpointId, files = []) => {
    if (!selectedMilestone || !checkpointId) return;
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

  const formData = new FormData();
  files.forEach((file) => formData.append('checkpointFile', file));

    try {
      await postUploadCheckpointFilebyCheckpointId(checkpointId, formData);
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
      const milestoneId = getMilestoneId(selectedMilestone);
      if (milestoneId) {
        await fetchMilestoneDetail(milestoneId);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to upload checkpoint files';
      toast.error(message);
    }
  };

  const handleDeleteSubmission = async (checkpointId, submissionId) => {
    if (!selectedMilestone) return;

    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    try {
      await deleteCheckpointFileByCheckpointIdAndFileId(checkpointId, submissionId);
      toast.success('Submission deleted');
      const milestoneId = getMilestoneId(selectedMilestone);
      if (milestoneId) {
        await fetchMilestoneDetail(milestoneId);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete file';
      toast.error(message);
    }
  };

  const handleRegenerateCheckpointFileLink = async (checkpointId, fileId) => {
    if (!selectedMilestone) return;
    if (!checkpointId || !fileId) return;

    try {
      await patchGenerateNewCheckpointFileLinkByCheckpointIdAndFileId(checkpointId, fileId);
      toast.success('A new download link has been generated');
      const milestoneId = getMilestoneId(selectedMilestone);
      if (milestoneId) {
        await fetchMilestoneDetail(milestoneId);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to refresh file link';
      toast.error(message);
    }
  };

  const handleMarkComplete = async (checkpointId) => {
    if (!selectedMilestone) return;

    const cp = selectedCheckpoints.find(c => c.id === checkpointId);
    if (!cp) return;

    const assignmentsCount = Array.isArray(cp.assignments) ? cp.assignments.length : 0;
    if (assignmentsCount === 0) {
      toast.error('Please assign at least one member before marking this checkpoint as complete');
      return;
    }

    try {
      await patchMarkDoneCheckpointByCheckpointId(checkpointId, true);
      toast.success('Checkpoint marked as complete');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to mark checkpoint as complete';
      toast.error(message);
      return;
    }

    const completedStatusString = 'COMPLETED';
    const completedUiStatus = resolveCheckpointUiStatus(completedStatusString);

    const updated = milestones.map(m => {
      if (getMilestoneId(m) !== getMilestoneId(selectedMilestone)) return m;
      const cps = (m.checkpoints || []).map(c =>
        c.id === checkpointId
          ? {
            ...c,
            uiStatus: completedUiStatus,
            statusString: completedStatusString,
            status: 1,
          }
          : c
      );
      return { ...m, checkpoints: cps };
    });
    setMilestones(updated);
    setSelectedMilestone(updated.find(m => getMilestoneId(m) === getMilestoneId(selectedMilestone)));

    const milestoneId = getMilestoneId(selectedMilestone);
    if (milestoneId) {
      await fetchMilestoneDetail(milestoneId);
    }
  };

  const openAssignModal = async (checkpointId, classMemberIds = []) => {
    if (!checkpointId) {
      toast.error('Unable to assign members: missing checkpoint');
      return;
    }

    const memberIds = Array.isArray(classMemberIds) ? classMemberIds : [];

    try {
      const response = await postAssignMembersToCheckpoint(checkpointId, memberIds);
      toast.success('Assignments updated');

      const milestoneId = getMilestoneId(selectedMilestone);
      if (milestoneId) {
        await fetchMilestoneDetail(milestoneId);
      }

      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to assign members to checkpoint';
      toast.error(message);
      console.error('Error assigning members to checkpoint:', error);
      throw error;
    }
  };


  const resetCheckpointUI = () => {
    setShowCreateModal(false);
    setNewCheckpoint({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
  };

  const closeModals = () => {
    resetCheckpointUI();
  };

  const handleSelectMilestone = (m) => {
    resetCheckpointUI();
    setSelectedMilestone(m);
    setActiveTab(getDefaultTab(m?.checkpoints || []));
    const milestoneId = getMilestoneId(m);
    if (!m?._hasDetails && milestoneId) {
      fetchMilestoneDetail(milestoneId);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />

      <main className="p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Sidebar - Milestone Timeline */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
              {isLoadingList && milestones.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[220px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              ) : (
                <MilestoneTimeline
                  milestones={milestones}
                  selectedMilestone={selectedMilestone}
                  onSelectMilestone={handleSelectMilestone}
                />
              )}
            </div>
          </div>

          {/* Main Content - Milestone Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedMilestone ? (
              isLoadingDetail ? (
                <div className="bg-white rounded-lg shadow-md p-10 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              ) : (
                <MilestoneHeader
                  milestone={selectedMilestone}
                  readOnly={false}
                  onComplete={handleCompleteMilestone}
                  onUploadMilestoneFiles={handleUploadMilestoneReturns}
                  onDeleteMilestoneReturn={handleDeleteMilestoneReturn}
                  onRefreshMilestoneReturnLink={handleRegenerateMilestoneReturnLink}
                  onAnswerSubmitted={handleQuestionAnswered}
                />
              )
            ) : (
              <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-600">
                There are no milestones available yet.
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
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  <Plus size={18} />
                  Create Checkpoint
                </button>
              </div>

              {isLoadingDetail ? (
                <div className="flex justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              ) : (
                <CheckpointSummaryCards checkpoints={selectedCheckpoints} />
              )}

              <div className="space-y-4">
                {/* Folder Tabs */}
                <div className="flex items-center gap-3 border-b">
                  {[
                    { key: 'all', label: 'All', count: checkpointGroups.all.length, badge: 'bg-gray-100 text-gray-700' },
                    { key: 'processing', label: 'Processing', count: checkpointGroups.processing.length, badge: 'bg-blue-50 text-blue-700' },
                    { key: 'completed', label: 'Completed', count: checkpointGroups.completed.length, badge: 'bg-green-50 text-green-700' }
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
                    <div className="flex justify-center py-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    </div>
                  ) : (
                    (checkpointGroups[activeTab] || []).map((checkpoint) => {
                      const isCheckpointCompleted = getCheckpointUiStatus(checkpoint) === 'completed';
                      return (
                        <CheckpointCard
                          key={checkpoint.id}
                          checkpoint={checkpoint}
                          readOnly={isCheckpointCompleted}
                          onEdit={(cpId, payload) => !isCheckpointCompleted && handleUpdateCheckpoint(cpId, payload)}
                          onDelete={(id) => !isCheckpointCompleted && handleDeleteCheckpoint(id)}
                          onUploadFiles={(id, files) => !isCheckpointCompleted && handleUploadCheckpointFiles(id, files)}
                          onMarkComplete={(id) => !isCheckpointCompleted && handleMarkComplete(id)}
                          onDeleteSubmission={(cpId, subId) => !isCheckpointCompleted && handleDeleteSubmission(cpId, subId)}
                          onAssign={(cpId, memberIds) => openAssignModal(cpId, memberIds)}
                          onGenerateFileLink={(cpId, fileId) => handleRegenerateCheckpointFileLink(cpId, fileId)}
                        />
                      );
                    })
                  )}
                </div>

                {!isLoadingDetail && (checkpointGroups[activeTab] || []).length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600">
                    Don't have any checkpoints yet.
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
    </div>



  );
};

export default MilestonePage;