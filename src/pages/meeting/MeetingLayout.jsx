import MeetingHomePage from './MeetingHomePage';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HomeLayout = ({ children }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };
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
