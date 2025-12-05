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
  ChevronLeft,
  ChevronRight,
  EyeIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateLecturerForm from '../../features/staff/components/CreateLecturerForm';
import CreateMultipleLecturerForm from '../../features/staff/components/CreateMultipleLecturerForm';
import CreateStudentForm from '../../features/staff/components/CreateStudentForm';
import CreateMultipleStudentForm from '../../features/staff/components/CreateMultipleStudent';
import EditAccountForm from '../../features/staff/components/EditAccountForm';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';
import { getAllLecturer, getAllStudent } from '../../services/userService';

export default function ImprovedAccountsTable() {
  const navigate = useNavigate();
  const [showLecturerDropdown, setShowLecturerDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [accountType, setAccountType] = useState('lecturer');
  const [searchFilters, setSearchFilters] = useState({
    Email: '',
    FullName: '',
    Yob: null,
    LecturerCode: '',
    Major: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(searchFilters);
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
      <StaffDashboardLayout>
        <div className='min-h-screen'>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-slate-800 mb-2'>
                Account Management
              </h1>
              <p className='text-slate-600'>
                Manage lecturers and students in the system
              </p>
            </div>

            {/* Account Type Toggle - Glassmorphism */}
            <div className='flex gap-3 mb-6'>
              <button
                onClick={() => setAccountType('lecturer')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all shadow-lg ${
                  accountType === 'lecturer'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400/50'
                    : 'bg-white/70 text-slate-700 border-white/40 hover:bg-white/90'
                }`}
              >
                <User className='w-4 h-4' /> Lecturers
              </button>
              <button
                onClick={() => setAccountType('student')}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all shadow-lg ${
                  accountType === 'student'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/50'
                    : 'bg-white/70 text-slate-700 border-white/40 hover:bg-white/90'
                }`}
              >
                <GraduationCap className='w-4 h-4' /> Students
              </button>
            </div>

            {/* Controls Bar - Glassmorphism */}
            <div className='bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 mb-6 overflow-visible'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                {/* Left side - Search and Filters */}
                <div className='flex items-center gap-4 flex-1'>
                  <button
                    className='flex items-center gap-2 px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-xl hover:bg-white/80 transition-all'
                  >
                    <Filter className='w-4 h-4' />
                    Filters
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg'
                  >
                    <Search className='w-4 h-4' />
                    Search
                  </button>
                </div>

                {/* Right side - Actions */}
                <div className='flex items-center gap-3'>
                  {/* Create Lecturer Dropdown */}
                  <div className='relative group'>
                    <button
                      onClick={() =>
                        setShowLecturerDropdown(!showLecturerDropdown)
                      }
                      className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all backdrop-blur-sm'
                    >
                      <Plus className='w-4 h-4' />
                      Create Lecturer
                      <ChevronDown className='w-4 h-4' />
                    </button>
                    {showLecturerDropdown && (
                      <div className='absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl transition-all z-[200]'>
                        <button
                          onClick={() => setIsOpen(true)}
                          className='w-full text-left px-4 py-2.5 hover:bg-blue-50/80 first:rounded-t-2xl transition-colors'
                        >
                          Single Lecturer
                        </button>
                        <button
                          onClick={() => setIsMultipleOpen(true)}
                          className='w-full text-left px-4 py-2.5 hover:bg-blue-50/80 last:rounded-b-2xl transition-colors'
                        >
                          Multiple Lecturers
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Create Student Dropdown */}
                  <div className='relative group'>
                    <button
                      onClick={() =>
                        setShowStudentDropdown(!showStudentDropdown)
                      }
                      className='flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all backdrop-blur-sm'
                    >
                      <Plus className='w-4 h-4' />
                      Create Student
                      <ChevronDown className='w-4 h-4' />
                    </button>
                    {showStudentDropdown && (
                      <div className='absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl transition-all z-[200]'>
                        <button
                          onClick={() => setIsStudentOpen(true)}
                          className='w-full text-left px-4 py-2.5 hover:bg-emerald-50/80 first:rounded-t-2xl transition-colors'
                        >
                          Single Student
                        </button>
                        <button
                          onClick={() => setIsMultipleStudentOpen(true)}
                          className='w-full text-left px-4 py-2.5 hover:bg-emerald-50/80 last:rounded-b-2xl transition-colors'
                        >
                          Multiple Students
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Form - Glassmorphism */}
                <div className='mt-6 grid grid-cols-1 md:grid-cols-5 gap-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm p-5 rounded-2xl border border-blue-100/50'>
                  {Object.entries(searchFilters).map(([key, value]) => (
                    <div key={key} className='flex flex-col'>
                      <label className='text-sm font-medium text-slate-700 mb-2'>
                        {key === 'LecturerCode' && accountType === 'student'
                          ? 'StudentCode'
                          : key}
                      </label>
                      <input
                        name={key}
                        value={value}
                        onChange={handleFilterChange}
                        placeholder={key}
                        className='px-4 py-2.5 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:outline-none transition-all text-sm'
                      />
                    </div>
                  ))}
                </div>
            </div>

            {/* Accounts Table with Pagination Inside - Glassmorphism */}
            <div className='bg-white/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-lg '>
              <div className='overflow-visible relative z-10 min-h-[400px] overflow-y-auto'>
                <table className='min-w-full divide-y divide-slate-200/50'>
                  <thead className='bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm'>
                    <tr>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        {accountType === 'lecturer' ? 'Lecturer' : 'Student'}
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        Email
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        {accountType === 'lecturer'
                          ? 'Lecturer Code'
                          : 'Student Code'}
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        Major
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        YOB
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className='divide-y divide-slate-100/50'
                    style={{ minHeight: '400px' }}
                  >
                    {accounts.map(acc => (
                      <tr
                        key={acc.uId}
                        className='hover:bg-white/60 backdrop-blur-sm transition-colors'
                      >
                        <td className='px-6 py-4 font-medium text-slate-800'>
                          {acc.fullname}
                        </td>
                        <td className='px-6 py-4 text-slate-600'>
                          {acc.email}
                        </td>
                        <td className='px-6 py-4 text-slate-600'>
                          {accountType === 'lecturer'
                            ? acc.lecturerCode
                            : acc.studentCode}
                        </td>
                        <td className='px-6 py-4 text-slate-600'>
                          {acc.major}
                        </td>
                        <td className='px-6 py-4 text-slate-600'>
                          {acc.yob || '-'}
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-semibold backdrop-blur-sm ${
                              acc.isActive
                                ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
                                : 'bg-rose-100/80 text-rose-700 border border-rose-200/50'
                            }`}
                          >
                            {acc.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className='px-6 py-4 flex items-center gap-3'>
                          <button
                            className='p-2 rounded-xl bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 hover:bg-blue-100 hover:shadow-md text-blue-600 transition-all'
                            onClick={() => {
                              setSelectedAccountId(acc.uId);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit3 className='w-4 h-4' />
                          </button>
                          <button
                            className='p-2 rounded-xl bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 hover:bg-blue-100 hover:shadow-md text-blue-600 transition-all'
                            onClick={() => {
                              navigate(`/staff/lecturers/${acc.uId}`);
                            }}
                          >
                            <EyeIcon className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {accounts.length === 0 && (
                  <div
                    className='p-8 text-center text-slate-500 bg-white/40 backdrop-blur-sm'
                    style={{ minHeight: '400px' }}
                  >
                    No {accountType}s found.
                  </div>
                )}
              </div>

              {/* Pagination inside table */}
              <div className='flex justify-between items-center px-6 py-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 backdrop-blur-sm'>
                <p className='text-slate-600 text-sm'>
                  Showing{' '}
                  <span className='font-semibold'>{accounts.length}</span> of{' '}
                  <span className='font-semibold'>{itemCount}</span>{' '}
                  {accountType}s
                </p>

                <div className='flex items-center gap-3'>
                  <button
                    onClick={handlePrevPage}
                    disabled={pageNum === 1}
                    className='p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronLeft size={18} className='text-slate-600' />
                  </button>
                  <span className='text-slate-700 text-sm font-medium px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50'>
                    Page {pageNum} of {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pageNum === pageCount}
                    className='p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronRight size={18} className='text-slate-600' />
                  </button>
                </div>
              </div>
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
          <CreateMultipleLecturerForm
            onClose={() => setIsMultipleOpen(false)}
          />
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
      </StaffDashboardLayout>
    </>
  );
}
