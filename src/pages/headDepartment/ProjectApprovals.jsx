import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectApprovalList from '../../components/ui/ProjectApprovalList';
import {
  getPendingProjects,
  handleProject
} from '../../services/userService';
import { toast } from 'sonner';
import Sidebar from '../../components/layout/HeadDepartmentSidebar';

export default function ProjectApprovals() {
  const [projects, setProjects] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [searchText, setSearchText] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 5;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch pending projects from API
    const fetchPendingProjects = async () => {
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
        console.error('Failed to fetch pending projects:', error);
      }
    };
    fetchPendingProjects();
  }, [pageNum, pageSize, searchText]);
  useEffect(() => {
    // Calculate pending projects count
    setPendingCount(projects.filter(p => p.status === 'pending').length);
  }, [projects]);

  const handleApproveProject = async projectId => {
    const response = await handleProject(projectId, true);
    if (response) {
      toast.success(response);
    } else {
      toast.error(`Failed to approve project: ${response}`);
    }
  };
  const handleRejectProject = async projectId => {
    const response = await handleProject(projectId, false);
    if (response) {
      toast.success(response);
    } else {
      toast.error(`Failed to reject project: ${response}`);
    }
  };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className='flex min-h-screen'>
        <Sidebar />
        <div className='flex flex-col flex-1'>
          <main className='bg-gray-50 min-h-screen'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
              <div className='bg-white shadow rounded-lg overflow-hidden'>
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div>
                      <div className='flex items-center gap-3'>
                        <Link
                          to='/academic'
                          className='text-gray-400 hover:text-gray-500'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-6 w-6'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M10 19l-7-7m0 0l7-7m-7 7h18'
                            />
                          </svg>
                        </Link>
                        <h1 className='text-2xl font-bold text-gray-900'>
                          Project Approvals
                        </h1>
                      </div>
                      <p className='mt-1 text-sm text-gray-500'>
                        Review and approve project proposals from lecturers
                      </p>
                    </div>
                    {pendingCount > 0 && (
                      <div className='inline-flex items-center px-2.5 py-0.5 rounded-md bg-red-100 text-red-800'>
                        <svg
                          className='mr-1.5 h-2 w-2 text-red-500'
                          fill='currentColor'
                          viewBox='0 0 8 8'
                        >
                          <circle cx='4' cy='4' r='3' />
                        </svg>
                        <span className='font-medium'>
                          {pendingCount} pending approvals
                        </span>
                      </div>
                    )}
                  </div>
                  <div className='mt-6'>
                    <input
                      type='text'
                      placeholder='Search by description...'
                      value={searchText}
                      onChange={e => {
                        setPageNum(1);
                        setSearchText(e.target.value);
                      }}
                      className='w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    />
                  </div>
                </div>

                <div className='p-6'>
                  {loading ? (
                    <div className='text-center text-gray-500 py-10'>
                      Loading...
                    </div>
                  ) : projects.length === 0 ? (
                    <div className='text-center text-gray-400 py-10'>
                      No pending projects found.
                    </div>
                  ) : (
                    <>
                      <ProjectApprovalList
                        projects={projects}
                        onApprove={id => handleApproveProject(id)}
                        onReject={id => handleRejectProject(id)}
                      />

                      {/* 📄 Pagination */}
                      <div className='flex justify-between items-center mt-6'>
                        <p className='text-sm text-gray-500'>
                          Page {pageNum} of {totalPages}
                        </p>
                        <div className='flex gap-2'>
                          <button
                            disabled={pageNum === 1}
                            onClick={() => setPageNum(p => Math.max(p - 1, 1))}
                            className={`px-4 py-2 rounded-md border ${
                              pageNum === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            Prev
                          </button>
                          <button
                            disabled={
                              pageNum === totalPages || totalPages === 0
                            }
                            onClick={() =>
                              setPageNum(p => (p < totalPages ? p + 1 : p))
                            }
                            className={`px-4 py-2 rounded-md border ${
                              pageNum === totalPages || totalPages === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
