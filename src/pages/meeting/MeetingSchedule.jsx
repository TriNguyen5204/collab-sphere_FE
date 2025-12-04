import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMeeting, getMeeting } from '../../features/meeting/services/meetingApi';
import { toast } from 'sonner';
import useIsoToLocalTime from '../../hooks/useIsoToLocalTime';

// Import components and utilities
import {
  Header,
  LoadingState,
  EmptyState,
  StatsBar,
  MeetingModal,
  DEFAULT_EVENT_COLOR,
  INITIAL_FORM_STATE,
  TIME_FORMATTER_CONFIG,
  formatMeetingData,
  buildDateTime,
  buildMeetingPayload,
} from '../../features/meeting/components/index';

// ==================== MAIN COMPONENT ====================

const MeetingSchedulerFull = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { formatIsoString } = useIsoToLocalTime(TIME_FORMATTER_CONFIG);
  
  // State
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [eventForm, setEventForm] = useState(INITIAL_FORM_STATE);

  // Fetch meetings on mount
  useEffect(() => {
    fetchMeetings();
  }, [teamId]);

  // Fetch meetings from API
  const fetchMeetings = async () => {
    setLoading(true);
    setEmptyMessage('');
    
    try {
      const response = await getMeeting({ teamId });

      if (response?.isSuccess && !response?.paginatedMeeting) {
        const message = response?.message || 'No meetings found for this team';
        setEmptyMessage(message);
        setEvents([]);
        toast.info(message);
        return;
      }

      if (response?.paginatedMeeting?.list) {
        const formattedEvents = response.paginatedMeeting.list.map(meeting =>
          formatMeetingData(meeting)
        );
        setEvents(formattedEvents);
        setEmptyMessage('');
      }
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
      toast.error('Failed to load meetings, please try again.');
      setEmptyMessage('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  // Handle date click (create new meeting)
  const handleDateClick = (arg) => {
    setSelectedDate(arg);
    setEventForm({
      ...INITIAL_FORM_STATE,
      startTime: arg.dateStr.includes('T')
        ? arg.dateStr.split('T')[1].slice(0, 5)
        : '09:00',
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  // Handle event click (edit meeting)
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setEventForm({
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      startTime: clickInfo.event.start?.toTimeString().slice(0, 5) || '09:00',
    });
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventForm.title.trim()) {
      toast.error('Meeting title is required');
      return;
    }

    const startDateTime = buildDateTime(selectedDate?.dateStr, eventForm.startTime);

    if (selectedEvent) {
      // Update existing event
      selectedEvent.setProp('title', eventForm.title);
      selectedEvent.setExtendedProp('description', eventForm.description);
      toast.success('✅ Meeting updated successfully!');
      setShowModal(false);
      resetForm();
      return;
    }

    // Create new meeting
    setSubmitting(true);
    try {
      const payload = buildMeetingPayload(teamId, eventForm, startDateTime);
      const formattedTime = formatIsoString(payload.scheduleTime);

      const response = await createMeeting(payload);
      
      if (response?.isSuccess) {
        toast.success(`🎉 Meeting created successfully at ${formattedTime}!`);
        
        setEvents([
          ...events,
          {
            id: response.data?.meetingId || Date.now().toString(),
            title: eventForm.title,
            start: startDateTime,
            backgroundColor: DEFAULT_EVENT_COLOR,
            borderColor: DEFAULT_EVENT_COLOR,
            extendedProps: {
              description: eventForm.description,
              meetingUrl: payload.meetingUrl,
            },
          },
        ]);
        
        if (emptyMessage) {
          setEmptyMessage('');
        }
        
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      console.error('Failed to create meeting:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create meeting';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      toast.info('🗑️ Meeting deleted.');
      setShowModal(false);
      resetForm();
      
      if (events.length === 1) {
        setEmptyMessage('No meetings scheduled yet');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setEventForm(INITIAL_FORM_STATE);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Render event content
  const renderEventContent = (eventInfo) => (
    <div className='px-1 py-0.5 overflow-hidden'>
      <div className='text-xs font-semibold'>{eventInfo.timeText}</div>
      <div className='text-sm truncate'>{eventInfo.event.title}</div>
    </div>
  );

  return (
    <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='flex-1 p-6 pt-28 px-6 pb-6 sm:px-14'>
        <Header loading={loading} onBack={handleBack} />

        {loading && <LoadingState />}

        {!loading && emptyMessage && (
          <EmptyState message={emptyMessage} onDateClick={handleDateClick} />
        )}

        {!loading && !emptyMessage && (
          <>
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

            {events.length > 0 && (
              <StatsBar eventCount={events.length} onRefresh={fetchMeetings} />
            )}
          </>
        )}

        <MeetingModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          onDelete={handleDeleteEvent}
          form={eventForm}
          onChange={setEventForm}
          selectedEvent={selectedEvent}
          selectedDate={selectedDate}
          formatIsoString={formatIsoString}
          loading={submitting}
        />
      </div>
    </div>
  );
};

export default MeetingSchedulerFull;