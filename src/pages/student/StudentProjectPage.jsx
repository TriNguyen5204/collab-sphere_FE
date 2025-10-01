import React from 'react'
import StudentSidebar from '../../components/layout/StudentSidebar'
import Header from '../../components/layout/Header'

const StudentProjectPage = () => {
  return (
    <>
      <Header />
      <div className="flex min-h-screen" style={{ backgroundColor: '#D5DADF' }}>
        {/* Sidebar Navigation */}
        <StudentSidebar />
        {/* Main Content */}
        <main className="flex-1 p-6">

        </main>
      </div>
    </>
  )
}

export default StudentProjectPage