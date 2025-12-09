// Custom Input Component for the Glass Theme (Light Version)
const GlassInput = ({ label, error, icon: Icon, rightElement, ...props }) => (
  <div className='group relative mb-6'>
    <div className='relative'>
      {Icon && (
        <div className='absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orangeFpt-500'>
          <Icon className='h-5 w-5' />
        </div>
      )}
      <input
        {...props}
        className={`w-full bg-transparent border-b-2 py-3 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:border-orangeFpt-500 focus:shadow-[0_10px_20px_-10px_rgba(234,121,45,0.1)] ${
          Icon ? 'pl-8' : ''
        } ${
          error ? 'border-rose-500' : 'border-gray-300'
        } ${props.className || ''}`}
      />
      {rightElement && (
        <div className='absolute right-0 top-1/2 -translate-y-1/2'>
          {rightElement}
        </div>
      )}
    </div>
    {label && (
      <label className='absolute -top-5 left-0 text-xs font-medium text-gray-500 uppercase tracking-wider'>
        {label}
      </label>
    )}
    {error && <p className='mt-1 text-xs text-rose-500'>{error}</p>}
  </div>
);
export default GlassInput;
