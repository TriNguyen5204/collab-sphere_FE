import MeetingHomePage from './MeetingHomePage';
import { useParams } from 'react-router-dom';

const HomeLayout = ({ children }) => {
  const { teamId } = useParams();
  return (
    <main className='relative'>
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
