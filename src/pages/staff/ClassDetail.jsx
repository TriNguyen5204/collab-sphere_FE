import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getClassDetail,
  getAllLecturer,
  getAllStudent,
  assignLecturerIntoClass,
  addStudentIntoClass,
} from '../../services/userService';
import {
  Calendar,
  Users,
  FileText,
  Layers,
  UserCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import ModalWrapper from '../../components/layout/ModalWrapper';
import Table from '../../components/ui/Table';
import SectionCard from '../../components/ui/SectionCard';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';
import UpdateClassForm from '../../features/staff/components/UpdateClassForm';

export default function ClassDetail() {
  const { classId } = useParams();
  const [classDetail, setClassDetail] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [lecturerList, setLecturerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMembers, setShowMembers] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [cls, lecturers, students] = await Promise.all([
          getClassDetail(classId),
          getAllLecturer(),
          getAllStudent(),
        ]);
        setClassDetail(cls);
        setLecturerList(lecturers?.list ?? []);
        setStudentList(students?.list ?? []);
      } catch (err) {
        console.error(err);
        setError('Failed to load class details');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [classId]);

  const handleAddStudent = async () => {
    if (selectedStudents.length === 0) {
      toast.warning('Please select at least one student!');
      return;
    }

    try {
      const res = await addStudentIntoClass(classId, selectedStudents);
      if (res) {
        toast.success('✅ Students added successfully!');
        const updatedClass = await getClassDetail(classId);
        setClassDetail(updatedClass);
        setSelectedStudents([]);
        setShowStudentModal(false);
      }
    } catch {
      toast.error('Failed to add students.');
    }
  };

  const handleAddLecturer = async lecturerId => {
    try {
      const response = await assignLecturerIntoClass(classId, lecturerId);
      if (response.isSuccess) {
        toast.success(response.message);
        const updatedClass = await getClassDetail(classId);
        setClassDetail(updatedClass);
        setShowLecturerModal(false);
      }
    } catch {
      toast.error('Failed to add lecturer.');
    }
  };

  const handleCheckboxChange = (studentId, fullname) => {
    setSelectedStudents(prev =>
      prev.some(s => s.studentId === studentId)
        ? prev.filter(s => s.studentId !== studentId)
        : [...prev, { studentId, studentName: fullname }]
    );
  };

  if (loading)
    return (
      <div className='flex justify-center items-center h-[70vh]'>
        <div className='text-center space-y-3'>
          <div className='w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto'></div>
          <p className='text-gray-600 font-medium'>Loading class details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center h-[70vh]'>
        <div className='text-center space-y-3'>
          <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto'>
            <svg
              className='w-8 h-8 text-red-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <p className='text-red-600 font-medium text-lg'>{error}</p>
        </div>
      </div>
    );

  if (!classDetail) return null;

  return (
    <StaffDashboardLayout>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40'>
        {/* Header Section - Hero Style */}
        <div className='relative overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5'></div>
          <div
            className='absolute inset-0 opacity-30'
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`,
            }}
          ></div>

          <div className='relative px-6 py-8 sm:px-8 sm:py-12'>
            <div className='max-w-7xl mx-auto'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='space-y-6'
              >
                {/* Breadcrumb */}
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <BookOpen size={16} />
                  <span>Classes</span>
                  <span>/</span>
                  <span className='text-gray-900 font-medium'>
                    {classDetail.className}
                  </span>
                </div>

                {/* Main Header */}
                <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
                        <GraduationCap className='text-white' size={28} />
                      </div>
                      <div>
                        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight'>
                          {classDetail.className}
                        </h1>
                        <p className='text-gray-600 mt-1 flex items-center gap-2'>
                          <span className='font-medium text-blue-600'>
                            {classDetail.subjectCode}
                          </span>
                          <span>•</span>
                          <span>{classDetail.subjectName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className='flex flex-wrap gap-3 mt-4'>
                      <div className='flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm'>
                        <Users size={14} className='text-blue-600' />
                        <span className='text-sm font-medium text-gray-700'>
                          {classDetail.memberCount} members
                        </span>
                      </div>
                      <div className='flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm'>
                        <Layers size={14} className='text-indigo-600' />
                        <span className='text-sm font-medium text-gray-700'>
                          {classDetail.teamCount} teams
                        </span>
                      </div>
                      <div className='flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm'>
                        <Calendar size={14} className='text-purple-600' />
                        <span className='text-sm font-medium text-gray-700'>
                          {new Date(classDetail.createdDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${
                          classDetail.isActive
                            ? 'bg-emerald-50/80 backdrop-blur-sm border-emerald-200/50'
                            : 'bg-gray-50/80 backdrop-blur-sm border-gray-200/50'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${classDetail.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                        ></span>
                        <span
                          className={`text-sm font-medium ${classDetail.isActive ? 'text-emerald-700' : 'text-gray-600'}`}
                        >
                          {classDetail.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-wrap gap-3'>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUpdateModal(true)}
                      className='px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 shadow-sm transition-all duration-200 flex items-center gap-2'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                      Edit Class
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowLecturerModal(true)}
                      className='px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-2'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 4v16m8-8H4'
                        />
                      </svg>
                      Add Lecturer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-6'>
          {/* Class Info Card - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 p-6'
          >
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                <FileText size={20} className='text-white' />
              </div>
              <h2 className='text-xl font-bold text-gray-900'>
                Class Information
              </h2>
            </div>

            <div className='grid sm:grid-cols-2 gap-5'>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Lecturer</p>
                <p className='text-base text-gray-900 font-semibold'>
                  {classDetail.lecturerName}
                </p>
                <p className='text-sm text-gray-600'>
                  {classDetail.lecturerCode}
                </p>
              </div>

              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>
                  Class Statistics
                </p>
                <div className='flex gap-4'>
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>
                      {classDetail.memberCount}
                    </p>
                    <p className='text-xs text-gray-600'>Members</p>
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-indigo-600'>
                      {classDetail.teamCount}
                    </p>
                    <p className='text-xs text-gray-600'>Teams</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Members Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 overflow-hidden'
          >
            {/* Header */}
            <div className='px-6 py-5 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                    <Users size={20} className='text-white' />
                  </div>
                  <div>
                    <h2 className='text-xl font-bold text-gray-900'>
                      Class Members
                    </h2>
                    <p className='text-sm text-gray-600 mt-0.5'>
                      {classDetail.classMembers.length}{' '}
                      {classDetail.classMembers.length === 1
                        ? 'student'
                        : 'students'}{' '}
                      enrolled
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowStudentModal(true)}
                    className='px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2'
                  >
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                    Add Student
                  </motion.button>

                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className='p-2 hover:bg-white/50 rounded-lg transition-colors'
                  >
                    <motion.div
                      animate={{ rotate: showMembers ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronUp size={20} className='text-gray-600' />
                    </motion.div>
                  </button>
                </div>
              </div>
            </div>

            {/* Members Grid */}
            <AnimatePresence>
              {showMembers && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {classDetail.classMembers.length === 0 ? (
                    <div className='p-12 text-center'>
                      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Users size={24} className='text-gray-400' />
                      </div>
                      <p className='text-gray-500 font-medium'>
                        No members yet
                      </p>
                      <p className='text-sm text-gray-400 mt-1'>
                        Add students to get started
                      </p>
                    </div>
                  ) : (
                    <div className='p-6'>
                      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {classDetail.classMembers.map((member, index) => (
                          <motion.div
                            key={member.classMemberId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className='group relative bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-4 border border-gray-200/50 hover:border-blue-300/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300'
                          >
                            {/* Status Badge */}
                            <div className='absolute top-3 right-3'>
                              {member.status === 0 ? (
                                <div className='flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-full border border-amber-200/50'>
                                  <span className='w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse'></span>
                                  <span className='text-xs font-medium text-amber-700'>
                                    Pending
                                  </span>
                                </div>
                              ) : (
                                <div className='flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200/50'>
                                  <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full'></span>
                                  <span className='text-xs font-medium text-emerald-700'>
                                    Active
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className='flex items-start gap-4'>
                              {/* Avatar */}
                              <div className='relative flex-shrink-0'>
                                <div className='w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white shadow-lg'>
                                  <img
                                    src={
                                      member.avatarImg ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullname)}&background=4f46e5&color=fff&size=128&bold=true`
                                    }
                                    alt={member.fullname}
                                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                    onError={e => {
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullname)}&background=4f46e5&color=fff&size=128&bold=true`;
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Info */}
                              <div className='flex-1 min-w-0 pt-1'>
                                <h3 className='font-bold text-gray-900 truncate text-base mb-0.5'>
                                  {member.fullname}
                                </h3>
                                <p className='text-sm text-blue-600 font-medium mb-3'>
                                  {member.studentCode}
                                </p>

                                <div className='space-y-1.5'>
                                  {member.phoneNumber && (
                                    <div className='flex items-center gap-2 text-xs text-gray-600'>
                                      <Phone
                                        size={12}
                                        className='text-gray-400 flex-shrink-0'
                                      />
                                      <span className='truncate'>
                                        {member.phoneNumber}
                                      </span>
                                    </div>
                                  )}

                                  {member.address && (
                                    <div className='flex items-center gap-2 text-xs text-gray-600'>
                                      <MapPin
                                        size={12}
                                        className='text-gray-400 flex-shrink-0'
                                      />
                                      <span className='truncate'>
                                        {member.address}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 p-6'
          >
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center'>
                <Layers size={20} className='text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>
                  Project Assignments
                </h2>
                <p className='text-sm text-gray-600 mt-0.5'>
                  {classDetail.projectAssignments.length} projects
                </p>
              </div>
            </div>

            {classDetail.projectAssignments.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Layers size={24} className='text-gray-400' />
                </div>
                <p className='text-gray-500 font-medium'>
                  No projects assigned yet
                </p>
              </div>
            ) : (
              <div className='grid sm:grid-cols-2 gap-4'>
                {classDetail.projectAssignments.map((project, index) => (
                  <motion.div
                    key={project.projectAssignmentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='group bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-5 border border-gray-200/50 hover:border-purple-300/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0'>
                        <FileText size={18} className='text-white' />
                      </div>
                      <span className='text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full'>
                        {new Date(project.assignedDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>

                    <h3 className='font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors'>
                      {project.projectName}
                    </h3>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                      {project.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Teams Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-gray-200/50 p-6'
          >
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center'>
                <UserCircle size={20} className='text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Teams</h2>
                <p className='text-sm text-gray-600 mt-0.5'>
                  {classDetail.teams.length} active teams
                </p>
              </div>
            </div>

            {classDetail.teams.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <UserCircle size={24} className='text-gray-400' />
                </div>
                <p className='text-gray-500 font-medium'>
                  No teams created yet
                </p>
              </div>
            ) : (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {classDetail.teams.map((team, index) => (
                  <motion.div
                    key={team.teamId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className='group bg-gradient-to-br from-white to-emerald-50/30 rounded-xl p-5 border border-gray-200/50 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300'
                  >
                    <div className='flex items-center gap-3 mb-4'>
                      <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0'>
                        <span className='text-white font-bold text-sm'>
                          {team.teamName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors'>
                          {team.teamName}
                        </h3>
                      </div>
                    </div>

                    <div className='space-y-2 mb-3'>
                      <div className='flex items-center gap-2 text-sm text-gray-700'>
                        <FileText size={14} className='text-gray-400' />
                        <span className='truncate'>{team.projectName}</span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-3 border-t border-gray-200/50'>
                      <span className='text-xs text-gray-500'>
                        {new Date(team.createdDate).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </span>
                      <span className='text-xs text-gray-500'>→</span>
                      <span className='text-xs text-gray-500'>
                        {new Date(team.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showStudentModal && (
            <Modal
              title='Add Students to Class'
              onClose={() => setShowStudentModal(false)}
            >
              {studentList.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>No students available</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  <Table
                    headers={['Select', 'Avatar', 'Student Code', 'Full Name']}
                    rows={studentList.map(s => [
                      // Selection checkbox
                      <input
                        type='checkbox'
                        checked={selectedStudents.some(
                          st => st.studentId === s.uId
                        )}
                        onChange={() => handleCheckboxChange(s.uId, s.fullname)}
                        className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                      />,

                      // Avatar
                      <img
                        src={
                          s.avatarPublicId
                            ? `https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${s.avatarPublicId}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                s.fullname
                              )}&background=4f46e5&color=fff&size=128&bold=true`
                        }
                        alt={s.fullname}
                        className='w-10 h-10 rounded-full object-cover shadow'
                      />,

                      // Student Code
                      s.studentCode,

                      // Fullname
                      s.fullname,
                    ])}
                  />

                  <div className='flex justify-end pt-4'>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddStudent}
                      className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200'
                    >
                      Add Selected Students
                    </motion.button>
                  </div>
                </div>
              )}
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLecturerModal && (
            <Modal
              title='Add Lecturer to Class'
              onClose={() => setShowLecturerModal(false)}
            >
              {lecturerList.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>No lecturers available</p>
                </div>
              ) : (
                <Table
                  headers={['Avatar', 'Lecturer Code', 'Full Name', 'Action']}
                  rows={lecturerList.map(l => [
                    // Avatar
                    <img
                      src={
                        l.avatarPublicId
                          ? `https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${l.avatarPublicId}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              l.fullname
                            )}&background=6366f1&color=fff&size=128&bold=true`
                      }
                      alt={l.fullname}
                      className='w-10 h-10 rounded-full object-cover shadow'
                    />,

                    l.lecturerCode,

                    l.fullname,

                    // Button Add
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddLecturer(l.uId)}
                      className='px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors'
                    >
                      Add
                    </motion.button>,
                  ])}
                />
              )}
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          <ModalWrapper
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
          >
            <UpdateClassForm classData={classDetail} />
          </ModalWrapper>
        </AnimatePresence>
      </div>
    </StaffDashboardLayout>
  );
}
