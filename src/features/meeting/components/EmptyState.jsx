import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarX, Info } from 'lucide-react';

const EmptyState = ({ message, onDateClick }) => (
  <div className='bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100 text-center animate-fadeIn'>
    <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6'>
      <CalendarX className='w-10 h-10 text-gray-400' />
    </div>
    <h3 className='text-2xl font-bold text-gray-900 mb-3'>
      No Meetings Found
    </h3>
    <p className='text-gray-600 mb-6 max-w-md mx-auto'>{message}</p>
    <div className='flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg'>
      <Info className='w-4 h-4' />
      <span>Click on any date below to schedule your first meeting</span>
    </div>
    
    <div className='mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200'>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today',
        }}
        dateClick={onDateClick}
        height='auto'
        editable={true}
        selectable={true}
      />
    </div>
  </div>
);

export default EmptyState;