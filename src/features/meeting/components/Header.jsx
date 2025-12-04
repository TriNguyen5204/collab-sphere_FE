import { Calendar, ArrowLeft } from 'lucide-react';

const Header = ({ loading, onBack }) => (
  <div className='text-center mb-8 animate-fadeIn'>
    {/* Back Button */}
    {onBack && (
      <div className='flex justify-start mb-4'>
        <button
          onClick={onBack}
          className='inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all font-medium'
        >
          <ArrowLeft className='w-5 h-5' />
          Back
        </button>
      </div>
    )}
    
    <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
      <Calendar className='w-8 h-8 text-blue-600' />
    </div>
    <h1 className='text-4xl font-bold text-gray-900 mb-2'>
      Meeting Scheduler
    </h1>
    <p className='text-gray-600'>
      {loading ? 'Loading your meetings...' : 'Click a date to create a meeting'}
    </p>
  </div>
);

export default Header;