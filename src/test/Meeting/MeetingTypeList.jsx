import { useState, useEffect } from 'react';
import { Video, CalendarDays, PlayCircle, LogIn } from 'lucide-react';
import MeetingCard from './MeetingCard';
import MeetingModal from './MeetingModal';
import { useNavigate } from 'react-router-dom';

const MeetingTypeList = () => {
  const [meetingState, setMeetingState] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (meetingState === 'isInstantMeeting') {
      navigate('/room');
    } else if( meetingState === 'history') {
      navigate('/test/meeting/history');
    } else if (meetingState === 'schedule') {
      navigate(`/test/meeting/schedule`)
    }
  }, [meetingState, navigate]);

  const meetingTypes = [
    {
      icon: <Video className='w-8 h-8 text-white' />,
      title: 'New Meeting',
      description: 'Start an instant meeting',
      color: 'bg-blue-600',
      handleClick: () => setMeetingState('isInstantMeeting'),
    },
    {
      icon: <CalendarDays className='w-8 h-8 text-white' />,
      title: 'Schedule Meeting',
      description: 'Plan your next meeting',
      color: 'bg-green-600',
      handleClick: () => setMeetingState('schedule'),
    },
    {
      icon: <PlayCircle className='w-8 h-8 text-white' />,
      title: 'View History',
      description: 'View past meetings',
      color: 'bg-purple-600',
      handleClick: () => setMeetingState('history'),
    },
    {
      icon: <LogIn className='w-8 h-8 text-white' />,
      title: 'Join Meeting',
      description: 'Join via code or link',
      color: 'bg-orange-500',
      handleClick: () => setMeetingState('join'),
    },
  ];

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
      {meetingTypes.map((item, index) => (
        <MeetingCard
          key={index}
          icon={item.icon}
          title={item.title}
          description={item.description}
          color={item.color}
          handleClick={item.handleClick}
        />
      ))}
    </section>
  );
};

export default MeetingTypeList;
