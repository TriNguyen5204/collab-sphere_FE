import apiClient from './apiClient';
import { cleanParams } from '../utils/cleanParam';

//staff
export const getClass = async filters => {
  try {
    const params = cleanParams(filters);

    const response = await apiClient.get('/class', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching class', error);
    throw error;
  }
};

export const getClassDetail = async id => {
  try {
    const response = await apiClient.get(`/class/${id}`);
    console.log('Class detail response:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error fetching class', error);
    throw error;
  }
};
export const createClass = async data => {
  try {
    const response = await apiClient.post('/class', data);
    return response.data;
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};
export const updateClass = async (id, data) => {
  try {
    const response = await apiClient.patch(`/class/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('Update failed', error);
  }
};
export const createMultipleClasses = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/class/imports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating multiple classes:', error);
    throw error;
  }
};
export const createStudent = async data => {
  try {
    const response = await apiClient.post('/student', data, {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      address: data.address,
      phoneNumber: data.phoneNumber,
      yob: data.yearOfBirth,
      school: data.school,
      studentCode: data.studentCode,
      major: data.major,
    });
    return response.data;
  } catch (error) {
    console.log('Create failed', error.response.data);
    throw error
  }
};
export const importStudentList = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/student/imports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing student list:', error);
    throw error;
  }
};
export const createLecturer = async data => {
  try {
    const response = await apiClient.post('/lecturer', {
      email: data.email,
      password: data.password,
      fullName: data.name,
      address: data.address,
      phoneNumber: data.phone,
      yob: Number(data.birth),
      school: data.school,
      lecturerCode: data.lecturerCode,
      major: data.major,
    });
    return response.data;
  } catch (error) {
    console.error('Create lecturer failed:', error);
    throw error;
  }
};

export const importLecturerList = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/lecturer/imports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing lecturer list:', error);
    throw error;
  }
};
export const getAllLecturer = async (
  email,
  fullName,
  yob,
  lecturerCode,
  major,
  pageNumber,
  pageSize = 5,
  isDesc
) => {
  try {
    const params = cleanParams({
      Email: email,
      FullName: fullName,
      Yob: yob,
      LecturerCode: lecturerCode,
      Major: major,
      PageNum: pageNumber,
      PageSize: pageSize,
      IsDesc: isDesc,
    });
    const response = await apiClient.get('/lecturer', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all lecturers:', error);
    throw error;
  }
};
export const getAllStudent = async (
  email,
  fullName,
  yob,
  studentCode,
  major,
  pageNumber,
  pageSize,
  isDesc
) => {
  try {
    const params = cleanParams({
      Email: email,
      FullName: fullName,
      Yob: yob,
      StudentCode: studentCode,
      Major: major,
      PageNum: pageNumber,
      PageSize: pageSize,
      IsDesc: isDesc,
    });
    const response = await apiClient.get('/student', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw error;
  }
};
export const getAllSubject = async () => {
  try {
    const response = await apiClient.get('/subject');
    return response.data;
  } catch (error) {
    console.error('Error fetching all subjects:', error);
    throw error;
  }
};
export const getSyllabusBySubjectId = async subjectId => {
  try {
    const response = await apiClient.get(`/subject/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching syllabus for subject ID ${subjectId}:`,
      error
    );
    throw error;
  }
};
export const assignLecturerIntoClass = async (classId, lecturerId) => {
  try {
    const response = await apiClient.patch(
      `/class/${classId}/lecturer-assignment`,
      {},
      {
        params: {
          LecturerId: lecturerId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Assign failed:', error.response?.data || error.message);
    throw error;
  }
};
export const addStudentIntoClass = async (classId, studentList) => {
  const body = {
    classId,
    studentList,
  };

  try {
    const response = await apiClient.post(`/class/${classId}/students`, body);
    return response.data;
  } catch (error) {
    console.error('Add failed:', error);
    throw error;
  }
};

//admin
export const getAllAccount = async () => {
  try {
    const response = await apiClient.get('/admin/all-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all accounts:', error);
    throw error;
  }
};
//head of department
export const getSemester = async () => {
  try{
    const response = await apiClient.get('/semester');
    return response.data;
  }catch(error){
    console.log('Error fetching data', error)
    throw error
  }
}
export const createMultipleSubjects = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/subject/imports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating multiple subjects:', error);
    throw error;
  }
};
export const getSubjectById = async id => {
  try {
    const response = await apiClient.get(`subject/${id}`);
    return response.data;
  } catch (error) {
    console.log('Fetch failed', error);
  }
};
export const deleteSubjectById = async subjectId => {
  try {
    const response = await apiClient.delete(`/subject/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting subject with ID ${subjectId}:`, error);
    throw error;
  }
};
export const updateSubject = async data => {
  try {
    const response = await apiClient.put(`/subject`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating syllabus for subject}:`, error);
    throw error;
  }
};
export const getAllProject = async (params = {}) => {
  try {
    const response = await apiClient.get('/project', {
      params: {
        LecturerIds: params.lecturerIds,
        SubjectIds: params.subjectIds,
        Descriptors: params.descriptors,
        ViewAll: params.viewAll,
        PageNum: params.pageNum,
        PageSize: params.pageSize,
      },
      paramsSerializer: {
        indexes: null, // quan trọng: giúp Axios format array như ?SubjectIds=10&SubjectIds=11
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching all classes:', error);
    throw error;
  }
};
export const getProjectById = async (id) => {
  try{
    const response = await apiClient.get(`/project/${id}`)
    return response.data
  }catch(error){
    console.log("Get error", error)
    throw error
  }
}
export const getPendingProjects = async (params = {}) => {
  try {
    const response = await apiClient.get('/project/pending', {
      params: {
        Descriptors: params.descriptors,
        ViewAll: params.viewAll,
        PageNum: params.pageNum,
        PageSize: params.pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending projects:', error);
    if (error.response) {
      return {
        isSuccess: false,
        status: error.response.status,
        message:
          error.response.data?.message || 'Failed to fetch pending projects',
        errorList: error.response.data?.errorList || [],
      };
    }

    throw error;
  }
};
export const handleProject = async (projectId, status) => {
  try {
    const response = await apiClient.patch(
      `/project/${projectId}/approval`,
      null,
      {
        params: { Approve: status },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error approving project with ID ${projectId}:`, error);
    throw error;
  }
};
export const removeProject = async projectId => {
  try {
    const response = await apiClient.patch(`/project/${projectId}/public-removal`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project', error);
  }
};
