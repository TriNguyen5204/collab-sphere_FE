import apiClient from './apiClient';

//staff
export const getClass = async (
  className,
  subjectIds,
  lecturerIds,
  orderBy,
  descending,
  pageNum,
  pageSize,
  viewAll
) => {
  try {
    const params = {
      OrderBy: orderBy,
      Descending: descending,
      ViewAll: viewAll,
      PageNum: pageNum,
      PageSize: pageSize,
    };

    if (className && className.trim() !== '') {
      params.ClassName = className;
    }

    if (subjectIds?.length > 0) {
      params.SubjectIds = subjectIds;
    }

    if (lecturerIds?.length > 0) {
      params.LecturerIds = lecturerIds;
    }

    const response = await apiClient.get('/class', { params });
    return response.data;
  } catch (error) {
    console.log('Error fetching class', error);
    throw error;
  }
};

export const getClassDetail = async id => {
  try {
    const response = await apiClient.get(`/class/${id}`);
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
export const createMultipleClasses = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/class/import', formData, {
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
export const importStudentList = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/student/import', formData, {
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
export const importLecturerList = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/lecturer/import', formData, {
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
export const getAllLecturer = async () => {
  try {
    const response = await apiClient.get('/lecturer');
    return response.data;
  } catch (error) {
    console.error('Error fetching all lecturers:', error);
    throw error;
  }
};
export const getAllStudent = async () => {
  try {
    const response = await apiClient.get('/student');
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
export const createMultipleSubjects = async data => {
  try {
    const formData = new FormData();
    formData.append('file', data);
    const response = await apiClient.post('/subject/import', formData, {
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
    const response = await apiClient.get('/project', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }
};

export const getPendingProjects = async ({
  descriptors,
  viewAll,
  pageNum,
  pageSize,
}) => {
  try {
    const response = await apiClient.get('/project/pending', {
      params: {
        Descriptors: descriptors,
        ViewAll: viewAll,
        PageNum: pageNum,
        PageSize: pageSize,
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
export const approveProject = async projectId => {
  try {
    const response = await apiClient.patch(`/project/${projectId}/approve`);
    return response.data;
  } catch (error) {
    console.error(`Error approving project with ID ${projectId}:`, error);
    throw error;
  }
};
export const rejectProject = async projectId => {
  try {
    const response = await apiClient.patch(`/project/${projectId}/deny`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting project with ID ${projectId}:`, error);
    throw error;
  }
};
