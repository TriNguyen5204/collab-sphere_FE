import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpWideNarrow,
  Users,
  Grid3x3,
} from 'lucide-react';
import CreateClassForm from '../../features/staff/components/CreateClassForm';
import CreateMultipleClassForm from '../../features/staff/components/CreateMultipleClassForm';
import ModalWrapper from '../../components/layout/ModalWrapper';
import { useNavigate } from 'react-router-dom';
import {
  getClass,
  getAllSubject,
  getAllLecturer,
} from '../../services/userService';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';

// Helper function for glass panel styling
const glassPanelClass = 'backdrop-blur-sm bg-white/40 border border-white/60';

// Helper function to get subject gradient (diagonal from top-right to bottom-left)
const subjectGradient = subjectCode => {
  const gradients = {
    DBI202: 'from-yellow-100 via-white to-yellow-100',
    CS102: 'from-blue-100 via-white to-blue-100',
    DBI201: 'from-green-100 via-white to-green-100',
    PM101: 'from-orange-100 via-white to-orange-100',
    WED201: 'from-purple-100 via-white to-purple-100',
    DS: 'from-pink-100 via-white to-pink-100',
    CS101: 'from-indigo-100 via-white to-indigo-100',
    OSG202: 'from-rose-100 via-white to-rose-100',
    ES211: 'from-cyan-100 via-white to-cyan-100',
  };
  return gradients[subjectCode] || 'from-violet via-white to-gray-100';
};

// StatusBadge Component
const StatusBadge = ({ isActive }) => (
  <span
    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
      isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
    }`}
  >
    {isActive ? 'ACTIVE' : 'INACTIVE'}
  </span>
);

// MetricChip Component
const MetricChip = ({ icon: Icon, label, value }) => (
  <div className='rounded-xl border border-gray-100 bg-white/90 p-2.5 shadow-sm'>
    <div className='mb-0.5 flex items-center gap-2'>
      <Icon className='h-4 w-4 text-gray-400' />
      <span className='text-2xl font-bold text-gray-900'>{value}</span>
    </div>
    <p className='text-xs font-medium text-gray-500'>{label}</p>
  </div>
);

// ClassCard Component
const ClassCard = ({ cls, onClick }) => {
  const handleClick = () => {
    onClick(cls.classId);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={`${glassPanelClass} flex h-full flex-col rounded-3xl bg-gradient-to-br ${subjectGradient(
        cls.subjectCode
      )} p-4 text-left transition hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200`}
    >
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-400'>
            {cls.createdDate
              ? new Date(cls.createdDate)
                  .toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                  .toUpperCase()
              : 'FALL 2025'}
          </p>
          <h3 className='mt-1.5 text-xl font-bold text-slate-900'>
            {cls.className}
          </h3>
          <p className='text-sm text-slate-500'>
            {cls.subjectName}
            {cls.subjectCode ? ` · ${cls.subjectCode}` : ''}
          </p>
        </div>
        <StatusBadge isActive={cls.isActive} />
      </div>

      <div className='mt-4 grid gap-2.5 md:grid-cols-2'>
        <MetricChip
          icon={Users}
          label='Total students'
          value={cls.memberCount ?? 0}
        />
        <MetricChip
          icon={Grid3x3}
          label='Formed teams'
          value={cls.teamCount ?? 0}
        />
      </div>

      <div className='mt-4 text-xs text-slate-500'>
        Created{' '}
        {cls.createdDate ? new Date(cls.createdDate).toLocaleDateString() : '—'}
      </div>
    </button>
  );
};

export default function ClassListStaff() {
  const [classes, setClasses] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [lecturerOptions, setLecturerOptions] = useState([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    ClassName: '',
    SubjectIds: null,
    LecturerIds: null,
    OrderBy: 'ClassName',
    PageNum: 1,
    PageSize: 9,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isMultiOpen, setIsMultiOpen] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [subjects, lecturers] = await Promise.all([
          getAllSubject(),
          getAllLecturer(true),
        ]);
        setSubjectOptions(subjects || []);
        setLecturerOptions(lecturers.list || []);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const data = await getClass(filters);
      setTotalClasses(data.itemCount);
      if (data?.list) {
        setClasses(data.list);
        setTotalPages(data.pageCount || 1);
      } else {
        setClasses([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = e => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, PageNum: 1 }));
    fetchData();
  };

  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, PageNum: newPage }));
  };

  const handleClassClick = classId => {
    navigate(`/staff/classes/${classId}`);
  };

  return (
    <StaffDashboardLayout>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2'>
              Class Management
            </h1>
            <p className='text-slate-600 text-lg'>
              You are currently assigned to {totalClasses} classes
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => setIsOpen(true)}
              className='flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all backdrop-blur-sm border border-orange-300/20'
            >
              <Plus className='w-5 h-5 mr-2' />
              Create Class
            </button>
            <button
              onClick={() => setIsMultiOpen(true)}
              className='flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all backdrop-blur-sm border border-amber-300/20'
            >
              <Plus className='w-5 h-5 mr-2' />
              Import Classes
            </button>
          </div>
        </div>

        {/* Filter Section - Glassmorphism */}
        <form
          onSubmit={handleSearch}
          className='bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-orange-200/30 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4'
        >
          {/* ClassName */}
          <div className='col-span-1'>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              Class Name
            </label>
            <div className='relative'>
              <input
                type='text'
                value={filters.ClassName}
                onChange={e =>
                  setFilters({ ...filters, ClassName: e.target.value })
                }
                placeholder='Search class...'
                className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
              />
              <Search
                className='absolute right-3 top-3 text-orange-400'
                size={18}
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              Subject
            </label>
            <select
              className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
              value={filters.SubjectIds ?? ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  SubjectIds: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            >
              <option value=''>All Subjects</option>
              {subjectOptions.map(s => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          {/* Lecturer */}
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              Lecturer
            </label>
            <select
              className='w-full bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
              value={filters.LecturerIds ?? ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  LecturerIds: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            >
              <option value=''>All Lecturers</option>
              {lecturerOptions.map(l => (
                <option key={l.uId} value={l.uId}>
                  {l.fullname}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Controls */}
          <div>
            <label className='block text-sm font-semibold text-slate-700 mb-2'>
              Sort By
            </label>
            <div className='flex gap-2'>
              <select
                className='flex-1 bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 focus:outline-none transition-all'
                value={filters.OrderBy}
                onChange={e =>
                  setFilters({ ...filters, OrderBy: e.target.value })
                }
              >
                <option value='ClassName'>Class Name</option>
                <option value='SubjectName'>Subject</option>
                <option value='CreatedDate'>Created Date</option>
              </select>
              <button
                type='button'
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    Descending: !prev.Descending,
                  }))
                }
                className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all ${
                  filters.Descending
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400/50 shadow-lg'
                    : 'bg-white/70 text-slate-600 border-orange-200/50 hover:bg-white/90'
                }`}
                title='Toggle ascending/descending'
              >
                <ArrowUpWideNarrow
                  size={18}
                  className={`transform transition-transform ${
                    filters.Descending ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Search Button */}
          <div className='md:col-span-4 flex justify-end'>
            <button
              type='submit'
              className='bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm border border-orange-300/20'
            >
              Search
            </button>
          </div>
        </form>

        {/* Stats Card */}
        <div className='bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-xl rounded-3xl shadow-lg border border-orange-300/30 p-6 mb-8 flex items-center gap-4'>
          <div className='w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl'>
            <BookOpen className='w-8 h-8 text-white' />
          </div>
          <div>
            <p className='text-sm text-slate-600 font-semibold uppercase tracking-wide'>
              Total Classes
            </p>
            <p className='text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
              {totalClasses}
            </p>
          </div>
        </div>

        {/* Class List */}
        {classes.length === 0 ? (
          <div className='text-center py-20 bg-white/70 backdrop-blur-xl rounded-3xl border border-orange-200/30 shadow-lg'>
            <BookOpen className='w-20 h-20 text-orange-300 mx-auto mb-4' />
            <h3 className='text-2xl font-bold text-slate-700 mb-2'>
              No classes found
            </h3>
            <p className='text-slate-500 mb-6 text-lg'>
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className='bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl border border-orange-300/20'
            >
              Create your first class
            </button>
          </div>
        ) : (
          <div className='bg-white/60 backdrop-blur-xl rounded-3xl border border-orange-200/30 shadow-lg p-6'>
            {/* Grid display */}
            <div
              className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              style={{ minHeight: '500px', gridAutoRows: '1fr' }}
            >
              {classes.map(c => (
                <ClassCard key={c.classId} cls={c} onClick={handleClassClick} />
              ))}
            </div>

            {/* Pagination */}
            <div className='flex justify-center items-center gap-4 pt-6 mt-6 border-t border-orange-200/50'>
              <button
                onClick={() => handlePageChange(filters.PageNum - 1)}
                disabled={filters.PageNum === 1}
                className='p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-orange-200/50 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
              >
                <ChevronLeft size={20} className='text-slate-600' />
              </button>
              <span className='text-slate-700 text-sm font-semibold px-6 py-2.5 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-200/50 shadow-sm'>
                Page {filters.PageNum} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.PageNum + 1)}
                disabled={filters.PageNum === totalPages}
                className='p-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-orange-200/50 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
              >
                <ChevronRight size={20} className='text-slate-600' />
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <ModalWrapper
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title='Create New Class'
        >
          <CreateClassForm onClose={() => setIsOpen(false)} />
        </ModalWrapper>
        <ModalWrapper
          isOpen={isMultiOpen}
          onClose={() => setIsMultiOpen(false)}
        >
          <CreateMultipleClassForm onClose={() => setIsMultiOpen(false)} />
        </ModalWrapper>
      </div>
    </StaffDashboardLayout>
  );
}
