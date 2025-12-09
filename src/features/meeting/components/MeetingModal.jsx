import { X, Calendar, Clock, AlignLeft, Trash2, Check, Plus, Pencil, Sparkles, Loader2, Eye, Type } from 'lucide-react';
import TimePreview from './TimePreview';
import { useState, useEffect } from 'react';

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
  loading,
  readOnly
}) => {
  // Local state for the editable date
  const [localDate, setLocalDate] = useState('');

  // Sync localDate with selectedDate when modal opens or selectedDate changes
  useEffect(() => {
    if (selectedDate?.dateStr) {
      const dateStr = selectedDate.dateStr.split('T')[0];
      setLocalDate(dateStr);
    }
  }, [selectedDate]);

  // Handle date change and update the parent form
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setLocalDate(newDate);
    // Update the form with new date info
    if (onChange && form) {
      onChange({ 
        ...form, 
        selectedDateStr: newDate 
      });
    }
  };

  if (!show) return null;

  // Format the display date
  const displayDate = localDate 
    ? new Date(localDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
    : 'Select a date';

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300'
      style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className='w-full max-w-md relative overflow-hidden transition-all duration-300 animate-scaleIn bg-white rounded-3xl shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='relative px-6 pt-6 pb-4 flex items-start justify-between border-b border-gray-100'>
          <div className='flex gap-4 items-center'>
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg
              ${selectedEvent 
                ? (readOnly ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-br from-orangeFpt-500 to-orangeFpt-600 text-white shadow-orangeFpt-500/30')
                : 'bg-gradient-to-br from-orangeFpt-400 to-orangeFpt-600 text-white shadow-orangeFpt-400/30'
              }
            `}>
              {selectedEvent ? (readOnly ? <Eye className="w-5 h-5" /> : <Pencil className="w-5 h-5" />) : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                {selectedEvent ? (readOnly ? 'View Meeting' : 'Edit Meeting') : 'New Meeting'}
              </h2>
              <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                {displayDate}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all'
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className='px-6 py-5 space-y-5'>
          
          {/* Title Input */}
          <div>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
              <Type className="w-4 h-4 text-orangeFpt-500" />
              Meeting Title
            </label>
            <input
              type='text'
              value={form.title}
              onChange={e => onChange({ ...form, title: e.target.value })}
              required
              disabled={readOnly}
              placeholder='Enter meeting title...'
              className={`w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200
                       focus:border-orangeFpt-400 focus:ring-2 focus:ring-orangeFpt-100 focus:bg-white
                       transition-all outline-none text-gray-800 font-medium placeholder:text-gray-400
                       ${readOnly ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            />
          </div>

          {/* Description Input */}
          <div>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
              <AlignLeft className="w-4 h-4 text-orangeFpt-500" />
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => onChange({ ...form, description: e.target.value })}
              rows='2'
              disabled={readOnly}
              placeholder='Add agenda, notes, or details...'
              className={`w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200
                       focus:border-orangeFpt-400 focus:ring-2 focus:ring-orangeFpt-100 focus:bg-white
                       transition-all outline-none text-gray-700 resize-none placeholder:text-gray-400
                       ${readOnly ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            />
          </div>

          {/* Date & Time Section */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3'>
              <Clock className="w-4 h-4 text-orangeFpt-500" />
              Date & Time
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Date Picker */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orangeFpt-500 pointer-events-none z-10">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type='date'
                  value={localDate}
                  onChange={handleDateChange}
                  disabled={readOnly}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-gray-200
                           focus:border-orangeFpt-400 focus:ring-2 focus:ring-orangeFpt-100
                           transition-all outline-none text-gray-800 font-medium text-sm
                           ${readOnly ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:border-orangeFpt-300'}`}
                />
              </div>

              {/* Time Picker */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orangeFpt-500 pointer-events-none z-10">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type='time'
                  value={form.startTime}
                  onChange={e => onChange({ ...form, startTime: e.target.value })}
                  disabled={readOnly}
                  className={`w-full pl-10 pr-3 py-3 rounded-xl bg-white border border-gray-200
                           focus:border-orangeFpt-400 focus:ring-2 focus:ring-orangeFpt-100
                           transition-all outline-none text-gray-800 font-mono font-medium
                           ${readOnly ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:border-orangeFpt-300'}`}
                />
              </div>
            </div>
            
            {/* Time Preview */}
            <div className="mt-3">
              <TimePreview 
                selectedDate={{ dateStr: localDate }} 
                startTime={form.startTime} 
                formatIsoString={formatIsoString} 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3 pt-1'>
            {selectedEvent && !readOnly && (
              <button
                type='button'
                onClick={onDelete}
                className='p-3.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 
                         transition-all border border-red-100 active:scale-95'
                title="Delete Meeting"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            {!readOnly ? (
              <button
                type='submit'
                disabled={loading}
                className={`
                  flex-1 py-3.5 px-6 rounded-xl font-bold text-white 
                  bg-gradient-to-r from-orangeFpt-500 to-orangeFpt-600 
                  hover:from-orangeFpt-600 hover:to-orangeFpt-700
                  shadow-lg shadow-orangeFpt-500/25 hover:shadow-orangeFpt-500/40
                  flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                  ${loading ? 'cursor-not-allowed opacity-70' : ''}
                `}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {selectedEvent ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{selectedEvent ? 'Save Changes' : 'Create Meeting'}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-gray-400 bg-gray-100 border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed">
                <span>Meeting Ended</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;