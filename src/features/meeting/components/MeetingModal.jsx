import TimePreview from './TimePreview';

const MeetingModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  onDelete,
  form, 
  onChange,
  selectedEvent,
  selectedDate,
  formatIsoString,
  loading 
}) => {
  if (!show) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[90vh] overflow-y-auto animate-slideUp'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50'>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            {selectedEvent ? '✏️ Edit Meeting' : '➕ New Meeting'}
          </h2>
          <button
            onClick={onClose}
            className='text-2xl leading-none text-gray-400 hover:text-gray-800 transition-colors'
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className='p-6 space-y-5'>
          {/* Title */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Meeting Title *
            </label>
            <input
              type='text'
              value={form.title}
              onChange={e => onChange({ ...form, title: e.target.value })}
              required
              placeholder='e.g., Team Standup'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
            />
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => onChange({ ...form, description: e.target.value })}
              rows='3'
              placeholder='Add meeting details...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all'
            />
          </div>

          {/* Start Time */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Start Time
            </label>
            <input
              type='time'
              value={form.startTime}
              onChange={e => onChange({ ...form, startTime: e.target.value })}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
            />
            <TimePreview 
              selectedDate={selectedDate} 
              startTime={form.startTime}
              formatIsoString={formatIsoString}
            />
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            {selectedEvent && (
              <button
                type='button'
                onClick={onDelete}
                className='flex-1 px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold'
              >
                Delete
              </button>
            )}
            <button
              type='submit'
              disabled={loading}
              className='flex-1 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold disabled:opacity-50'
            >
              {loading ? 'Saving...' : selectedEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;