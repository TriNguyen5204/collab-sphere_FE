import MeetingTypeList from '../../features/meeting/components/MeetingTypeList';
import { Calendar, Clock, Sunrise, Sunset, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const MeetingHomePage = ({ teamId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(currentTime);
  const hours = currentTime.getHours();

  // Get greeting and icon based on time
  const getGreeting = () => {
    if (hours < 12) return { text: 'Good Morning', icon: Sunrise, color: 'from-orange-400 to-yellow-500' };
    if (hours < 17) return { text: 'Good Afternoon', icon: Sun, color: 'from-blue-400 to-cyan-500' };
    if (hours < 21) return { text: 'Good Evening', icon: Sunset, color: 'from-purple-400 to-pink-500' };
    return { text: 'Good Night', icon: Moon, color: 'from-indigo-500 to-purple-600' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <section className='flex size-full flex-col gap-8'>
      {/* Main Hero Card */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-2xl'>
        {/* Animated Stars Background */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute w-1 h-1 bg-white rounded-full top-[20%] left-[15%] animate-pulse'></div>
          <div className='absolute w-1 h-1 bg-white rounded-full top-[40%] left-[80%] animate-pulse' style={{ animationDelay: '0.5s' }}></div>
          <div className='absolute w-1 h-1 bg-white rounded-full top-[70%] left-[30%] animate-pulse' style={{ animationDelay: '1s' }}></div>
          <div className='absolute w-2 h-2 bg-blue-300 rounded-full top-[30%] left-[60%] animate-pulse' style={{ animationDelay: '1.5s' }}></div>
          <div className='absolute w-1 h-1 bg-white rounded-full top-[85%] left-[70%] animate-pulse' style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className='relative p-8 lg:p-12'>
          {/* Greeting Badge */}
          <div className='inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8'>
            <GreetingIcon className='w-5 h-5 text-yellow-300' />
            <span className='text-white font-semibold'>{greeting.text}</span>
          </div>

          {/* Time Display */}
          <div className='mb-8'>
            <div className='flex items-baseline gap-4 mb-4'>
              <h1 className='text-7xl lg:text-9xl font-black text-white tracking-tight'>
                {time.split(':')[0]}
                <span className='text-white/40'>:</span>
                {time.split(':')[1]}
              </h1>
              <span className='text-3xl lg:text-4xl font-bold text-white/60'>
                {time.split(':')[2]}
              </span>
            </div>
            
            <p className='text-xl lg:text-2xl text-blue-200 font-medium mb-6'>
              {date}
            </p>

            {/* Info Pills */}
            <div className='flex flex-wrap gap-3'>
              <div className='flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30'>
                <Calendar className='w-4 h-4 text-blue-300' />
                <span className='text-blue-100 text-sm font-medium'>
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
              </div>
              
              <div className='flex items-center gap-2 px-4 py-2 bg-indigo-500/20 backdrop-blur-sm rounded-full border border-indigo-400/30'>
                <Clock className='w-4 h-4 text-indigo-300' />
                <span className='text-indigo-100 text-sm font-medium'>
                  Team #{teamId}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-3 gap-4 pt-8 border-t border-white/10'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-white mb-1'>
                {currentTime.toLocaleDateString('en-US', { month: 'short' })}
              </p>
              <p className='text-sm text-blue-200'>Month</p>
            </div>
            <div className='text-center'>
              <p className='text-3xl font-bold text-white mb-1'>
                {currentTime.getDate()}
              </p>
              <p className='text-sm text-blue-200'>Day</p>
            </div>
            <div className='text-center'>
              <p className='text-3xl font-bold text-white mb-1'>
                {currentTime.getFullYear()}
              </p>
              <p className='text-sm text-blue-200'>Year</p>
            </div>
          </div>
        </div>

        {/* Decorative Gradient Overlay */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-3xl'></div>
      </div>

      {/* Meeting Actions */}
      <MeetingTypeList teamId={teamId} />
    </section>
  );
};

export default MeetingHomePage;
