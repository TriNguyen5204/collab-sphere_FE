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
  ArrowUpWideNarrow,
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

// Helper function for glass panel styling
const glassPanelClass = 'backdrop-blur-sm bg-white/40 border border-white/60';

// Helper function to get account gradient based on index
const getAccountGradient = (index) => {
  const gradients = [
    'from-orange-100 via-white to-orange-100',
    'from-blue-100 via-white to-blue-100',
    'from-green-100 via-white to-green-100',
    'from-purple-100 via-white to-purple-100',
    'from-pink-100 via-white to-pink-100',
    'from-yellow-100 via-white to-yellow-100',
  ];
  return gradients[index % gradients.length];
};

// StatusBadge Component
const StatusBadge = ({ isActive }) => (
  <span
    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
      isActive
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-gray-200 text-gray-600'
    }`}
  >
    {isActive ? 'ACTIVE' : 'INACTIVE'}
  </span>
);

// InfoChip Component
const InfoChip = ({ icon: Icon, label, value }) => (
  <div className='rounded-xl border border-gray-100 bg-white/90 p-2.5 shadow-sm'>
    <div className='mb-0.5 flex items-center gap-2 min-w-0'>
      <Icon className='h-4 w-4 text-gray-400 flex-shrink-0' />
      <span className='text-sm font-semibold text-gray-900 truncate'>{value}</span>
    </div>
    <p className='text-xs font-medium text-gray-500'>{label}</p>
  </div>
);

// AccountCard Component
const AccountCard = ({ account, accountType, onClick, index }) => {
  const handleClick = () => {
    onClick(account.uId);
  };

  const code = accountType === 'lecturer' ? account.lecturerCode : account.studentCode;

  return (
    <button
      type='button'
      onClick={handleClick}
      className={`${glassPanelClass} flex h-full flex-col rounded-3xl bg-gradient-to-bl ${getAccountGradient(
        index
      )} p-4 text-left transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200`}
    >
      <div className='flex items-center justify-between gap-3'>
        <div className='flex-1'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-400'>
            {accountType === 'lecturer' ? 'LECTURER' : 'STUDENT'}
          </p>
          <h3 className='mt-1.5 text-xl font-bold text-slate-900'>
            {account.fullname}
          </h3>
          <p className='text-sm text-slate-500'>{account.major}</p>
        </div>
        <StatusBadge isActive={account.isActive} />
      </div>

      <div className='mt-4 grid gap-2.5 md:grid-cols-2'>
        <InfoChip icon={Mail} label='Email' value={account.email} />
        <InfoChip icon={BookOpen} label='Code' value={code || 'N/A'} />
      </div>

      <div className='mt-4 flex items-center gap-4 text-xs text-slate-500'>
        {account.yob && (
          <div className='flex items-center gap-1'>
            <Calendar className='h-3.5 w-3.5' />
            <span>YOB: {account.yob}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default function LecturerListStaff() {
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
  const [accounts, setAccounts] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    const fetchAccounts = async () => {
      let response;
      if (accountType === 'lecturer') {
        response = await getAllLecturer(
          false,
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
          false,
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
    fetchAccounts();
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

  const handleApplyFilters = (e) => {
    e.preventDefault();
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

  const handleAccountClick = (accountId) => {
    navigate(`/staff/lecturers/${accountId}`);
  };


  return (
    <>
      <StaffDashboardLayout>
        {/* <div className='bg-gradient-to-br from-orange-50 via-white to-amber-50'> */}
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2'>
                  Account Management
                </h1>
                <p className='text-slate-600 text-lg'>
                  Managing {itemCount} {accountType}s ).
                </p>
              </div>
              
              {/* Account Type Toggle */}
              <div className='flex gap-3'>
                <button
                  onClick={() => setAccountType('lecturer')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all shadow-lg ${
                    accountType === 'lecturer'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400/50 shadow-xl'
                      : 'bg-white/70 text-slate-700 border-orange-200/40 hover:bg-white/90'
                  }`}
                >
                  <User className='w-4 h-4' /> Lecturers
                </button>
                <button
                  onClick={() => setAccountType('student')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all shadow-lg ${
                    accountType === 'student'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400/50 shadow-xl'
                      : 'bg-white/70 text-slate-700 border-orange-200/40 hover:bg-white/90'
                  }`}
                >
                  <GraduationCap className='w-4 h-4' /> Students
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <form
              onSubmit={handleApplyFilters}
              className='bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-orange-200/30 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4'
            >
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Email
                </label>
                <input
                  type='text'
                  name='Email'
                  value={searchFilters.Email}
                  onChange={handleFilterChange}
                  placeholder='Search email...'
                  className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
                />
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  name='FullName'
                  value={searchFilters.FullName}
                  onChange={handleFilterChange}
                  placeholder='Search name...'
                  className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
                />
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  {accountType === 'lecturer' ? 'Lecturer Code' : 'Student Code'}
                </label>
                <input
                  type='text'
                  name='LecturerCode'
                  value={searchFilters.LecturerCode}
                  onChange={handleFilterChange}
                  placeholder='Search code...'
                  className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
                />
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Major
                </label>
                <input
                  type='text'
                  name='Major'
                  value={searchFilters.Major}
                  onChange={handleFilterChange}
                  placeholder='Search major...'
                  className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
                />
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-slate-700 mb-2'>
                  Year of Birth
                </label>
                <input
                  type='number'
                  name='Yob'
                  value={searchFilters.Yob || ''}
                  onChange={handleFilterChange}
                  placeholder='YYYY'
                  className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
                />
              </div>

              {/* Search Button */}
              <div className='md:col-span-5 flex justify-end gap-3'>
                <button
                  type='submit'
                  className='bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm border border-orange-300/20'
                >
                  Search
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className='relative z-20 bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-orange-200/30 p-6 mb-8'>
              <div className='flex flex-wrap items-center gap-3'>
                {/* Create Lecturer Dropdown */}
                <div className='relative'>
                  <button
                    onClick={() => setShowLecturerDropdown(!showLecturerDropdown)}
                    className='flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all backdrop-blur-sm border border-orange-300/20'
                  >
                    <Plus className='w-4 h-4' />
                    Create Lecturer
                    <ChevronDown className='w-4 h-4' />
                  </button>
                  {showLecturerDropdown && (
                    <div className='absolute left-0 mt-2 w-56 bg-white/90 backdrop-blur-xl border border-orange-200/50 rounded-2xl shadow-xl z-50 overflow-hidden'>
                      <button
                        onClick={() => {
                          setIsOpen(true);
                          setShowLecturerDropdown(false);
                        }}
                        className='w-full text-left px-4 py-3 hover:bg-orange-50/80 transition-colors text-slate-700 font-medium'
                      >
                        Create Single Lecturer
                      </button>
                      <button
                        onClick={() => {
                          setIsMultipleOpen(true);
                          setShowLecturerDropdown(false);
                        }}
                        className='w-full text-left px-4 py-3 hover:bg-orange-50/80 transition-colors text-slate-700 font-medium border-t border-orange-100/50'
                      >
                        Create Multiple Lecturers
                      </button>
                    </div>
                  )}
                </div>

                {/* Create Student Dropdown */}
                <div className='relative'>
                  <button
                    onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                    className='flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all backdrop-blur-sm border border-amber-300/20'
                  >
                    <Plus className='w-4 h-4' />
                    Create Student
                    <ChevronDown className='w-4 h-4' />
                  </button>
                  {showStudentDropdown && (
                    <div className='absolute left-0 mt-2 w-56 bg-white/90 backdrop-blur-xl border border-orange-200/50 rounded-2xl shadow-xl z-50 overflow-hidden'>
                      <button
                        onClick={() => {
                          setIsStudentOpen(true);
                          setShowStudentDropdown(false);
                        }}
                        className='w-full text-left px-4 py-3 hover:bg-orange-50/80 transition-colors text-slate-700 font-medium'
                      >
                        Create Single Student
                      </button>
                      <button
                        onClick={() => {
                          setIsMultipleStudentOpen(true);
                          setShowStudentDropdown(false);
                        }}
                        className='w-full text-left px-4 py-3 hover:bg-orange-50/80 transition-colors text-slate-700 font-medium border-t border-orange-100/50'
                      >
                        Create Multiple Students
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className='bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-xl rounded-3xl shadow-lg border border-orange-300/30 p-6 mb-8 flex items-center gap-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl'>
                {accountType === 'lecturer' ? (
                  <User className='w-8 h-8 text-white' />
                ) : (
                  <GraduationCap className='w-8 h-8 text-white' />
                )}
              </div>
              <div>
                <p className='text-sm text-slate-600 font-semibold uppercase tracking-wide'>
                  Total {accountType === 'lecturer' ? 'Lecturers' : 'Students'}
                </p>
                <p className='text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
                  {itemCount}
                </p>
              </div>
            </div>

            {/* Account List */}
            {accounts.length === 0 ? (
              <div className='text-center py-20 bg-white/70 backdrop-blur-xl rounded-3xl border border-orange-200/30 shadow-lg'>
                {accountType === 'lecturer' ? (
                  <User className='w-20 h-20 text-orange-300 mx-auto mb-4' />
                ) : (
                  <GraduationCap className='w-20 h-20 text-orange-300 mx-auto mb-4' />
                )}
                <h3 className='text-2xl font-bold text-slate-700 mb-2'>
                  No {accountType}s found
                </h3>
                <p className='text-slate-500 mb-6 text-lg'>
                  Try adjusting your search criteria
                </p>
              </div>
            ) : (
              <div className='bg-white/60 backdrop-blur-xl rounded-3xl border border-orange-200/30 shadow-lg p-6'>
                {/* Grid display */}
                <div
                  className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  style={{ minHeight: '500px', gridAutoRows: '1fr' }}
                >
                  {accounts.map((account, index) => (
                    <AccountCard
                      key={account.uId}
                      account={account}
                      accountType={accountType}
                      onClick={handleAccountClick}
                      index={index}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className='flex justify-center items-center gap-4 pt-6 mt-6 border-t border-orange-200/50'>
                  <button
                    onClick={handlePrevPage}
                    disabled={pageNum === 1}
                    className='p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-orange-200/50 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronLeft size={20} className='text-slate-600' />
                  </button>
                  <span className='text-slate-700 text-sm font-semibold px-6 py-2.5 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm'>
                    Page {pageNum} of {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pageNum === pageCount}
                    className='p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-orange-200/50 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronRight size={20} className='text-slate-600' />
                  </button>
                </div>
              </div>
            )}
          </div>
        {/* </div> */}

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
        >
          <CreateMultipleStudentForm
            onClose={() => setIsMultipleStudentOpen(false)}
          />
        </ModalWrapper>
      </StaffDashboardLayout>
    </>
  );
}