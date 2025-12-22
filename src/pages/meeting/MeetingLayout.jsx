import MeetingHomePage from './MeetingHomePage';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getMeetingTeamId } from '../../utils/meetingSessionHelper';
import { toast } from 'sonner';

const HomeLayout = ({ children }) => {
  const navigate = useNavigate();
  const teamId = getMeetingTeamId();
  console.log('MeetingLayout - teamId from sessionStorage:', teamId);

  // Redirect if no teamId found in sessionStorage
  // This layout is for STUDENT only (see Router.jsx), so redirect to student home
  useEffect(() => {
    if (!teamId) {
      toast.error('No team selected. Please select a team from your project workspace first.');
      navigate('/student');
    }
  }, [teamId, navigate]);

  const handleBack = () => {
    navigate(`/student/project/team-workspace`);
  };
  
  // Don't render if no teamId
  if (!teamId) {
    return null;
  }

  return (
    <main className='relative'>
      <button
        onClick={handleBack}
        className='absolute left-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-100'
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div className='flex'>
        <section className='flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pd-14 sm:px-14'>
          <div className='w-full'>
            <MeetingHomePage teamId={teamId} />
          </div>
        </section>
      </div>
      {children}
    </main>
  );
};
export default HomeLayout;
