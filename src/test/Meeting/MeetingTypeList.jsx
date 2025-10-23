import { useState } from 'react';
import { Video, CalendarDays, PlayCircle, LogIn } from 'lucide-react';
import MeetingCard from './MeetingCard';
import MeetingModal from './MeetingModal';

const MeetingTypeList = () => {
  const [meetingState, setMeetingState] = useState('');

  const CreateMeeting = () =>{
    
  }

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
      title: 'View Recordings',
      description: 'Watch past meetings',
      color: 'bg-purple-600',
      handleClick: () => setMeetingState('recordings'),
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
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title='New meeting'
        description='Start an instant meeting'
        handleClick={() => setMeetingState('isJoiningMeeting')}
        className='bg-orange-300'
      />
    </section>
  );
};

export default MeetingTypeList;
