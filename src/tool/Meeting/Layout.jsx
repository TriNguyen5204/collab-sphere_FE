import MeetingHomePage from './MeetingHomePage';
import ProjectBoardHeader from '../../components/layout/ProjectBoardHeader';
import useTeam from '../../context/useTeam';

const HomeLayout = ({ children }) => {
  const { team } = useTeam();
  const teamId = team?.teamId ?? '';
  return (
    <main className='relative'>
      <ProjectBoardHeader />
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
