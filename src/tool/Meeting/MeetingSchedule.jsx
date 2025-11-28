import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { createMeeting, getMeeting } from '../../services/meetingApi';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { Calendar, Loader2, CalendarX, Info } from 'lucide-react';

const MeetingSchedulerFull = () => {
  const { teamId } = useParams();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
    startTime: '09:00',
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
  ];

  useEffect(() => {
    fetchMeetings();
  }, [teamId]);

  const fetchMeetings = async () => {
    setLoading(true);
    setEmptyMessage('');
    
    try {
      const response = await getMeeting({
        teamId: teamId,
      });

      // ✅ Xử lý trường hợp không có meetings
      if (response?.isSuccess && !response?.paginatedMeeting) {
        setEmptyMessage(response?.message || 'No meetings found for this team');
        setEvents([]);
        toast.info(response?.message || 'No meetings found');
        return;
      }

      // ✅ Xử lý trường hợp có meetings
      if (response?.paginatedMeeting?.list) {
        const formattedEvents = response.paginatedMeeting.list.map(meeting => ({
          id: meeting.meetingId,
          title: meeting.title,
          start: meeting.scheduleTime,
          backgroundColor: eventColors[0].value,
          borderColor: eventColors[0].value,
          extendedProps: {
            description: meeting.description,
            meetingUrl: meeting.meetingUrl,
          },
        }));
        setEvents(formattedEvents);
        setEmptyMessage('');
      }
    } catch (err) {
      console.error('❌ Failed to fetch meetings:', err);
      toast.error('Failed to load meetings, please try again.');
      setEmptyMessage('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = arg => {
    setSelectedDate(arg);
    setEventForm({
      title: '',
      description: '',
      color: '#3b82f6',
      startTime: arg.dateStr.includes('T')
        ? arg.dateStr.split('T')[1].slice(0, 5)
        : '09:00',
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = clickInfo => {
    setSelectedEvent(clickInfo.event);
    setEventForm({
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      color: clickInfo.event.backgroundColor || '#3b82f6',
      startTime: clickInfo.event.start?.toTimeString().slice(0, 5) || '09:00',
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      toast.error('Meeting title is required');
      return;
    }

    const dateStr = selectedDate?.dateStr?.split('T')[0];
    const startDateTime = `${dateStr}T${eventForm.startTime}`;

    if (selectedEvent) {
      // Cập nhật event hiện có
      selectedEvent.setProp('title', eventForm.title);
      selectedEvent.setProp('backgroundColor', eventForm.color);
      selectedEvent.setExtendedProp('description', eventForm.description);
      toast.success('✅ Meeting updated successfully!');
    } else {
      // 🆕 Tạo roomId ngẫu nhiên
      const newRoomId = Math.random().toString(36).substring(2, 10);

      // Payload API
      const payload = {
        teamId: parseInt(teamId) || 2,
        title: eventForm.title,
        description: eventForm.description,
        meetingUrl: `${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/room/${newRoomId}`,
        scheduleTime: new Date(startDateTime).toISOString(),
      };

      try {
        const response = await createMeeting(payload);
        if (response?.isSuccess) {
          toast.success('🎉 Meeting created successfully!');
          
          // 🗓️ Thêm event mới vào lịch
          setEvents([
            ...events,
            {
              id: response.data?.meetingId || Date.now().toString(),
              title: eventForm.title,
              start: startDateTime,
              backgroundColor: eventForm.color,
              borderColor: eventForm.color,
              extendedProps: {
                description: eventForm.description,
                meetingUrl: payload.meetingUrl,
              },
            },
          ]);
          
          // Clear empty message nếu có
          if (emptyMessage) {
            setEmptyMessage('');
          }
        }
      } catch (err) {
        console.error('❌ Failed to create meeting:', err);
        const errorMsg = err.response?.data?.message || 'Failed to create meeting';
        toast.error(errorMsg);
      }
    }

    setShowModal(false);
    resetForm();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      toast.info('🗑️ Meeting deleted.');
      setShowModal(false);
      resetForm();
      
      // Check if no events left
      if (events.length === 1) {
        setEmptyMessage('No meetings scheduled yet');
      }
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      color: '#3b82f6',
      startTime: '09:00',
    });
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const renderEventContent = eventInfo => (
    <div className='px-1 py-0.5 overflow-hidden'>
      <div className='text-xs font-semibold'>{eventInfo.timeText}</div>
      <div className='text-sm truncate'>{eventInfo.event.title}</div>
    </div>
  );

  return (
    <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='flex-1 p-6 pt-28 px-6 pb-6 sm:px-14'>
        {/* Header */}
        <div className='text-center mb-8 animate-fadeIn'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
            <Calendar className='w-8 h-8 text-blue-600' />
          </div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Meeting Scheduler
          </h1>
          <p className='text-gray-600'>
            {loading ? 'Loading your meetings...' : 'Click a date to create a meeting'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='flex justify-center items-center py-20'>
            <div className='text-center'>
              <Loader2 className='w-12 h-12 text-blue-600 animate-spin mx-auto mb-4' />
              <p className='text-gray-600 font-medium'>Loading calendar...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && emptyMessage && (
          <div className='bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100 text-center animate-fadeIn'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6'>
              <CalendarX className='w-10 h-10 text-gray-400' />
            </div>
            <h3 className='text-2xl font-bold text-gray-900 mb-3'>
              No Meetings Found
            </h3>
            <p className='text-gray-600 mb-6 max-w-md mx-auto'>
              {emptyMessage}
            </p>
            <div className='flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-flex'>
              <Info className='w-4 h-4' />
              <span>Click on any date below to schedule your first meeting</span>
            </div>
            
            {/* Mini Calendar for creating meetings */}
            <div className='mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200'>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView='dayGridMonth'
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today',
                }}
                dateClick={handleDateClick}
                height='auto'
                editable={true}
                selectable={true}
              />
            </div>
          </div>
        )}

        {/* Calendar with Events */}
        {!loading && !emptyMessage && (
          <div className='bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 animate-fadeIn'>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              editable={true}
              selectable={true}
              dayMaxEvents={true}
              height='auto'
              eventDisplay='block'
              displayEventTime={true}
              displayEventEnd={false}
            />
          </div>
        )}

        {/* Stats Bar */}
        {!loading && events.length > 0 && (
          <div className='mt-6 bg-white rounded-xl shadow-md p-4 border border-gray-100 animate-fadeIn'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                <span className='text-sm font-medium text-gray-700'>
                  {events.length} {events.length === 1 ? 'Meeting' : 'Meetings'} Scheduled
                </span>
              </div>
              <button
                onClick={fetchMeetings}
                className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'
            onClick={() => setShowModal(false)}
          >
            <div
              className='bg-white rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[90vh] overflow-y-auto animate-slideUp'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                  {selectedEvent ? '✏️ Edit Meeting' : '➕ New Meeting'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-2xl leading-none text-gray-400 hover:text-gray-800 transition-colors'
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className='p-6 space-y-5'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Meeting Title *
                  </label>
                  <input
                    type='text'
                    value={eventForm.title}
                    onChange={e =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    required
                    placeholder='e.g., Team Standup'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={e =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    rows='3'
                    placeholder='Add meeting details...'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Start Time
                  </label>
                  <input
                    type='time'
                    value={eventForm.startTime}
                    onChange={e =>
                      setEventForm({ ...eventForm, startTime: e.target.value })
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Color Theme
                  </label>
                  <div className='flex gap-3 flex-wrap'>
                    {eventColors.map(color => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() =>
                          setEventForm({ ...eventForm, color: color.value })
                        }
                        className={`w-10 h-10 rounded-full transition-all ${
                          eventForm.color === color.value
                            ? 'ring-4 ring-offset-2 scale-110'
                            : 'ring-2 ring-transparent hover:scale-105'
                        }`}
                        style={{ 
                          backgroundColor: color.value,
                          ringColor: eventForm.color === color.value ? color.value : 'transparent'
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className='flex justify-between pt-4 border-t border-gray-200'>
                  {selectedEvent ? (
                    <button
                      type='button'
                      onClick={handleDeleteEvent}
                      className='px-5 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2'
                    >
                      🗑️ Delete
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className='flex gap-3'>
                    <button
                      type='button'
                      onClick={() => setShowModal(false)}
                      className='px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg'
                    >
                      {selectedEvent ? 'Update' : 'Create'} Meeting
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        /* Custom FullCalendar Styling */
        .fc-day-today {
          background-color: #eff6ff !important;
        }
        
        .fc-event {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .fc-event:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default MeetingSchedulerFull;