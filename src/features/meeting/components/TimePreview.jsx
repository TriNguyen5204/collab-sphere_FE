const TimePreview = ({ selectedDate, startTime, formatIsoString }) => {
  if (!selectedDate || !startTime) return null;

  const dateStr = selectedDate?.dateStr?.split('T')[0];
  const isoString = new Date(`${dateStr}T${startTime}`).toISOString();

  return (
    <div className='mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200'>
      <div className='flex items-center gap-2 text-sm'>
        <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        <span className='text-blue-900 font-medium'>
          Scheduled for: {formatIsoString(isoString)}
        </span>
      </div>
      <div className='mt-1 text-xs text-blue-700 ml-6'>
        Timezone: Asia/Ho_Chi_Minh (GMT+7)
      </div>
    </div>
  );
};

export default TimePreview;