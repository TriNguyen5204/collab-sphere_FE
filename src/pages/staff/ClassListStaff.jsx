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
import CreateClassForm from '../../components/staff/CreateClassForm';
import CreateMultipleClassForm from '../../components/staff/CreateMultipleClassForm';
import ModalWrapper from '../../components/layout/ModalWrapper';
import { useNavigate } from 'react-router-dom';
import {
  getClass,
  getAllSubject,
  getAllLecturer,
} from '../../services/userService';
// import { toast } from 'sonner';
import Header from '../../components/layout/Header';

export default function ClassListStaff() {
  const [classes, setClasses] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [lecturerOptions, setLecturerOptions] = useState([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    ClassName: '',
    SubjectId: null,
    LecturerId: null,
    OrderBy: 'ClassName',
    // Descending: false,
    PageNum: 1,
    PageSize: 9,
    // ViewAll: false,
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
      setTotalClasses(data.itemCount)
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
    <>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Class Management
              </h1>
              <p className='text-gray-600'>
                Manage your classes and monitor student progress
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setIsOpen(true)}
                className='flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all'
              >
                <Plus className='w-5 h-5 mr-2' />
                Create Class
              </button>
              <button
                onClick={() => setIsMultiOpen(true)}
                className='flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all'
              >
                <Plus className='w-5 h-5 mr-2' />
                Create multiple class
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <form
            onSubmit={handleSearch}
            className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4'
          >
            {/* --- ClassName --- */}
            <div className='col-span-1'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
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
                  className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                />
                <Search
                  className='absolute right-3 top-2.5 text-gray-400'
                  size={18}
                />
              </div>
            </div>

            {/* --- Subject --- */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Subject
              </label>
              <select
                className='w-full border border-gray-300 rounded-lg px-3 py-2'
                value={filters.SubjectId ?? ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    SubjectId: e.target.value ? parseInt(e.target.value) : null,
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Lecturer
              </label>
              <select
                className='w-full border border-gray-300 rounded-lg px-3 py-2'
                value={filters.LecturerId ?? ''}
                onChange={e =>
                  setFilters({
                    ...filters,
                    LecturerId: e.target.value
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Order By
              </label>
              <div className='flex items-center gap-2'>
                <select
                  className='flex-1 border border-gray-300 rounded-lg px-3 py-2'
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
                  className={`p-2 rounded-lg border transition-colors ${
                    filters.Descending
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300'
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
                className='bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors'
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center'>
              <BookOpen className='w-6 h-6 text-white' />
            </div>
            <div>
              <p className='text-sm text-gray-600'>Total Classes</p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalClasses}
              </p>
            </div>
          </div>

          {/* Class List */}
          {classes.length === 0 ? (
            <div className='text-center py-12'>
              <BookOpen className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No classes found
              </h3>
              <p className='text-gray-600 mb-6'>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className='bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors'
              >
                Create your first class
              </button>
            </div>
          ) : (
            <div>
              {/* Grid/List display — tùy bạn thêm code hiển thị class card */}
              <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {classes.map(c => (
                  <div
                    key={c.classId}
                    className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-5 flex flex-col justify-between'
                  >
                    <div>
                      <div className='flex justify-between items-center mb-2'>
                        <h2 className='text-lg font-semibold text-gray-900'>
                          {c.className}
                        </h2>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            c.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className='text-sm text-gray-600 flex items-center gap-2'>
                        <BookCopy size={15} className='text-indigo-500' />
                        {c.subjectName} ({c.subjectCode})
                      </p>
                      <p className='text-sm text-gray-600 flex items-center gap-2 mt-1'>
                        <UserCheck size={15} className='text-indigo-500' />
                        {c.lecturerName} ({c.lecturerCode})
                      </p>

                      <div className='mt-3 flex flex-wrap gap-3 text-sm text-gray-500'>
                        <span className='flex items-center gap-1'>
                          <Users size={15} /> {c.memberCount} members
                        </span>
                        <span className='flex items-center gap-1'>
                          <BookOpen size={15} /> {c.teamCount} teams
                        </span>
                        <span className='flex items-center gap-1'>
                          <CalendarDays size={15} />
                          {new Date(c.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className='flex justify-end gap-2 mt-5'>
                      <button
                        onClick={() => navigate(`/staff/classes/${c.classId}`)}
                        className='p-2 rounded-lg border border-gray-200 hover:bg-gray-100'
                      >
                        <Eye size={16} className='text-gray-600' />
                      </button>
                      <button className='p-2 rounded-lg border border-gray-200 hover:bg-indigo-50'>
                        <Edit size={16} className='text-indigo-600' />
                      </button>
                      <button className='p-2 rounded-lg border border-gray-200 hover:bg-red-50'>
                        <Trash2 size={16} className='text-red-600' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex justify-center mt-8 gap-4'>
                <button
                  onClick={() => handlePageChange(filters.PageNum - 1)}
                  disabled={filters.PageNum === 1}
                  className='px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50'
                >
                  <ChevronLeft size={18} />
                </button>
                <span className='text-gray-700 text-sm'>
                  Page {filters.PageNum} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.PageNum + 1)}
                  disabled={filters.PageNum === totalPages}
                  className='px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50'
                >
                  <ChevronRight size={18} />
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
    </>
  );
}
