import { Loader2 } from 'lucide-react';

const LoadingState = () => (
  <div className='flex justify-center items-center py-20'>
    <div className='text-center'>
      <Loader2 className='w-12 h-12 text-blue-600 animate-spin mx-auto mb-4' />
      <p className='text-gray-600 font-medium'>Loading calendar...</p>
    </div>
  </div>
);

export default LoadingState;