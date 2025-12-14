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
  Calendar,
  Filter,
  ChevronDown,
} from 'lucide-react';
import CreateClassForm from '../../features/staff/components/CreateClassForm';
import CreateMultipleClassForm from '../../features/staff/components/CreateMultipleClassForm';
import ModalWrapper from '../../components/layout/ModalWrapper';
import { useNavigate } from 'react-router-dom';
import {
  getClass,
  getAllSubject,
  getAllLecturer,
  getSemester,
} from '../../services/userService';
import StaffDashboardLayout from '../../components/layout/StaffDashboardLayout';

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

export default function ClassListStaff() {
  const [classes, setClasses] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [lecturerOptions, setLecturerOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    Descriptor: '',
    SemesterId: null,
    SubjectIds: null,
    LecturerIds: null,
    OrderBy: 'ClassName',
    PageNum: 1,
    PageSize: 10,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isMultiOpen, setIsMultiOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [subjects, lecturers, semesters] = await Promise.all([
          getAllSubject(),
          getAllLecturer(true),
          getSemester(),
        ]);
        setSubjectOptions(subjects || []);
        setLecturerOptions(lecturers.list || []);
        setSemesterOptions(semesters || []);
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

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <StaffDashboardLayout>
      <div className='bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
        <div className='mx-auto space-y-6'>
          {/* Header Section */}
          <div className='relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur'>
            <div className='relative z-10 px-6 py-8 lg:px-10'>
              <div className='flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
                <div className='max-w-2xl space-y-4'>
                  <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2'>
                    Staff Hub
                  </p>
                  <h1 className='mt-2 text-3xl font-semibold text-slate-900'>
                    Class{' '}
                    <span className='text-orangeFpt-500 font-bold'>
                      Management
                    </span>
                  </h1>
                  <p className='mt-1 text-sm text-slate-600'>
                    Manage and organize your classes efficiently.
                  </p>
                </div>

                {/* Stats Card */}
                <div className='w-full max-w-sm'>
                  <div
                    className='rounded-2xl border px-5 py-4 shadow-sm backdrop-blur transition-all duration-200
                      border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500'
                  >
                    <div className='flex justify-between items-start'>
                      <p className='text-[11px] uppercase tracking-wide font-semibold text-orangeFpt-700'>
                        Total Classes
                      </p>
                      <BookOpen className='w-5 h-5 text-orangeFpt-600' />
                    </div>
                    <p className='text-3xl font-bold text-orangeFpt-600 mt-2'>
                      {totalClasses}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Table Section */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
            <div className='p-5 border-b border-slate-100'>
              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                  Classes
                  <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
                    {totalClasses} total
                  </span>
                </h2>

                {/* Search & Action Buttons */}
                <div className='flex flex-wrap items-center gap-3'>
                  {/* Search Bar */}
                  <div className='relative'>
                    <input
                      type='text'
                      value={filters.Descriptor}
                      onChange={e => {
                        setFilters({
                          ...filters,
                          Descriptor: e.target.value,
                          PageNum: 1,
                        });
                      }}
                      placeholder='Search classes...'
                      className='w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm'
                    />
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                  </div>

                  {/* Filter Dropdown Button */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className='flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm border border-slate-200'
                    >
                      <Filter className='w-4 h-4' />
                      Filters
                      <ChevronDown className='w-4 h-4' />
                    </button>
                    {showFilterDropdown && (
                      <div className='fixed mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto'>
                        <div className='p-4 space-y-4'>
                          <h3 className='font-semibold text-slate-800 text-sm'>
                            Filter Classes
                          </h3>

                          {/* Semester */}
                          <div>
                            <label className='block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                              Semester
                            </label>
                            <select
                              className='w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none transition-all text-sm'
                              value={filters.SemesterId ?? ''}
                              onChange={e =>
                                setFilters({
                                  ...filters,
                                  SemesterId: e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                })
                              }
                            >
                              <option value=''>All Semesters</option>
                              {semesterOptions.map(sem => (
                                <option
                                  key={sem.semesterId}
                                  value={sem.semesterId}
                                >
                                  {sem.semesterName} ({sem.semesterCode})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Subject */}
                          <div>
                            <label className='block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                              Subject
                            </label>
                            <select
                              className='w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none transition-all text-sm'
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
                            <label className='block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                              Lecturer
                            </label>
                            <select
                              className='w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none transition-all text-sm'
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
                              <option value=''>All Lecturers</option>
                              {lecturerOptions.map(l => (
                                <option key={l.uId} value={l.uId}>
                                  {l.fullname}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Sort By */}
                          <div>
                            <label className='block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>
                              Sort By
                            </label>
                            <div className='flex gap-2'>
                              <select
                                className='flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none transition-all text-sm'
                                value={filters.OrderBy}
                                onChange={e =>
                                  setFilters({
                                    ...filters,
                                    OrderBy: e.target.value,
                                  })
                                }
                              >
                                <option value='ClassName'>Class Name</option>
                                <option value='SubjectName'>Subject</option>
                                <option value='CreatedDate'>
                                  Created Date
                                </option>
                              </select>
                              <button
                                type='button'
                                onClick={() =>
                                  setFilters(prev => ({
                                    ...prev,
                                    Descending: !prev.Descending,
                                  }))
                                }
                                className={`p-2 rounded-lg border transition-all ${
                                  filters.Descending
                                    ? 'bg-orangeFpt-500 text-white border-orangeFpt-500'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                                title='Toggle ascending/descending'
                              >
                                <ArrowUpWideNarrow
                                  size={16}
                                  className={`transform transition-transform ${
                                    filters.Descending ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex gap-2 pt-2'>
                            <button
                              onClick={() => {
                                setFilters({
                                  Descriptor: '',
                                  SemesterId: null,
                                  SubjectIds: null,
                                  LecturerIds: null,
                                  OrderBy: 'ClassName',
                                  PageNum: 1,
                                  PageSize: 10,
                                });
                                setShowFilterDropdown(false);
                              }}
                              className='flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm'
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => {
                                setFilters(prev => ({ ...prev, PageNum: 1 }));
                                setShowFilterDropdown(false);
                              }}
                              className='flex-1 px-4 py-2 bg-orangeFpt-500 text-white rounded-lg hover:bg-orangeFpt-600 transition-all font-medium text-sm'
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create Dropdown Button */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                      className='flex items-center gap-2 bg-orangeFpt-500 text-white px-4 py-2 rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium text-sm'
                    >
                      <Plus className='w-4 h-4' />
                      Create Class
                      <ChevronDown className='w-4 h-4' />
                    </button>
                    {showCreateDropdown && (
                      <div className='absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden'>
                        <button
                          onClick={() => {
                            setIsOpen(true);
                            setShowCreateDropdown(false);
                          }}
                          className='w-full text-left px-4 py-3 hover:bg-orangeFpt-50 transition-colors text-slate-700 font-medium text-sm'
                        >
                          Create Single Class
                        </button>
                        <button
                          onClick={() => {
                            setIsMultiOpen(true);
                            setShowCreateDropdown(false);
                          }}
                          className='w-full text-left px-4 py-3 hover:bg-orangeFpt-50 transition-colors text-slate-700 font-medium border-t border-slate-100 text-sm'
                        >
                          Create Multiple Classes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              {classes.length === 0 ? (
                <div className='text-center py-20'>
                  <BookOpen className='w-16 h-16 text-slate-300 mx-auto mb-4' />
                  <h3 className='text-xl font-bold text-slate-700 mb-2'>
                    No classes found
                  </h3>
                  <p className='text-slate-500 mb-6'>
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => setIsOpen(true)}
                    className='bg-orangeFpt-500 text-white px-6 py-2.5 rounded-xl hover:bg-orangeFpt-600 transition-all shadow-lg shadow-orangeFpt-500/30 font-medium'
                  >
                    Create your first class
                  </button>
                </div>
              ) : (
                <table className='w-full table-fixed'>
                  <colgroup>
                    <col className='w-[25%]' />
                    <col className='w-[20%]' />
                    <col className='w-[15%]' />
                    <col className='w-[10%]' />
                    <col className='w-[10%]' />
                    <col className='w-[10%]' />
                    <col className='w-[10%]' />
                  </colgroup>
                  <thead className='bg-slate-50/50 border-b border-slate-200'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        Class Info
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        Subject
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        Created Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        Students
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        Teams
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {classes.map(cls => (
                      <tr
                        key={cls.classId}
                        onClick={() => handleClassClick(cls.classId)}
                        className='hover:bg-slate-50 transition-colors cursor-pointer'
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-lg bg-orangeFpt-50 flex items-center justify-center flex-shrink-0'>
                              <BookOpen className='w-5 h-5 text-orangeFpt-600' />
                            </div>
                            <div className='min-w-0'>
                              <p className='font-semibold text-slate-900 truncate'>
                                {cls.className}
                              </p>
                              <p className='text-xs text-slate-500'>
                                {cls.subjectCode || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='text-sm text-slate-600 truncate block'>
                            {cls.subjectName || 'N/A'}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2 text-slate-600'>
                            <Calendar className='w-4 h-4 flex-shrink-0 text-slate-400' />
                            <span className='text-sm'>
                              {formatDate(cls.createdDate)}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Users className='w-4 h-4 text-slate-400' />
                            <span className='text-sm font-medium text-slate-700'>
                              {cls.memberCount ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Grid3x3 className='w-4 h-4 text-slate-400' />
                            <span className='text-sm font-medium text-slate-700'>
                              {cls.teamCount ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <StatusBadge isActive={cls.isActive} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {classes.length > 0 && (
              <div className='flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50'>
                <p className='text-sm text-slate-600'>
                  Showing page {filters.PageNum} of {totalPages}
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handlePageChange(filters.PageNum - 1)}
                    disabled={filters.PageNum === 1}
                    className='p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronLeft size={18} className='text-slate-600' />
                  </button>
                  <span className='text-sm font-medium text-slate-700 px-3'>
                    {filters.PageNum} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.PageNum + 1)}
                    disabled={filters.PageNum === totalPages}
                    className='p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronRight size={18} className='text-slate-600' />
                  </button>
                </div>
              </div>
            )}
          </div>
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
          <CreateMultipleClassForm
            onClose={() => {
              setIsMultiOpen(false);
              fetchData();
            }}
          />
        </ModalWrapper>
      </div>
    </StaffDashboardLayout>
  );
}
