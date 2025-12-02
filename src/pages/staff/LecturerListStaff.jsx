import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Filter,
  ChevronDown,
  User,
  GraduationCap,
} from 'lucide-react';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateLecturerForm from '../../features/staff/components/CreateLecturerForm';
import CreateMultipleLecturerForm from '../../features/staff/components/CreateMultipleLecturerForm';
import CreateStudentForm from '../../features/staff/components/CreateStudentForm';
import CreateMultipleStudentForm from '../../features/staff/components/CreateMultipleStudent';
import EditAccountForm from '../../features/staff/components/EditAccountForm';
import Header from '../../components/layout/Header';
import { getAllLecturer, getAllStudent } from '../../services/userService';

export default function ImprovedAccountsTable() {
  const [accountType, setAccountType] = useState('lecturer');
  const [searchFilters, setSearchFilters] = useState({
    Email: '',
    FullName: '',
    Yob: null,
    LecturerCode: '',
    Major: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(searchFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMultipleOpen, setIsMultipleOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isMultipleStudentOpen, setIsMultipleStudentOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    const fetchLecturer = async () => {
      let response;
      if (accountType === 'lecturer') {
        response = await getAllLecturer(
          appliedFilters.Email,
          appliedFilters.FullName,
          appliedFilters.Yob,
          appliedFilters.LecturerCode,
          appliedFilters.Major,
          pageNum,
          pageSize
        );
      } else {
        response = await getAllStudent(
          appliedFilters.Email,
          appliedFilters.FullName,
          appliedFilters.Yob,
          appliedFilters.LecturerCode,
          appliedFilters.Major,
          pageNum,
          pageSize
        );
      }

      if (response?.list) {
        setAccounts(response.list);
        setPageCount(response.pageCount);
        setItemCount(response.itemCount);
      }
    };
    fetchLecturer();
  }, [
    appliedFilters.Email,
    appliedFilters.FullName,
    appliedFilters.LecturerCode,
    appliedFilters.Major,
    appliedFilters.Yob,
    accountType,
    appliedFilters,
    pageNum,
  ]);

  const handleApplyFilters = () => {
    setAppliedFilters(searchFilters);
    setPageNum(1);
  };

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < pageCount) setPageNum(pageNum + 1);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setSearchFilters({ ...searchFilters, [name]: value });
  };

  return (
    <>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Account Management
            </h1>
            <p className='text-gray-600'>
              Manage lecturers and students in the system
            </p>
          </div>

          <div className='flex gap-3 mb-6'>
            <button
              onClick={() => setAccountType('lecturer')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg border transition-all ${
                accountType === 'lecturer'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <User className='w-4 h-4' /> Lecturers
            </button>
            <button
              onClick={() => setAccountType('student')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg border transition-all ${
                accountType === 'student'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className='w-4 h-4' /> Students
            </button>
          </div>
          {/* Controls Bar */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              {/* Left side - Search and Filters */}
              <div className='flex items-center gap-4 flex-1'>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <Filter className='w-4 h-4' />
                  Filters
                </button>
                <button
                  onClick={handleApplyFilters}
                  className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all'
                >
                  <Search className='w-4 h-4' />
                  Search
                </button>
              </div>

              {/* Right side - Actions */}
              <div className='flex items-center gap-3'>
                {/* Create Lecturer Dropdown */}
                <div className='relative group'>
                  <button className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-all hover:shadow-md'>
                    <Plus className='w-4 h-4' />
                    Create Lecturer
                    <ChevronDown className='w-4 h-4' />
                  </button>
                  <div className='absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10'>
                    <button
                      onClick={() => setIsOpen(true)}
                      className='w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg'
                    >
                      Single Lecturer
                    </button>
                    <button
                      onClick={() => setIsMultipleOpen(true)}
                      className='w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg'
                    >
                      Multiple Lecturers
                    </button>
                  </div>
                </div>

                {/* Create Student Dropdown */}
                <div className='relative group'>
                  <button className='flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-green-700 transition-all hover:shadow-md'>
                    <Plus className='w-4 h-4' />
                    Create Student
                    <ChevronDown className='w-4 h-4' />
                  </button>
                  <div className='absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10'>
                    <button
                      onClick={() => setIsStudentOpen(true)}
                      className='w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg'
                    >
                      Single Student
                    </button>
                    <button
                      onClick={() => setIsMultipleStudentOpen(true)}
                      className='w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg'
                    >
                      Multiple Students
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Form */}
            {showFilters && (
              <div className='mt-6 grid grid-cols-1 md:grid-cols-5 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100'>
                {Object.entries(searchFilters).map(([key, value]) => (
                  <div key={key} className='flex flex-col'>
                    <label className='text-sm font-medium text-gray-700 mb-1'>
                      {key === 'LecturerCode' && accountType === 'student'
                        ? 'StudentCode'
                        : key}
                    </label>
                    <input
                      name={key}
                      value={value}
                      onChange={handleFilterChange}
                      placeholder={key}
                      className='px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accounts Table */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    {accountType === 'lecturer' ? 'Lecturer' : 'Student'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    {accountType === 'lecturer'
                      ? 'Lecturer Code'
                      : 'Student Code'}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Major
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    YOB
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {accounts.map(acc => (
                  <tr key={acc.uId} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 font-medium text-gray-800'>
                      {acc.fullname}
                    </td>
                    <td className='px-6 py-4 text-gray-600'>{acc.email}</td>
                    <td className='px-6 py-4 text-gray-600'>
                      {accountType === 'lecturer'
                        ? acc.lecturerCode
                        : acc.studentCode}
                    </td>
                    <td className='px-6 py-4 text-gray-600'>{acc.major}</td>
                    <td className='px-6 py-4 text-gray-600'>
                      {acc.yob || '-'}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          acc.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {acc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 flex items-center gap-3'>
                      {/* Edit button */}
                      <button
                        className='p-2 rounded-md hover:bg-blue-100 text-blue-600 transition'
                        onClick={() => {
                          setSelectedAccountId(acc.uId);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit3 className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accounts.length === 0 && (
              <div className='p-6 text-center text-gray-500'>
                No {accountType}s found.
              </div>
            )}
          </div>
        </div>
        <div className='flex justify-between items-center mt-6'>
          <p className='text-gray-600 text-sm'>
            Showing <span className='font-semibold'>{accounts.length}</span> of{' '}
            <span className='font-semibold'>{itemCount}</span> lecturers
          </p>

          <div className='flex gap-2'>
            <button
              onClick={handlePrevPage}
              disabled={pageNum === 1}
              className={`px-4 py-2 rounded-lg border ${
                pageNum === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              Prev
            </button>
            <span className='px-4 py-2 text-gray-700'>
              Page {pageNum} of {pageCount}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNum === pageCount}
              className={`px-4 py-2 rounded-lg border ${
                pageNum === pageCount
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Create New Lecturer'
      >
        <CreateLecturerForm onClose={() => setIsOpen(false)} />
      </ModalWrapper>

      <ModalWrapper
        isOpen={isMultipleOpen}
        onClose={() => setIsMultipleOpen(false)}
        title='Create multiple lecturer'
      >
        <CreateMultipleLecturerForm onClose={() => setIsMultipleOpen(false)} />
      </ModalWrapper>

      <ModalWrapper
        isOpen={isStudentOpen}
        onClose={() => setIsStudentOpen(false)}
        title='Create student'
      >
        <CreateStudentForm onClose={() => setIsStudentOpen(false)} />
      </ModalWrapper>

      <ModalWrapper
        isOpen={isMultipleStudentOpen}
        onClose={() => setIsMultipleStudentOpen(false)}
        title='Create multiple student'
      >
        <CreateMultipleStudentForm
          onClose={() => setIsMultipleStudentOpen(false)}
        />
      </ModalWrapper>
      <ModalWrapper
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title='Edit Account'
      >
        <EditAccountForm
          id={selectedAccountId}
          onClose={() => setIsEditOpen(false)}
        />
      </ModalWrapper>
    </>
  );
}
