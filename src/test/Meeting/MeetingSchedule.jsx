import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { createMeeting, getMeeting } from '../../services/meetingApi';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

const MeetingSchedulerFull = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
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
    const fetchMeetings = async () => {
      try {
        const meetings = await getMeeting({
          teamId: 2,
        }); 
        const formattedEvents = meetings.list.map(meeting => ({
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
      }
      catch (err) {
        console.error('❌ Failed to fetch meetings:', err);
        toast.error('Failed to load meetings, please try again.');
      }
    };
    fetchMeetings();
  }, []);
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

  // 🧠 Submit tạo hoặc cập nhật meeting
  const handleSubmit = async e => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

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
        teamId: 2,
        title: eventForm.title,
        description: eventForm.description,
        meetingUrl: `http://localhost:5173/room/${newRoomId}`,
        scheduleTime: new Date(startDateTime).toISOString(),
      };

      try {
        const response = await createMeeting(payload);
        if (response) {
          toast.success('🎉 Meeting created successfully!');
        }

        // 🗓️ Thêm event mới vào lịch
        setEvents([
          ...events,
          {
            id: Date.now().toString(),
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
      } catch (err) {
        console.error('❌ Failed to create meeting:', err);
        toast.error('Failed to create meeting, please try again.');
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
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 p-6 min-h-screen pt-28 px-6 pb-6 sm:px-14'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            📅 Meeting Scheduler
          </h1>
          <p className='text-gray-600'>Click a date to create a meeting</p>
        </div>

        {/* Calendar */}
        <div className='bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100'>
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
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
            onClick={() => setShowModal(false)}
          >
            <div
              className='bg-white rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[90vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {selectedEvent ? '✏️ Edit Meeting' : '➕ New Meeting'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-2xl leading-none text-gray-400 hover:text-gray-800'
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
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
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
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none'
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
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-3'>
                    Color
                  </label>
                  <div className='flex gap-3 flex-wrap'>
                    {eventColors.map(color => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() =>
                          setEventForm({ ...eventForm, color: color.value })
                        }
                        className={`w-8 h-8 rounded-full ${
                          eventForm.color === color.value
                            ? 'ring-4 ring-gray-900 ring-offset-2'
                            : 'ring-2 ring-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className='flex justify-between pt-4 border-t border-gray-200'>
                  {selectedEvent ? (
                    <button
                      type='button'
                      onClick={handleDeleteEvent}
                      className='px-5 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100'
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
                      className='px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
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
    </div>
  );
};

export default MeetingSchedulerFull;
