import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import StudentProjectSideBar from '../../../components/layout/StudentProjectSideBar';

const ProjectHomePage = () => {
  const { id } = useParams();

  return (
    <>
        <Header />
        <div className="flex min-h-screen" style={{ backgroundColor: '#D5DADF' }}>
          {/* Sidebar Navigation */}
            <StudentProjectSideBar />
          {/* Main Content */}
          <main className="flex-1 p-6">
            Project Home Page for Project ID: {id}
          </main>
        </div>
    </>
  )
}

export default ProjectHomePage;