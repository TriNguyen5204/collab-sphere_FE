import apiClient from './apiClient';

// Student-specific API utilities
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

export const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/user/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for user ID ${userId}:`, error);
    throw error;
  }
};

export const getAllMilestonesByTeamId = async (teamId) => {
  try {
    const response = await apiClient.get(`/milestone/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching milestones for team ID ${teamId}:`, error);
    throw error;
  }
};

export const getDetailOfMilestoneByMilestoneId = async (milestoneId) => {
  try {
    const response = await apiClient.get(`/milestone/${milestoneId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching milestone details for milestone ID ${milestoneId}:`, error);
    throw error;
  }
};

export const getDetailOfCheckpointByCheckpointId = async (checkpointId) => {
  try {
    const response = await apiClient.get(`/checkpoint/${checkpointId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching checkpoint details for checkpoint ID ${checkpointId}:`, error);
    throw error;
  }
};

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

export const getDetailOfTeamByTeamId = async (teamId) => {
  try {
    const response = await apiClient.get(`/team/${teamId}`);
    return response.data.teamDetail;
  } catch (error) {
    console.error(`Error fetching team details for team ID ${teamId}:`, error);
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



