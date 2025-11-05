import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';

const MeetingSchedulerFull = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    color: '#3b82f6',
    startTime: '',
    endTime: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' }
  ];

  const handleDateClick = (arg) => {
    setSelectedDate(arg);
    setEventForm({
      title: '',
      description: '',
      color: '#3b82f6',
      startTime: arg.dateStr.includes('T') ? arg.dateStr.split('T')[1].slice(0, 5) : '09:00',
      endTime: arg.dateStr.includes('T') ? arg.dateStr.split('T')[1].slice(0, 5) : '10:00'
    });
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setEventForm({
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      color: clickInfo.event.backgroundColor || '#3b82f6',
      startTime: clickInfo.event.start?.toTimeString().slice(0, 5) || '09:00',
      endTime: clickInfo.event.end?.toTimeString().slice(0, 5) || '10:00'
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    if (selectedEvent) {
      selectedEvent.setProp('title', eventForm.title);
      selectedEvent.setProp('backgroundColor', eventForm.color);
      selectedEvent.setExtendedProp('description', eventForm.description);
    } else {
      const dateStr = selectedDate.dateStr.split('T')[0];
      setEvents([...events, {
        id: Date.now().toString(),
        title: eventForm.title,
        start: `${dateStr}T${eventForm.startTime}`,
        end: `${dateStr}T${eventForm.endTime}`,
        backgroundColor: eventForm.color,
        borderColor: eventForm.color,
        extendedProps: {
          description: eventForm.description
        }
      }]);
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
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
      endTime: '10:00'
    });
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="px-1 py-0.5 overflow-hidden">
        <div className="text-xs font-semibold">{eventInfo.timeText}</div>
        <div className="text-sm truncate">{eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📅 Meeting Scheduler
        </h1>
        <p className="text-gray-600">
          Click on any date to schedule a meeting
        </p>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
        <style>{`
          .fc {
            --fc-border-color: #e5e7eb;
            --fc-button-bg-color: #3b82f6;
            --fc-button-border-color: #3b82f6;
            --fc-button-hover-bg-color: #2563eb;
            --fc-button-hover-border-color: #2563eb;
            --fc-button-active-bg-color: #1d4ed8;
            --fc-today-bg-color: #dbeafe;
          }
          .fc .fc-button {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            text-transform: capitalize;
          }
          .fc .fc-toolbar-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
          }
          .fc .fc-daygrid-day:hover {
            background-color: #f9fafb;
            cursor: pointer;
          }
          .fc .fc-daygrid-day-number {
            padding: 8px;
            font-weight: 600;
          }
        `}</style>
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEvent ? '✏️ Edit Meeting' : '➕ New Meeting'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="e.g., Team Standup"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Add meeting details, agenda, or notes..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEventForm({...eventForm, color: color.value})}
                      className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
                        eventForm.color === color.value 
                          ? 'ring-4 ring-gray-900 ring-offset-2' 
                          : 'ring-2 ring-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-200">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
  );
};

export default MeetingSchedulerFull;
