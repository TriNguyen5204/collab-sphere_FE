import apiClient from './apiClient';

//staff
export const createMultipleClasses = async (data) => {
    try{
        const formData = new FormData();
        formData.append('file', data);
        const response = await apiClient.post('/class/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }catch(error){
        console.error('Error creating multiple classes:', error);
        throw error;
    }
}
export const getAllLecturer = async () => {
    try{
        const response = await apiClient.get('/Lecturer');
        return response.data;
    }catch(error){
        console.error('Error fetching all lecturers:', error);
        throw error;
    }
}
export const getAllStudent = async () => {
    try{
        const response = await apiClient.get('/student');
        return response.data;
    }catch(error){
        console.error('Error fetching all students:', error);
        throw error;
    }
}
export const getAllSubject = async () => {
    try{
        const response = await apiClient.get('/subject');
        return response.data;
    }catch(error){
        console.error('Error fetching all subjects:', error);
        throw error;
    }
}
export const getSyllabusBySubjectId = async (subjectId) => {
    try{
        const response = await apiClient.get(`/subject/${subjectId}`);
        return response.data;
    }catch(error){
        console.error(`Error fetching syllabus for subject ID ${subjectId}:`, error);
        throw error;
    }
}
//admin
export const getAllAccount = async () => {
    try{
        const response = await apiClient.get('/Admin/all-users');
        return response.data;
    }catch(error){
        console.error('Error fetching all accounts:', error);
        throw error;
    }
}
//head of department
export const createMultipleSubjects = async (data) => {
    try{
        const formData = new FormData();
        formData.append('file', data);
        const response = await apiClient.post('/Subject/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }catch(error){
        console.error('Error creating multiple subjects:', error);
        throw error;
    }
}