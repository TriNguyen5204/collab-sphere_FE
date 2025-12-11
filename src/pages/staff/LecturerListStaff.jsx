import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  BookOpen,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalWrapper from '../../components/layout/ModalWrapper';
import CreateLecturerForm from '../../features/staff/components/CreateLecturerForm';
import CreateMultipleLecturerForm from '../../features/staff/components/CreateMultipleLecturerForm';
import CreateStudentForm from '../../features/staff/components/CreateStudentForm';
import CreateMultipleStudentForm from '../../features/staff/components/CreateMultipleStudent';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';
import { getAllLecturer, getAllStudent } from '../../services/userService';
import { useAvatar } from '../../hooks/useAvatar';

// StatusBadge Component
const StatusBadge = ({ isActive }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
      isActive 
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' 
        : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10'
    }`}
  >
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// UserAvatar Component using useAvatar hook
const UserAvatar = ({ user }) => {
  const { initials, colorClass, shouldShowImage, setImageError } = useAvatar(
    user.fullname || user.email,
    user.avatar || user.avatarImg
  );

  return shouldShowImage ? (
    <img
      src={user.avatar || user.avatarImg}
      alt={user.fullname || user.email}
      className='w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0 border border-slate-200'
      onError={() => setImageError(true)}
    />
  ) : (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm flex-shrink-0 border ${colorClass}`}>
      {initials}
    </div>
  );
};

export default function LecturerListStaff() {
  const navigate = useNavigate();
  const [showLecturerDropdown, setShowLecturerDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [accountType, setAccountType] = useState('lecturer');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMultipleOpen, setIsMultipleOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isMultipleStudentOpen, setIsMultipleStudentOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const pageSize = 5;

  // Fetch all accounts without search filter
  useEffect(() => {
    const fetchAccounts = async () => {
      let response;
      if (accountType === 'lecturer') {
        response = await getAllLecturer(
          false,
          '', // Email
          '', // FullName
          null, // Yob
          '', // LecturerCode
          '', // Major
          pageNum,
          pageSize
        );
      } else {
        response = await getAllStudent(
          false,
          '', // Email
          '', // FullName
          null, // Yob
          '', // StudentCode
          '', // Major
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
    fetchAccounts();
  }, [accountType, pageNum]);

  // Filter accounts client-side by name or code (instant search)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAccounts(accounts);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = accounts.filter(account => {
        const name = (account.fullname || '').toLowerCase();
        const code = accountType === 'lecturer' 
          ? (account.lecturerCode || '').toLowerCase()
          : (account.studentCode || '').toLowerCase();
        return name.includes(query) || code.includes(query);
      });
      setFilteredAccounts(filtered);
    }
  }, [accounts, searchQuery, accountType]);

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < pageCount) setPageNum(pageNum + 1);
  };

  const handleTabChange = (type) => {
    setAccountType(type);
    setSearchQuery('');
    setPageNum(1);
  };

  const handleAccountClick = accountId => {
    navigate(`/staff/lecturers/${accountId}`);
  };

  return (
    <>
      <StaffDashboardLayout>
        <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
          <div className='mx-auto space-y-6'>
            
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
              <div className="relative z-10 px-6 py-8 lg:px-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                      Staff Hub
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                      Account <span className="text-orangeFpt-500 font-bold">Management</span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      Manage lecturer and student accounts efficiently.
                    </p>
                    
                    {/* Account Type Toggle - Switch Style */}
                    <div className='inline-flex p-1 bg-slate-100 rounded-xl mt-2'>
                      <button
                        onClick={() => handleTabChange('lecturer')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all font-medium text-sm ${
                          accountType === 'lecturer'
                            ? 'bg-white text-orangeFpt-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <User className='w-4 h-4' /> Lecturers
                      </button>
                      <button
                        onClick={() => handleTabChange('student')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all font-medium text-sm ${
                          accountType === 'student'
                            ? 'bg-white text-orangeFpt-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <GraduationCap className='w-4 h-4' /> Students
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="w-full max-w-sm">
                    <div
                      className={`rounded-2xl border px-5 py-4 shadow-sm backdrop-blur transition-all duration-200
                        border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <p className='text-[11px] uppercase tracking-wide font-semibold text-orangeFpt-700'>
                          Total {accountType === 'lecturer' ? 'Lecturers' : 'Students'}
                        </p>
                        <Users className='w-5 h-5 text-orangeFpt-600' />
                      </div>
                      <p className="text-3xl font-bold text-orangeFpt-600 mt-2">
                        {itemCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Actions Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
              <div className='p-5 border-b border-slate-100'>
                <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                  <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                    {accountType === 'lecturer' ? 'Lecturers' : 'Students'}
                    <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
                      {searchQuery ? `${filteredAccounts.length} of ${itemCount}` : `${itemCount} total`}
                    </span>
                  </h2>
                  
                  {/* Search & Action Buttons */}
                  <div className='flex flex-wrap items-center gap-3'>
                    {/* Search Bar - Instant search on typing */}
                    <div className='relative'>
                      <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search by name or code...`}
                        className='w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm'
                      />
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                    </div>

                    {/* Conditional Create Button - Lecturer */}
                    {accountType === 'lecturer' && (
                      <div className='relative'>
                        <button
                          onClick={() => setShowLecturerDropdown(!showLecturerDropdown)}
                          className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium text-sm'
                        >
                          <Plus className='w-4 h-4' />
                          Create Lecturer
                          <ChevronDown className='w-4 h-4' />
                        </button>
                        {showLecturerDropdown && (
                          <div className='absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden'>
                            <button
                              onClick={() => {
                                setIsOpen(true);
                                setShowLecturerDropdown(false);
                              }}
                              className='w-full text-left px-4 py-3 hover:bg-orangeFpt-50 transition-colors text-slate-700 font-medium text-sm'
                            >
                              Create Single Lecturer
                            </button>
                            <button
                              onClick={() => {
                                setIsMultipleOpen(true);
                                setShowLecturerDropdown(false);
                              }}
                              className='w-full text-left px-4 py-3 hover:bg-orangeFpt-50 transition-colors text-slate-700 font-medium border-t border-slate-100 text-sm'
                            >
                              Create Multiple Lecturers
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conditional Create Button - Student */}
                    {accountType === 'student' && (
                      <div className='relative'>
                        <button
                          onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                          className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium text-sm'
                        >
                          <Plus className='w-4 h-4' />
                          Create Student
                          <ChevronDown className='w-4 h-4' />
                        </button>
                        {showStudentDropdown && (
                          <div className='absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden'>
                            <button
                              onClick={() => {
                                setIsStudentOpen(true);
                                setShowStudentDropdown(false);
                              }}
                              className='w-full text-left px-4 py-3 hover:bg-orangeFpt-50 transition-colors text-slate-700 font-medium text-sm'
                            >
                              Create Single Student
                            </button>
                            <button
                              onClick={() => {
                                setIsMultipleStudentOpen(true);
                                setShowStudentDropdown(false);
                              }}
                              className='w-full text-left px-4 py-3 hover:bg-orangeFpt-50 transition-colors text-slate-700 font-medium border-t border-slate-100 text-sm'
                            >
                              Create Multiple Students
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className='overflow-x-auto'>
                {filteredAccounts.length === 0 ? (
                  <div className='text-center py-20'>
                    {accountType === 'lecturer' ? (
                      <User className='w-16 h-16 text-slate-300 mx-auto mb-4' />
                    ) : (
                      <GraduationCap className='w-16 h-16 text-slate-300 mx-auto mb-4' />
                    )}
                    <h3 className='text-xl font-bold text-slate-700 mb-2'>
                      No {accountType}s found
                    </h3>
                    <p className='text-slate-500'>
                      {searchQuery ? 'Try a different search term' : 'No accounts available'}
                    </p>
                  </div>
                ) : (
                  <table className='w-full table-fixed'>
                    <colgroup>
                      <col className='w-[25%]' />
                      <col className='w-[25%]' />
                      <col className='w-[15%]' />
                      <col className='w-[15%]' />
                      <col className='w-[10%]' />
                      <col className='w-[10%]' />
                    </colgroup>
                    <thead className='bg-slate-50/50 border-b border-slate-200'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          User Info
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Email
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Code
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Major
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                          YOB
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {filteredAccounts.map((account) => (
                        <tr 
                          key={account.uId} 
                          onClick={() => handleAccountClick(account.uId)}
                          className='hover:bg-slate-50 transition-colors cursor-pointer'
                        >
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-3'>
                              <UserAvatar user={account} />
                              <div className='min-w-0'>
                                <p className='font-semibold text-slate-900 truncate'>
                                  {account.fullname}
                                </p>
                                <p className='text-xs text-slate-500'>
                                  {accountType === 'lecturer' ? 'Lecturer' : 'Student'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2 text-slate-600 min-w-0'>
                              <Mail className='w-4 h-4 flex-shrink-0 text-slate-400' />
                              <span className='truncate text-sm'>{account.email}</span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='font-mono text-sm text-slate-600'>
                              {accountType === 'lecturer' ? account.lecturerCode : account.studentCode || 'N/A'}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-sm text-slate-600 truncate block'>
                              {account.major || 'N/A'}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <StatusBadge isActive={account.isActive} />
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-sm text-slate-600'>
                              {account.yob || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {filteredAccounts.length > 0 && (
                <div className='flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50'>
                  <p className='text-sm text-slate-600'>
                    Showing page {pageNum} of {pageCount}
                  </p>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handlePrevPage}
                      disabled={pageNum === 1}
                      className='p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                    >
                      <ChevronLeft size={18} className='text-slate-600' />
                    </button>
                    <span className='text-sm font-medium text-slate-700 px-3'>
                      {pageNum} / {pageCount}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={pageNum === pageCount}
                      className='p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                    >
                      <ChevronRight size={18} className='text-slate-600' />
                    </button>
                  </div>
                </div>
              )}
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
          title='Create Multiple Lecturers'
        >
          <CreateMultipleLecturerForm
            onClose={() => setIsMultipleOpen(false)}
          />
        </ModalWrapper>

        <ModalWrapper
          isOpen={isStudentOpen}
          onClose={() => setIsStudentOpen(false)}
          title='Create New Student'
        >
          <CreateStudentForm onClose={() => setIsStudentOpen(false)} />
        </ModalWrapper>

        <ModalWrapper
          isOpen={isMultipleStudentOpen}
          onClose={() => setIsMultipleStudentOpen(false)}
          title='Create Multiple Students'
        >
          <CreateMultipleStudentForm
            onClose={() => setIsMultipleStudentOpen(false)}
          />
        </ModalWrapper>
      </StaffDashboardLayout>
    </>
  );
}
