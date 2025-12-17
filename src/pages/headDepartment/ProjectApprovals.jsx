import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingProjects } from '../../services/userService';
import { toast } from 'sonner';
import {
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
  Target,
  Flag,
  ClipboardCheck,
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
      <div className=' bg-gradient-to-br from-slate-50 to-slate-100'>
        <div className='space-y-6'>
          
          {/* Header Section - Matching Staff/Admin style */}
          <div className="relative overflow-hidden rounded-3xl border border-orangeFpt-50 bg-gradient-to-tl from-orangeFpt-50 via-white/45 to-white shadow-md shadow-orangeFpt-100/60 backdrop-blur">
            <div className="relative z-10 px-6 py-8 lg:px-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
                    Head Department
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Project <span className="text-orangeFpt-500 font-bold">Approvals</span>
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Review and approve pending project proposals
                  </p>
                </div>
                
                {/* Stats Card */}
                <div className="w-full max-w-sm">
                  <div className="rounded-2xl border border-orangeFpt-500 bg-orangeFpt-50 ring-1 ring-orangeFpt-500 px-5 py-4 shadow-sm backdrop-blur transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <p className='text-[11px] uppercase tracking-wide font-semibold text-orangeFpt-700'>
                        Pending Reviews
                      </p>
                      <ClipboardCheck className='w-5 h-5 text-orangeFpt-600' />
                    </div>
                    <p className="text-3xl font-bold text-orangeFpt-600 mt-2">
                      {total}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Content Section */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mx-auto max-w-[95%]'>
            {/* Filter Header */}
            <div className='p-5 border-b border-slate-100'>
              <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
                <h2 className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                  Pending Projects
                  <span className='px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium'>
                    {projects.length} showing
                  </span>
                </h2>
                
                {/* Search Bar */}
                <div className='relative group'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orangeFpt-500 transition-colors' />
                  <input
                    type='text'
                    placeholder='Search projects...'
                    value={searchText}
                    onChange={e => {
                      setSearchText(e.target.value);
                      setPageNum(1);
                    }}
                    className='w-full sm:w-72 pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orangeFpt-500 focus:ring-2 focus:ring-orangeFpt-500/20 focus:bg-white transition-all'
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
              </div>
            </div>

            {/* Content Area */}
            <div className='p-5 min-h-[500px]'>
              {loading ? (
                <div className='flex h-64 items-center justify-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-orangeFpt-600'></div>
                    <p className='text-sm text-slate-500'>Loading projects...</p>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className='flex h-80 flex-col items-center justify-center text-center'>
                  <div className='flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-4 border border-dashed border-slate-200'>
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
                    return (
                      <div
                        key={project.projectId}
                        onClick={() => handleProjectClick(project)}
                        className='group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orangeFpt-300 hover:shadow-lg hover:shadow-orangeFpt-50 cursor-pointer'
                      >
                        {/* Card Header */}
                        <div className='mb-4 flex items-start justify-between'>
                          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-orangeFpt-50 text-orangeFpt-600 shadow-sm ring-1 ring-orangeFpt-100 transition-colors group-hover:bg-orangeFpt-500 group-hover:text-white'>
                            <BookOpen className='h-6 w-6' />
                          </div>
                          <span className='inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20'>
                            <Clock className='w-3 h-3 mr-1' />
                            PENDING
                          </span>
                        </div>

                        {/* Content */}
                        <div className='mb-4'>
                          <h3
                            className='text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-orangeFpt-600 transition-colors'
                            title={project.projectName}
                          >
                            {project.projectName}
                          </h3>
                          <p className='mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed h-[40px]'>
                            {project.description ||
                              'No description provided for this project.'}
                          </p>
                        </div>


                        {/* Meta Info */}
                        <div className='mt-auto space-y-3 border-t border-slate-100 pt-4'>
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

                        {/* Footer Action */}
                        <div className='mt-4 pt-3 flex justify-end'>
                          <span className='text-sm font-bold text-orangeFpt-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                            Review Details <ArrowRight className='w-4 h-4' />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className='p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
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
                          : 'bg-white border-slate-200 text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600 hover:shadow-md'
                      }`}
                    >
                      <ChevronLeft className='w-5 h-5' />
                    </button>

                    <div className='flex items-center gap-1 px-2'>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                ? 'bg-orangeFpt-500 text-white shadow-md shadow-orangeFpt-200'
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
                          : 'bg-white border-slate-200 text-slate-600 hover:border-orangeFpt-300 hover:text-orangeFpt-600 hover:shadow-md'
                      }`}
                    >
                      <ChevronRight className='w-5 h-5' />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HeadDashboardLayout>
  );
}
