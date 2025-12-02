import apiClient from "../../../services/apiClient";

export const getChat = async (teamId) => {
    try{
        const response = await apiClient.get(`/chat-conversation?TeamId=${teamId}`);
        return response.data;
    }catch(error){
        console.error("Error fetching chat conversation:", error);
        throw error;
    }
}
export const postChat = async (teamId, conversationName) => {
    try{
        const response = await apiClient.post(`/chat-conversation`, {
            teamId,
            conversationName
        })
        return response.data;   
    }catch(error){
        console.error("Error creating chat conversation:", error);
        throw error;
    }
}
export const patchChatIsRead = async (conversationId) => {
    try{
        const response = await apiClient.patch(`/chat-conversation/${conversationId}/is-read`)
        return response.data;
    }catch(error){
        console.error("Error marking chat conversation as read:", error);
        throw error;
    }
}
export const getChatById = async (conversationId) => {
    try{
        const response = await apiClient.get(`/chat-conversation/${conversationId}`)
        return response.data;
    }catch(error){
        console.error("Error fetching chat conversation by ID:", error);
        throw error;
    }
}
export const deleteChat = async (conversationId) => {
    try{
        const response = await apiClient.delete(`/chat-conversation/${conversationId}`)
        return response.data;
    }catch(error){
        console.error("Error deleting chat conversation:", error);
        throw error;
    }
}