import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingProjects } from '../../services/userService';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  BookOpen,
  User,
  Clock,
  ArrowRight,
  Filter,
  Target,
  Flag,
} from 'lucide-react';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

export default function ProjectApprovals() {
  const [projects, setProjects] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Pagination State
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 6; // Số lượng project mỗi trang
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch Data
  useEffect(() => {
    const fetchPendingProjects = async () => {
      setLoading(true);
      try {
        const data = await getPendingProjects({
          descriptors: searchText, // Tham số search
          viewAll: false, // isApproved
          pageNum: pageNum,
          pageSize: pageSize,
        });
        setProjects(data.list || []);
        setTotal(data.itemCount || 0);
      } catch (error) {
        toast.error('Failed to fetch pending projects');
        console.error(error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchPendingProjects();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, pageNum]);

  // Calculate Total Pages
  const totalPages = Math.ceil(total / pageSize);

  const handleProjectClick = project => {
    navigate(`/head-department/project-approvals/${project.projectId}`, {
      state: { project },
    });
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNum(newPage);
      // Scroll to top when page changes (optional)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <HeadDashboardLayout>
      <div className='w-full px-6 mx-auto space-y-6 pb-8'>
        {/* --- Header Section --- */}
        <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <button
                onClick={() => navigate(-1)}
                className='p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
              </button>
              <h1 className='text-2xl font-bold text-slate-800'>
                Project Approvals
              </h1>
            </div>
            <p className='text-slate-500'>
              Review and approve pending project proposals
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            {/* Search */}
            <div className='relative group'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F26F21] transition-colors' />
              <input
                type='text'
                placeholder='Search projects...'
                value={searchText}
                onChange={e => {
                  setSearchText(e.target.value);
                  setPageNum(1); // Reset về trang 1 khi search
                }}
                className='w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#F26F21] focus:ring-2 focus:ring-orange-100 transition-all shadow-sm'
              />
              {searchText && (
                <button
                  onClick={() => {
                    setSearchText('');
                    setPageNum(1);
                  }}
                  className='absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>

            <button className='flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm'>
              <Filter className='h-4 w-4' />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col'>
          <div className='flex-1 p-6'>
            {loading ? (
              <div className='flex h-64 items-center justify-center'>
                <div className='flex flex-col items-center gap-3'>
                  <Loader2 className='h-8 w-8 animate-spin text-[#F26F21]' />
                  <p className='text-sm text-slate-500'>Loading projects...</p>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className='flex h-96 flex-col items-center justify-center text-center'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-4'>
                  <FileText className='h-10 w-10 text-slate-300' />
                </div>
                <h3 className='text-lg font-bold text-slate-800'>
                  No pending projects
                </h3>
                <p className='text-slate-500 max-w-xs mx-auto mt-2'>
                  There are currently no projects waiting for approval.
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                {projects.map(project => {
                  // Calculate stats
                  const objectivesCount = project.objectives?.length || 0;
                  const milestonesCount =
                    project.objectives?.reduce(
                      (acc, obj) =>
                        acc + (obj.objectiveMilestones?.length || 0),
                      0
                    ) || 0;

                  return (
                    <div
                      key={project.projectId}
                      onClick={() => handleProjectClick(project)}
                      className='group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg cursor-pointer'
                    >
                      {/* --- 1. Card Header: Icon & Badge --- */}
                      <div className='mb-4 flex items-start justify-between'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21] shadow-sm ring-1 ring-orange-100 transition-colors group-hover:bg-[#F26F21] group-hover:text-white'>
                          <BookOpen className='h-6 w-6' />
                        </div>
                        <span className='inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20'>
                          <Clock className='w-3 h-3 mr-1' />
                          PENDING
                        </span>
                      </div>

                      {/* --- 2. Content: Title & Desc --- */}
                      <div className='mb-4'>
                        <h3
                          className='text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-[#F26F21] transition-colors'
                          title={project.projectName}
                        >
                          {project.projectName}
                        </h3>
                        <p className='mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed h-[40px]'>
                          {project.description ||
                            'No description provided for this project.'}
                        </p>
                      </div>

                      {/* --- 3. Stats: Obj & Mile (Small Badges) --- */}
                      <div className='flex flex-wrap gap-2 mb-5'>
                        <div className='inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-100'>
                          <Target className='h-3.5 w-3.5 text-indigo-500' />
                          {objectivesCount} Objectives
                        </div>
                        <div className='inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-100'>
                          <Flag className='h-3.5 w-3.5 text-emerald-500' />
                          {milestonesCount} Milestones
                        </div>
                      </div>

                      {/* --- 4. Meta Info: Subject & Lecturer (Styled Blocks) --- */}
                      <div className='mt-auto space-y-3 border-t border-slate-100 pt-4'>
                        {/* Subject Row */}
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100'>
                            <FileText className='h-4 w-4' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-[10px] font-bold uppercase text-slate-400'>
                              Subject
                            </p>
                            <p
                              className='truncate text-sm font-semibold text-slate-700'
                              title={project.subjectCode}
                            >
                              {project.subjectCode}
                            </p>
                          </div>
                        </div>

                        {/* Lecturer Row */}
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-100'>
                            <User className='h-4 w-4' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-[10px] font-bold uppercase text-slate-400'>
                              Proposer
                            </p>
                            <p
                              className='truncate text-sm font-semibold text-slate-700'
                              title={project.lecturerName}
                            >
                              {project.lecturerName}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* --- 5. Footer Action --- */}
                      <div className='mt-4 pt-3 flex justify-end'>
                        <span className='text-sm font-bold text-[#F26F21] flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                          Review Details <ArrowRight className='w-4 h-4' />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* --- Pagination Footer --- */}
          {totalPages > 0 && (
            <div className='p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <div className='text-sm text-slate-500'>
                Showing{' '}
                <span className='font-bold text-slate-800'>
                  {(pageNum - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className='font-bold text-slate-800'>
                  {Math.min(pageNum * pageSize, total)}
                </span>{' '}
                of <span className='font-bold text-slate-800'>{total}</span>{' '}
                projects
              </div>

              <div className='flex items-center gap-2'>
                <button
                  disabled={pageNum === 1}
                  onClick={() => handlePageChange(pageNum - 1)}
                  className={`p-2 rounded-xl border transition-all duration-200 ${
                    pageNum === 1
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#F26F21] hover:text-[#F26F21] hover:shadow-md'
                  }`}
                >
                  <ChevronLeft className='w-5 h-5' />
                </button>

                <div className='flex items-center gap-1 px-2'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic hiển thị số trang đơn giản (1, 2, 3...)
                    // Nếu muốn logic phức tạp hơn (1 ... 5 6 7 ... 10) thì cần code thêm
                    let p = i + 1;
                    if (totalPages > 5 && pageNum > 3) {
                      p = pageNum - 2 + i;
                    }
                    if (p > totalPages) return null;

                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          pageNum === p
                            ? 'bg-[#F26F21] text-white shadow-md shadow-orange-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={pageNum === totalPages}
                  onClick={() => handlePageChange(pageNum + 1)}
                  className={`p-2 rounded-xl border transition-all duration-200 ${
                    pageNum === totalPages
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#F26F21] hover:text-[#F26F21] hover:shadow-md'
                  }`}
                >
                  <ChevronRight className='w-5 h-5' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </HeadDashboardLayout>
  );
}
