import apiClient from './apiClient';
import { getTeamDetail } from './teamApi';
import { getMilestonesByTeam, getMilestoneDetail } from './milestoneApi';

// Student-specific API 

// Class API (Student-flow)
export const getClassesByStudentId = async (studentId) => {
  try {
    const response = await apiClient.get(`/class/student/${studentId}`);
    const data = response.data;
    return data?.list ?? [];
  } catch (error) {
    console.error('Error fetching classes by student id:', error);
    throw error;
  }
};

export const getClassDetailsById = async (classId) => {
  try {
    const response = await apiClient.get(`/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching class details for class ID ${classId}:`,
      error
    );
    throw error;
  }
};

// Team and Project API (Student-flow)
export const getListOfTeamsByStudentId = async (studentId) => {
  try {
    const response = await apiClient.get(`/team/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching teams for student ID ${studentId}:`, error);
    throw error;
  }
};

export const getDetailOfProjectByProjectId = async (projectId) => {
  try {
    const response = await apiClient.get(`/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching project details for project ID ${projectId}:`,
      error
    );
    throw error;
  }
};

export const getDetailOfTeamByTeamId = async (teamId) => {
  try {
    return await getTeamDetail(teamId);
  } catch (error) {
    console.error(`Error fetching team details for team ID ${teamId}:`, error);
    throw error;
  }
};

export const putUpdateTeamByTeamId = async (teamId, payload) => {
  try {
    const response = await apiClient.put(`/team/${teamId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating team for team ID ${teamId}:`, error);
    throw error;
  }
};

export const postAvatarOfTeam = async (formData) => {
  try {
    const response = await apiClient.post(`/team/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading avatar for team:', error);
    throw error;
  }
};

export const getAssignedTeamByClassId = async (classId) => {
  try {
    const response = await apiClient.get(`/team/student/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching assigned team for class ID ${classId}:`, error);
    throw error;
  }
};

// User API (Student-flow)
export const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/user/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for user ID ${userId}:`, error);
    throw error;
  }
};

export const getAvatarByPublicId = async (publicId) => {
  try {
    const response = await apiClient.get(`/avatar/avatar-url?publicId=${publicId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching avatar for public ID ${publicId}:`, error);
    throw error;
  }
};

export const putUpdateUserProfile = async (userId, payload) => {
  try {
    console.log('Updating user profile with payload:', payload);
    const response = await apiClient.put(`/user/profile/${userId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating profile for user ID ${userId}:`, error);
    throw error;
  }
};

export const postUploadUserAvatar = async (formData) => {
  try {
    console.log('Uploading user avatar with formData:', formData);
    const response = await apiClient.post(`/user/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading user avatar:', error);
    throw error;
  }
};

// Checkpoint API (Student-flow)
export const getDetailOfCheckpointByCheckpointId = async (checkpointId) => {
  try {
    const response = await apiClient.get(`/checkpoint/${checkpointId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching checkpoint details for checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

export const postCreateCheckpoint = async (teamMilestoneId, title, description, complexity, startDate, dueDate) => {
  try {
    console.log(teamMilestoneId, title, description, complexity, startDate, dueDate);
    const response = await apiClient.post(`/checkpoint`, {
      teamMilestoneId,
      title,
      description,
      complexity,
      startDate,
      dueDate,
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating checkpoint for team milestone ID ${teamMilestoneId}:`, error);
    throw error;
  }
};

export const postUploadCheckpointFilebyCheckpointId = async (checkpointId, formData) => {
  try {
    const response = await apiClient.post(`/checkpoint/${checkpointId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading file for checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

export const deleteCheckpointFileByCheckpointIdAndFileId = async (checkpointId, fileId) => {
  try {
    const response = await apiClient.delete(`/checkpoint/${checkpointId}/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting file for checkpoint ID ${checkpointId} and file ID ${fileId}:`, error);
    throw error;
  }
};

export const patchGenerateNewCheckpointFileLinkByCheckpointIdAndFileId = async (checkpointId, fileId) => {
  try {
    const response = await apiClient.patch(`/checkpoint/${checkpointId}/files/${fileId}/new-url`);
    return response.data;
  } catch (error) {
    console.error(`Error regenerating file link for checkpoint ID ${checkpointId} and file ID ${fileId}:`, error);
    throw error;
  }
};

export const patchMarkDoneCheckpointByCheckpointId = async (checkpointId, isDone = true) => {
  try {
    const response = await apiClient.patch(`/checkpoint/${checkpointId}/status`, { isDone });
    return response.data;
  } catch (error) {
    console.error(`Error updating checkpoint status for checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

export const putUpdateCheckpointByCheckpointId = async (checkpointId, payload) => {
  try {
    const response = await apiClient.put(`/checkpoint/${checkpointId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating checkpoint for checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

export const deleteCheckpointByCheckpointId = async (checkpointId) => {
  try {
    const response = await apiClient.delete(`/checkpoint/${checkpointId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting checkpoint for checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

export const postAssignMembersToCheckpoint = async (checkpointId, memberIds) => {
  try {
    const normalizedIds = Array.isArray(memberIds)
      ? memberIds
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value))
      : [];

    const response = await apiClient.post(
      `/checkpoint/${checkpointId}/assignments`,
      null,
      {
        params: { classMemberIds: normalizedIds },
        paramsSerializer: { indexes: null },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error assigning members to checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

// Evaluation API (Student-flow)
export const getEvaluationMemberByTeamId = async (teamId) => {
  try {
    const response = await apiClient.get(`/evaluate/member/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching evaluation members for team ID ${teamId}:`, error);
    throw error;
  }
};

export const postSubmitPeerEvaluation = async (teamId, payload) => {
  try {
    const response = await apiClient.post(`/evaluate/member/team/${teamId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error submitting peer evaluation for team ID ${teamId}:`, error);
    throw error;
  }
};

export const getOwnEvaluationByTeamId = async (teamId) => {
  try {
    const response = await apiClient.get(`/evaluate/member/team/${teamId}/own`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching own evaluation for team ID ${teamId}:`, error);
    throw error;
  }
};

// Milestone API (Student-flow)
export const getAllMilestonesByTeamId = async (teamId) => getMilestonesByTeam(teamId);

export const getDetailOfMilestoneByMilestoneId = async (milestoneId) => getMilestoneDetail(milestoneId);

export const patchMarkDoneMilestoneByMilestoneId = async (teamMilestoneId, isDone = true) => {
  try {
    const response = await apiClient.patch(
      `/milestone/${teamMilestoneId}/status`,
      null,
      {
        params: { isDone },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating done status for team milestone ID ${teamMilestoneId}:`, error);
    throw error;
  }
};

export const patchGenerateNewMilestoneFileLinkByMilestoneIdAndFileId = async (milestoneId, fileId) => {
  try {
    const response = await apiClient.patch(`/milestone/${milestoneId}/files/${fileId}/new-url`);
    return response.data;
  } catch (error) {
    console.error(`Error regenerating file link for milestone ID ${milestoneId} and file ID ${fileId}:`, error);
    throw error;
  }
};

export const postUploadMilestoneFilebyMilestoneId = async (milestoneId, formData) => {
  try {
    const response = await apiClient.post(`/milestone/${milestoneId}/returns`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading file for milestone ID ${milestoneId}:`, error);
    throw error;
  }
};

export const deleteMilestoneFileByMilestoneIdAndMileReturnId = async (milestoneId, mileReturnId) => {
  try {
    const response = await apiClient.delete(`/milestone/${milestoneId}/returns/${mileReturnId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting file for milestone ID ${milestoneId} and return ID ${mileReturnId}:`, error);
    throw error;
  }
};

export const patchGenerateNewReturnFileLinkByMilestoneIdAndMileReturnId = async (milestoneId, mileReturnId) => {
  try {
    const response = await apiClient.patch(`/milestone/${milestoneId}/returns/${mileReturnId}/new-url`);
    return response.data;
  } catch (error) {
    console.error(`Error regenerating return file link for milestone ID ${milestoneId} and return ID ${mileReturnId}:`, error);
    throw error;
  }
};

export const getMilestoneQuestionsAnswersByQuestionId = async (questionId) => {
  try {
    const response = await apiClient.get(`/question/${questionId}/answer`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching answers for question ID ${questionId}:`, error);
    throw error;
  }
};

export const postCreateMilestoneQuestionAnswer = async (questionId, content) => {
  try {
    const payload = { answer: content };
    const response = await apiClient.post(`/question/${questionId}/answer`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error creating answer for question ID ${questionId}:`, error);
    throw error;
  }
};

export const patchUpdateMilestoneQuestionAnswer = async (questionId, answerId, content) => {
  try {
    const payload = { answer: content };
    const response = await apiClient.patch(`/question/${questionId}/answer/${answerId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating answer for question ID ${questionId} and answer ID ${answerId}:`, error);
    throw error;
  }
};

export const deleteMilestoneQuestionAnswer = async (questionId, answerId) => {
  try {
    const response = await apiClient.delete(`/question/${questionId}/answer/${answerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting answer for question ID ${questionId} and answer ID ${answerId}:`, error);
    throw error;
  }
};

export const postEvaluateAndFeedbackMilestoneAnswer = async (answerId, feedbackPayload) => {
  try {
    const payload =
      feedbackPayload && typeof feedbackPayload === 'object'
        ? feedbackPayload
        : { feedback: feedbackPayload };

    const response = await apiClient.post(`/evaluate/answer/${answerId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error submitting feedback for answer ID ${answerId}:`, error);
    throw error;
  }
};
