// import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MeetingHomePage from './MeetingHomePage'
const HomeLayout = ({children}) => {
    return (
        <main className="relative">
            {/* <Navbar/> */}
            <div className="flex">
                <Sidebar/>
                <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-28 max-md:pd-14 sm:px-14">
                    <div className="w-full">
                        <MeetingHomePage/>
                    </div>
                </section>
            </div>
            {children}
        </main>
    )
}
export default HomeLayout