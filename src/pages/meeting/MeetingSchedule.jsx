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
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Prevent creating meetings in the past
    if (arg.allDay) {
      if (arg.date < todayStart) {
        toast.error("Cannot schedule meetings in the past.");
        return;
      }
    } else {
      if (arg.date < now) {
        toast.error("Cannot schedule meetings in the past.");
        return;
      }
    }

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

    // Use form's selectedDateStr if available (user changed date), otherwise use calendar's selectedDate
    const dateToUse = eventForm.selectedDateStr || selectedDate?.dateStr;
    const startDateTime = buildDateTime(dateToUse, eventForm.startTime);

    // Validate that the meeting time is not in the past for new meetings
    if (!selectedEvent) {
      const meetingTime = new Date(startDateTime);
      if (meetingTime < new Date()) {
        toast.error("Cannot create meetings in the past.");
        return;
      }
    }

    if (selectedEvent) {
      // Update existing event
      selectedEvent.setProp('title', eventForm.title);
      selectedEvent.setExtendedProp('description', eventForm.description);
      toast.success('Meeting updated successfully!');
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
        toast.success(`Meeting created successfully at ${formattedTime}!`);
        
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
      
      if (err.response?.data?.errorList && Array.isArray(err.response.data.errorList)) {
        err.response.data.errorList.forEach(error => {
          toast.warning(error.message || 'Invalid input');
        });
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to create meeting';
        toast.error(errorMsg);
      }
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
    <div className='flex flex-col px-1 overflow-hidden h-full justify-center'>
      <div className='text-[0.7rem] font-medium opacity-90 leading-tight'>{eventInfo.timeText}</div>
      <div className='text-sm font-bold truncate leading-tight'>{eventInfo.event.title}</div>
    </div>
  );

  return (
    <div className='min-h-screen bg-[#F0F4F8] relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900'>
      {/* Aurora Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/40 blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="fixed top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-orange-100/50 blur-[80px] pointer-events-none mix-blend-multiply" />
      
      {/* Abstract 3D Floating Elements */}
      <div className="fixed top-20 right-20 w-64 h-64 opacity-30 pointer-events-none animate-float-slow">
         <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/20 to-transparent blur-2xl" />
      </div>

      <div className='relative z-10 flex-1 p-6 pt-10 px-6 pb-6 sm:px-14 max-w-[1600px] mx-auto'>
        <Header loading={loading} onBack={handleBack} />

        {loading && <LoadingState />}

        {!loading && emptyMessage && (
          <EmptyState message={emptyMessage} onDateClick={handleDateClick} />
        )}

        {!loading && !emptyMessage && (
          <>
            {/* Glass Calendar Container */}
            <div className='backdrop-blur-xl bg-white/40 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/60 p-8 animate-fadeIn overflow-hidden relative'>
              {/* Soft inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-[2.5rem]" />

              <style>{`
                /* Typography */
                .fc {
                  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
                }
                
                /* Grid System - Glass Etched Look */
                .fc-theme-standard td, 
                .fc-theme-standard th,
                .fc-theme-standard .fc-scrollgrid {
                  border: none !important;
                }

                .fc-scrollgrid {
                  border-radius: 1.5rem;
                  overflow: hidden;
                  background: rgba(255, 255, 255, 0.2); /* The "gap" color */
                  gap: 1px;
                  display: grid;
                  box-shadow: inset 0 0 20px rgba(255,255,255,0.5);
                }

                .fc-daygrid-day {
                  background: rgba(255, 255, 255, 0.5); /* Cell background */
                  transition: all 0.3s ease;
                }

                .fc-daygrid-day:hover {
                  background: rgba(255, 255, 255, 0.75);
                  backdrop-filter: blur(10px);
                }

                /* Header Cells */
                .fc-col-header-cell {
                  background: rgba(255, 255, 255, 0.3);
                  padding: 1.2rem 0;
                }
                
                .fc-col-header-cell-cushion {
                  color: #64748b;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                  letter-spacing: 0.1em;
                  font-weight: 700;
                  text-decoration: none !important;
                }

                /* Today Cell - Warm Glow */
                .fc-day-today {
                  background: linear-gradient(to bottom right, rgba(255, 247, 237, 0.8), rgba(255, 247, 237, 0.4)) !important;
                  position: relative;
                }
                .fc-day-today::before {
                  content: '';
                  position: absolute;
                  top: 0; left: 0; right: 0; height: 3px;
                  background: #f97316;
                  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
                }

                /* 3D Event Lozenges */
                .fc-event {
                  background: transparent !important;
                  border: none !important;
                  box-shadow: none !important;
                  margin-top: 6px !important;
                  margin-bottom: 2px !important;
                  cursor: pointer;
                }

                .fc-event-main {
                  background: #f97316 !important;
                  border: 1px solid #fed7aa;
                  box-shadow: 
                    0 4px 6px -1px rgba(249, 115, 22, 0.1),
                    0 2px 4px -1px rgba(249, 115, 22, 0.06),
                    inset 0 2px 0 rgba(255, 255, 255, 0.8);
                  border-radius: 12px;
                  padding: 6px 12px;
                  color: #9a3412;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  position: relative;
                  overflow: hidden;
                }

                /* Glossy Shine Effect */
                .fc-event-main::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 40%;
                  background: linear-gradient(to bottom, rgba(255,255,255,0.8), transparent);
                  border-radius: 11px 11px 0 0;
                }

                .fc-event-main:hover {
                  box-shadow: 
                    0 12px 20px -5px rgba(249, 115, 22, 0.2),
                    inset 0 2px 0 rgba(255, 255, 255, 0.9);
                  border-color: #fdba74;
                  z-index: 50;
                }

                /* Floating Segmented Control Header */
                .fc-header-toolbar {
                  margin-bottom: 2.5rem !important;
                  padding: 0 1rem;
                }

                .fc-toolbar-title {
                  font-size: 2rem !important;
                  font-weight: 800 !important;
                  color: #1e293b;
                  letter-spacing: -0.03em;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .fc-button-group {
                  background: rgba(255, 255, 255, 0.6);
                  backdrop-filter: blur(12px);
                  padding: 5px;
                  border-radius: 9999px;
                  border: 1px solid rgba(255, 255, 255, 0.8);
                  box-shadow: 
                    0 4px 6px -1px rgba(0, 0, 0, 0.05),
                    inset 0 2px 4px rgba(255, 255, 255, 0.5);
                }

                .fc-button {
                  background: transparent !important;
                  border: none !important;
                  color: #64748b !important;
                  font-weight: 600 !important;
                  font-size: 0.9rem !important;
                  padding: 0.6rem 1.5rem !important;
                  border-radius: 9999px !important;
                  transition: all 0.3s ease !important;
                  box-shadow: none !important;
                  text-transform: capitalize;
                }

                .fc-button:hover {
                  color: #334155 !important;
                  background: rgba(255, 255, 255, 0.5) !important;
                }

                .fc-button-active {
                  background: white !important;
                  color: #0f172a !important;
                  box-shadow: 
                    0 4px 12px rgba(0,0,0,0.08),
                    0 2px 4px rgba(0,0,0,0.05) !important;
                  transform: scale(1.05);
                }
                
                .fc-button:focus {
                  box-shadow: none !important;
                }

                /* Navigation Buttons (Prev/Next) */
                .fc-prev-button, .fc-next-button {
                  background: white !important;
                  border: 1px solid rgba(255,255,255,0.8) !important;
                  color: #64748b !important;
                  border-radius: 12px !important;
                  width: 40px !important;
                  height: 40px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.05) !important;
                  margin-right: 8px !important;
                }
                
                .fc-prev-button:hover, .fc-next-button:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important;
                  color: #334155 !important;
                }

                .fc-today-button {
                  background: rgba(249, 115, 22, 0.1) !important;
                  color: #ea580c !important;
                  font-weight: 700 !important;
                  border: 1px solid rgba(249, 115, 22, 0.2) !important;
                }

                /* Day Number Styling */
                .fc-daygrid-day-number {
                  font-size: 0.95rem;
                  font-weight: 600;
                  color: #64748b;
                  padding: 12px 16px !important;
                  opacity: 0.8;
                }
                
                .fc-day-today .fc-daygrid-day-number {
                  color: #ea580c;
                  font-weight: 800;
                  opacity: 1;
                  font-size: 1.1rem;
                }
                
                /* More Link */
                .fc-daygrid-more-link {
                  color: #64748b;
                  font-weight: 600;
                  font-size: 0.8rem;
                  text-decoration: none;
                  background: rgba(255,255,255,0.5);
                  padding: 2px 8px;
                  border-radius: 12px;
                }

              `}</style>

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
              <div className="mt-8 backdrop-blur-md bg-white/30 rounded-2xl p-4 border border-white/40 shadow-sm">
                <StatsBar eventCount={events.length} onRefresh={fetchMeetings} />
              </div>
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
          readOnly={selectedEvent && selectedEvent.start < new Date()}
        />
      </div>
    </div>
  );
};

export default MeetingSchedulerFull;