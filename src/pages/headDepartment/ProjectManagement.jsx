import { useEffect, useState, useCallback } from 'react';
import {
  getAllProject,
  getAllSubject,
  getAllLecturer,
  removeProject,
} from '../../services/userService';
import {
  BookOpen,
  User,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  List,
  ArrowRight,
  User as UserIcon,
  Search,
  X,
  FolderKanban,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';
import { Pagination } from '../../features/head-department/components';

// Debounce hook - must be outside component
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [lecturerOptions, setLecturerOptions] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  // UI State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const navigate = useNavigate();

  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [itemCount, setItemCount] = useState(0);

  // Debounced search value
  const debouncedSearch = useDebounce(search, 300);

  const fetchProjects = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await getAllProject(params);
      setProjects(data.list);
      setPageCount(data.pageCount || 1);
      setItemCount(data.itemCount || 0);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when filters change
  useEffect(() => {
    const params = {
      descriptors: debouncedSearch || undefined,
      subjectIds: subjectId ? [Number(subjectId)] : undefined,
      lecturerIds: lecturerId ? [Number(lecturerId)] : undefined,
      pageNum: pageNum,
      pageSize: 3,
    };
    fetchProjects(params);
  }, [debouncedSearch, subjectId, lecturerId, pageNum, fetchProjects]);

  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const [subjects, lecturers] = await Promise.all([
          getAllSubject(),
          getAllLecturer(true),
        ]);
        setSubjectOptions(subjects);
        setLecturerOptions(lecturers.list);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    fetchDropdown();
  }, []);

  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNum(1);
  };

  const handleSubjectChange = (value) => {
    setSubjectId(value);
    setPageNum(1);
  };

  const handleLecturerChange = (value) => {
    setLecturerId(value);
    setPageNum(1);
  };

  const clearSearch = () => {
    setSearch('');
    setPageNum(1);
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pageCount) {
      setPageNum(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProject = id => {
    navigate(`/head-department/project/${id}`);
  };

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleDeleteProject = async () => {
    if (!deleteId) return;
    try {
      const response = await removeProject(deleteId);
      if (response) {
        toast.success('Project deleted successfully!');
        setProjects(prev => prev.filter(p => p.projectId !== deleteId));
      }
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  };

  // Helper for status styling
  const getStatusColor = status => {
    const s = String(status).toLowerCase();
    if (s === 'approved' || s === '1' || s === 'active')
      return 'border-green-200 bg-green-50 text-green-700';
    if (s === 'pending' || s === '0')
      return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    if (s === 'rejected') return 'border-red-200 bg-red-50 text-red-700';
    return 'border-slate-200 bg-slate-50 text-slate-700';
  };

  const getStatusLabel = project => {
    return project.statusString || (project.status ? 'Active' : 'Pending');
  };

  return (
    <HeadDashboardLayout>
      <div className=' bg-gradient-to-br from-slate-50 to-slate-100 p-6'>
        <div className='mx-auto space-y-6'>
          
          {/* Header Section - Matching Staff/Admin style */}
          <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
            <div className="relative z-10 px-6 py-8 lg:px-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                    Head Department
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Project <span className="text-orangeFpt-500 font-bold">Management</span>
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage and monitor all capstone projects
                  </p>
                  
                  {/* View Toggle */}
                  <div className='inline-flex p-1 bg-slate-100 rounded-xl mt-2'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all font-medium text-sm ${
                        viewMode === 'grid'
                          ? 'bg-white text-orangeFpt-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <LayoutGrid className='w-4 h-4' /> Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all font-medium text-sm ${
                        viewMode === 'list'
                          ? 'bg-white text-orangeFpt-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <List className='w-4 h-4' /> List
                    </button>
                  </div>
                </div>
                
                {/* Stats Card */}
                <div className="w-full max-w-sm">
                  <div
                    className={`rounded-2xl border px-5 py-4 shadow-sm backdrop-blur transition-all duration-200
                      border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <p className='text-[11px] uppercase tracking-wide font-semibold text-orangeFpt-700'>
                        Total Projects
                      </p>
                      <FolderKanban className='w-5 h-5 text-orangeFpt-600' />
                    </div>
                    <p className="text-3xl font-bold text-orangeFpt-600 mt-2">
                      {itemCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Table Section */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
            {/* Filter Header */}
            <div className='p-5 border-b border-slate-100'>
              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                  Projects
                  <span className='px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
                    {projects?.length || 0} showing
                  </span>
                </h2>
                
                {/* Search & Filters */}
                <div className='flex flex-wrap items-center gap-3'>
                  {/* Search Bar */}
                  <div className='relative'>
                    <input
                      type='text'
                      value={search}
                      onChange={e => handleSearchChange(e.target.value)}
                      placeholder='Search projects...'
                      className='w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm'
                    />
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                    {search && (
                      <button
                        onClick={clearSearch}
                        className='absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    )}
                  </div>

                  {/* Subject Filter */}
                  <select
                    value={subjectId}
                    onChange={e => handleSubjectChange(e.target.value)}
                    className='bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm cursor-pointer'
                  >
                    <option value=''>All Subjects</option>
                    {subjectOptions.map(subj => (
                      <option key={subj.subjectId} value={subj.subjectId}>
                        {subj.subjectCode || subj.subjectName}
                      </option>
                    ))}
                  </select>

                  {/* Lecturer Filter */}
                  <select
                    value={lecturerId}
                    onChange={e => handleLecturerChange(e.target.value)}
                    className='bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orangeFpt-500/20 focus:border-orangeFpt-500 focus:outline-none focus:bg-white transition-all text-sm cursor-pointer'
                  >
                    <option value=''>All Lecturers</option>
                    {lecturerOptions.map(lec => (
                      <option key={lec.uId} value={lec.uId}>
                        {lec.fullname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className='p-5 min-h-[400px]'>
              {loading ? (
                <div className='flex justify-center items-center h-64'>
                  <div className='animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-orangeFpt-600'></div>
                </div>
              ) : error ? (
                <div className='text-red-500 text-center py-8 bg-red-50 rounded-2xl border border-red-100'>
                  {error}
                </div>
              ) : !projects || projects.length === 0 ? (
                <div className='text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300'>
                  <div className='bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <BookOpen className='h-8 w-8 text-slate-400' />
                  </div>
                  <h3 className='text-lg font-bold text-slate-900'>
                    No projects found
                  </h3>
                  <p className='text-slate-500 mt-1'>
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                      {projects.map(project => (
                        <div
                          key={project.projectId}
                          onClick={() => handleProject(project.projectId)}
                          className='group relative flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orangeFpt-300 hover:shadow-lg hover:shadow-orangeFpt-50'
                        >
                          {/* Card Header */}
                          <div className='mb-4 flex items-start justify-between'>
                            <div className='space-y-2 flex-1 min-w-0 pr-3'>
                              <div className='flex items-center gap-2'>
                                <span className='inline-flex items-center rounded-lg bg-orangeFpt-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orangeFpt-700 border border-orangeFpt-100'>
                                  {project.subjectCode || project.majorName?.substring(0, 3).toUpperCase() || 'PROJ'}
                                </span>
                                {project.lecturerName && (
                                  <span className='inline-flex items-center gap-1 text-[11px] text-slate-500' title={`Created by ${project.lecturerName}`}>
                                    <UserIcon className='h-3 w-3' />
                                    <span className='truncate max-w-[100px]'>{project.lecturerName}</span>
                                  </span>
                                )}
                              </div>
                              <h3 className='text-base font-bold text-slate-900 line-clamp-1 group-hover:text-orangeFpt-600 transition-colors duration-200' title={project.projectName}>
                                {project.projectName}
                              </h3>
                            </div>

                            <div className='flex flex-col items-end gap-2'>
                              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusColor(project.status || (project.isActive ? 'active' : 'pending'))}`}>
                                {getStatusLabel(project)}
                              </span>
                              <button
                                onClick={e => confirmDelete(e, project.projectId)}
                                className='opacity-0 group-hover:opacity-100 p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200'
                                title='Delete Project'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>

                          <p className='mb-5 text-xs text-slate-500 line-clamp-2 flex-1 leading-relaxed'>
                            {project.description || 'No description provided for this project.'}
                          </p>

                          <div className='mt-auto flex items-center justify-between border-t border-slate-100 pt-4'>
                            <span className='text-xs font-semibold text-slate-400 group-hover:text-orangeFpt-600 transition-colors'>View Details</span>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-orangeFpt-100 group-hover:text-orangeFpt-600'>
                              <ArrowRight className='h-4 w-4' />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex flex-col gap-4'>
                      {projects.map(project => (
                        <div
                          key={project.projectId}
                          onClick={() => handleProject(project.projectId)}
                          className='group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-orangeFpt-300 hover:shadow-md sm:flex-row sm:items-center cursor-pointer'
                        >
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-2'>
                              <span className='inline-flex items-center rounded-lg bg-orangeFpt-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orangeFpt-700 border border-orangeFpt-100'>
                                {project.subjectCode || project.majorName?.substring(0, 3).toUpperCase() || 'PROJ'}
                              </span>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusColor(project.status || (project.isActive ? 'active' : 'pending'))}`}>
                                {getStatusLabel(project)}
                              </span>
                              {project.lecturerName && (
                                <span className='inline-flex items-center gap-1.5 text-xs text-slate-500 ml-2'>
                                  <div className='w-1 h-1 rounded-full bg-slate-300'></div>
                                  <UserIcon className='h-3 w-3' />
                                  <span>{project.lecturerName}</span>
                                </span>
                              )}
                            </div>
                            <h3 className='text-base font-bold text-slate-900 truncate group-hover:text-orangeFpt-600 transition-colors'>
                              {project.projectName}
                            </h3>
                            <p className='text-xs text-slate-500 truncate max-w-lg mt-1'>
                              {project.description || 'No description available'}
                            </p>
                          </div>

                          <div className='flex sm:w-auto w-full gap-2'>
                            <button
                              onClick={e => { e.stopPropagation(); handleProject(project.projectId); }}
                              className='group/btn flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-orangeFpt-200 hover:bg-orangeFpt-50 hover:text-orangeFpt-700 active:scale-[0.98]'
                            >
                              <span>Details</span>
                              <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-1' />
                            </button>
                            <button
                              onClick={e => confirmDelete(e, project.projectId)}
                              className='flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm'
                              title='Delete Project'
                            >
                              <Trash2 className='h-5 w-5' />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pagination Footer */}
            {pageCount > 1 && (
              <Pagination
                currentPage={pageNum}
                totalPages={pageCount}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div className='fixed inset-0 flex items-center justify-center bg-slate-900/30 z-50 backdrop-blur-sm transition-opacity'>
            <div className='bg-white rounded-2xl shadow-xl p-6 w-96 transform transition-all scale-100 border border-slate-100'>
              <div className='flex items-center gap-4 mb-5'>
                <div className='p-3 bg-red-50 rounded-full border border-red-100'>
                  <AlertTriangle className='w-6 h-6 text-red-600' />
                </div>
                <h2 className='text-lg font-bold text-slate-800'>Delete Project?</h2>
              </div>
              <p className='text-slate-500 mb-6 text-sm leading-relaxed'>
                Are you sure you want to delete this project? This action cannot be undone and will remove all associated data.
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setDeleteId(null)}
                  className='px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium text-sm'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className='px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm shadow-md shadow-red-100'
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeadDashboardLayout>
  );
}
