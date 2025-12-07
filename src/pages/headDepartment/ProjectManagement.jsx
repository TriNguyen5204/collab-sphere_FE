import { useEffect, useState } from 'react';
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
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

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

  const fetchProjects = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getAllProject(params);
      setProjects(data.list);
      setPageCount(data.pageCount || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [pageNum]);

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

  const handleSearch = e => {
    e.preventDefault();
    setPageNum(1);
    const params = {
      descriptors: search || undefined,
      subjectIds: subjectId ? [Number(subjectId)] : undefined,
      lecturerIds: lecturerId ? [Number(lecturerId)] : undefined,
      pageNum: 1,
    };
    fetchProjects(params);
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
      <div className='flex h-screen bg-gray-50 overflow-hidden font-sans'>
        {/* Main Content */}
        <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
          <main className='flex-1 overflow-y-auto p-4 md:p-8'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Header & Controls */}
              <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-gray-100'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
                    <div className='p-2 bg-orange-100 rounded-lg'>
                      <BookOpen className='h-8 w-8 text-orange-600' />
                    </div>
                    Project Management
                  </h1>
                  <p className='text-sm text-gray-500 mt-2 ml-1'>
                    Manage and monitor all capstone projects
                  </p>
                </div>

                {/* View Toggle */}
                <div className='flex items-center gap-1 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm'>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-orange-50 text-orange-600 shadow-sm font-medium'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title='Grid View'
                  >
                    <LayoutGrid className='w-5 h-5' />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-orange-50 text-orange-600 shadow-sm font-medium'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title='List View'
                  >
                    <List className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
                <form
                  onSubmit={handleSearch}
                  className='flex flex-wrap items-center gap-4'
                >
                  <div className='flex-1 min-w-[240px] relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Search projects...'
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className='w-full border border-gray-200 bg-gray-50 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-transparent transition-all placeholder:text-gray-400 text-sm'
                    />
                  </div>

                  <div className='flex gap-3 flex-wrap'>
                    <div className='relative'>
                      <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <select
                        value={subjectId}
                        onChange={e => setSubjectId(e.target.value)}
                        className='border border-gray-200 bg-gray-50 rounded-xl pl-10 pr-8 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-transparent cursor-pointer text-sm appearance-none hover:bg-gray-100 transition-colors min-w-[160px]'
                      >
                        <option value=''>All Subjects</option>
                        {subjectOptions.map(subj => (
                          <option key={subj.subjectId} value={subj.subjectId}>
                            {subj.subjectCode || subj.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <select
                        value={lecturerId}
                        onChange={e => setLecturerId(e.target.value)}
                        className='border border-gray-200 bg-gray-50 rounded-xl pl-10 pr-8 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-transparent cursor-pointer text-sm appearance-none hover:bg-gray-100 transition-colors min-w-[160px]'
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

                  <button
                    type='submit'
                    className='bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all font-medium shadow-md shadow-orange-100 active:scale-95 text-sm'
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Content Area */}
              {loading ? (
                <div className='flex justify-center items-center h-64'>
                  <div className='animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-orange-600'></div>
                </div>
              ) : error ? (
                <div className='text-red-500 text-center py-8 bg-red-50 rounded-2xl border border-red-100'>
                  {error}
                </div>
              ) : projects.length === 0 ? (
                <div className='text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300'>
                  <div className='bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <BookOpen className='h-8 w-8 text-gray-400' />
                  </div>
                  <h3 className='text-lg font-bold text-gray-900'>
                    No projects found
                  </h3>
                  <p className='text-gray-500 mt-1'>
                    Try adjusting your search or filters to find what you're
                    looking for.
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'>
                      {projects.map(project => (
                        <div
                          key={project.projectId}
                          onClick={() => handleProject(project.projectId)}
                          className='group relative flex cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-50'
                        >
                          {/* Card Header */}
                          <div className='mb-4 flex items-start justify-between'>
                            <div className='space-y-2 flex-1 min-w-0 pr-3'>
                              <div className='flex items-center gap-2'>
                                {/* Subject Badge - FPT Style */}
                                <span className='inline-flex items-center rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 border border-orange-100'>
                                  {project.subjectCode ||
                                    project.majorName
                                      ?.substring(0, 3)
                                      .toUpperCase() ||
                                    'PROJ'}
                                </span>
                                {project.lecturerName && (
                                  <span
                                    className='inline-flex items-center gap-1 text-[11px] text-gray-500'
                                    title={`Created by ${project.lecturerName}`}
                                  >
                                    <UserIcon className='h-3 w-3' />
                                    <span className='truncate max-w-[100px]'>
                                      {project.lecturerName}
                                    </span>
                                  </span>
                                )}
                              </div>
                              <h3
                                className='text-base font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200'
                                title={project.projectName}
                              >
                                {project.projectName}
                              </h3>
                            </div>

                            {/* Actions Top Right */}
                            <div className='flex flex-col items-end gap-2'>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusColor(project.status || (project.isActive ? 'active' : 'pending'))}`}
                              >
                                {getStatusLabel(project)}
                              </span>
                              <button
                                onClick={e =>
                                  confirmDelete(e, project.projectId)
                                }
                                className='opacity-0 group-hover:opacity-100 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200'
                                title='Delete Project'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className='mb-5 text-xs text-gray-500 line-clamp-2 flex-1 leading-relaxed'>
                            {project.description ||
                              'No description provided for this project.'}
                          </p>

                          {/* Stats */}
                          <div className='mb-5 grid grid-cols-2 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100'>
                            <div className='text-center bg-gray-50 py-2'>
                              <p className='text-[10px] font-bold uppercase text-gray-400 tracking-wide'>
                                Objectives
                              </p>
                              <p className='text-sm font-bold text-gray-800'>
                                {project.objectives?.length || 0}
                              </p>
                            </div>
                            <div className='text-center bg-gray-50 py-2'>
                              <p className='text-[10px] font-bold uppercase text-gray-400 tracking-wide'>
                                Milestones
                              </p>
                              <p className='text-sm font-bold text-gray-800'>
                                {project.milestoneCount || 0}
                              </p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className='mt-auto flex items-center justify-between border-t border-gray-100 pt-4'>
                            <span className='text-xs font-semibold text-gray-400 group-hover:text-orange-600 transition-colors'>
                              View Details
                            </span>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-200 group-hover:bg-orange-100 group-hover:text-orange-600'>
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
                          className='group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md sm:flex-row sm:items-center cursor-pointer'
                        >
                          {/* Left: Info */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-2'>
                              <span className='inline-flex items-center rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 border border-orange-100'>
                                {project.subjectCode ||
                                  project.majorName
                                    ?.substring(0, 3)
                                    .toUpperCase() ||
                                  'PROJ'}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusColor(project.status || (project.isActive ? 'active' : 'pending'))}`}
                              >
                                {getStatusLabel(project)}
                              </span>
                              {project.lecturerName && (
                                <span className='inline-flex items-center gap-1.5 text-xs text-gray-500 ml-2'>
                                  <div className='w-1 h-1 rounded-full bg-gray-300'></div>
                                  <UserIcon className='h-3 w-3' />
                                  <span>{project.lecturerName}</span>
                                </span>
                              )}
                            </div>
                            <h3 className='text-base font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors'>
                              {project.projectName}
                            </h3>
                            <p className='text-xs text-gray-500 truncate max-w-lg mt-1'>
                              {project.description ||
                                'No description available'}
                            </p>
                          </div>

                          {/* Middle: Stats */}
                          <div className='flex items-center gap-8 px-6 sm:border-l sm:border-r border-gray-100'>
                            <div className='text-center'>
                              <span className='block text-lg font-bold text-gray-800'>
                                {project.objectives?.length || 0}
                              </span>
                              <span className='text-[10px] font-bold uppercase text-gray-400'>
                                Objectives
                              </span>
                            </div>
                            <div className='text-center'>
                              <span className='block text-lg font-bold text-gray-800'>
                                {project.milestoneCount || 0}
                              </span>
                              <span className='text-[10px] font-bold uppercase text-gray-400'>
                                Milestones
                              </span>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className='flex sm:w-auto w-full gap-2'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleProject(project.projectId);
                              }}
                              className='group/btn flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 active:scale-[0.98]'
                            >
                              <span>Details</span>
                              <ArrowRight className='h-4 w-4 transition-transform group-hover/btn:translate-x-1' />
                            </button>

                            <button
                              onClick={e => confirmDelete(e, project.projectId)}
                              className='flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm'
                              title='Delete Project'
                            >
                              <Trash2 className='h-5 w-5' />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  <div className='flex justify-center items-center gap-3 mt-8 pb-8'>
                    <button
                      disabled={pageNum === 1}
                      onClick={() => handlePageChange(pageNum - 1)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        pageNum === 1
                          ? 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
                      }`}
                    >
                      Previous
                    </button>
                    <span className='text-orange-700 text-sm font-bold bg-orange-50 px-4 py-2 rounded-xl border border-orange-100'>
                      Page {pageNum} of {pageCount}
                    </span>
                    <button
                      disabled={pageNum === pageCount}
                      onClick={() => handlePageChange(pageNum + 1)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        pageNum === pageCount
                          ? 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-900/30 z-50 backdrop-blur-sm transition-opacity'>
            <div className='bg-white rounded-2xl shadow-xl p-6 w-96 transform transition-all scale-100 border border-gray-100'>
              <div className='flex items-center gap-4 mb-5'>
                <div className='p-3 bg-red-50 rounded-full border border-red-100'>
                  <AlertTriangle className='w-6 h-6 text-red-600' />
                </div>
                <h2 className='text-lg font-bold text-gray-800'>
                  Delete Project?
                </h2>
              </div>
              <p className='text-gray-500 mb-6 text-sm leading-relaxed'>
                Are you sure you want to delete this project? This action cannot
                be undone and will remove all associated data.
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setDeleteId(null)}
                  className='px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium text-sm'
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
