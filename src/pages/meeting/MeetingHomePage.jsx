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
      {/* Meeting Actions */}
      <MeetingTypeList teamId={teamId} />
    </section>
  );
};

export default MeetingHomePage;
