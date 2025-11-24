import apiClient from './apiClient';

const validateIdentifier = (value, label) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${label} is required to call evaluation API.`);
  }
};

const unwrapResponse = (payload) => {
  if (payload === null || payload === undefined) return null;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return payload;
};

export const getTeamEvaluationSummary = async (teamId) => {
  validateIdentifier(teamId, 'teamId');
  try {
    const response = await apiClient.get(`/evaluate/lecturer/team/${teamId}`);
    const payload = response.data;
    if (payload?.lecturerEvaluateTeam) {
      return payload.lecturerEvaluateTeam;
    }
    return null;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

const extractMilestoneCollection = (payload) => {
  if (Array.isArray(payload?.teamMilestones)) return payload.teamMilestones;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const getMilestoneEvaluationsByTeam = async (teamId, params = {}) => {
  validateIdentifier(teamId, 'teamId');
  try {
    const response = await apiClient.get(`/milestone/team/${teamId}`, { params });
    const teamMilestones = extractMilestoneCollection(response.data);
    if (!teamMilestones.length) {
      return [];
    }

    const evaluations = await Promise.all(
      teamMilestones.map(async (milestone) => {
        const milestoneId = milestone?.teamMilestoneId ?? milestone?.milestoneId ?? milestone?.id;
        if (!milestoneId) {
          return null;
        }

        try {
          const response = await apiClient.get(`/milestone/${milestoneId}`);
          const detail = response.data?.milestoneEvaluation;
          
          if (!detail) {
            return null;
          }

          return {
            ...detail,
            teamMilestoneId: detail.teamMilestoneId ?? milestoneId,
            milestoneTitle: milestone?.title ?? milestone?.name,
            milestoneDueDate: milestone?.dueDate ?? milestone?.endDate ?? milestone?.targetDate,
          };
        } catch (error) {
          if (error?.response?.status === 404) {
            return null;
          }
          throw error;
        }
      })
    );

    return evaluations.filter(Boolean);
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const submitTeamEvaluation = async (teamId, payload = {}) => {
  validateIdentifier(teamId, 'teamId');
  if (!payload || typeof payload !== 'object') {
    throw new Error('payload is required to submit a team evaluation.');
  }

  const response = await apiClient.post(`/evaluate/lecturer/team/${teamId}`, payload);
  return response.data;
};

export const submitMilestoneEvaluation = async (teamMilestoneId, payload = {}) => {
  validateIdentifier(teamMilestoneId, 'teamMilestoneId');
  if (!payload || typeof payload !== 'object') {
    throw new Error('payload is required to submit a milestone evaluation.');
  }

  const response = await apiClient.post(`/evaluate/milestone/${teamMilestoneId}`, payload);
  return response.data;
};

