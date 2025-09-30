import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  UserPlus,
  Download,
  Upload,
} from 'lucide-react';

export default function ImprovedClassDetail() {
  const [lecturers] = useState([
    { id: 1, name: 'Prof. John Doe', email: 'john.d@university.edu' },
    { id: 2, name: 'Prof. Emily Carter', email: 'emily.c@university.edu' },
    { id: 3, name: 'Prof. Michael Smith', email: 'michael.s@university.edu' },
  ]);
  const additionalStudents = [
    {
      id: 6,
      name: 'Jane Cooper',
      studentId: 'SE302145',
      birth: '07 March, 2002',
      email: 'jane.c@university.edu',
      phone: '+1 (555) 678-9012',
      avatar: 'https://i.pravatar.cc/40?img=6',
      status: 'active',
      gpa: 3.4,
      attendance: 85,
    },
    {
      id: 7,
      name: 'Robert Fox',
      studentId: 'SE402836',
      birth: '08 March, 2002',
      email: 'robert.f@university.edu',
      phone: '+1 (555) 789-0123',
      avatar: 'https://i.pravatar.cc/40?img=7',
      status: 'active',
      gpa: 3.9,
      attendance: 97,
    },
    {
      id: 8,
      name: 'Courtney Henry',
      studentId: 'SE509284',
      birth: '09 March, 2002',
      email: 'courtney.h@university.edu',
      phone: '+1 (555) 890-1234',
      avatar: 'https://i.pravatar.cc/40?img=8',
      status: 'inactive',
      gpa: 2.9,
      attendance: 70,
    },
    {
      id: 9,
      name: 'Devon Lane',
      studentId: 'SE682390',
      birth: '10 March, 2002',
      email: 'devon.l@university.edu',
      phone: '+1 (555) 901-2345',
      avatar: 'https://i.pravatar.cc/40?img=9',
      status: 'active',
      gpa: 3.5,
      attendance: 89,
    },
    {
      id: 10,
      name: 'Eleanor Pena',
      studentId: 'SE782341',
      birth: '11 March, 2002',
      email: 'eleanor.p@university.edu',
      phone: '+1 (555) 012-3456',
      avatar: 'https://i.pravatar.cc/40?img=10',
      status: 'active',
      gpa: 3.6,
      attendance: 93,
    },
  ];

  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Cameron Williamson',
      studentId: 'SE11111',
      birth: '01 March, 2002',
      email: 'cameron.w@university.edu',
      phone: '+1 (555) 123-4567',
      avatar: 'https://i.pravatar.cc/40?img=1',
      status: 'active',
      gpa: 3.8,
      attendance: 95,
    },
    {
      id: 2,
      name: 'Darlene Robertson',
      studentId: 'SE184727',
      birth: '03 March, 2002',
      email: 'darlene.r@university.edu',
      phone: '+1 (555) 234-5678',
      avatar: 'https://i.pravatar.cc/40?img=2',
      status: 'active',
      gpa: 3.6,
      attendance: 88,
    },
    {
      id: 3,
      name: 'Leslie Alexander',
      studentId: 'SE252322',
      birth: '04 March, 2002',
      email: 'leslie.a@university.edu',
      phone: '+1 (555) 345-6789',
      avatar: 'https://i.pravatar.cc/40?img=3',
      status: 'active',
      gpa: 3.9,
      attendance: 92,
    },
    {
      id: 4,
      name: 'Albert Flores',
      studentId: 'SE105823',
      birth: '05 March, 2002',
      email: 'albert.f@university.edu',
      phone: '+1 (555) 456-7890',
      avatar: 'https://i.pravatar.cc/40?img=4',
      status: 'inactive',
      gpa: 3.2,
      attendance: 75,
    },
    {
      id: 5,
      name: 'Dianne Russell',
      studentId: 'SE201253',
      birth: '06 March, 2002',
      email: 'dianne.r@university.edu',
      phone: '+1 (555) 567-8901',
      avatar: 'https://i.pravatar.cc/40?img=5',
      status: 'active',
      gpa: 3.7,
      attendance: 90,
    },
  ]);

  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Class information
  const classInfo = {
    name: 'Advanced Programming Concepts',
    code: 'CS-301',
    semester: 'Fall 2024',
    lecturer: 'Prof. Sarah Johnson',
    schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
    room: 'Computer Lab A-201',
    credits: 3,
    description:
      'An advanced course covering object-oriented programming, data structures, and algorithm design patterns.',
  };
  const handleAddLecturer = lecturer => {
    setSelectedLecturer(lecturer);
    setShowLecturerModal(false);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(student => student.id)));
    }
  };

  const handleSelectStudent = id => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  const handleDeleteClick = student => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);

    // Simulate API call
    setTimeout(() => {
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setIsDeleting(false);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }, 1500);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
    setIsDeleting(false);
  };

  const getStatusBadge = status => {
    const statusConfig = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        dot: 'bg-green-500',
      },
      inactive: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    };
    const config = statusConfig[status];

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const getGpaColor = gpa => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgGPA = (
    students.reduce((sum, student) => sum + student.gpa, 0) / students.length
  ).toFixed(2);
  const avgAttendance = Math.round(
    students.reduce((sum, student) => sum + student.attendance, 0) /
      students.length
  );

  const navigate = direction => {
    console.log(`Navigate ${direction}`);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate(-1)}
                className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all'
              >
                <ArrowLeft className='w-4 h-4' />
                <span className='font-medium'>Back</span>
              </button>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
                  <BookOpen className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>
                    {classInfo.name}
                  </h1>
                  <p className='text-sm text-gray-600'>
                    {classInfo.code} • {classInfo.semester}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all'>
                <Download className='w-4 h-4' />
                <span className='hidden sm:inline'>Export</span>
              </button>
              <button 
              onClick={() => setShowStudentModal(true)}
              className='flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all'>
                <UserPlus className='w-4 h-4' />
                <span className='hidden sm:inline'>Add Student</span>
              </button>
              <button
                onClick={() => setShowLecturerModal(true)}
                className='flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all'
              >
                <UserPlus className='w-4 h-4' />
                <span className='hidden sm:inline'>Add Lecturer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto p-6'>
        {/* Class Info Cards */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8'>
          {/* Class Details */}
          <div className='lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center'>
                <BookOpen className='w-4 h-4 text-indigo-600' />
              </div>
              <h3 className='font-semibold text-gray-900'>Class Information</h3>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Users className='w-4 h-4 text-gray-400' />
                <span className='text-sm text-gray-600'>Lecturer:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {classInfo.lecturer}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <Calendar className='w-4 h-4 text-gray-400' />
                <span className='text-sm text-gray-600'>Schedule:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {classInfo.schedule}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <GraduationCap className='w-4 h-4 text-gray-400' />
                <span className='text-sm text-gray-600'>Room:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {classInfo.room}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                <Users className='w-6 h-6 text-blue-600' />
              </div>
              <p className='text-2xl font-bold text-gray-900'>
                {students.length}
              </p>
              <p className='text-sm text-gray-600'>Total Students</p>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                <GraduationCap className='w-6 h-6 text-green-600' />
              </div>
              <p className='text-2xl font-bold text-gray-900'>{avgGPA}</p>
              <p className='text-sm text-gray-600'>Average GPA</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-4 flex-1'>
              <div className='relative flex-1 max-w-md'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Search students...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>
            </div>

            {selectedStudents.size > 0 && (
              <div className='flex items-center gap-3'>
                <span className='text-sm text-gray-600'>
                  {selectedStudents.size} selected
                </span>
                <button className='px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors'>
                  Remove Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left'>
                    <input
                      type='checkbox'
                      checked={selectedStudents.size === students.length}
                      onChange={handleSelectAll}
                      className='w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500'
                    />
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Student
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Student ID
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Contact
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Performance
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className='hover:bg-gray-50 transition-colors group'
                  >
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedStudents.has(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className='w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500'
                      />
                    </td>

                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <div className='relative'>
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className='w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm'
                          />
                        </div>
                        <div>
                          <div className='font-semibold text-gray-900'>
                            {student.name}
                          </div>
                          <div className='text-sm text-gray-600'>
                            Born: {student.birth}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className='px-6 py-4'>
                      <div className='font-mono text-sm font-semibold text-gray-900'>
                        {student.studentId}
                      </div>
                    </td>

                    <td className='px-6 py-4'>
                      <div className='text-sm'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Mail className='w-3 h-3 text-gray-400' />
                          <span className='text-gray-600'>{student.email}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Phone className='w-3 h-3 text-gray-400' />
                          <span className='text-gray-600'>{student.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className='px-6 py-4'>
                      <div className='text-sm'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-gray-600'>GPA:</span>
                          <span
                            className={`font-semibold ${getGpaColor(student.gpa)}`}
                          >
                            {student.gpa.toFixed(1)}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600'>Attendance:</span>
                          <span className='font-semibold text-gray-900'>
                            {student.attendance}%
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className='px-6 py-4'>
                      {getStatusBadge(student.status)}
                    </td>

                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <button className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all'>
                          <Eye className='w-4 h-4' />
                        </button>
                        <button className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all'>
                          <Edit3 className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className='text-center py-12'>
              <Users className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No students found
              </h3>
              <p className='text-gray-600'>
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden'>
            {/* Modal Header */}
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <Trash2 className='w-5 h-5 text-red-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Remove Student
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Remove student from class
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className='px-6 py-6'>
              <div className='text-center'>
                <img
                  src={studentToDelete.avatar}
                  alt={studentToDelete.name}
                  className='w-16 h-16 rounded-full mx-auto mb-4'
                />
                <h4 className='text-xl font-bold text-gray-900 mb-2'>
                  {studentToDelete.name}
                </h4>
                <p className='text-gray-600 mb-4'>
                  ID: {studentToDelete.studentId}
                </p>

                <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6'>
                  <p className='text-yellow-800 text-sm'>
                    This will remove the student from the class. Their progress
                    and grades will be preserved.
                  </p>
                </div>

                <p className='text-gray-600 text-sm'>
                  Are you sure you want to remove{' '}
                  <strong>{studentToDelete.name}</strong> from this class?
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
              <div className='flex items-center gap-3 justify-end'>
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50'
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isDeleting
                      ? 'bg-red-400 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className='w-4 h-4' />
                      Remove Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLecturerModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-md'>
            <h2 className='text-lg font-bold mb-4'>Select Lecturer</h2>
            <ul className='space-y-2'>
              {lecturers.map(lec => (
                <li
                  key={lec.id}
                  className='flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50'
                >
                  <div>
                    <p className='font-medium'>{lec.name}</p>
                    <p className='text-sm text-gray-500'>{lec.email}</p>
                  </div>
                  <button
                    onClick={() => handleAddLecturer(lec)}
                    className='px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700'
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowLecturerModal(false)}
              className='mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showStudentModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-md'>
            <h2 className='text-lg font-bold mb-4'>Select Lecturer</h2>
            <ul className='space-y-2'>
              {additionalStudents.map(student => (
                <li
                  key={student.id}
                  className='flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50'
                >
                  <div>
                    <p className='font-medium'>{student.name}</p>
                    <p className='text-sm text-gray-500'>{student.email}</p>
                  </div>
                  <button
                    onClick={() => handleAddLecturer(student)}
                    className='px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700'
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowStudentModal(false)}
              className='mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
