import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectApprovalList from '../../features/staff/components/ProjectApprovalList';
import { getPendingProjects } from '../../services/userService';
import Sidebar from '../../components/layout/HeadDepartmentSidebar';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from 'lucide-react';
import HeadDashboardLayout from '../../components/layout/HeadDashboardLayout';

export default function ProjectApprovals() {
  const [projects, setProjects] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingProjects = async () => {
      setLoading(true);
      try {
        const data = await getPendingProjects(
          searchText,
          pageNum,
          pageSize,
          false
        );
        setProjects(data.list);
        setTotal(data.itemCount);
      } catch (error) {
        toast.error('Failed to fetch pending projects');
        console.error(error);
      }
      setLoading(false);
    };
    fetchPendingProjects();
  }, [pageNum, pageSize, searchText]);

  useEffect(() => {
    // Note: This logic assumes 'projects' contains all pending items,
    // but with pagination it only contains the current page.
    // Ideally, get pending count from API metadata.
    // Keeping logic as is for now based on original code.
    if (projects.length > 0) {
      setPendingCount(projects.filter(p => p.status === 'pending').length);
    }
  }, [projects]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <HeadDashboardLayout>
      <div className='flex h-screen bg-gray-50 overflow-hidden font-sans'>
        {/* Main Content Container - Independent Scroll */}
        <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
          <main className='flex-1 overflow-y-auto p-4 md:p-8 relative'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Header Section */}
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                  <Link
                    to='/head-department'
                    className='p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all duration-200'
                    aria-label='Back'
                  >
                    <ArrowLeft className='w-5 h-5' />
                  </Link>
                  <div>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-900 tracking-tight'>
                      Project Approvals
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>
                      Review and manage project proposals
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {total > 0 && (
                    <span className='inline-flex items-center px-4 py-2 rounded-xl bg-orange-50 text-orange-700 font-bold text-sm gap-2.5 border border-orange-100 shadow-sm'>
                      <span className='relative flex h-3 w-3'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75'></span>
                        <span className='relative inline-flex rounded-full h-3 w-3 bg-orange-500'></span>
                      </span>
                      {total} Pending Requests
                    </span>
                  )}
                </div>
              </div>

              {/* Search Filter - FPT Soft Minimalism */}
              <div className='bg-white p-2 rounded-2xl shadow-sm border border-gray-100 max-w-2xl'>
                <div className='relative flex items-center'>
                  <Search className='absolute left-4 w-5 h-5 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search project by description...'
                    className='w-full pl-12 pr-10 py-3 bg-transparent border-none rounded-xl focus:ring-0 text-gray-700 placeholder:text-gray-400 text-sm md:text-base'
                    value={searchText}
                    onChange={e => {
                      setPageNum(1);
                      setSearchText(e.target.value);
                    }}
                  />
                  {searchText && (
                    <button
                      onClick={() => setSearchText('')}
                      className='absolute right-3 p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              </div>

              {/* Project List Area */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col'>
                {loading ? (
                  <div className='flex-1 flex flex-col justify-center items-center text-gray-400 py-16 gap-3'>
                    <Loader2 className='w-10 h-10 animate-spin text-orange-500' />
                    <p className='text-sm font-medium text-gray-500'>
                      Loading pending projects...
                    </p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className='flex-1 flex flex-col justify-center items-center text-gray-400 py-16 gap-4'>
                    <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center'>
                      <FileText className='w-8 h-8 text-gray-300' />
                    </div>
                    <div className='text-center'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        No pending projects
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        There are no projects waiting for approval.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex-1'>
                      <ProjectApprovalList projects={projects} />
                    </div>

                    {/* Pagination Footer */}
                    <div className='flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-50 bg-gray-50/30 gap-4'>
                      <span className='text-sm text-gray-500 font-medium'>
                        Showing{' '}
                        <span className='text-gray-900 font-bold'>
                          {(pageNum - 1) * pageSize + 1}
                        </span>{' '}
                        to{' '}
                        <span className='text-gray-900 font-bold'>
                          {Math.min(pageNum * pageSize, total)}
                        </span>{' '}
                        of{' '}
                        <span className='text-gray-900 font-bold'>{total}</span>{' '}
                        results
                      </span>

                      <div className='flex items-center gap-2'>
                        <button
                          disabled={pageNum === 1}
                          onClick={() => setPageNum(p => Math.max(p - 1, 1))}
                          className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1 text-sm font-semibold ${
                            pageNum === 1
                              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-600 hover:shadow-sm'
                          }`}
                        >
                          <ChevronLeft className='w-4 h-4' />
                          <span className='hidden sm:inline'>Prev</span>
                        </button>

                        <div className='px-4 py-2.5 bg-white border border-orange-200 text-orange-600 font-bold rounded-xl text-sm shadow-sm'>
                          {pageNum}
                        </div>

                        <button
                          disabled={pageNum === totalPages || totalPages === 0}
                          onClick={() =>
                            setPageNum(p => (p < totalPages ? p + 1 : p))
                          }
                          className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1 text-sm font-semibold ${
                            pageNum === totalPages || totalPages === 0
                              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-600 hover:shadow-sm'
                          }`}
                        >
                          <span className='hidden sm:inline'>Next</span>
                          <ChevronRight className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </HeadDashboardLayout>
  );
}
