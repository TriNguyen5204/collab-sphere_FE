import { useEffect, useState } from 'react';
import {
  createClass,
  getAllStudent,
  getAllLecturer,
  getAllSubject,
  getSemester,
} from '../../../services/userService';
import {
  Check,
  Users,
  BookOpen,
  UserCheck,
  Eye,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const CreateClassForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState([]);
  const [apiErrors, setApiErrors] = useState([]);

  // Pagination & Filter state for Students
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentFilters, setStudentFilters] = useState({
    email: '',
    fullName: '',
    yob: '',
    studentCode: '',
    major: '',
  });
  const [showStudentFilter, setShowStudentFilter] = useState(false);

  // Pagination & Filter state for Lecturers
  const [lecturerPage, setLecturerPage] = useState(1);
  const [lecturerTotalPages, setLecturerTotalPages] = useState(1);
  const [lecturerFilters, setLecturerFilters] = useState({
    email: '',
    fullName: '',
    yob: '',
    lecturerCode: '',
  });
  const [showLecturerFilter, setShowLecturerFilter] = useState(false);

  const PAGE_SIZE = 10;

  const [formData, setFormData] = useState({
    className: '',
    subjectId: '',
    semesterId: '',
    lecturerId: '',
    studentIds: [],
    isActive: true,
  });

  // Fetch Students with pagination and filters
  const fetchStudents = async (page = 1, filters = {}) => {
    try {
      const response = await getAllStudent(
        false,
        filters.email || '',
        filters.fullName || '',
        filters.yob || '',
        filters.studentCode || '',
        filters.major || '',
        page,
        PAGE_SIZE,
        false
      );
      setStudents(response.list || []);
      setStudentTotalPages(response.pageCount || 1);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  // Fetch Lecturers with pagination and filters
  const fetchLecturers = async (page = 1, filters = {}) => {
    try {
      const response = await getAllLecturer(
        false,
        filters.email || '',
        filters.fullName || '',
        filters.yob || '',
        filters.lecturerCode || '',
        '',
        page,
        PAGE_SIZE,
        false
      );
      setLecturers(response.list || []);
      setLecturerTotalPages(response.pageCount || 1);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      toast.error('Failed to load lecturers');
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, semesterData] = await Promise.all([
          getAllSubject(),
          getSemester(),
        ]);
        setSubjects(subjectsData || []);
        setSemester(semesterData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch students when step 2 is active
  useEffect(() => {
    if (step === 2) {
      fetchStudents(studentPage, studentFilters);
    }
  }, [step, studentPage]);

  // Fetch lecturers when step 3 is active
  useEffect(() => {
    if (step === 3) {
      fetchLecturers(lecturerPage, lecturerFilters);
    }
  }, [step, lecturerPage]);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle student filter changes
  const handleStudentFilterChange = e => {
    const { name, value } = e.target;
    setStudentFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle lecturer filter changes
  const handleLecturerFilterChange = e => {
    const { name, value } = e.target;
    setLecturerFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply student filters
  const applyStudentFilters = () => {
    setStudentPage(1);
    fetchStudents(1, studentFilters);
  };

  // Apply lecturer filters
  const applyLecturerFilters = () => {
    setLecturerPage(1);
    fetchLecturers(1, lecturerFilters);
  };

  // Clear student filters
  const clearStudentFilters = () => {
    setStudentFilters({
      email: '',
      fullName: '',
      yob: '',
      studentCode: '',
      major: '',
    });
    setStudentPage(1);
    fetchStudents(1, {});
  };

  // Clear lecturer filters
  const clearLecturerFilters = () => {
    setLecturerFilters({
      email: '',
      fullName: '',
      yob: '',
      lecturerCode: '',
    });
    setLecturerPage(1);
    fetchLecturers(1, {});
  };

  // Toggle student selection
  const handleStudentToggle = id => {
    setFormData(prev => {
      const exists = prev.studentIds.includes(id);
      return {
        ...prev,
        studentIds: exists
          ? prev.studentIds.filter(sid => sid !== id)
          : [...prev.studentIds, id],
      };
    });
  };

  // Submit new class
  const handleSubmit = async () => {
    try {
      const response = await createClass(formData);
      if (response) {
        toast.success('✅ Class created successfully!');
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }

      setFormData({
        className: '',
        subjectId: '',
        lecturerId: '',
        studentIds: [],
        isActive: true,
      });
      setStep(1);
    } catch (error) {
      const apiErrorList = error?.response?.data?.errorList || [];
      setApiErrors(apiErrorList);

      if (!apiErrorList.length) {
        toast.error(error.message || 'Đã xảy ra lỗi khi tạo lớp');
      }
    }
  };

  // Step header component
  const StepHeader = ({ title }) => (
    <h2 className='text-2xl font-bold text-gray-800 mb-6'>{title}</h2>
  );

  // Get avatar URL with fallback
  const getAvatarUrl = avatarPublicId => {
    if (!avatarPublicId) {
      return 'https://via.placeholder.com/100?text=No+Image';
    }
    // Assuming avatarPublicId is a full URL or needs to be constructed
    return avatarPublicId;
  };

  const stepIcons = [BookOpen, Users, UserCheck, Eye];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Step Progress Bar */}
        <div className='bg-white rounded-2xl shadow-xl p-8 mb-6'>
          <div className='flex items-center justify-between'>
            {[1, 2, 3, 4].map(num => {
              const Icon = stepIcons[num - 1];
              const isCompleted = num < step;
              const isCurrent = num === step;

              return (
                <div key={num} className='flex items-center flex-1'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : isCurrent
                            ? 'bg-blue-600 text-white shadow-lg scale-110 ring-4 ring-blue-200'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className='w-6 h-6' />
                      ) : (
                        <Icon className='w-6 h-6' />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {num === 1 && 'Class Info'}
                      {num === 2 && 'Students'}
                      {num === 3 && 'Lecturer'}
                      {num === 4 && 'Review'}
                    </span>
                  </div>
                  {num < 4 && (
                    <div className='flex-1 h-1 mx-4 rounded-full relative'>
                      <div
                        className={`absolute inset-0 rounded-full transition-all duration-300 ${
                          num < step ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className='bg-white rounded-2xl shadow-xl p-8 transition-all duration-500'>
          {/* Step 1: Class Info */}
          {step === 1 && (
            <div className='animate-fade-in'>
              <StepHeader title='Class Information' />
              <div className='space-y-6'>
                {/* Class Name */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Class Name
                  </label>
                  <input
                    type='text'
                    name='className'
                    value={formData.className}
                    onChange={handleChange}
                    placeholder='e.g., Advanced Mathematics 2024'
                    className='w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Subject
                  </label>
                  <select
                    name='subjectId'
                    value={formData.subjectId}
                    onChange={handleChange}
                    className='w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                  >
                    <option value=''>Select a subject</option>
                    {subjects.map(subj => (
                      <option key={subj.subjectId} value={subj.subjectId}>
                        {subj.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Semester */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Semester
                  </label>
                  <select
                    name='semesterId'
                    value={formData.semesterId}
                    onChange={handleChange}
                    className='w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                  >
                    <option value=''>Select a semester</option>
                    {semester.map(sem => (
                      <option key={sem.semesterId} value={sem.semesterId}>
                        {sem.semesterName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='flex justify-end mt-8'>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.className || !formData.subjectId}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    !formData.className || !formData.subjectId
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Students */}
          {step === 2 && (
            <div className='animate-fade-in'>
              <StepHeader title='Add Students' />
              
              {/* Filter Toggle Button */}
              <div className='flex justify-between items-center mb-4'>
                <div className='bg-gray-50 rounded-xl p-4'>
                  <p className='text-sm text-gray-600'>
                    Selected:{' '}
                    <span className='font-bold text-blue-600'>
                      {formData.studentIds.length}
                    </span>{' '}
                    student(s)
                  </p>
                </div>
                <button
                  onClick={() => setShowStudentFilter(!showStudentFilter)}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all'
                >
                  <Filter className='w-4 h-4' />
                  {showStudentFilter ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Filter Panel */}
              {showStudentFilter && (
                <div className='bg-gray-50 rounded-xl p-4 mb-4 space-y-3'>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    <input
                      type='text'
                      name='fullName'
                      value={studentFilters.fullName}
                      onChange={handleStudentFilterChange}
                      placeholder='Full Name'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='text'
                      name='email'
                      value={studentFilters.email}
                      onChange={handleStudentFilterChange}
                      placeholder='Email'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='text'
                      name='studentCode'
                      value={studentFilters.studentCode}
                      onChange={handleStudentFilterChange}
                      placeholder='Student Code'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='text'
                      name='major'
                      value={studentFilters.major}
                      onChange={handleStudentFilterChange}
                      placeholder='Major'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='number'
                      name='yob'
                      value={studentFilters.yob}
                      onChange={handleStudentFilterChange}
                      placeholder='Year of Birth'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={applyStudentFilters}
                      className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm'
                    >
                      <Search className='w-4 h-4' />
                      Apply Filters
                    </button>
                    <button
                      onClick={clearStudentFilters}
                      className='flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all text-sm'
                    >
                      <X className='w-4 h-4' />
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Students List */}
              <div className='max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 space-y-3'>
                {students.length > 0 ? (
                  students.map(stu => (
                    <label
                      key={stu.uId}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                        formData.studentIds.includes(stu.uId)
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'bg-white border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={formData.studentIds.includes(stu.uId)}
                        onChange={() => handleStudentToggle(stu.uId)}
                        className='w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                      />
                      
                      {/* Avatar */}
                      <img
                        src={`https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${getAvatarUrl(stu.avatarPublicId)}`}
                        alt={stu.fullname}
                        className='w-12 h-12 rounded-full object-cover border-2 border-gray-200'
                        onError={e => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />

                      {/* Student Info */}
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-800'>
                          {stu.fullname}
                        </p>
                        <div className='flex flex-wrap gap-2 mt-1 text-xs text-gray-600'>
                          <span className='bg-gray-100 px-2 py-1 rounded'>
                            {stu.studentCode}
                          </span>
                          {stu.major && (
                            <span className='bg-blue-100 px-2 py-1 rounded'>
                              {stu.major}
                            </span>
                          )}
                          {stu.yob && (
                            <span className='bg-green-100 px-2 py-1 rounded'>
                              YOB: {stu.yob}
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>{stu.email}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className='text-center text-gray-500 py-8'>
                    No students found.
                  </p>
                )}
              </div>

              {/* Pagination */}
              {studentTotalPages > 1 && (
                <div className='flex justify-center items-center gap-2 mt-4'>
                  <button
                    onClick={() => setStudentPage(prev => Math.max(1, prev - 1))}
                    disabled={studentPage === 1}
                    className={`p-2 rounded-lg ${
                      studentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  
                  <span className='text-sm text-gray-600'>
                    Page {studentPage} of {studentTotalPages}
                  </span>
                  
                  <button
                    onClick={() => setStudentPage(prev => Math.min(studentTotalPages, prev + 1))}
                    disabled={studentPage === studentTotalPages}
                    className={`p-2 rounded-lg ${
                      studentPage === studentTotalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>
              )}

              <div className='flex justify-between mt-8'>
                <button
                  onClick={() => setStep(1)}
                  className='px-8 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition-all font-semibold text-gray-700'
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold'
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Lecturer */}
          {step === 3 && (
            <div className='animate-fade-in'>
              <StepHeader title='Assign Lecturer' />
              
              {/* Filter Toggle Button */}
              <div className='flex justify-end mb-4'>
                <button
                  onClick={() => setShowLecturerFilter(!showLecturerFilter)}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all'
                >
                  <Filter className='w-4 h-4' />
                  {showLecturerFilter ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Filter Panel */}
              {showLecturerFilter && (
                <div className='bg-gray-50 rounded-xl p-4 mb-4 space-y-3'>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    <input
                      type='text'
                      name='fullName'
                      value={lecturerFilters.fullName}
                      onChange={handleLecturerFilterChange}
                      placeholder='Full Name'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='text'
                      name='email'
                      value={lecturerFilters.email}
                      onChange={handleLecturerFilterChange}
                      placeholder='Email'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='text'
                      name='lecturerCode'
                      value={lecturerFilters.lecturerCode}
                      onChange={handleLecturerFilterChange}
                      placeholder='Lecturer Code'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                    <input
                      type='number'
                      name='yob'
                      value={lecturerFilters.yob}
                      onChange={handleLecturerFilterChange}
                      placeholder='Year of Birth'
                      className='border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={applyLecturerFilters}
                      className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm'
                    >
                      <Search className='w-4 h-4' />
                      Apply Filters
                    </button>
                    <button
                      onClick={clearLecturerFilters}
                      className='flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all text-sm'
                    >
                      <X className='w-4 h-4' />
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Lecturers List */}
              <div className='max-h-96 overflow-y-auto space-y-3'>
                {lecturers.length > 0 ? (
                  lecturers.map(lec => (
                    <label
                      key={lec.uId}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                        formData.lecturerId == lec.uId
                          ? 'bg-blue-50 border-2 border-blue-400 shadow-md'
                          : 'bg-white border-2 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type='radio'
                        name='lecturerId'
                        value={lec.uId}
                        checked={formData.lecturerId == lec.uId}
                        onChange={handleChange}
                        className='w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500'
                      />
                      
                      {/* Avatar */}
                      <img
                        src={`https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${getAvatarUrl(lec.avatarPublicId)}`}
                        alt={lec.fullname}
                        className='w-12 h-12 rounded-full object-cover border-2 border-gray-200'
                        onError={e => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />

                      {/* Lecturer Info */}
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-800'>
                          {lec.fullname}
                        </p>
                        <div className='flex flex-wrap gap-2 mt-1 text-xs text-gray-600'>
                          <span className='bg-gray-100 px-2 py-1 rounded'>
                            {lec.lecturerCode}
                          </span>
                          {lec.yob && (
                            <span className='bg-green-100 px-2 py-1 rounded'>
                              YOB: {lec.yob}
                            </span>
                          )}
                          {lec.school && (
                            <span className='bg-purple-100 px-2 py-1 rounded'>
                              {lec.school}
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>{lec.email}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className='text-center text-gray-500 py-8'>
                    No lecturers found.
                  </p>
                )}
              </div>

              {/* Pagination */}
              {lecturerTotalPages > 1 && (
                <div className='flex justify-center items-center gap-2 mt-4'>
                  <button
                    onClick={() => setLecturerPage(prev => Math.max(1, prev - 1))}
                    disabled={lecturerPage === 1}
                    className={`p-2 rounded-lg ${
                      lecturerPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>
                  
                  <span className='text-sm text-gray-600'>
                    Page {lecturerPage} of {lecturerTotalPages}
                  </span>
                  
                  <button
                    onClick={() => setLecturerPage(prev => Math.min(lecturerTotalPages, prev + 1))}
                    disabled={lecturerPage === lecturerTotalPages}
                    className={`p-2 rounded-lg ${
                      lecturerPage === lecturerTotalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>
              )}

              <div className='flex justify-between mt-8'>
                <button
                  onClick={() => setStep(2)}
                  className='px-8 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition-all font-semibold text-gray-700'
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.lecturerId}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    !formData.lecturerId
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className='animate-fade-in'>
              <StepHeader title='Review and Confirm' />
              <div className='bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-4'>
                <InfoRow
                  icon={<BookOpen />}
                  label='Class Name'
                  value={formData.className}
                />
                <InfoRow
                  icon={<BookOpen />}
                  label='Subject'
                  value={
                    subjects.find(s => s.subjectId == formData.subjectId)
                      ?.subjectName || 'N/A'
                  }
                />
                <InfoRow
                  icon={<CalendarDays />}
                  label='Semester'
                  value={
                    semester.find(s => s.semesterId == formData.semesterId)
                      ?.semesterName || 'N/A'
                  }
                />
                <InfoRow
                  icon={<UserCheck />}
                  label='Lecturer'
                  value={
                    lecturers.find(l => l.uId == formData.lecturerId)
                      ?.fullname || 'N/A'
                  }
                />
                <InfoRow
                  icon={<Users />}
                  label='Students'
                  value={
                    formData.studentIds.length > 0
                      ? `${formData.studentIds.length} student(s)`
                      : 'None'
                  }
                />
              </div>

              <div className='flex justify-between mt-8'>
                <button
                  onClick={() => setStep(3)}
                  className='px-8 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition-all font-semibold text-gray-700'
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className='bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-semibold flex items-center gap-2'
                >
                  <Check className='w-5 h-5' />
                  Confirm & Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* errorList */}
      {apiErrors.length > 0 && (
        <div className='mt-4 p-4 bg-red-50 border border-red-300 rounded-md'>
          <h3 className='text-red-600 font-semibold mb-2'>Danh sách lỗi:</h3>
          <ul className='list-disc list-inside text-red-700'>
            {apiErrors.map((err, index) => (
              <li key={index}>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper component for review info
const InfoRow = ({ icon, label, value }) => (
  <div className='flex items-start gap-3'>
    <div className='text-blue-600 mt-1'>{icon}</div>
    <div>
      <p className='text-sm text-gray-600'>{label}</p>
      <p className='font-bold text-gray-800'>{value || 'N/A'}</p>
    </div>
  </div>
);

export default CreateClassForm;