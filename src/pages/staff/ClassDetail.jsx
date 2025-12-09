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
  LayoutDashboard,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  ArrowRight,
  BookOpen,
  MapPin,
  Phone,
  Search,
  PenSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import ModalWrapper from '../../components/layout/ModalWrapper';
import Table from '../../components/ui/Table';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';
import UpdateClassForm from '../../features/staff/components/UpdateClassForm';

// --- Avatar Component Helper (Styled like ClassDetailPage) ---
const Avatar = ({ src, name, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  
  // Generate initials
  const getInitials = (n) => {
    const segments = String(n || '').trim().split(/\s+/).filter(Boolean);
    if (!segments.length) return 'NA';
    if (segments.length === 1) return segments[0].slice(0, 2).toUpperCase();
    return (segments[0].charAt(0) + segments[segments.length - 1].charAt(0)).toUpperCase();
  };

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} object-cover bg-white`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase select-none shadow-sm border border-white`}
      style={{ fontSize: '0.85em' }}
    >
      {getInitials(name)}
    </div>
  );
};

// --- Utility Format Date ---
const formatDate = (value) => {
  if (!value) return 'TBA';
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

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
  const [studentSearch, setStudentSearch] = useState('');
  const [lecturerSearch, setLecturerSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [cls, lecturers, students] = await Promise.all([
          getClassDetail(classId),
          getAllLecturer(true),
          getAllStudent(true),
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

  const filteredStudentList = studentList.filter(s =>
    s.fullname?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredLecturerList = lecturerList.filter(l =>
    l.fullname?.toLowerCase().includes(lecturerSearch.toLowerCase())
  );

  if (loading)
    return (
      <StaffDashboardLayout>
        <div className='flex justify-center items-center h-[70vh]'>
          <div className='w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin'></div>
        </div>
      </StaffDashboardLayout>
    );

  if (error)
    return (
      <StaffDashboardLayout>
        <div className='mx-auto mt-10 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800'>
          <AlertTriangle className='mx-auto mb-2 h-8 w-8 text-red-500' />
          {error}
        </div>
      </StaffDashboardLayout>
    );

  if (!classDetail) return null;

  return (
    <StaffDashboardLayout>
      <div className='min-h-screen space-y-8 bg-slate-50/50 pb-10'>
        {/* Breadcrumbs Placeholder */}
        <div className="flex items-center gap-2 text-sm text-slate-500 px-1">
          <BookOpen className="h-4 w-4" />
          <span>Classes</span>
          <span>/</span>
          <span className="font-semibold text-slate-700">{classDetail.className}</span>
        </div>

        {/* --- HERO SECTION --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl"></div>
          <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-blue-50/50 blur-2xl"></div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-lg bg-indigo-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-indigo-700">
                  {classDetail.subjectCode}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                  classDetail.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {classDetail.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{classDetail.className}</h1>
                <p className="mt-2 text-lg text-slate-500">
                  {classDetail.subjectName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                   <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                   </div>
                  <span className="font-medium">
                    Lecturer: {classDetail.lecturerName || 'Not Assigned'}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Created: {formatDate(classDetail.createdDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <PenSquare className="h-4 w-4" />
                Edit Class
              </button>
              
              <button
                onClick={() => setShowLecturerModal(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
              >
                <GraduationCap className="h-4 w-4" />
                {classDetail.lecturerName ? 'Change Lecturer' : 'Assign Lecturer'}
              </button>

              <button
                onClick={() => setShowStudentModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* --- STATS STRIP --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-500">Students</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classDetail.memberCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-500">Teams</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classDetail.teamCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-500">Projects</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classDetail.projectAssignments.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-500">Status</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{classDetail.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 mx-auto">
          
          {/* LEFT COLUMN: TEAMS & ROSTER */}
          <div className="flex flex-col gap-8 xl:col-span-2">
            
            {/* 1. ACTIVE TEAMS */}
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-slate-500" />
                Active Teams
              </h2>

              {classDetail.teams.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {classDetail.teams.map((team, index) => (
                    <div key={team.teamId || index} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        {/* Left: Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={team.teamName}
                              className="h-10 w-10 rounded-full"
                            />
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {team.teamName}
                            </h3>
                          </div>

                          <div className="pl-13 sm:pl-12">
                             <p className="font-medium text-slate-700">{team.projectName || 'No Project Assigned'}</p>
                             <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>End: {formatDate(team.endDate)}</span>
                                </div>
                             </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 pl-12 sm:pl-0">
                          {/* Placeholder for View Board logic if needed */}
                           <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200">
                              {team.teamCode}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                   <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <LayoutDashboard className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">No Teams Created</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    This class currently has no active teams.
                  </p>
                </div>
              )}
            </div>

            {/* 2. CLASS ROSTER (Members) */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <Users className="h-5 w-5 text-slate-500" />
                   Class Roster
                </h2>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {classDetail.classMembers.length} Enrolled
                </span>
              </div>

              {classDetail.classMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-l-xl">Student</th>
                        <th className="px-4 py-3 font-semibold">Code</th>
                        <th className="px-4 py-3 font-semibold">Contact</th>
                        <th className="px-4 py-3 font-semibold rounded-r-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classDetail.classMembers.map((member) => (
                        <tr key={member.classMemberId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={member.avatarImg}
                                name={member.fullname}
                                className="h-9 w-9 rounded-full border border-slate-200 shadow-sm"
                              />
                              <div>
                                <p className="font-semibold text-slate-900">{member.fullname}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{member.studentCode}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 text-xs">
                                {member.phoneNumber && (
                                    <span className="flex items-center gap-1.5 text-slate-500">
                                        <Phone className="w-3 h-3" /> {member.phoneNumber}
                                    </span>
                                )}
                                {member.address && (
                                    <span className="flex items-center gap-1.5 text-slate-400">
                                        <MapPin className="w-3 h-3" /> <span className="truncate max-w-[150px]">{member.address}</span>
                                    </span>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                             {member.status === 1 ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                  Active
                                </span>
                             ) : (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                  Pending
                                </span>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">No students enrolled yet.</div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="space-y-6 xl:col-span-1">
             <div className="sticky top-6 space-y-6">
                
                {/* Assignments / Projects */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Assignments</h2>
                  </div>

                  {classDetail.projectAssignments.length > 0 ? (
                    <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                      {classDetail.projectAssignments.map((project) => (
                        <div key={project.projectAssignmentId} className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm">
                          <div className="flex justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                                {project.projectName}
                              </h3>
                              <h4 className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</h4>
                            </div>
                            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                                <FileText className="h-4 w-4 text-indigo-500" />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 border-t border-slate-200 pt-3">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">
                              Assigned: {formatDate(project.assignedDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="py-8 text-center text-sm text-slate-500">
                        No projects assigned.
                     </div>
                  )}
                </div>
             </div>
          </aside>

        </div>

        {/* --- MODALS (Preserved Logic, Updated Wrapper Styles if necessary) --- */}
        <AnimatePresence>
          {showStudentModal && (
            <Modal
              title='Add Students to Class'
              onClose={() => setShowStudentModal(false)}
            >
              <div className='relative pb-5'>
                <div className="relative">
                    <input
                    type='text'
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder='Search student name...'
                    className='w-full pl-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all'
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <span className='absolute right-1 top-11 text-slate-400 text-xs'>
                  Showing {filteredStudentList.length} of {studentList.length}
                </span>
              </div>

              {filteredStudentList.length === 0 ? (
                <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                  <p className='text-slate-500'>No students available</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Reuse Table Component */}
                  <Table
                    headers={['Select', 'Avatar', 'Code', 'Full Name']}
                    rows={filteredStudentList.map(s => [
                      <input
                        type='checkbox'
                        checked={selectedStudents.some(
                          st => st.studentId === s.uId
                        )}
                        onChange={() => handleCheckboxChange(s.uId, s.fullname)}
                        className='w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500'
                      />,
                      <Avatar src={s.avatarPublicId ? `https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${s.avatarPublicId}` : null} name={s.fullname} className="w-8 h-8 rounded-full" />,
                      s.studentCode,
                      s.fullname,
                    ])}
                  />

                  <div className='flex justify-end pt-4 border-t border-slate-100'>
                    <button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddStudent}
                      className='px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all'
                    >
                      Add Selected Students ({selectedStudents.length})
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
              title='Assign Lecturer'
              onClose={() => setShowLecturerModal(false)}
            >
              <div className='relative pb-5'>
                <div className="relative">
                    <input
                    type='text'
                    value={lecturerSearch}
                    onChange={e => setLecturerSearch(e.target.value)}
                    placeholder='Search lecturer name...'
                    className='w-full pl-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all'
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              {filteredLecturerList.length === 0 ? (
                <div className='text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                  <p className='text-slate-500'>No lecturers available</p>
                </div>
              ) : (
                <Table
                  headers={['Avatar', 'Code', 'Name', 'Action']}
                  rows={filteredLecturerList.map(l => [
                    <Avatar src={l.avatarPublicId ? `https://res.cloudinary.com/dn5xgbmqq/image/upload/v1/${l.avatarPublicId}` : null} name={l.fullname} className="w-8 h-8 rounded-full" />,
                    l.lecturerCode,
                    l.fullname,
                    <button
                      onClick={() => handleAddLecturer(l.uId)}
                      className='px-3 py-1.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 text-xs font-semibold rounded-lg transition-all shadow-sm'
                    >
                      Assign
                    </button>,
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