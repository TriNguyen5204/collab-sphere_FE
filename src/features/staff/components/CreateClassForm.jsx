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
import { useAvatar } from '../../../hooks/useAvatar';

const CreateClassForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState([]);
  const [apiErrors, setApiErrors] = useState([]);

  // Filter state for Students
  const [studentFilters, setStudentFilters] = useState({
    email: '',
    fullName: '',
    yob: '',
    studentCode: '',
    major: '',
  });
  const [showStudentFilter, setShowStudentFilter] = useState(false);

  // Filter state for Lecturers
  const [lecturerFilters, setLecturerFilters] = useState({
    email: '',
    fullName: '',
    yob: '',
    lecturerCode: '',
  });
  const [showLecturerFilter, setShowLecturerFilter] = useState(false);

  const [formData, setFormData] = useState({
    className: '',
    subjectId: '',
    semesterId: '',
    lecturerId: '',
    studentIds: [],
    isActive: true,
  });

  // Fetch Students with filters (all results)
  const fetchStudents = async (filters = {}) => {
    try {
      const response = await getAllStudent(
        false,
        filters.email || '',
        filters.fullName || '',
        filters.yob || '',
        filters.studentCode || '',
        filters.major || '',
        1,
        9999,
        false
      );
      setStudents(response.list || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

    // Fetch Lecturers with filters (all results)
    const fetchLecturers = async (filters = {}) => {
      try {
        const response = await getAllLecturer(
          false,
          filters.email || '',
          filters.fullName || '',
          filters.yob || '',
          filters.lecturerCode || '',
          '',
          1,
          9999,
          false
        );
        setLecturers(response.list || []);
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
        fetchStudents(studentFilters);
      }
    }, [step]);

    // Fetch lecturers when step 3 is active
    // Fetch lecturers when step 3 is active
    useEffect(() => {
      if (step === 3) {
        fetchLecturers(lecturerFilters);
      }
    }, [step]);
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
      fetchStudents(studentFilters);
    };

    // Apply lecturer filters
    const applyLecturerFilters = () => {
      fetchLecturers(lecturerFilters);
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
      fetchStudents({});
    };

    // Clear lecturer filters
    const clearLecturerFilters = () => {
      setLecturerFilters({
        email: '',
        fullName: '',
        yob: '',
        lecturerCode: '',
      });
      fetchLecturers({});
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
          toast.success('Class created successfully!');
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
          toast.error(error.message || 'An error occurred while creating the class');
        }
      }
    };

    // Step header component
    const StepHeader = ({ title }) => (
      <h2 className='text-2xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-orangeFpt-100'>{title}</h2>
    );

    // Get avatar URL with fallback
    const getAvatarUrl = avatarPublicId => {
      if (!avatarPublicId) {
        return '';
      }
      // Assuming avatarPublicId is a full URL or needs to be constructed
      return `https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${avatarPublicId}`;
    };

    // Student Avatar Component with useAvatar hook
    const StudentAvatar = ({ student }) => {
      const avatarUrl = student.avatarImg || getAvatarUrl(student.avatarPublicId);
      const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(
        student.fullname,
        avatarUrl
      );

      return (
        <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-colors ${shouldShowImage ? 'border-slate-200 bg-white' : `border-slate-300 ${colorClass}`
          }`}>
          {shouldShowImage ? (
            <img
              src={avatarUrl}
              alt={student.fullname}
              className='w-full h-full object-cover'
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-xs font-bold'>
              {initials}
            </div>
          )}
        </div>
      );
    };

    // Lecturer Avatar Component with useAvatar hook
    const LecturerAvatar = ({ lecturer }) => {
      const avatarUrl = lecturer.avatarImg || getAvatarUrl(lecturer.avatarPublicId);
      const { initials, colorClass, imageError, setImageError, shouldShowImage } = useAvatar(
        lecturer.fullname,
        avatarUrl
      );

      return (
        <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-colors ${shouldShowImage ? 'border-slate-200 bg-white' : `border-slate-300 ${colorClass}`
          }`}>
          {shouldShowImage ? (
            <img
              src={avatarUrl}
              alt={lecturer.fullname}
              className='w-full h-full object-cover'
              onError={() => setImageError(true)}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-xs font-bold'>
              {initials}
            </div>
          )}
        </div>
      );
    };
    const stepIcons = [BookOpen, Users, UserCheck, Eye];

    // Helper component for review info
    const InfoRow = ({ icon, label, value }) => (
      <div className='flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200'>
        <div className='text-orangeFpt-600 mt-1 p-2 bg-orangeFpt-50 rounded-lg'>{icon}</div>
        <div>
          <p className='text-sm font-semibold text-slate-600 mb-1'>{label}</p>
          <p className='font-bold text-slate-800'>{value || 'N/A'}</p>
        </div>
      </div>
    );

    return (
      <div className=' py-2 px-2'>
        <div className='max-w-5xl mx-auto'>
          {/* Step Progress Bar */}
          <div className='p-2 mb-2 '>
            <div className='flex items-center'>
              {[1, 2, 3, 4].map(num => {
                const Icon = stepIcons[num - 1];
                const isCompleted = num < step;
                const isCurrent = num === step;

                return (
                  <div key={num} className='flex items-center flex-1'>
                    <div className='flex flex-col items-center'>
                      <div
                        className={`rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 ${isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg scale-105'
                          : isCurrent
                            ? 'bg-orangeFpt-600 text-white shadow-xl scale-110 ring-4 ring-orangeFpt-200'
                            : 'bg-slate-200 text-slate-500'
                          }`}
                      >
                        {isCompleted ? (
                          <Check className='w-7 h-7' />
                        ) : (
                          <Icon className='w-7 h-7' />
                        )}
                      </div>
                      <span
                        className={`text-xs mt-3 font-bold ${isCurrent ? 'text-orangeFpt-600' : 'text-slate-500'
                          }`}
                      >
                        {num === 1 && 'Class Info'}
                        {num === 2 && 'Students'}
                        {num === 3 && 'Lecturer'}
                        {num === 4 && 'Review'}
                      </span>
                    </div>
                    {num < 4 && (
                      <div className='flex-1 h-1.5 mx-4 rounded-full relative'>
                        <div
                          className={`absolute inset-0 rounded-full transition-all duration-300 ${num < step ? 'bg-emerald-500' : 'bg-slate-200'
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
          <div className=''>
            {/* Step 1: Class Info */}
            {step === 1 && (
              <div className='animate-fade-in'>
                <div className='space-y-6'>
                  {/* Class Name */}
                  <div>
                    <label className='block text-sm font-bold text-slate-700 mb-2'>
                      Class Name
                    </label>
                    <input
                      type='text'
                      name='className'
                      value={formData.className}
                      onChange={handleChange}
                      placeholder='e.g., Advanced Mathematics 2024'
                      className='w-full border-2 border-slate-200 rounded-xl p-3.5 focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 transition-all outline-none text-slate-800 placeholder:text-slate-400'
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className='block text-sm font-bold text-slate-700 mb-2'>
                      Subject
                    </label>
                    <select
                      name='subjectId'
                      value={formData.subjectId}
                      onChange={handleChange}
                      className='w-full border-2 border-slate-200 rounded-xl p-3.5 focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 transition-all outline-none text-slate-800'
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
                    <label className='block text-sm font-bold text-slate-700 mb-2'>
                      Semester
                    </label>
                    <select
                      name='semesterId'
                      value={formData.semesterId}
                      onChange={handleChange}
                      className='w-full border-2 border-slate-200 rounded-xl p-3.5 focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-100 transition-all outline-none text-slate-800'
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
                    className={`px-8 py-3.5 rounded-xl font-bold transition-all ${!formData.className || !formData.subjectId
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-gradient-to-r from-orangeFpt-600 to-orangeFpt-700 text-white hover:shadow-lg shadow-orangeFpt-200 transform hover:scale-105 active:scale-95'
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
                {/* Fixed Header with Selected Count and Filter Button */}
                <div className='bg-white border border-slate-200 rounded-t-lg px-4 py-3 flex justify-between items-center sticky top-0 z-10'>
                  <div className='bg-orangeFpt-50 rounded-lg px-4 py-2 border border-orangeFpt-200'>
                    <p className='text-sm text-slate-700 font-semibold'>
                      Selected: <span className='font-bold text-orangeFpt-700'>{formData.studentIds.length}</span> student(s)
                    </p>
                  </div>

                  <div className='relative'>
                    <button
                      onClick={() => setShowStudentFilter(!showStudentFilter)}
                      className='flex items-center gap-2 px-4 py-2 bg-orangeFpt-100 text-orangeFpt-700 rounded-lg hover:bg-orangeFpt-200 transition-all font-semibold text-sm border border-orangeFpt-200'
                    >
                      <Filter className='w-4 h-4' />
                      {showStudentFilter ? 'Hide' : 'Filter'}
                    </button>

                    {/* Dropdown Filter Menu */}
                    {showStudentFilter && (
                      <div className='absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-slate-200 p-4 space-y-3 z-20'>
                        <div className='space-y-2'>
                          <input
                            type='text'
                            name='fullName'
                            value={studentFilters.fullName}
                            onChange={handleStudentFilterChange}
                            placeholder='Full Name'
                            className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-100 outline-none'
                          />
                          <input
                            type='text'
                            name='studentCode'
                            value={studentFilters.studentCode}
                            onChange={handleStudentFilterChange}
                            placeholder='Student Code'
                            className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-100 outline-none'
                          />
                          <input
                            type='text'
                            name='major'
                            value={studentFilters.major}
                            onChange={handleStudentFilterChange}
                            placeholder='Major'
                            className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-100 outline-none'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => {
                              applyStudentFilters();
                              setShowStudentFilter(false);
                            }}
                            className='flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-orangeFpt-600 text-white rounded-lg hover:bg-orangeFpt-700 transition-all text-sm font-semibold'
                          >
                            <Search className='w-4 h-4' />
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              clearStudentFilters();
                              setShowStudentFilter(false);
                            }}
                            className='flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all text-sm font-semibold'
                          >
                            <X className='w-4 h-4' />
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable Students List */}
                <div className='h-64 overflow-y-auto border-x border-b border-slate-200 rounded-b-lg p-2 space-y-2 bg-slate-50'>
                  {students.length > 0 ? (
                    students.map(stu => (
                      <label
                        key={stu.uId}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${formData.studentIds.includes(stu.uId)
                            ? 'bg-orangeFpt-50 border border-orangeFpt-400'
                            : 'bg-white border border-slate-200 hover:border-orangeFpt-300 hover:bg-orangeFpt-50/30'
                          }`}
                      >
                        <input
                          type='checkbox'
                          checked={formData.studentIds.includes(stu.uId)}
                          onChange={() => handleStudentToggle(stu.uId)}
                          className='w-4 h-4 text-orangeFpt-600 rounded cursor-pointer flex-shrink-0'
                        />

                        {/* Compact Avatar */}
                        <div className='flex-shrink-0'>
                          <StudentAvatar student={stu} />
                        </div>

                        {/* Compact Student Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-slate-800 text-sm truncate'>
                            {stu.fullname}
                          </p>
                          <div className='flex flex-wrap gap-1.5 mt-0.5'>
                            <span className='bg-orangeFpt-100 text-orangeFpt-700 px-2 py-0.5 rounded text-xs font-semibold'>
                              {stu.studentCode}
                            </span>
                            {stu.major && (
                              <span className='bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs'>
                                {stu.major}
                              </span>
                            )}
                            {stu.yob && (
                              <span className='bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs'>
                                {stu.yob}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className='text-center text-slate-500 py-8 text-sm'>
                      No students found.
                    </p>
                  )}
                </div>

                <div className='flex justify-between mt-4'>
                  <button
                    onClick={() => setStep(1)}
                    className='px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 transition-all font-semibold text-slate-700 text-sm'
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={formData.studentIds.length === 0}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                      formData.studentIds.length === 0
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                        : 'bg-gradient-to-r from-orangeFpt-600 to-orangeFpt-700 text-white hover:shadow-md shadow-orangeFpt-200'
                    }`}
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Lecturer */}
            {step === 3 && (
              <div className='animate-fade-in'>
                {/* Fixed Header with Selected Lecturer and Filter Button */}
                <div className='bg-white border border-slate-200 rounded-t-lg px-4 py-3 flex justify-between items-center sticky top-0 z-10'>
                  <div className='bg-orangeFpt-50 rounded-lg px-4 py-2 border border-orangeFpt-200'>
                    <p className='text-sm text-slate-700 font-semibold'>
                      Lecturer: <span className='font-bold text-orangeFpt-700'>
                        {formData.lecturerId
                          ? lecturers.find(l => l.uId == formData.lecturerId)?.fullname || 'Selected'
                          : 'Not selected'}
                      </span>
                    </p>
                  </div>

                  <div className='relative'>
                    <button
                      onClick={() => setShowLecturerFilter(!showLecturerFilter)}
                      className='flex items-center gap-2 px-4 py-2 bg-orangeFpt-100 text-orangeFpt-700 rounded-lg hover:bg-orangeFpt-200 transition-all font-semibold text-sm border border-orangeFpt-200'
                    >
                      <Filter className='w-4 h-4' />
                      {showLecturerFilter ? 'Hide' : 'Filter'}
                    </button>

                    {/* Dropdown Filter Menu */}
                    {showLecturerFilter && (
                      <div className='absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-slate-200 p-4 space-y-3 z-20'>
                        <div className='space-y-2'>
                          <input
                            type='text'
                            name='fullName'
                            value={lecturerFilters.fullName}
                            onChange={handleLecturerFilterChange}
                            placeholder='Full Name'
                            className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-100 outline-none'
                          />
                          <input
                            type='text'
                            name='email'
                            value={lecturerFilters.email}
                            onChange={handleLecturerFilterChange}
                            placeholder='Email'
                            className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-100 outline-none'
                          />
                          <input
                            type='text'
                            name='lecturerCode'
                            value={lecturerFilters.lecturerCode}
                            onChange={handleLecturerFilterChange}
                            placeholder='Lecturer Code'
                            className='w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-orangeFpt-500 focus:ring-1 focus:ring-orangeFpt-100 outline-none'
                          />
                        </div>
                        <div className='flex gap-2 pt-2 border-t border-slate-200'>
                          <button
                            onClick={() => {
                              applyLecturerFilters();
                              setShowLecturerFilter(false);
                            }}
                            className='flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-orangeFpt-600 text-white rounded-lg hover:bg-orangeFpt-700 transition-all text-sm font-semibold'
                          >
                            <Search className='w-4 h-4' />
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              clearLecturerFilters();
                              setShowLecturerFilter(false);
                            }}
                            className='flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all text-sm font-semibold'
                          >
                            <X className='w-4 h-4' />
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable Lecturers List */}
                <div className='h-64 overflow-y-auto border-x border-b border-slate-200 rounded-b-lg p-2 space-y-2 bg-slate-50'>
                  {lecturers.length > 0 ? (
                    lecturers.map(lec => (
                      <label
                        key={lec.uId}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${formData.lecturerId == lec.uId
                            ? 'bg-orangeFpt-50 border border-orangeFpt-400'
                            : 'bg-white border border-slate-200 hover:border-orangeFpt-300 hover:bg-orangeFpt-50/30'
                          }`}
                      >
                        <input
                          type='radio'
                          name='lecturerId'
                          value={lec.uId}
                          checked={formData.lecturerId == lec.uId}
                          onChange={handleChange}
                          className='w-4 h-4 text-orangeFpt-600  cursor-pointer flex-shrink-0'
                        />

                        {/* Compact Avatar */}
                        <div className='flex-shrink-0'>
                          <LecturerAvatar lecturer={lec} />
                        </div>

                        {/* Compact Lecturer Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-slate-800 text-sm truncate'>
                            {lec.fullname}
                          </p>
                          <div className='flex flex-wrap gap-1.5 mt-0.5'>
                            <span className='bg-orangeFpt-100 text-orangeFpt-700 px-2 py-0.5 rounded text-xs font-semibold'>
                              {lec.lecturerCode}
                            </span>
                            {lec.yob && (
                              <span className='bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs'>
                                {lec.yob}
                              </span>
                            )}
                            {lec.school && (
                              <span className='bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs'>
                                {lec.school}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className='text-center text-slate-500 py-8 text-sm'>
                      No lecturers found.
                    </p>
                  )}
                </div>

                <div className='flex justify-between mt-4'>
                  <button
                    onClick={() => setStep(2)}
                    className='px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 transition-all font-semibold text-slate-700 text-sm'
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!formData.lecturerId}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all text-sm ${!formData.lecturerId
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                        : 'bg-gradient-to-r from-orangeFpt-600 to-orangeFpt-700 text-white hover:shadow-md shadow-orangeFpt-200'
                      }`}
                  >
                    Review & Submit →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className='animate-fade-in'>
                <div className='p-2 space-y-4'>
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
                    className='px-8 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 transition-all font-bold text-slate-700 border-2 border-slate-300'
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className='bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-10 py-3.5 rounded-xl hover:shadow-lg shadow-emerald-200 transform hover:scale-105 active:scale-95 transition-all font-bold flex items-center gap-2'
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
            <h3 className='text-red-600 font-semibold mb-2'>Error list:</h3>
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

export default CreateClassForm;