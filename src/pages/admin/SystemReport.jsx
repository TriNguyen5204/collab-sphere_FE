import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Mail,
  AlertTriangle,
  Activity,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Server,
  Cpu,
  HardDrive,
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
export default function ImprovedSystemReports() {
  const [timeRange, setTimeRange] = useState('7days');
  //   const [selectedReport, setSelectedReport] = useState('overview');

  const [emailReports] = useState([
    {
      id: 1,
      subject: 'Welcome Email',
      recipient: 'user1@example.com',
      status: 'Sent',
      date: '2025-09-25',
      time: '10:30',
    },
    {
      id: 2,
      subject: 'Password Reset',
      recipient: 'user2@example.com',
      status: 'Failed',
      date: '2025-09-26',
      time: '14:15',
    },
    {
      id: 3,
      subject: 'Account Verification',
      recipient: 'user3@example.com',
      status: 'Sent',
      date: '2025-09-27',
      time: '09:45',
    },
    {
      id: 4,
      subject: 'Newsletter',
      recipient: 'user4@example.com',
      status: 'Pending',
      date: '2025-09-28',
      time: '16:20',
    },
  ]);

  const [errorLogs] = useState([
    {
      id: 1,
      message: 'Database connection timeout',
      level: 'Error',
      timestamp: '2025-09-28 14:23',
      source: 'Database',
    },
    {
      id: 2,
      message: 'API response delayed',
      level: 'Warning',
      timestamp: '2025-09-28 15:10',
      source: 'API Gateway',
    },
    {
      id: 3,
      message: 'Memory usage high',
      level: 'Warning',
      timestamp: '2025-09-28 15:45',
      source: 'System',
    },
    {
      id: 4,
      message: 'Failed login attempt',
      level: 'Info',
      timestamp: '2025-09-28 16:30',
      source: 'Auth Service',
    },
  ]);

  const usageData = [
    { name: 'Mon', users: 120, requests: 1500 },
    { name: 'Tue', users: 180, requests: 2200 },
    { name: 'Wed', users: 90, requests: 1100 },
    { name: 'Thu', users: 200, requests: 2600 },
    { name: 'Fri', users: 150, requests: 1900 },
    { name: 'Sat', users: 80, requests: 950 },
    { name: 'Sun', users: 70, requests: 850 },
  ];

  const performanceData = [
    { time: '10:00', cpu: 40, memory: 60, disk: 45 },
    { time: '11:00', cpu: 55, memory: 70, disk: 48 },
    { time: '12:00', cpu: 65, memory: 75, disk: 50 },
    { time: '13:00', cpu: 50, memory: 65, disk: 52 },
    { time: '14:00', cpu: 70, memory: 80, disk: 55 },
    { time: '15:00', cpu: 45, memory: 68, disk: 53 },
  ];

  const statsCards = [
    {
      title: 'Total Emails Sent',
      value: '1,247',
      change: '+12.5%',
      icon: Mail,
      color: 'blue',
      trend: 'up',
    },
    {
      title: 'Active Users',
      value: '890',
      change: '+8.2%',
      icon: Activity,
      color: 'green',
      trend: 'up',
    },
    {
      title: 'System Errors',
      value: '23',
      change: '-15.3%',
      icon: AlertTriangle,
      color: 'red',
      trend: 'down',
    },
    {
      title: 'Avg Response Time',
      value: '142ms',
      change: '-5.1%',
      icon: TrendingUp,
      color: 'purple',
      trend: 'down',
    },
  ];

  return (
    <>
      <div className='min-h-screen flex'>
        <AdminSidebar />
        <div className='flex flex-col flex-1'>
          <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            <div className='max-w-7xl mx-auto space-y-6'>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-3'>
                    <Activity className='w-8 h-8 text-blue-600' />
                    System Reports
                  </h1>
                  <p className='text-gray-500 mt-1'>
                    Monitor system performance and activity logs
                  </p>
                </div>
                <div className='flex gap-3'>
                  <select
                    value={timeRange}
                    onChange={e => setTimeRange(e.target.value)}
                    className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                  >
                    <option value='24hours'>Last 24 Hours</option>
                    <option value='7days'>Last 7 Days</option>
                    <option value='30days'>Last 30 Days</option>
                    <option value='90days'>Last 90 Days</option>
                  </select>
                  <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md'>
                    <Download className='w-4 h-4' />
                    Export Report
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {statsCards.map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    blue: 'bg-blue-500',
                    green: 'bg-green-500',
                    red: 'bg-red-500',
                    purple: 'bg-purple-500',
                  };
                  return (
                    <div
                      key={index}
                      className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <div
                          className={`p-3 rounded-lg ${colorClasses[stat.color]}`}
                        >
                          <Icon className='w-6 h-6 text-white' />
                        </div>
                        <div
                          className={`flex items-center text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          <TrendingUp
                            className={`w-4 h-4 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`}
                          />
                          {stat.change}
                        </div>
                      </div>
                      <h3 className='text-gray-600 text-sm font-medium mb-1'>
                        {stat.title}
                      </h3>
                      <p className='text-2xl font-bold text-gray-800'>
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* System Usage Analytics */}
              <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                    <BarChart className='w-6 h-6 text-blue-600' />
                    System Usage Analytics
                  </h2>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-blue-500 rounded'></div>
                      <span>Users</span>
                    </div>
                    <div className='flex items-center gap-1 ml-4'>
                      <div className='w-3 h-3 bg-purple-500 rounded'></div>
                      <span>Requests</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='name' stroke='#6b7280' />
                    <YAxis stroke='#6b7280' />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey='users' fill='#3b82f6' radius={[8, 8, 0, 0]} />
                    <Bar
                      dataKey='requests'
                      fill='#8b5cf6'
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                    <Server className='w-6 h-6 text-green-600' />
                    Performance Metrics
                  </h2>
                  <div className='flex items-center gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Cpu className='w-4 h-4 text-red-500' />
                      <span className='text-gray-600'>CPU</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Activity className='w-4 h-4 text-green-500' />
                      <span className='text-gray-600'>Memory</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <HardDrive className='w-4 h-4 text-blue-500' />
                      <span className='text-gray-600'>Disk</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='time' stroke='#6b7280' />
                    <YAxis stroke='#6b7280' />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='cpu'
                      stroke='#ef4444'
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='memory'
                      stroke='#10b981'
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='disk'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Email Reports */}
                <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                  <div className='p-6 bg-gradient-to-r from-blue-50 to-white border-b'>
                    <div className='flex items-center justify-between mb-4'>
                      <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                        <Mail className='w-6 h-6 text-blue-600' />
                        Email Reports
                      </h2>
                      <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                        View All
                      </button>
                    </div>
                    <div className='flex gap-3'>
                      <div className='flex-1 relative'>
                        <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                          type='text'
                          placeholder='Search emails...'
                          className='w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                            Subject
                          </th>
                          <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                            Status
                          </th>
                          <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {emailReports.map(r => (
                          <tr
                            key={r.id}
                            className='hover:bg-gray-50 transition-colors'
                          >
                            <td className='px-4 py-3'>
                              <p className='text-sm font-medium text-gray-800'>
                                {r.subject}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {r.recipient}
                              </p>
                            </td>
                            <td className='px-4 py-3'>
                              {r.status === 'Sent' ? (
                                <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'>
                                  <CheckCircle className='w-3 h-3' />
                                  Sent
                                </span>
                              ) : r.status === 'Failed' ? (
                                <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800'>
                                  <XCircle className='w-3 h-3' />
                                  Failed
                                </span>
                              ) : (
                                <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800'>
                                  <Clock className='w-3 h-3' />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className='px-4 py-3'>
                              <div className='flex items-center gap-1 text-xs text-gray-600'>
                                <Calendar className='w-3 h-3 text-gray-400' />
                                {r.date}
                              </div>
                              <div className='flex items-center gap-1 text-xs text-gray-500'>
                                <Clock className='w-3 h-3 text-gray-400' />
                                {r.time}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Error Logs */}
                <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                  <div className='p-6 bg-gradient-to-r from-red-50 to-white border-b'>
                    <div className='flex items-center justify-between mb-4'>
                      <h2 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                        <AlertTriangle className='w-6 h-6 text-red-600' />
                        Error Logs
                      </h2>
                      <button className='text-red-600 hover:text-red-700 text-sm font-medium'>
                        View All
                      </button>
                    </div>
                    <div className='flex gap-2'>
                      <button className='px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'>
                        Errors
                      </button>
                      <button className='px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'>
                        Warnings
                      </button>
                      <button className='px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                        Info
                      </button>
                    </div>
                  </div>
                  <div className='divide-y divide-gray-200 max-h-96 overflow-y-auto'>
                    {errorLogs.map(log => (
                      <div
                        key={log.id}
                        className='p-4 hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-start gap-3'>
                          <div
                            className={`p-2 rounded-lg mt-0.5 ${
                              log.level === 'Error'
                                ? 'bg-red-100'
                                : log.level === 'Warning'
                                  ? 'bg-yellow-100'
                                  : 'bg-blue-100'
                            }`}
                          >
                            {log.level === 'Error' ? (
                              <XCircle className='w-4 h-4 text-red-600' />
                            ) : log.level === 'Warning' ? (
                              <AlertTriangle className='w-4 h-4 text-yellow-600' />
                            ) : (
                              <AlertCircle className='w-4 h-4 text-blue-600' />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-800'>
                              {log.message}
                            </p>
                            <div className='flex items-center gap-3 mt-1'>
                              <span className='text-xs text-gray-500'>
                                {log.source}
                              </span>
                              <span className='text-xs text-gray-400'>•</span>
                              <span className='text-xs text-gray-500'>
                                {log.timestamp}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              log.level === 'Error'
                                ? 'bg-red-100 text-red-800'
                                : log.level === 'Warning'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
