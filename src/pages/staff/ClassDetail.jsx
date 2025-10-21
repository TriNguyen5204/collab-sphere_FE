import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getClassDetail,
  getAllLecturer,
  getAllStudent,
  assignLecturerIntoClass,
  addStudentIntoClass,
} from '../../services/userService';
import { Calendar, Users, FileText, Layers, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SectionCard from '../../components/ui/SectionCard';
import Header from '../../components/layout/Header';

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
        setLecturerList(lecturers?.lecturerList ?? []);
        setStudentList(students?.studentList ?? []);
      } catch (err) {
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
        <p className='text-gray-500 animate-pulse'>Loading class details...</p>
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center h-[70vh]'>
        <p className='text-red-500 font-medium'>{error}</p>
      </div>
    );

  if (!classDetail) return null;

  return (
    <>
      <Header />
      <div className='p-8 space-y-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          {/* Left side — Class info */}
          <div>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <UserCircle size={36} className='text-blue-600' />
              {classDetail.className}
            </h1>
            <p className='text-gray-600 mt-1'>
              {classDetail.subjectCode} — {classDetail.subjectName}
            </p>
          </div>

          {/* Right side — Created date + Add button */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            {/* Created date */}
            <div className='flex items-center gap-2 text-gray-700 text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200'>
              <Calendar size={16} className='text-gray-500' />
              <span>
                Created on{' '}
                {new Date(classDetail.createdDate).toLocaleDateString('en-GB')}
              </span>
            </div>

            {/* Add Lecturer button */}
            <button
              onClick={() => setShowLecturerModal(true)}
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2}
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Lecturer
            </button>
          </div>
        </div>

        {/* Class Info */}
        <motion.div
          className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className='text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700'>
            <FileText size={20} /> Class Information
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-gray-700'>
            <p>
              <strong>Lecturer:</strong> {classDetail.lecturerName} (
              {classDetail.lecturerCode})
            </p>
            <p>
              <strong>Members:</strong> {classDetail.memberCount}
            </p>
            <p>
              <strong>Teams:</strong> {classDetail.teamCount}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={`font-medium px-2 py-1 rounded ${
                  classDetail.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {classDetail.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Members */}
        <SectionCard
          title='Class Members'
          icon={<Users size={20} />}
          buttonLabel='Add Student'
          buttonColor='blue'
          onButtonClick={() => setShowStudentModal(true)}
        >
          {classDetail.classMembers.length === 0 ? (
            <EmptyState text='No members found.' />
          ) : (
            <Table
              headers={[
                'Student Code',
                'Full Name',
                'Address',
                'Phone',
                'Status',
              ]}
              rows={classDetail.classMembers.map(m => [
                m.studentCode,
                m.fullname,
                m.address,
                m.phoneNumber,
                m.status === 0 ? (
                  <span className='text-yellow-600 font-medium'>Pending</span>
                ) : (
                  <span className='text-green-600 font-medium'>Active</span>
                ),
              ])}
            />
          )}
        </SectionCard>

        {/* Projects */}
        <SectionCard title='Project Assignments' icon={<Layers size={20} />}>
          {classDetail.projectAssignments.length === 0 ? (
            <EmptyState text='No projects assigned.' />
          ) : (
            <div className='grid md:grid-cols-2 gap-4'>
              {classDetail.projectAssignments.map(p => (
                <motion.div
                  key={p.projectAssignmentId}
                  className='border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition'
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className='font-semibold text-gray-900 mb-1'>
                    {p.projectName}
                  </h3>
                  <p className='text-sm text-gray-600 mb-2'>{p.description}</p>
                  <p className='text-xs text-gray-500'>
                    Assigned:{' '}
                    {new Date(p.assignedDate).toLocaleDateString('en-GB')}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Teams + Add Lecturer */}
        <SectionCard title='Teams' icon={<UserCircle size={20} />}>
          {classDetail.teams.length === 0 ? (
            <EmptyState text='No teams created yet.' />
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {classDetail.teams.map(team => (
                <motion.div
                  key={team.teamId}
                  className='border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition'
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className='font-semibold text-gray-900 mb-1'>
                    {team.teamName}
                  </h3>
                  <p className='text-sm text-gray-600 mb-2'>
                    Project: {team.projectName}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {new Date(team.createdDate).toLocaleDateString('en-GB')} →{' '}
                    {new Date(team.endDate).toLocaleDateString('en-GB')}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Modals */}
        <AnimatePresence>
          {showStudentModal && (
            <Modal
              title='Add Students to Class'
              onClose={() => setShowStudentModal(false)}
            >
              {studentList.length === 0 ? (
                <EmptyState text='No students available.' />
              ) : (
                <div className='space-y-4'>
                  <Table
                    headers={['Select', 'Student Code', 'Full Name']}
                    rows={studentList.map(s => [
                      <input
                        type='checkbox'
                        checked={selectedStudents.some(
                          st => st.studentId === s.uId
                        )}
                        onChange={() => handleCheckboxChange(s.uId, s.fullname)}
                      />,
                      s.studentCode,
                      s.fullname,
                    ])}
                  />
                  <div className='flex justify-end'>
                    <button
                      onClick={handleAddStudent}
                      className='bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition'
                    >
                      Add Selected Students
                    </button>
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
                <EmptyState text='No lecturers available.' />
              ) : (
                <Table
                  headers={['Lecturer Code', 'Full Name', 'Action']}
                  rows={lecturerList.map(l => [
                    l.lecturerCode,
                    l.fullname,
                    <button
                      onClick={() => handleAddLecturer(l.uId)}
                      className='text-green-600 hover:underline'
                    >
                      Add
                    </button>,
                  ])}
                />
              )}
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function EmptyState({ text }) {
  return <p className='text-gray-500 italic text-center py-6'>{text}</p>;
}
