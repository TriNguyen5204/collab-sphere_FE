import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Video, CalendarDays, PlayCircle, Sparkles, Zap, Clock } from 'lucide-react';
import MeetingCard from './MeetingCard';

const MeetingTypeList = ({ teamId }) => {
  const [meetingState, setMeetingState] = useState('');
  // const roleName = useSelector(state => state.user.roleName);
  const navigate = useNavigate();


  useEffect(() => {
    if (!meetingState ) return;

    if (meetingState === 'isInstantMeeting') {
      navigate(`/join-room/${teamId}`);
    } else if (meetingState === 'history') {
      navigate(`/meeting/history/${teamId}`);
    } else if (meetingState === 'schedule') {
      navigate(`/meeting/schedule/${teamId}`);
    }
  }, [meetingState, teamId, navigate]);

  const meetingTypes = [
    {
      icon: <Video className="w-8 h-8 text-white" />,
      title: 'New Meeting',
      description: 'Start or join a meeting now',
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      handleClick: () => setMeetingState('isInstantMeeting'),
    },
    {
      icon: <CalendarDays className="w-8 h-8 text-white" />,
      title: 'Schedule Meeting',
      description: 'Plan your next meeting ahead',
      color: 'bg-gradient-to-br from-green-500 to-emerald-700',
      handleClick: () => setMeetingState('schedule'),
    },
    {
      icon: <PlayCircle className="w-8 h-8 text-white" />,
      title: 'View History',
      description: 'Review past meeting records',
      color: 'bg-gradient-to-br from-purple-500 to-purple-700',
      handleClick: () => setMeetingState('history'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Choose an action to get started with your meetings
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Team #{teamId ?? '—'}
          </span>
        </div>
      </div>

      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetingTypes.map((item, index) => (
          <MeetingCard key={index} {...item} />
        ))}
      </section>

      {/* Pro Tip */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Pro Tip</h3>
            <p className="text-gray-700 text-sm">
              You can quickly start a meeting by clicking "New Meeting" or schedule one for later.
              All your meetings are automatically saved in the history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingTypeList;
