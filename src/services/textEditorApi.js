import apiClient from './apiClient';

export const getDocuments = async teamId => {
  try {
    const response = await apiClient.get(`/team/${teamId}/documents`);
    return response.data;
  } catch (error) {
    console.log('Error fetching documents', error);
    throw error;
  }
};
export const createDocumentRoom = async (teamId, roomName) => {
  try {
    const response = await apiClient.post(`/team/${teamId}/documents`, {
      roomName: roomName,
    });
    return response.data;
  } catch (error) {
    console.log('Error creating room', error);
    throw error;
  }
};
export const deleteDocumentRoom = async (teamId, roomName) => {
    try{
        const response = await apiClient.delete(`/team/${teamId}/documents/${roomName}`)
        return response.data
    }catch(error){
        console.log("Error deleting room", error)
        throw error
    }
}
