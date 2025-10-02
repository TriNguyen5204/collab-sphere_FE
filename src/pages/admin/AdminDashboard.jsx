import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Server,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  UserMinus,
  BarChart3,
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7days');

  // Mock data for system metrics
  const systemMetrics = {
    totalUsers: 12458,
    activeUsers: 8942,
    newUsersToday: 234,
    serverUptime: '99.98%',
    avgResponseTime: '142ms',
    totalRequests: '1.2M',
    errorRate: '0.02%',
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 52,
  };

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      action: 'Đăng nhập',
      time: '2 phút trước',
      status: 'success',
    },
    {
      id: 2,
      user: 'Trần Thị B',
      action: 'Tạo tài khoản mới',
      time: '5 phút trước',
      status: 'success',
    },
    {
      id: 3,
      user: 'Lê Văn C',
      action: 'Cập nhật profile',
      time: '12 phút trước',
      status: 'success',
    },
    {
      id: 4,
      user: 'Phạm Thị D',
      action: 'Đăng xuất',
      time: '18 phút trước',
      status: 'info',
    },
    {
      id: 5,
      user: 'Hoàng Văn E',
      action: 'Đăng nhập thất bại',
      time: '25 phút trước',
      status: 'error',
    },
  ];

  // Mock data for user statistics
  const userStats = [
    { month: 'T1', users: 8200 },
    { month: 'T2', users: 8900 },
    { month: 'T3', users: 9500 },
    { month: 'T4', users: 10200 },
    { month: 'T5', users: 11100 },
    { month: 'T6', users: 12458 },
  ];

  const StatCard = ({ title, value, change, icon: Icon, trend, color }) => (
    <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
      <div className='flex items-center justify-between mb-4'>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className='w-6 h-6 text-white' />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend === 'up' ? (
              <TrendingUp className='w-4 h-4 mr-1' />
            ) : (
              <TrendingDown className='w-4 h-4 mr-1' />
            )}
            {change}
          </div>
        )}
      </div>
      <h3 className='text-gray-600 text-sm font-medium mb-1'>{title}</h3>
      <p className='text-2xl font-bold text-gray-800'>{value}</p>
    </div>
  );

  const SystemHealthCard = ({ title, value, max, color }) => {
    const percentage = (value / max) * 100;
    return (
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-gray-700 font-semibold'>{title}</h3>
          <span className='text-2xl font-bold text-gray-800'>{value}%</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3'>
          <div
            className={`h-3 rounded-full transition-all ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className='min-h-screen flex'>
        <AdminSidebar />
        <div className='flex flex-col flex-1'>
          <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            {/* Header */}
            <header className='bg-white shadow-sm border-b'>
              <div className='max-w-7xl mx-auto px-6 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <LayoutDashboard className='w-8 h-8 text-blue-600' />
                    <div>
                      <h1 className='text-2xl font-bold text-gray-800'>
                        Admin Dashboard
                      </h1>
                      <p className='text-sm text-gray-500'>
                        Tổng quan hệ thống và quản lý người dùng
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <select
                      value={timeRange}
                      onChange={e => setTimeRange(e.target.value)}
                      className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='24hours'>24 giờ qua</option>
                      <option value='7days'>7 ngày qua</option>
                      <option value='30days'>30 ngày qua</option>
                      <option value='90days'>90 ngày qua</option>
                    </select>
                  </div>
                </div>
              </div>
            </header>

            <main className='max-w-7xl mx-auto px-6 py-8'>
              {/* Main Statistics */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <StatCard
                  title='Tổng số người dùng'
                  value={systemMetrics.totalUsers.toLocaleString()}
                  change='+12.5%'
                  icon={Users}
                  trend='up'
                  color='bg-blue-500'
                />
                <StatCard
                  title='Người dùng hoạt động'
                  value={systemMetrics.activeUsers.toLocaleString()}
                  change='+8.2%'
                  icon={Activity}
                  trend='up'
                  color='bg-green-500'
                />
                <StatCard
                  title='Người dùng mới hôm nay'
                  value={systemMetrics.newUsersToday.toLocaleString()}
                  change='+5.3%'
                  icon={UserPlus}
                  trend='up'
                  color='bg-purple-500'
                />
                <StatCard
                  title='Tổng số yêu cầu'
                  value={systemMetrics.totalRequests}
                  change='+18.7%'
                  icon={BarChart3}
                  trend='up'
                  color='bg-orange-500'
                />
              </div>

              {/* System Health */}
              <div className='mb-8'>
                <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center'>
                  <Server className='w-6 h-6 mr-2 text-blue-600' />
                  Tình trạng hệ thống
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <SystemHealthCard
                    title='CPU Usage'
                    value={systemMetrics.cpuUsage}
                    max={100}
                    color='bg-blue-500'
                  />
                  <SystemHealthCard
                    title='Memory Usage'
                    value={systemMetrics.memoryUsage}
                    max={100}
                    color='bg-green-500'
                  />
                  <SystemHealthCard
                    title='Disk Usage'
                    value={systemMetrics.diskUsage}
                    max={100}
                    color='bg-purple-500'
                  />
                </div>
              </div>

              {/* System Metrics & Recent Activities */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                {/* System Performance Metrics */}
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center'>
                    <Activity className='w-6 h-6 mr-2 text-green-600' />
                    Hiệu suất hệ thống
                  </h2>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 bg-green-50 rounded-lg'>
                      <div className='flex items-center'>
                        <CheckCircle className='w-5 h-5 text-green-600 mr-3' />
                        <span className='text-gray-700 font-medium'>
                          Server Uptime
                        </span>
                      </div>
                      <span className='text-xl font-bold text-green-600'>
                        {systemMetrics.serverUptime}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg'>
                      <div className='flex items-center'>
                        <Clock className='w-5 h-5 text-blue-600 mr-3' />
                        <span className='text-gray-700 font-medium'>
                          Avg Response Time
                        </span>
                      </div>
                      <span className='text-xl font-bold text-blue-600'>
                        {systemMetrics.avgResponseTime}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-4 bg-red-50 rounded-lg'>
                      <div className='flex items-center'>
                        <AlertCircle className='w-5 h-5 text-red-600 mr-3' />
                        <span className='text-gray-700 font-medium'>
                          Error Rate
                        </span>
                      </div>
                      <span className='text-xl font-bold text-red-600'>
                        {systemMetrics.errorRate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className='bg-white rounded-lg shadow-md p-6'>
                  <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center'>
                    <Clock className='w-6 h-6 mr-2 text-purple-600' />
                    Hoạt động gần đây
                  </h2>
                  <div className='space-y-3'>
                    {recentActivities.map(activity => (
                      <div
                        key={activity.id}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.status === 'success'
                                ? 'bg-green-500'
                                : activity.status === 'error'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                            }`}
                          ></div>
                          <div>
                            <p className='text-sm font-semibold text-gray-800'>
                              {activity.user}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {activity.action}
                            </p>
                          </div>
                        </div>
                        <span className='text-xs text-gray-400'>
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center'>
                  <TrendingUp className='w-6 h-6 mr-2 text-blue-600' />
                  Tăng trưởng người dùng
                </h2>
                <div className='flex items-end justify-between h-64 space-x-4'>
                  {userStats.map((stat, index) => {
                    const height =
                      (stat.users / Math.max(...userStats.map(s => s.users))) *
                      100;
                    return (
                      <div
                        key={index}
                        className='flex-1 flex flex-col items-center'
                      >
                        <div
                          className='w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer relative group'
                          style={{ height: `${height}%` }}
                        >
                          <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                            {stat.users.toLocaleString()} users
                          </div>
                        </div>
                        <span className='text-sm text-gray-600 mt-2 font-medium'>
                          {stat.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
