import apiClient from "./apiClient";

export const getWorkspace = async (teamId) => {
    try{
        const response = await apiClient.get(`/team-workspace/${teamId}`);
        return response.data;
    }catch(error){
        console.error("Error fetching workspace:", error);
        throw error;
    }
}