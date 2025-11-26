
import MeetingHomePage from './MeetingHomePage'
import ProjectBoardHeader from '../../components/layout/ProjectBoardHeader'
import { useParams } from 'react-router-dom'
const HomeLayout = ({children}) => {
    const {teamId, id: legacyTeamId} = useParams();
    const effectiveTeamId = teamId || legacyTeamId
    console.log(effectiveTeamId)
    return (
        <main className="relative">
        <ProjectBoardHeader/>
            <div className="flex">
                <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pd-14 sm:px-14">
                    <div className="w-full">
                        <MeetingHomePage teamId={effectiveTeamId}/>
                    </div>
                </section>
            </div>
            {children}
        </main>
    )
}
export default HomeLayout