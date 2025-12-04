const StatsBar = ({ eventCount, onRefresh }) => (
  <div className='mt-6 bg-white rounded-xl shadow-md p-4 border border-gray-100 animate-fadeIn'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
        <span className='text-sm font-medium text-gray-700'>
          {eventCount} {eventCount === 1 ? 'Meeting' : 'Meetings'} Scheduled
        </span>
      </div>
      <button
        onClick={onRefresh}
        className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
        </svg>
        Refresh
      </button>
    </div>
  </div>
);

export default StatsBar;