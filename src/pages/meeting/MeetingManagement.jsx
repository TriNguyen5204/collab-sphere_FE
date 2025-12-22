import React, { useEffect, useState } from 'react';
import { getMeeting } from '../../features/meeting/services/meetingApi';
import { toast } from 'sonner';
import {
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  User,
  RefreshCw,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LecturerBreadcrumbs from '../../features/lecturer/components/LecturerBreadcrumbs';
import RecordUrlCell from '../../features/meeting/components/RecordUrlCell';
import { useAvatar } from '../../hooks/useAvatar';
import { getMeetingTeamId } from '../../utils/meetingSessionHelper';

// Avatar Component using useAvatar hook (consistent with ClassDetailPage)
const Avatar = ({ src, name, className = '' }) => {
  const { initials, colorClass, setImageError, shouldShowImage } = useAvatar(
    name,
    src
  );

  if (shouldShowImage) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} object-cover bg-white`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} ${colorClass} flex items-center justify-center font-bold uppercase select-none shadow-sm border border-white`}
      style={{ fontSize: '0.75em' }}
    >
      {initials}
    </div>
  );
};

const MeetingManagement = () => {
  const navigate = useNavigate();
  const teamId = getMeetingTeamId();
  const teamIdNumber = parseInt(teamId);
  
  console.log('MeetingManagement - teamId from sessionStorage:', teamId);
  console.log('MeetingManagement - teamIdNumber for API:', teamIdNumber);

  const [meetings, setMeetings] = useState([]);
  const [filters, setFilters] = useState({
    teamId: teamIdNumber,
    title: '',
    scheduleTime: '',
    status: '',
    isDesc: true,
    pageNum: 1,
    pageSize: 10,
  });
  const [pagination, setPagination] = useState({ pageCount: 1, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // UTC conversion
  const convertToUTC = localDateStr => {
    if (!localDateStr) return '';
    const localDate = new Date(localDateStr);
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  };

  // Validate teamId
  useEffect(() => {
    if (!teamId) {
      toast.error('No team selected. Please select a team first.');
      navigate('/lecturer/meetings');
    }
  }, [teamId, navigate]);

  // Fetch meetings
  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const payload = {
        ...filters,
        scheduleTime: convertToUTC(filters.scheduleTime),
      };
      
      console.log('MeetingManagement - Calling API with payload:', payload);
      const res = await getMeeting(payload);

      if (res?.isSuccess && res.paginatedMeeting?.list) {
        setMeetings(res.paginatedMeeting.list);
        setPagination({
          pageCount: res.paginatedMeeting.pageCount,
          itemCount: res.paginatedMeeting.itemCount,
        });
      } else {
        setMeetings([]);
        toast.warning('No meetings found');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [filters.pageNum, filters.pageSize]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, pageNum: 1 }));
    fetchMeetings();
  };

  const handleReset = () => {
    setFilters({
      teamId: teamIdNumber,
      title: '',
      scheduleTime: '',
      status: '',
      isDesc: true,
      pageNum: 1,
      pageSize: 10,
    });
    fetchMeetings();
  };

  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      setFilters(prev => ({ ...prev, pageNum: newPage }));
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // ✅ Giữ nguyên giờ UTC + hiển thị giờ phút
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-slate-50/50'>
        {/* --- HERO SECTION --- */}
        <header className='relative rounded-3xl border border-white/60 bg-white p-8 shadow-xl shadow-slate-200/50 mb-6'>
          <div className='absolute inset-0 overflow-hidden rounded-3xl pointer-events-none'>
            <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orangeFpt-100/50 blur-3xl'></div>
          </div>

          <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-4'>
              <div>
                <LecturerBreadcrumbs
                  items={[
                    {
                      label: 'Lecturer Workspace',
                      href: '/lecturer/classes',
                    },
                    { label: 'Meeting History', href: null },
                  ]}
                />
                <h1 className='mt-2 text-3xl font-semibold text-slate-900'>
                  Meeting History
                </h1>
                <p className='mt-1 text-sm text-slate-600'>
                  View past meetings, schedules, and meeting details.
                </p>
              </div>

              {/* Stats */}
              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-orangeFpt-50 rounded-lg'>
                    <Video className='h-4 w-4 text-orangeFpt-600' />
                  </div>
                  <div>
                    <p className='font-semibold text-slate-900'>
                      {pagination.itemCount}
                    </p>
                    <p className='text-xs text-slate-500'>Total Meetings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-3'>
              <button
                onClick={fetchMeetings}
                disabled={loading}
                className='flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-orangeFpt-600 active:scale-95 disabled:opacity-50'
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* Filters Card */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden'>
          <div className='px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center justify-between w-full'
            >
              <div className='flex items-center gap-2'>
                <Filter className='w-5 h-5 text-gray-700' />
                <h3 className='text-lg font-semibold text-gray-900'>Filters</h3>
              </div>
              <span className='text-sm text-gray-500'>
                {showFilters ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>

          {showFilters && (
            <div className='p-6 bg-white'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Search Title
                  </label>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      name='title'
                      value={filters.title}
                      onChange={handleFilterChange}
                      placeholder='Search meetings...'
                      className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Schedule Time
                  </label>
                  <input
                    type='datetime-local'
                    name='scheduleTime'
                    value={filters.scheduleTime}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Sort Order
                  </label>
                  <select
                    name='isDesc'
                    value={filters.isDesc}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orangeFpt-500 focus:border-transparent transition-all'
                  >
                    <option value={true}>Newest First</option>
                    <option value={false}>Oldest First</option>
                  </select>
                </div>

                <div className='flex items-end'>
                  <div className='flex gap-3 w-full'>
                    <button
                      onClick={handleSearch}
                      className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white px-4 py-2.5 rounded-xl hover:from-orangeFpt-600 hover:to-orangeFpt-700 transition-all shadow-md hover:shadow-lg shadow-orangeFpt-500/20'
                    >
                      <Search className='w-4 h-4' />
                      Search
                    </button>
                    <button
                      onClick={handleReset}
                      className='px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all'
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meetings Table */}
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='text-center'>
                <div className='w-16 h-16 border-4 border-orangeFpt-200 border-t-orangeFpt-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Loading meetings...</p>
              </div>
            </div>
          ) : meetings.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='max-w-md mx-auto'>
                <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Calendar className='w-10 h-10 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No meetings found
                </h3>
                <p className='text-gray-600'>
                  Try adjusting your filters or create a new meeting
                </p>
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-slate-50 border-b border-slate-200'>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                      Meeting
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                      Host
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                      Recording
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {meetings.map(meeting => (
                    <tr
                      key={meeting.meetingId}
                      className='hover:bg-slate-50/50 transition-colors'
                    >
                      {/* Meeting Title */}
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-orangeFpt-50 rounded-lg shrink-0'>
                            <Video className='h-4 w-4 text-orangeFpt-600' />
                          </div>
                          <div className='min-w-0'>
                            <p
                              className='text-sm font-semibold text-slate-900 truncate max-w-[350px]'
                              title={meeting.title}
                            >
                              {meeting.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Host */}
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <Avatar
                            src={meeting.creatorAvatar}
                            name={meeting.creatorName}
                            className='h-9 w-9 rounded-full'
                          />
                          <div className='min-w-0'>
                            <p
                              className='text-sm font-medium text-slate-900 truncate max-w-[150px]'
                              title={meeting.creatorName}
                            >
                              {meeting.creatorName || 'Unknown'}
                            </p>
                            <span className='inline-flex items-center gap-1 text-xs text-orangeFpt-600 font-medium'>
                              <User className='h-3 w-3' />
                              Host
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-slate-400' />
                          <span className='text-sm text-slate-700'>
                            {formatDate(meeting.scheduleTime)}
                          </span>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <RecordUrlCell recordUrl={meeting.recordUrl} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <div className='px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50'>
              <p className='text-sm text-gray-600'>
                Showing page{' '}
                <span className='font-semibold'>{filters.pageNum}</span> of{' '}
                <span className='font-semibold'>{pagination.pageCount}</span> (
                {pagination.itemCount} meetings)
              </p>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handlePageChange(filters.pageNum - 1)}
                  disabled={filters.pageNum <= 1}
                  className='p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronLeft className='w-5 h-5' />
                </button>

                <div className='flex gap-1'>
                  {[...Array(Math.min(pagination.pageCount, 5))].map((_, i) => {
                    let pageNum;
                    if (pagination.pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (filters.pageNum <= 3) {
                      pageNum = i + 1;
                    } else if (filters.pageNum >= pagination.pageCount - 2) {
                      pageNum = pagination.pageCount - 4 + i;
                    } else {
                      pageNum = filters.pageNum - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${filters.pageNum === pageNum
                            ? 'bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 text-white shadow-md shadow-orangeFpt-500/20'
                            : 'border border-gray-200 hover:bg-white'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.pageNum + 1)}
                  disabled={filters.pageNum >= pagination.pageCount}
                  className='p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronRight className='w-5 h-5' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MeetingManagement;
