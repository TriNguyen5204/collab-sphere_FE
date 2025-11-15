import { useEffect, useState } from 'react';
import {
  createClass,
  getAllStudent,
  getAllLecturer,
  getAllSubject,
  getSemester,
} from '../../services/userService';
import {
  Check,
  Users,
  BookOpen,
  UserCheck,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';

const CreateClassForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState([]);
  const [apiErrors, setApiErrors] = useState([]);

  const [formData, setFormData] = useState({
    className: '',
    subjectId: '',
    semesterId: '',
    lecturerId: '',
    enrolKey: '',
    studentIds: [],
    isActive: true,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, lecturersData, subjectsData, semesterData] =
          await Promise.all([
            getAllStudent(),
            getAllLecturer(),
            getAllSubject(),
            getSemester(),
          ]);
        setStudents(studentsData.list || []);
        setLecturers(lecturersData.list || []);
        setSubjects(subjectsData || []);
        setSemester(semesterData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
        enrolKey: '',
        studentIds: [],
        isActive: true,
      });
      setStep(1);
    } catch (error) {
      const apiErrorList = error?.response?.data?.errorList || [];
      setApiErrors(apiErrorList);

      if (!apiErrorList.length) {
        toast.error(error.message || 'Đã xảy ra lỗi khi import');
      }
    }
  };

  // Step header component
  const StepHeader = ({ title }) => (
    <h2 className='text-2xl font-bold text-gray-800 mb-6'>{title}</h2>
  );

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

                {/* Join Code */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Join Code
                  </label>
                  <input
                    type='text'
                    name='enrolKey'
                    value={formData.enrolKey}
                    onChange={handleChange}
                    placeholder='e.g., ABC123XYZ'
                    className='w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-mono'
                  />
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
              <div className='bg-gray-50 rounded-xl p-4 mb-4'>
                <p className='text-sm text-gray-600'>
                  Selected:{' '}
                  <span className='font-bold text-blue-600'>
                    {formData.studentIds.length}
                  </span>{' '}
                  student(s)
                </p>
              </div>

              <div className='max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 space-y-2'>
                {students.length > 0 ? (
                  students.map(stu => (
                    <label
                      key={stu.uId}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
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
                      <span className='font-medium text-gray-700'>
                        {stu.fullname}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className='text-center text-gray-500 py-8'>
                    No students available.
                  </p>
                )}
              </div>

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
              <div className='space-y-4'>
                {lecturers.map(lec => (
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
                    <div>
                      <p className='font-semibold text-gray-800'>
                        {lec.fullname}
                      </p>
                      <p className='text-sm text-gray-500'>Lecturer</p>
                    </div>
                  </label>
                ))}
              </div>

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
                  icon={<BookOpen />}
                  label='Join Code'
                  value={formData.enrolKey}
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
