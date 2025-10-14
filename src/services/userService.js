import apiClient from './apiClient';

//staff
export const getClass = async (filters) => {
  try {
    // Lấy ra từng trường
    const {
      ClassName,
      SubjectIds,
      LecturerIds,
      OrderBy,
      Descending,
      PageNum,
      PageSize,
      ViewAll,
    } = filters;

    // Tạo đối tượng params trống
    const params = {};

    // Chỉ thêm vào nếu có giá trị thực sự
    if (ClassName?.trim()) params.ClassName = ClassName.trim();
    if (SubjectIds?.length > 0) params.SubjectIds = SubjectIds.join(','); // Gộp thành chuỗi
    if (LecturerIds?.length > 0) params.LecturerIds = LecturerIds.join(',');
    if (ViewAll) params.ViewAll = ViewAll; // chỉ gửi nếu true
    if (PageNum && PageNum !== 1) params.PageNum = PageNum; // bỏ mặc định 1
    if (PageSize && PageSize !== 8) params.PageSize = PageSize;
    if (OrderBy && OrderBy !== 'ClassName') params.OrderBy = OrderBy;
    if (Descending) params.Descending = Descending;

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
export const getAllLecturer = async (
  email,
  fullName,
  yob,
  lecturerCode,
  major,
  pageNumber,
  pageSize,
  isDesc
) => {
  try {
    const response = await apiClient.get('/lecturer', {
      params: {
        Email: email,
        FullName: fullName,
        Yob: yob,
        LecturerCode: lecturerCode,
        Major: major,
        PageNumber: pageNumber,
        PageSize: pageSize,
        IsDesc: isDesc,
      },
    });
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
export const assignLecturerIntoClass = async (classId, lecturerId) => {
  try {
    const response = await apiClient.patch(
      `/class/${classId}/assign-lecturer`,
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
    const response = await apiClient.post(
      `/class/${classId}/add-student`,
      body
    );
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
