import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CalendarDays, PlayCircle, Sparkles, Zap, Clock } from 'lucide-react';
import MeetingCard from './MeetingCard';

const MeetingTypeList = ({ teamId }) => {
  const [meetingState, setMeetingState] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingState) return;
    if (meetingState === 'isInstantMeeting') navigate(`/join-room/${teamId}`);
    else if (meetingState === 'history') navigate(`/meeting/history/${teamId}`);
    else if (meetingState === 'schedule') navigate(`/meeting/schedule/${teamId}`);
  }, [meetingState, teamId, navigate]);

  const meetingTypes = [
    {
      icon: <Video />,
      title: 'New Meeting',
      description: 'Start an instant meeting with your team members right now.',
      onClick: () => setMeetingState('isInstantMeeting'),
    },
    {
      icon: <CalendarDays />,
      title: 'Schedule',
      description: 'Plan upcoming sessions and notify everyone in advance.',
      onClick: () => setMeetingState('schedule'),
    },
    {
      icon: <PlayCircle />,
      title: 'History',
      description: 'Access recordings and notes from previous discussions.',
      onClick: () => setMeetingState('history'),
    },
  ];

  return (
    <div className="mx-auto space-y-12 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Meeting Hub</h2>
          <p className="text-slate-500 max-w-md text-lg">
            Streamline your collaboration with simple, focused tools.
          </p>
        </div>
      </div>
      {/* Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {meetingTypes.map((item, index) => (
          <MeetingCard key={index} {...item} />
        ))}
      </section>
      
    </div>
  );
};

export default MeetingTypeList;
