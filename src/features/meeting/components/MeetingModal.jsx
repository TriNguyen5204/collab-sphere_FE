import { X, Calendar, Clock, AlignLeft, Trash2, Check, Plus, Pencil, Sparkles, Loader2, Eye } from 'lucide-react';
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
  loading,
  readOnly
}) => {
  if (!show) return null;

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300'
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg relative overflow-hidden transition-all duration-300 animate-scaleIn'
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid transparent',
          borderImageSource: 'linear-gradient(to bottom right, rgba(255,255,255,1), rgba(255,255,255,0))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Glassy Gradient Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orangeFpt-400/10 via-orangeFpt-200/5 to-transparent pointer-events-none" />

        {/* Header Content */}
        <div className='relative px-8 pt-8 pb-6 flex items-start justify-between'>
          <div className='flex gap-5'>
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md
              ${selectedEvent 
                ? (readOnly ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-br from-orangeFpt-500 to-orangeFpt-600 text-white shadow-orangeFpt-500/30')
                : 'bg-white/80 text-orangeFpt-500 shadow-orangeFpt-200/50'
              }
            `}>
              {selectedEvent ? (readOnly ? <Eye className="w-6 h-6" /> : <Pencil className="w-6 h-6" />) : <Sparkles className="w-6 h-6" />}
            </div>
            <div className="pt-1">
              <h2 className='text-2xl font-bold text-[#1A2B45] tracking-tight'>
                {selectedEvent ? (readOnly ? 'View Meeting' : 'Edit Session') : 'New Meeting'}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {selectedDate?.dateStr 
                  ? new Date(selectedDate.dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) 
                  : 'Schedule Event'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className='group w-9 h-9 rounded-xl bg-white/50 hover:bg-white border border-white/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shadow-sm hover:shadow-md'
          >
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className='px-8 pb-8 space-y-6 relative'>
          
          {/* Title Input */}
          <div className="group">
            <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-orangeFpt-500 transition-colors'>
              Meeting Title
            </label>
            <div className="relative">
              <input
                type='text'
                value={form.title}
                onChange={e => onChange({ ...form, title: e.target.value })}
                required
                disabled={readOnly}
                placeholder='What is this meeting about?'
                className={`w-full px-5 py-4 rounded-xl 
                         transition-all outline-none text-[#1A2B45] font-semibold placeholder:text-slate-400/80
                         ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{
                  background: 'rgba(240, 240, 245, 0.5)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                  border: 'none'
                }}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <AlignLeft className="w-5 h-5 opacity-50" />
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="group">
            <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-orangeFpt-500 transition-colors'>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => onChange({ ...form, description: e.target.value })}
              rows='3'
              disabled={readOnly}
              placeholder='Add agenda, notes, or details...'
              className={`w-full px-5 py-4 rounded-xl 
                       transition-all outline-none text-[#1A2B45] resize-none placeholder:text-slate-400/80
                       ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{
                background: 'rgba(240, 240, 245, 0.5)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                border: 'none'
              }}
            />
          </div>

          {/* Time Block Group */}
          <div className="bg-white/40 rounded-2xl p-4 border border-white/50">
            <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1'>
              Time Block
            </label>
            <div className="flex items-center gap-4">
              {/* Date Display (Read-only context) */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/60 rounded-xl border border-white/60 text-slate-600">
                <Calendar className="w-4 h-4 text-orangeFpt-500" />
                <span className="text-sm font-medium">
                  {selectedDate?.dateStr 
                    ? new Date(selectedDate.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                    : 'Date'}
                </span>
              </div>

              {/* Start Time Input */}
              <div className="flex-[2] relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orangeFpt-500 pointer-events-none">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type='time'
                  value={form.startTime}
                  onChange={e => onChange({ ...form, startTime: e.target.value })}
                  disabled={readOnly}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl 
                           transition-all outline-none text-[#1A2B45] font-mono text-lg font-medium
                           ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                  style={{
                    background: 'rgba(240, 240, 245, 0.5)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    border: 'none'
                  }}
                />
              </div>
            </div>
            
            {/* Time Preview (Optional context) */}
            <div className="mt-3 px-1">
               <TimePreview 
                  selectedDate={selectedDate} 
                  startTime={form.startTime} 
                  formatIsoString={formatIsoString} 
                />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3 pt-2'>
            {selectedEvent && !readOnly && (
              <button
                type='button'
                onClick={onDelete}
                className='p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 
                         transition-all border border-red-100 shadow-sm hover:shadow-md active:scale-95'
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
                  flex-1 py-4 px-6 rounded-2xl font-bold text-white 
                  flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
                  ${loading ? 'cursor-not-allowed opacity-80' : ''}
                `}
                style={{
                  background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #FF8C42 0%, #F36F21 100%)',
                  boxShadow: loading ? 'none' : '0 10px 20px rgba(243, 111, 33, 0.3)',
                  border: 'none'
                }}
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
              <div className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 bg-slate-100/50 border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed">
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