import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectApprovalList from '../../components/staff/ProjectApprovalList';
import { getPendingProjects } from '../../services/userService';
import Sidebar from '../../components/layout/HeadDepartmentSidebar';
import { toast } from 'sonner';

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
          searchText, pageNum, pageSize, false
        );
        setProjects(data.list);
        setTotal(data.itemCount);
      } catch (error) {
        toast.error('Failed to fetch pending projects', error);
        // bạn có thể show toast nếu muốn
      }
      setLoading(false);
    };
    fetchPendingProjects();
  }, [pageNum, pageSize, searchText]);
  useEffect(() => {
    setPendingCount(projects.filter(p => p.status === 'pending').length);
  }, [projects]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className='flex min-h-screen w-full bg-gray-50'>
      <Sidebar />
      <div className='flex-1 flex flex-col min-w-0'>
        <main className='flex-1 bg-gray-50'>
          <div className='max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-6'>
            {/* Banner */}
            <div className="flex items-start justify-between mb-6 flex-col md:flex-row">
              <div className="flex items-center gap-3">
                <Link
                  to='/academic'
                  className='text-gray-400 hover:text-gray-500'
                  aria-label="Back"
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7'
                    viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M10 19l-7-7m0 0l7-7m-7 7h18'
                    />
                  </svg>
                </Link>
                <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight'>
                  Project Approvals
                </h1>
              </div>
              <div>
                {pendingCount > 0 &&
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-semibold text-base gap-2 shadow">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    {pendingCount} Pending
                  </span>
                }
              </div>
            </div>

            {/* Search and filter */}
            <div className="flex items-center gap-2 my-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search project by description..."
                  className="peer w-full px-4 pl-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-base"
                  value={searchText}
                  onChange={e => {
                    setPageNum(1);
                    setSearchText(e.target.value);
                  }}
                />
                <span className="absolute left-2 top-2.5 text-gray-400 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}
                    viewBox="0 0 24 24">
                    <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0013.15 6.15z"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <button
                className="ml-2 py-2 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
                onClick={() => setSearchText('')}
                disabled={!searchText}
              >
                Clear
              </button>
            </div>

            {/* Project List */}
            <div className="bg-white rounded-lg shadow border border-gray-100 mt-3">
              {loading ? (
                <div className='text-center text-gray-400 py-16 animate-pulse'>
                  <div className="h-6 w-40 bg-gray-200 mx-auto rounded mb-4" />
                  <div className="h-4 w-2/3 bg-gray-100 mx-auto rounded" />
                  <div className="h-4 w-1/2 bg-gray-100 mx-auto rounded" />
                </div>
              ) : projects.length === 0 ? (
                <div className='text-center text-gray-400 py-14'>
                  <span className="text-3xl">📂</span>
                  <div>No pending projects found.</div>
                </div>
              ) : (
                <>
                  <ProjectApprovalList projects={projects} />
                  <div className='flex flex-col md:flex-row justify-between items-center mt-8 px-4'>
                    <span className='text-gray-500'>
                      Showing {(pageNum - 1) * pageSize + 1}-
                      {Math.min(pageNum * pageSize, total)} of {total} results
                    </span>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        disabled={pageNum === 1}
                        onClick={() => setPageNum(p => Math.max(p - 1, 1))}
                        className={`px-4 py-2 rounded-lg border font-semibold ${
                          pageNum === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-200'
                        }`}
                      >Prev</button>
                      <span className="inline-block px-3 py-2 text-base font-semibold">{pageNum}</span>
                      <button
                        disabled={pageNum === totalPages || totalPages === 0}
                        onClick={() => setPageNum(p => (p < totalPages ? p + 1 : p))}
                        className={`px-4 py-2 rounded-lg border font-semibold ${
                          pageNum === totalPages || totalPages === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50 text-blue-600 border-blue-200'
                        }`}
                      >Next</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
