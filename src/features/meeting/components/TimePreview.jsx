import { Clock, Globe } from 'lucide-react';

const TimePreview = ({ selectedDate, startTime, formatIsoString }) => {
  if (!selectedDate?.dateStr || !startTime) return null;

  const dateStr = selectedDate.dateStr.split('T')[0];
  const isoString = new Date(`${dateStr}T${startTime}`).toISOString();

  return (
    <div className='p-3 bg-orangeFpt-50 rounded-xl border border-orangeFpt-100'>
      <div className='flex items-center gap-2 text-sm'>
        <Clock className='w-4 h-4 text-orangeFpt-500' />
        <span className='text-orangeFpt-800 font-medium'>
          Scheduled for: {formatIsoString(isoString)}
        </span>
      </div>
      <div className='mt-1.5 flex items-center gap-1.5 text-xs text-orangeFpt-600 ml-6'>
        <Globe className='w-3 h-3' />
        <span>Timezone: Asia/Ho Chi Minh (GMT+7)</span>
      </div>
    </div>
  );
};

export default TimePreview;