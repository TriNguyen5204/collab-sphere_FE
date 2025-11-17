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

export const getTeamEvaluationSummary = async (teamId, params = {}) => {
  validateIdentifier(teamId, 'teamId');
  try {
    const response = await apiClient.get(`/evaluate/team/${teamId}`);
    const payload = response.data;
    if (payload?.teamEvaluation || payload?.memberEvaluations || payload?.evaluationDetails) {
      return payload;
    }
    return unwrapResponse(payload) ?? null;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getMilestoneEvaluationDetail = async (milestoneId) => {
  validateIdentifier(milestoneId, 'milestoneId');
  try {
    const response = await apiClient.get(`/evaluate/milestone/${milestoneId}`);
    console.log("milestone evaluation detail response:", response.data);
    return unwrapResponse(response.data);
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
          const detail = await getMilestoneEvaluationDetail(milestoneId);
          if (!detail) {
            return null;
          }

          const normalizedDetail = detail?.lecturerEvaluateTeamMilestone
            ? {
                ...detail.lecturerEvaluateTeamMilestone,
                teamMilestoneId: detail.lecturerEvaluateTeamMilestone.teamMilestoneId ?? milestoneId,
              }
            : detail;

          return {
            ...normalizedDetail,
            teamMilestoneId: normalizedDetail.teamMilestoneId ?? milestoneId,
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
