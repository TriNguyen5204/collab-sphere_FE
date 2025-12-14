import { error } from 'three';
import apiClient from './apiClient';

export const createTeam = async (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('A payload object is required to create a team.');
  }
  try {
    console.log('Creating team with payload:', payload);
    const response = await apiClient.post('/team', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw new Error(
      error.response?.data?.errorList?.[0]?.message || "An error occurred while creating the team."
    );
  }
};

export const getTeamDetail = async (teamId) => {
  if (teamId === undefined || teamId === null || teamId === '') {
    throw new Error('teamId is required to fetch team detail.');
  }

  const response = await apiClient.get(`/team/${teamId}`);
  const payload = response.data;
  if (payload && typeof payload === 'object' && payload.teamDetail) {
    return payload.teamDetail;
  }
  return payload;
};

export const updateTeam = async (teamId, payload = {}) => {
  if (!teamId) {
    throw new Error('teamId is required to update team.');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('A payload object is required to update a team.');
  }
  try {
    console.log(`Updating team ${teamId} with payload:`, payload);
    const response = await apiClient.put(`/team/${teamId}`, payload);
    console.log('Team updated successfully:', response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "An error occurred while updating the team."
    );
  }
};