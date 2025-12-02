// Custom Input Component for the Glass Theme
const GlassInput = ({ label, error, icon: Icon, rightElement, ...props }) => (
  <div className='group relative mb-6'>
    <div className='relative'>
      {Icon && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-orange-400'>
          <Icon className='h-5 w-5' />
        </div>
      )}
      <input
        {...props}
        className={`w-full bg-transparent border-b-2 py-3 text-white placeholder-white/30 transition-all focus:outline-none focus:border-orange-400 focus:shadow-[0_10px_20px_-10px_rgba(249,115,22,0.3)] ${
          Icon ? 'pl-8' : ''
        } ${
          error ? 'border-rose-400' : 'border-white/20'
        } ${props.className || ''}`}
      />
      {rightElement && (
        <div className='absolute right-0 top-1/2 -translate-y-1/2'>
          {rightElement}
        </div>
      )}
    </div>
    {label && (
      <label className='absolute -top-5 left-0 text-xs font-medium text-orange-200/80 uppercase tracking-wider'>
        {label}
      </label>
    )}
    {error && <p className='mt-1 text-xs text-rose-400'>{error}</p>}
  </div>
);
export default GlassInput;
