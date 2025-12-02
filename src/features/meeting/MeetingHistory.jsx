import { useState } from 'react';
import { CalendarClock, User, Users, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const MeetingHistory = () => {
  const [meetings] = useState([
    {
      MeetingId: 1,
      TeamId: 12,
      Title: 'Weekly Standup',
      Description: 'Discuss weekly progress and blockers',
      CreatedBy: 101,
      ScheduledTime: '2025-11-03T09:00:00Z',
      CreatedAt: '2025-11-02T14:20:00Z',
      Status: 1,
    },
    {
      MeetingId: 2,
      TeamId: 15,
      Title: 'UI Design Review',
      Description: 'Review new UI components for the dashboard',
      CreatedBy: 102,
      ScheduledTime: '2025-10-28T13:30:00Z',
      CreatedAt: '2025-10-25T09:10:00Z',
      Status: 1,
    },
    {
      MeetingId: 3,
      TeamId: 8,
      Title: 'Sprint Planning',
      Description: 'Plan upcoming sprint goals and tasks',
      CreatedBy: 103,
      ScheduledTime: '2025-11-06T10:00:00Z',
      CreatedAt: '2025-11-01T15:00:00Z',
      Status: 2,
    },
    {
      MeetingId: 4,
      TeamId: 8,
      Title: 'Client Presentation',
      Description: 'Present Q4 progress to stakeholders',
      CreatedBy: 104,
      ScheduledTime: '2025-10-20T14:00:00Z',
      CreatedAt: '2025-10-18T10:00:00Z',
      Status: 0,
    },
  ]);

  const [filter, setFilter] = useState('all');

  const getStatusBadge = status => {
    switch (status) {
      case 1:
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20'>
            <CheckCircle2 className='w-3.5 h-3.5' />
            Completed
          </span>
        );
      case 0:
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20'>
            <XCircle className='w-3.5 h-3.5' />
            Canceled
          </span>
        );
      case 2:
        return (
          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20'>
            <AlertCircle className='w-3.5 h-3.5' />
            Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (filter === 'all') return true;
    return m.Status === parseInt(filter);
  });

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='flex bg-gray-950 min-h-screen'>
      
      <section className='flex-1 px-6 py-8 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>Meeting History</h1>
          <p className='text-gray-400 text-sm'>View and manage all your meeting records</p>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 mb-6 border-b border-gray-800 pb-4'>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All Meetings
          </button>
          <button
            onClick={() => setFilter('2')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === '2'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('1')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === '1'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('0')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === '0'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Canceled
          </button>
        </div>

        {/* Meetings List */}
        <div className='space-y-4'>
          {filteredMeetings.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              <Clock className='w-12 h-12 mx-auto mb-3 opacity-50' />
              <p>No meetings found</p>
            </div>
          ) : (
            filteredMeetings.map(meeting => (
              <div
                key={meeting.MeetingId}
                className='bg-gray-900/50 backdrop-blur rounded-xl p-5 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/70 transition-all duration-200 group'
              >
                {/* Header Row */}
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex-1'>
                    <h2 className='text-lg font-semibold text-white group-hover:text-blue-400 transition-colors'>
                      {meeting.Title}
                    </h2>
                    <p className='text-sm text-gray-400 mt-1 line-clamp-2'>
                      {meeting.Description}
                    </p>
                  </div>
                  <div className='ml-4'>
                    {getStatusBadge(meeting.Status)}
                  </div>
                </div>

                {/* Info Row */}
                <div className='flex flex-wrap gap-4 text-sm text-gray-400'>
                  <div className='flex items-center gap-2'>
                    <Users className='w-4 h-4 text-gray-500' />
                    <span>Team {meeting.TeamId}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <User className='w-4 h-4 text-gray-500' />
                    <span>User {meeting.CreatedBy}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CalendarClock className='w-4 h-4 text-gray-500' />
                    <span>{formatDate(meeting.ScheduledTime)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className='mt-3 pt-3 border-t border-gray-800'>
                  <p className='text-xs text-gray-500'>
                    Created {formatDate(meeting.CreatedAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        <div className='mt-8 pt-6 border-t border-gray-800'>
          <div className='flex gap-6 text-sm'>
            <div>
              <span className='text-gray-500'>Total: </span>
              <span className='text-white font-medium'>{meetings.length}</span>
            </div>
            <div>
              <span className='text-gray-500'>Completed: </span>
              <span className='text-green-400 font-medium'>
                {meetings.filter(m => m.Status === 1).length}
              </span>
            </div>
            <div>
              <span className='text-gray-500'>Upcoming: </span>
              <span className='text-blue-400 font-medium'>
                {meetings.filter(m => m.Status === 2).length}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MeetingHistory;
