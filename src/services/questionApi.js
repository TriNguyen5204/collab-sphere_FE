//Api for question
import apiClient from './apiClient';

const normalizeError = (error) => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errorList) && data.errorList.length > 0) {
    return data.errorList.map(err => {
      if (typeof err === 'string') return err;
      return err.message || err.description || JSON.stringify(err);
    }).join('\n');
  }
  if (typeof data?.error === 'string') {
    return data.error;
  }
  if (typeof data?.message === 'string') {
    return data.message;
  }
  if (typeof data === 'string') {
    return data;
  }
  if (typeof error?.message === 'string') {
    return error.message;
  }
  return 'Unknown error';
};

export const postMilestoneQuestion = async (teamMilestoneId, teamId, question) => {
    if (!teamMilestoneId) {
        throw new Error('teamMilestoneId is required to post a question.');
    }
    try {
        const response = await apiClient.post(`/question/milestone/${teamMilestoneId}`, { 
            teamId: teamId,
            question: question
        });
        return response.data;
    } catch (error) {
        console.error(`Error posting question for milestone ID ${teamMilestoneId}:`, error);
        throw new Error(normalizeError(error));
    }
};

export const patchMilestoneQuestion = async (questionId, updatedQuestion) => {
    if (!questionId) {
        throw new Error('questionId is required to update a question.');
    }
    try {
        const response = await apiClient.patch(`/question/${questionId}`, { question: updatedQuestion });
        return response.data;
    } catch (error) {
        console.error(`Error updating question ID ${questionId}:`, error);
        throw new Error(normalizeError(error));
    }
};

export const deleteMilestoneQuestion = async (questionId) => {
    if (!questionId) {
        throw new Error('questionId is required to delete a question.');
    }
    try {
        const response = await apiClient.delete(`/question/${questionId}`);
        return response.data;
    }
    catch (error) {
        console.error(`Error deleting question ID ${questionId}:`, error);
        throw new Error(normalizeError(error));
    }
};
    