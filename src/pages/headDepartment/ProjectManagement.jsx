import { useEffect, useState } from 'react';
import HeadDepartmentSidebar from '../../components/layout/HeadDepartmentSidebar';
import {
  getAllProject,
  getAllSubject,
  getAllLecturer,
  removeProject,
} from '../../services/userService';
import {
  BookOpen,
  User,
  ClipboardList,
  GraduationCap,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

  const navigate = useNavigate();

  // Pagination
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  // Fetch Projects
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
    fetchProjects({ pageNum });
  }, [pageNum]);

  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const [subjects, lecturers] = await Promise.all([
          getAllSubject(),
          getAllLecturer(),
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
      const params = {
        Descriptors: search || undefined,
        SubjectIds: subjectId ? [Number(subjectId)] : undefined,
        LecturerIds: lecturerId ? [Number(lecturerId)] : undefined,
        pageNum: newPage,
      };
      setPageNum(newPage);
      fetchProjects(params);
    }
  };

  const handleProject = id => {
    navigate(`/head-department/project/${id}`);
  };

  const confirmDelete = id => {
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

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <HeadDepartmentSidebar />
      <div className='flex-1 p-8 relative'>
        <h1 className='text-2xl font-semibold text-gray-800 mb-6'>
          Project Management
        </h1>

        {/* Search & Filter */}
        <form
          onSubmit={handleSearch}
          className='flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl shadow-md'
        >
          <input
            type='text'
            placeholder='Search by keyword...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />

          <select
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            className='border border-gray-300 rounded-lg px-4 py-2 w-56 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            <option value=''>All Subjects</option>
            {subjectOptions.map(subj => (
              <option key={subj.subjectId} value={subj.subjectId}>
                {subj.subjectName}
              </option>
            ))}
          </select>

          <select
            value={lecturerId}
            onChange={e => setLecturerId(e.target.value)}
            className='border border-gray-300 rounded-lg px-4 py-2 w-56 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          >
            <option value=''>All Lecturers</option>
            {lecturerOptions.map(lec => (
              <option key={lec.uId} value={lec.uId}>
                {lec.fullname}
              </option>
            ))}
          </select>

          <button
            type='submit'
            className='bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition'
          >
            Search
          </button>
        </form>

        {loading && <div className='text-gray-500'>Loading...</div>}
        {error && <div className='text-red-500'>{error}</div>}

        {!loading && !error && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
              {projects.map(project => (
                <div
                  key={project.projectId}
                  className='relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer border border-gray-100'
                >
                  {/* Header */}
                  <div className='h-24 bg-gradient-to-r from-blue-300 to-blue-500 rounded-t-2xl'></div>

                  {/* Content */}
                  <div
                    onClick={() => handleProject(project.projectId)}
                    className='p-5'
                  >
                    <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                      {project.projectName}
                    </h2>

                    <div className='flex items-center text-sm text-gray-700 mb-1'>
                      <BookOpen className='w-4 h-4 mr-2 text-blue-600' />
                      <span>
                        {project.subjectName}{' '}
                        {project.semesterName
                          ? `(${project.semesterName})`
                          : ''}
                      </span>
                    </div>

                    <div className='flex items-center text-sm text-gray-700 mb-1'>
                      <ClipboardList className='w-4 h-4 mr-2 text-green-600' />
                      <span>{project.className || 'No Class Info'}</span>
                    </div>

                    <div className='flex items-center text-sm text-gray-700 mb-1'>
                      <User className='w-4 h-4 mr-2 text-purple-600' />
                      <span>{project.lecturerName || 'Unknown Lecturer'}</span>
                    </div>

                    {project.majorName && (
                      <div className='flex items-center text-sm text-gray-700 mb-1'>
                        <GraduationCap className='w-4 h-4 mr-2 text-amber-600' />
                        <span>{project.majorName}</span>
                      </div>
                    )}

                    <div className='mt-3'>
                      <div className='flex justify-between text-xs text-gray-500 mb-1'>
                        <span>Progress</span>
                        <span>{project.progress ?? 0}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full transition-all duration-500'
                          style={{ width: `${project.progress ?? 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='absolute top-3 right-3 flex gap-2'>
                    <button
                      onClick={() => handleProject(project.projectId)}
                      className='bg-white p-2 rounded-full shadow hover:bg-blue-50 transition'
                      title='View Details'
                    >
                      <Eye className='w-4 h-4 text-blue-600' />
                    </button>
                    <button
                      onClick={() => confirmDelete(project.projectId)}
                      className='bg-white p-2 rounded-full shadow hover:bg-red-50 transition'
                      title='Delete Project'
                    >
                      <Trash2 className='w-4 h-4 text-red-500' />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className='flex justify-center items-center gap-3 mt-6'>
              <button
                disabled={pageNum === 1}
                onClick={() => handlePageChange(pageNum - 1)}
                className={`px-4 py-2 rounded-md border ${
                  pageNum === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'hover:bg-blue-50 text-blue-600 border-blue-200'
                }`}
              >
                Previous
              </button>
              <span className='text-gray-700 font-medium'>
                Page {pageNum} / {pageCount}
              </span>
              <button
                disabled={pageNum === pageCount}
                onClick={() => handlePageChange(pageNum + 1)}
                className={`px-4 py-2 rounded-md border ${
                  pageNum === pageCount
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'hover:bg-blue-50 text-blue-600 border-blue-200'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
            <div className='bg-white rounded-xl shadow-lg p-6 w-96'>
              <div className='flex items-center gap-3 mb-4'>
                <AlertTriangle className='w-6 h-6 text-red-500' />
                <h2 className='text-lg font-semibold text-gray-800'>
                  Confirm Deletion
                </h2>
              </div>
              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete this project? This action cannot
                be undone.
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setDeleteId(null)}
                  className='px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition'
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
