import React, { useEffect, useMemo, useState } from 'react';
import ProjectBoardHeader from '../../../components/layout/ProjectBoardHeader';
import MilestoneTimeline from '../../../features/student/components/milestone/MilestoneTimeline';
import MilestoneHeader from '../../../features/student/components/milestone/MilestoneHeader';
import CheckpointSummaryCards from '../../../features/student/components/milestone/CheckpointSummaryCards';
import CheckpointCard from '../../../features/student/components/milestone/CheckpointCard';
import CheckpointFormModal from '../../../features/student/components/milestone/CheckpointFormModal';
import MilestoneUpdateModal from '../../../features/student/components/milestone/MilestoneUpdateModal';
import { Plus, Folder } from 'lucide-react';
import {
  getAllMilestonesByTeamId,
  getDetailOfMilestoneByMilestoneId,
  getDetailOfCheckpointByCheckpointId,
  patchMarkDoneMilestoneByMilestoneId,
  postCreateCheckpoint,
  postAssignMembersToCheckpoint,
  postUploadCheckpointFilebyCheckpointId,
  deleteCheckpointFileByCheckpointIdAndFileId,
  deleteCheckpointByCheckpointId,
  patchMarkDoneCheckpointByCheckpointId,
  putUpdateCheckpointByCheckpointId,
  postUploadMilestoneFilebyMilestoneId,
  deleteMilestoneFileByMilestoneIdAndMileReturnId,
  deleteTeamMilestoneById,
} from '../../../services/studentApi';
import { normalizeMilestoneStatus } from '../../../utils/milestoneHelpers';
import { toast } from 'sonner';
import useTeam from '../../../context/useTeam';

const MilestonePage = () => {
  const [milestones, setMilestones] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [milestoneToUpdate, setMilestoneToUpdate] = useState(null);
  const [newCheckpoint, setNewCheckpoint] = useState({ title: '', description: '', startDate: '', dueDate: '', complexity: 'LOW' });
  const [activeTab, setActiveTab] = useState('all');
  const { team } = useTeam();
  const teamId = team?.teamId ?? null;

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

  const getCheckpointId = (checkpoint) => checkpoint?.id ?? checkpoint?.checkpointId ?? checkpoint?.checkpointID ?? checkpoint?.teamCheckpointId ?? null;

  const mapCheckpointAssignments = (rawAssignments = []) =>
    rawAssignments
      .map((assignment) => ({
        id: assignment?.checkpointAssignmentId ?? assignment?.id,
        checkpointId: assignment?.checkpointId ?? assignment?.checkpointID ?? assignment?.id,
        classMemberId: assignment?.classMemberId ?? assignment?.classMemberID ?? null,
        studentId: assignment?.studentId ?? null,
        fullname: assignment?.fullname ?? assignment?.fullName ?? assignment?.studentName ?? assignment?.name ?? '',
        studentCode: assignment?.studentCode ?? '',
        avatarImg: assignment?.avatarImg ?? assignment?.avatar ?? null,
        teamRole: assignment?.teamRole ?? null,
        teamRoleString: assignment?.teamRoleString ?? assignment?.teamRoleLabel ?? '',
      }))
      .filter((assignment) => assignment.classMemberId != null);

  const mapCheckpointSubmissions = (rawSubmissions = []) =>
    rawSubmissions.map((submission, index) => {
      const submissionId = submission?.fileId ?? submission?.checkpointFileId ?? submission?.submissionId ?? submission?.id ?? index;
      const resolveFileSize = () => {
        if (submission?.fileSize != null) {
          return `${submission.fileSize}`;
        }
        if (submission?.size != null) {
          return `${(submission.size / (1024 * 1024)).toFixed(2)} MB`;
        }
        return '';
      };
      return {
        id: submissionId,
        fileId: submissionId,
        fileName: submission?.fileName ?? submission?.name ?? 'file',
        originalFileName: submission?.originalFileName ?? submission?.fileName ?? submission?.name ?? 'file',
        fileSize: resolveFileSize(),
        fileType: submission?.fileType ?? (submission?.fileName ? submission.fileName.split('.').pop()?.toLowerCase() : ''),
        url: submission?.fileUrl ?? submission?.url ?? submission?.downloadUrl ?? submission?.path ?? submission?.filePath ?? null,
        uploadedBy: submission?.uploadedByName ?? submission?.uploadedBy ?? submission?.userName ?? submission?.createdBy ?? '',
        uploadedAt: submission?.uploadedAt ?? submission?.createdAt ?? submission?.submittedAt ?? submission?.createdDate ?? '',
        avatar: submission?.avatar ?? submission?.avatarImg ?? submission?.uploadedByAvatar ?? submission?.studentAvatar ?? null,
        studentName: submission?.studentName ?? submission?.uploadedByName ?? submission?.uploadedBy ?? submission?.userName ?? '',
        raw: submission,
      };
    });

  const transformCheckpointFromApi = (checkpoint) => {
    if (!checkpoint) return null;
    const checkpointId = getCheckpointId(checkpoint);
    if (checkpointId == null) return null;

    const assignments = mapCheckpointAssignments(
      checkpoint.checkpointAssignments || checkpoint.assignments || []
    );
    const submissions = mapCheckpointSubmissions(
      checkpoint.checkpointFiles || checkpoint.submissions || checkpoint.attachments || []
    );
    const statusRaw = checkpoint.statusString ?? checkpoint.status ?? 0;
    const statusString = normalizeCheckpointStatus(statusRaw);
    const uiStatus = resolveCheckpointUiStatus(statusString);
    const numericStatus = typeof checkpoint.status === 'number'
      ? checkpoint.status
      : (statusString === 'COMPLETED' ? 1 : 0);

    return {
      id: checkpointId,
      checkpointId,
      title: checkpoint.title ?? checkpoint.name ?? 'Checkpoint',
      description: checkpoint.description ?? '',
      dueDate: checkpoint.dueDate ?? checkpoint.deadline ?? checkpoint.endDate ?? null,
      startDate: checkpoint.startDate ?? checkpoint.beginDate ?? null,
      status: numericStatus,
      statusString,
      uiStatus,
      complexity: (checkpoint.complexity ?? 'LOW').toString().toUpperCase(),
      assignments,
      checkpointAssignments: assignments,
      submissions,
      checkpointFiles: submissions,
      createdAt: checkpoint.createdAt ?? '',
      updatedAt: checkpoint.updatedAt ?? checkpoint.modifiedAt ?? checkpoint.lastModified ?? null,
      comments: checkpoint.comments ?? '',
      hasFullDetail: true,
      refreshKey: Date.now(),
      teamMilestoneId: checkpoint.teamMilestoneId ?? checkpoint.teamMilestoneID ?? checkpoint.milestoneId ?? null,
    };
  };

  const getMilestoneId = (milestone) => milestone?.teamMilestoneId ?? milestone?.id ?? milestone?.milestoneId ?? null;

  const getDefaultTab = () => 'all';

  const updateCheckpointWithinMilestone = (targetMilestoneId, checkpointId, transformFn) => {
    if (!targetMilestoneId || !checkpointId || typeof transformFn !== 'function') {
      return;
    }

    const applyUpdate = (checkpoints = []) => {
      let wasUpdated = false;
      const mapped = checkpoints.map((cp) => {
        if (getCheckpointId(cp) !== checkpointId) {
          return cp;
        }
        wasUpdated = true;
        return transformFn(cp ?? {});
      });

      if (wasUpdated) {
        return mapped;
      }

      const appended = transformFn({ id: checkpointId });
      return appended ? [...mapped, appended] : mapped;
    };

    setMilestones((prev) =>
      prev.map((milestone) => {
        if (getMilestoneId(milestone) !== targetMilestoneId) {
          return milestone;
        }
        const checkpoints = applyUpdate(milestone.checkpoints || []);
        return { ...milestone, checkpoints };
      })
    );

    setSelectedMilestone((prev) => {
      if (!prev || getMilestoneId(prev) !== targetMilestoneId) {
        return prev;
      }
      const checkpoints = applyUpdate(prev.checkpoints || []);
      return { ...prev, checkpoints };
    });
  };

  const refreshCheckpointDetail = async (checkpointId, milestoneIdOverride = null) => {
    const targetMilestoneId = milestoneIdOverride ?? getMilestoneId(selectedMilestone);
    if (!checkpointId || !targetMilestoneId) {
      return null;
    }

    try {
      const detail = await getDetailOfCheckpointByCheckpointId(checkpointId);
      const normalized = transformCheckpointFromApi(detail);
      if (normalized?.id == null) {
        return detail;
      }

      updateCheckpointWithinMilestone(targetMilestoneId, normalized.id, (existing = {}) => ({
        ...existing,
        ...normalized,
      }));

      return detail;
    } catch (error) {
      console.error('Failed to refresh checkpoint detail:', error);
      throw error;
    }
  };

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
    const checkpoints = cpRaw
      .map((cp) => transformCheckpointFromApi(cp))
      .filter(Boolean);

    const lecturerFilesRaw = detail?.milestoneFiles || [];
    const lecturerFiles = lecturerFilesRaw.map((f, idx) => ({
      id: f.fileId ?? idx,
      name: f.fileName ?? f.name ?? f.type ?? 'File',
      owner: f?.userName ?? 'Lecturer',
      ownerAvatar: f?.avatarImg ?? null,
      createAt: f?.createdAt ?? '',
      fileSize: f?.fileSize ?? null,
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
      title: detail?.title ?? base?.title ?? 'Milestone',
      description: detail?.description ?? base?.description ?? 'Milestone Description',
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
  const fetchMilestones = async (teamId, keepSelection = false) => {
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
        let milestoneToSelect = normalizedList[0];
        
        if (keepSelection && selectedMilestone) {
            const currentId = getMilestoneId(selectedMilestone);
            const found = normalizedList.find(m => getMilestoneId(m) === currentId);
            if (found) {
                milestoneToSelect = found;
            }
        }

        const mId = getMilestoneId(milestoneToSelect);
        setSelectedMilestone(milestoneToSelect);
        if (mId) {
          await fetchMilestoneDetail(mId, milestoneToSelect);
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

  // Fetch milestone detail
  const fetchMilestoneDetail = async (milestoneId, overrideBase = null) => {
    if (!milestoneId) return null;

    try {
      setIsLoadingDetail(true);
      const detail = await getDetailOfMilestoneByMilestoneId(milestoneId);

      let baseMilestone = null;
      if (overrideBase) {
        baseMilestone = overrideBase;
      } else {
        baseMilestone = milestones.find(m => getMilestoneId(m) === milestoneId);
      }

      if (!baseMilestone && selectedMilestone && getMilestoneId(selectedMilestone) === milestoneId) {
        baseMilestone = selectedMilestone;
      }
      const calculatedSelected = mergeDetailIntoMilestone(baseMilestone || {}, detail);

      console.log('Fetched milestone detail:', detail);
      console.log('Calculated selected milestone:', calculatedSelected);
      setSelectedMilestone(calculatedSelected);

      setMilestones((prev) => prev.map((m) => {
        if (getMilestoneId(m) !== milestoneId) return m;
        return mergeDetailIntoMilestone(m, detail);
      }));

      return calculatedSelected;

    } catch (error) {
      console.error("Error fetching milestone detail:", error);
      return null;
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchMilestones(teamId);
    }
  }, [teamId]);

  const handleMilestoneUpdated = async () => {
    if (teamId) {
      await fetchMilestones(teamId, true);
    }
  };

  const handleOpenUpdateModal = (milestone) => {
    setMilestoneToUpdate(milestone);
    setShowUpdateModal(true);
  };

  const handleDeleteMilestone = async (milestone) => {
    const milestoneId = getMilestoneId(milestone);
    if (!milestoneId) return;

    if (window.confirm(`Are you sure you want to delete milestone '${milestone.title}'?`)) {
      try {
        await deleteTeamMilestoneById(milestoneId);
        toast.success(`Deleted successfully team milestone '${milestone.title}' (${milestoneId})`);
        
        // Refresh list
        if (teamId) {
            fetchMilestones(teamId);
        }
      } catch (error) {
        console.error('Failed to delete milestone:', error);
        toast.error('Failed to delete milestone');
      }
    }
  };

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
      const normalizedCompleteStatus = normalizeMilestoneStatus('completed');
      const completionTimestamp = new Date().toISOString();
      const updatedMilestones = milestones.map(milestone => {
        if (getMilestoneId(milestone) === milestoneId) {
          return {
            ...milestone,
            status: normalizedCompleteStatus,
            statusString: normalizedCompleteStatus,
            completedDate: completionTimestamp,
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

  const isSelectedMilestoneCompleted = normalizeMilestoneStatus(selectedMilestone?.status ?? selectedMilestone?.statusString) === 'Completed';

  const handleCreateCheckpoint = async () => {
    if (!selectedMilestone) return;
    const isMilestoneCompleted = normalizeMilestoneStatus(selectedMilestone?.status ?? selectedMilestone?.statusString) === 'Completed';
    if (isMilestoneCompleted) {
      toast.error('Cannot create checkpoints for a completed milestone');
      return;
    }
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
      const detail = await refreshCheckpointDetail(checkpointId, finalPayload.teamMilestoneId);
      return detail;
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
      toast.error(error?.response?.data?.errorList?.[0]?.message || 'Failed to upload files');
      throw error;
    }
  };

  const handleDeleteMilestoneReturn = async (mileReturnId) => {
    if (!selectedMilestone) return;
    if (mileReturnId == null) {
      toast.error('Unable to delete submission: missing identifier');
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
      toast.error(error?.response?.data?.errorList?.[0]?.message || 'Failed to delete submission');
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
      const detail = await refreshCheckpointDetail(checkpointId);
      return detail;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to upload checkpoint files';
      toast.error(message);
    }
  };

  const handleDeleteSubmission = async (checkpointId, submissionId) => {
    if (!selectedMilestone) return;
    try {
      await deleteCheckpointFileByCheckpointIdAndFileId(checkpointId, submissionId);
      toast.success('Submission deleted');
      const detail = await refreshCheckpointDetail(checkpointId);
      return detail;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete file';
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
    const detail = await refreshCheckpointDetail(checkpointId, milestoneId);
    return detail;
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
      const detail = await refreshCheckpointDetail(checkpointId, milestoneId);
      return detail ?? response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to assign members to checkpoint';
      toast.error(message);
      console.error('Error assigning members to checkpoint:', error);
      return null;
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#D5DADF" }}>
      <ProjectBoardHeader />
      <div className="flex-1 grid grid-cols-7 gap-6 p-6 overflow-hidden">
        {/* Left Sidebar - Milestone Timeline */}
        <aside className="col-span-2 h-full overflow-y-auto custom-scrollbar">
          {isLoadingList && milestones.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[220px]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          ) : (
            <MilestoneTimeline
              milestones={milestones}
              selectedMilestone={selectedMilestone}
              onSelectMilestone={handleSelectMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onUpdateMilestone={handleOpenUpdateModal}
            />
          )}
        </aside>
        {/* Main Content - Milestone Details */}
        <main className="col-span-5 h-full overflow-y-auto pb-5 custom-scrollbar space-y-6">
          {selectedMilestone ? (
            isLoadingDetail ? (
              <div className="bg-white rounded-lg shadow-md p-10 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            ) : (
              <MilestoneHeader
                milestone={selectedMilestone}
                readOnly={isSelectedMilestoneCompleted}
                onComplete={handleCompleteMilestone}
                onUploadMilestoneFiles={handleUploadMilestoneReturns}
                onDeleteMilestoneReturn={handleDeleteMilestoneReturn}
                onAnswerSubmitted={handleQuestionAnswered}
                onUpdateClick={() => handleOpenUpdateModal(selectedMilestone)}
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
                <h3 className="text-2xl font-semibold text-gray-800">Checkpoints</h3>
                <span className="text-sm text-gray-600">{checkpointProgress.completed}/{checkpointProgress.total} completed ({checkpointProgress.percent}%)</span>
              </div>
              <button
                onClick={() => {
                  if (!isSelectedMilestoneCompleted) {
                    setShowCreateModal(true);
                  }
                }}
                disabled={isSelectedMilestoneCompleted}
                title={isSelectedMilestoneCompleted ? 'This milestone is completed. Create checkpoint is disabled.' : undefined}
                className="flex items-center gap-2 px-3 py-2 bg-orangeFpt-500 text-white rounded-lg hover:bg-orangeFpt-600 transition disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
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
                    className={`flex items-center gap-2 px-3 py-2 -mb-px border-b-2 ${activeTab === tab.key ? 'border-orangeFpt-500' : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <Folder size={18} className={activeTab === tab.key ? 'text-orangeFpt-500' : 'text-gray-600'} />
                    <span className={`text-sm font-medium ${activeTab === tab.key ? 'text-orangeFpt-500' : 'text-gray-700'}`}>{tab.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tab.badge}`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              <div>
                {isLoadingDetail ? (
                  <div className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                ) : (
                  (checkpointGroups[activeTab] || []).map((checkpoint) => {
                    const isCheckpointCompleted = getCheckpointUiStatus(checkpoint) === 'completed';
                    const checkpointReadOnly = isCheckpointCompleted || isSelectedMilestoneCompleted;
                    return (
                      <CheckpointCard
                        key={checkpoint.id}
                        checkpoint={checkpoint}
                        readOnly={checkpointReadOnly}
                        onEdit={(cpId, payload) => checkpointReadOnly ? null : handleUpdateCheckpoint(cpId, payload)}
                        onDelete={(id) => checkpointReadOnly ? null : handleDeleteCheckpoint(id)}
                        onUploadFiles={(id, files) => checkpointReadOnly ? null : handleUploadCheckpointFiles(id, files)}
                        onMarkComplete={(id) => checkpointReadOnly ? null : handleMarkComplete(id)}
                        onDeleteSubmission={(cpId, subId) => checkpointReadOnly ? null : handleDeleteSubmission(cpId, subId)}
                        onAssign={(cpId, memberIds) => checkpointReadOnly ? null : openAssignModal(cpId, memberIds)}
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
        </main>
      </div>
      {/* Checkpoint Modals */}
      <CheckpointFormModal
        isOpen={showCreateModal}
        title="Create Checkpoint"
        checkpoint={newCheckpoint}
        onChange={setNewCheckpoint}
        onSubmit={handleCreateCheckpoint}
        onClose={closeModals}
      />
      <MilestoneUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        milestone={milestoneToUpdate}
        onUpdateSuccess={handleMilestoneUpdated}
      />
    </div>
  );
};

export default MilestonePage;
