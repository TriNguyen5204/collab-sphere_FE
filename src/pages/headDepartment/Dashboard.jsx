import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  TrendingUp,
  AlertCircle,
  Users,
  FolderOpen,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  X,
  CheckCheck,
} from 'lucide-react';
import HeadDepartmentSidebar from '../../components/layout/HeadDepartmentSidebar';

export default function DepartmentOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [pendingProjects, setPendingProjects] = useState([
    {
      id: 1,
      name: 'Project Alpha',
      deadline: '2025-10-05',
      status: 'In Review',
      priority: 'High',
      progress: 75,
    },
    {
      id: 2,
      name: 'Project Beta',
      deadline: '2025-10-12',
      status: 'Pending Approval',
      priority: 'Medium',
      progress: 45,
    },
    {
      id: 3,
      name: 'Project Gamma',
      deadline: '2025-10-20',
      status: 'In Progress',
      priority: 'Low',
      progress: 30,
    },
  ]);

  const [approvalQueue, setApprovalQueue] = useState([
    {
      id: 101,
      request: 'Budget Increase',
      requester: 'Lecturer A',
      date: '2025-09-28',
      type: 'Budget',
      amount: '$5,000',
    },
    {
      id: 102,
      request: 'New Course Proposal',
      requester: 'Staff B',
      date: '2025-09-30',
      type: 'Course',
      amount: '-',
    },
    {
      id: 103,
      request: 'Equipment Purchase',
      requester: 'Lecturer C',
      date: '2025-10-01',
      type: 'Equipment',
      amount: '$12,000',
    },
  ]);

  const [statistics, setStatistics] = useState({
    totalProjects: 12,
    pendingApprovals: 5,
    completed: 20,
    activeStaff: 15,
  });

  const handleApprove = id => {
    setApprovalQueue(approvalQueue.filter(item => item.id !== id));
  };

  const handleReject = id => {
    setApprovalQueue(approvalQueue.filter(item => item.id !== id));
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = type => {
    switch (type) {
      case 'Budget':
        return 'bg-blue-100 text-blue-700';
      case 'Course':
        return 'bg-purple-100 text-purple-700';
      case 'Equipment':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className='min-h-screen flex'>
        <HeadDepartmentSidebar />
        <div className='flex flex-col flex-1'>
          <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <BarChart3 className='w-8 h-8 text-blue-600' />
                    Departmental Overview
                  </h1>
                  <p className='text-gray-500 mt-1'>
                    Monitor projects, approvals, and department statistics
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm'>
                    <Download className='w-4 h-4' />
                    Export Report
                  </button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-600'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-lg bg-blue-100'>
                      <FolderOpen className='w-6 h-6 text-blue-600' />
                    </div>
                    <div className='flex items-center text-sm font-semibold text-green-600'>
                      <TrendingUp className='w-4 h-4 mr-1' />
                      +8%
                    </div>
                  </div>
                  <h3 className='text-gray-600 text-sm font-medium mb-1'>
                    Total Projects
                  </h3>
                  <p className='text-3xl font-bold text-gray-800'>
                    {statistics.totalProjects}
                  </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-600'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-lg bg-yellow-100'>
                      <Clock className='w-6 h-6 text-yellow-600' />
                    </div>
                    <div className='flex items-center text-sm font-semibold text-red-600'>
                      <TrendingUp className='w-4 h-4 mr-1' />
                      +3
                    </div>
                  </div>
                  <h3 className='text-gray-600 text-sm font-medium mb-1'>
                    Pending Approvals
                  </h3>
                  <p className='text-3xl font-bold text-gray-800'>
                    {statistics.pendingApprovals}
                  </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-600'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-lg bg-green-100'>
                      <CheckCircle className='w-6 h-6 text-green-600' />
                    </div>
                    <div className='flex items-center text-sm font-semibold text-green-600'>
                      <TrendingUp className='w-4 h-4 mr-1' />
                      +5
                    </div>
                  </div>
                  <h3 className='text-gray-600 text-sm font-medium mb-1'>
                    Completed
                  </h3>
                  <p className='text-3xl font-bold text-gray-800'>
                    {statistics.completed}
                  </p>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-600'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-lg bg-purple-100'>
                      <Users className='w-6 h-6 text-purple-600' />
                    </div>
                    <div className='flex items-center text-sm font-semibold text-green-600'>
                      <TrendingUp className='w-4 h-4 mr-1' />
                      +2
                    </div>
                  </div>
                  <h3 className='text-gray-600 text-sm font-medium mb-1'>
                    Active Staff
                  </h3>
                  <p className='text-3xl font-bold text-gray-800'>
                    {statistics.activeStaff}
                  </p>
                </div>
              </div>

              {/* Pending Projects */}
              <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                <div className='p-6 bg-gradient-to-r from-blue-50 to-white border-b'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                      <Clock className='w-6 h-6 text-blue-600' />
                      Pending Projects
                      <span className='ml-2 text-sm font-normal text-gray-500'>
                        ({pendingProjects.length} projects)
                      </span>
                    </h2>
                    <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                      View All Projects
                    </button>
                  </div>
                  <div className='flex gap-3'>
                    <div className='flex-1 relative'>
                      <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search projects...'
                        className='w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <select
                      className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                    >
                      <option value='all'>All Status</option>
                      <option value='review'>In Review</option>
                      <option value='pending'>Pending Approval</option>
                      <option value='progress'>In Progress</option>
                    </select>
                  </div>
                </div>
                <div className='divide-y divide-gray-200'>
                  {pendingProjects.map(proj => (
                    <div
                      key={proj.id}
                      className='p-6 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-2'>
                            <h3 className='font-semibold text-gray-800 text-lg'>
                              {proj.name}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(proj.priority)}`}
                            >
                              {proj.priority} Priority
                            </span>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-gray-600'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-4 h-4 text-gray-400' />
                              <span>Deadline: {proj.deadline}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <AlertCircle className='w-4 h-4 text-gray-400' />
                              <span>{proj.status}</span>
                            </div>
                          </div>
                        </div>
                        <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors'>
                          <Eye className='w-4 h-4' />
                          View Details
                        </button>
                      </div>
                      <div className='mt-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-sm text-gray-600'>
                            Progress
                          </span>
                          <span className='text-sm font-semibold text-gray-800'>
                            {proj.progress}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full transition-all'
                            style={{ width: `${proj.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Queue */}
              <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                <div className='p-6 bg-gradient-to-r from-green-50 to-white border-b'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                      <FileText className='w-6 h-6 text-green-600' />
                      Approval Queue
                      <span className='ml-2 text-sm font-normal text-gray-500'>
                        ({approvalQueue.length} pending)
                      </span>
                    </h2>
                    <div className='flex gap-2'>
                      <button className='px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                        All Requests
                      </button>
                      <button className='px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full'>
                        Budget
                      </button>
                      <button className='px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full'>
                        Course
                      </button>
                    </div>
                  </div>
                </div>
                <div className='divide-y divide-gray-200'>
                  {approvalQueue.map(item => (
                    <div
                      key={item.id}
                      className='p-6 hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-4 flex-1'>
                          <div className='p-3 bg-green-100 rounded-lg'>
                            <FileText className='w-5 h-5 text-green-600' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <h3 className='font-semibold text-gray-800 text-lg'>
                                {item.request}
                              </h3>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}
                              >
                                {item.type}
                              </span>
                            </div>
                            <div className='flex items-center gap-4 text-sm text-gray-600'>
                              <div className='flex items-center gap-1'>
                                <Users className='w-4 h-4 text-gray-400' />
                                <span>By {item.requester}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Calendar className='w-4 h-4 text-gray-400' />
                                <span>{item.date}</span>
                              </div>
                              {item.amount !== '-' && (
                                <div className='flex items-center gap-1'>
                                  <span className='font-semibold text-blue-600'>
                                    {item.amount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-2 ml-4'>
                          <button
                            className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm'
                            onClick={() => handleApprove(item.id)}
                          >
                            <CheckCheck className='w-4 h-4' />
                            Approve
                          </button>
                          <button
                            className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm'
                            onClick={() => handleReject(item.id)}
                          >
                            <X className='w-4 h-4' />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {approvalQueue.length === 0 && (
                  <div className='text-center py-12'>
                    <CheckCircle className='w-16 h-16 text-green-300 mx-auto mb-4' />
                    <h3 className='text-lg font-semibold text-gray-600 mb-2'>
                      All caught up!
                    </h3>
                    <p className='text-gray-500'>
                      No pending approvals at the moment
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
