import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpWideNarrow,
  Users,
  CalendarDays,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  BookCopy,
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
          getAllLecturer(),
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

  return (
    <StaffDashboardLayout>
      <div className='min-h-screen'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-slate-800 mb-2'>
                Class Management
              </h1>
              <p className='text-slate-600'>
                Manage your classes and monitor student progress
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setIsOpen(true)}
                className='flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all backdrop-blur-sm'
              >
                <Plus className='w-5 h-5 mr-2' />
                Create Class
              </button>
              <button
                onClick={() => setIsMultiOpen(true)}
                className='flex items-center bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-purple-600 transition-all backdrop-blur-sm'
              >
                <Plus className='w-5 h-5 mr-2' />
                Create Multiple
              </button>
            </div>
          </div>

          {/* Filter Section - Glassmorphism */}
          <form
            onSubmit={handleSearch}
            className='bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4'
          >
            {/* --- ClassName --- */}
            <div className='col-span-1'>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
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
                  className='w-full bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:outline-none transition-all'
                />
                <Search
                  className='absolute right-3 top-3 text-slate-400'
                  size={18}
                />
              </div>
            </div>

            {/* --- Subject --- */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Subject
              </label>
              <select
                className='w-full bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:outline-none transition-all'
                value={filters.SubjectIds ?? ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    SubjectIds: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              >
                <option value=''>All</option>
                {subjectOptions.map(s => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Lecturer --- */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Lecturer
              </label>
              <select
                className='w-full bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:outline-none transition-all'
                value={filters.LecturerIds ?? ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    LecturerIds: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              >
                <option value=''>All</option>
                {lecturerOptions.map(l => (
                  <option key={l.uId} value={l.uId}>
                    {l.fullname}
                  </option>
                ))}
              </select>
            </div>

            {/* --- Order By --- */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Order By
              </label>
              <div className='flex items-center gap-2'>
                <select
                  className='flex-1 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:outline-none transition-all'
                  value={filters.OrderBy}
                  onChange={e =>
                    setFilters({ ...filters, OrderBy: e.target.value })
                  }
                >
                  <option value='ClassName'>Class Name</option>
                  <option value='CreatedDate'>Created Date</option>
                  <option value='LecturerId'>Lecturer</option>
                  <option value='SubjectId'>Subject</option>
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
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400/50 shadow-lg'
                      : 'bg-white/50 text-slate-600 border-slate-200/50 hover:bg-white/80'
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

            {/* --- Search Button --- */}
            <div className='md:col-span-4 flex justify-end'>
              <button
                type='submit'
                className='bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-2.5 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl backdrop-blur-sm'
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats - Glassmorphism */}
          <div className='bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl shadow-lg border border-white/30 p-6 mb-8 flex items-center gap-4'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
              <BookOpen className='w-7 h-7 text-white' />
            </div>
            <div>
              <p className='text-sm text-slate-600 font-medium'>
                Total Classes
              </p>
              <p className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                {totalClasses}
              </p>
            </div>
          </div>

          {/* Class List */}
          {classes.length === 0 ? (
            <div className='text-center py-16 bg-white/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-lg '>
              <BookOpen className='w-16 h-16 text-slate-300 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-slate-700 mb-2'>
                No classes found
              </h3>
              <p className='text-slate-500 mb-6'>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className='bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl'
              >
                Create your first class
              </button>
            </div>
          ) : (
            <div className='bg-white/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-lg p-6'>
              {/* Grid display */}
              <div
                className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                style={{ minHeight: '500px', gridAutoRows: '1fr' }}
              >
                {classes.map(c => (
                  <div
                    key={c.classId}
                    className='bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-white/40 hover:shadow-xl hover:border-blue-300/50 transition-all p-5 flex flex-col justify-between group'
                  >
                    <div>
                      <div className='flex justify-between items-center mb-3'>
                        <h2 className='text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors'>
                          {c.className}
                        </h2>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium backdrop-blur-sm ${
                            c.isActive
                              ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50'
                              : 'bg-slate-100/80 text-slate-600 border border-slate-200/50'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className='text-sm text-slate-600 flex items-center gap-2 mb-2'>
                        <BookCopy size={15} className='text-blue-500' />
                        {c.subjectName} ({c.subjectCode})
                      </p>
                      <p className='text-sm text-slate-600 flex items-center gap-2'>
                        <UserCheck size={15} className='text-indigo-500' />
                        {c.lecturerName} ({c.lecturerCode})
                      </p>

                      <div className='mt-4 flex flex-wrap gap-3 text-sm text-slate-500'>
                        <span className='flex items-center gap-1 bg-slate-50/50 px-2 py-1 rounded-lg backdrop-blur-sm'>
                          <Users size={15} /> {c.memberCount}
                        </span>
                        <span className='flex items-center gap-1 bg-slate-50/50 px-2 py-1 rounded-lg backdrop-blur-sm'>
                          <BookOpen size={15} /> {c.teamCount}
                        </span>
                        <span className='flex items-center gap-1 bg-slate-50/50 px-2 py-1 rounded-lg backdrop-blur-sm'>
                          <CalendarDays size={15} />
                          {new Date(c.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className='flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100/50'>
                      <button
                        onClick={() => navigate(`/staff/classes/${c.classId}`)}
                        className='p-2 rounded-xl bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all'
                      >
                        <Eye
                          size={16}
                          className='text-slate-600 group-hover:text-blue-600'
                        />
                      </button>
                      <button className='p-2 rounded-xl bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all'>
                        <Edit size={16} className='text-indigo-600' />
                      </button>
                      <button className='p-2 rounded-xl bg-slate-50/50 backdrop-blur-sm border border-slate-200/50 hover:bg-rose-50 hover:border-rose-300 hover:shadow-md transition-all'>
                        <Trash2 size={16} className='text-rose-600' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination inside table card */}
              <div className='flex justify-center items-center gap-4 pt-4 border-t border-slate-200/50'>
                <button
                  onClick={() => handlePageChange(filters.PageNum - 1)}
                  disabled={filters.PageNum === 1}
                  className='p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronLeft size={18} className='text-slate-600' />
                </button>
                <span className='text-slate-700 text-sm font-medium px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/50'>
                  Page {filters.PageNum} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.PageNum + 1)}
                  disabled={filters.PageNum === totalPages}
                  className='p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronRight size={18} className='text-slate-600' />
                </button>
              </div>
            </div>
          )}
        </div>

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
          title='Create Multiple Classes'
        >
          <CreateMultipleClassForm onClose={() => setIsMultiOpen(false)} />
        </ModalWrapper>
      </div>
    </StaffDashboardLayout>
  );
}
