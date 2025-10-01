import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import ClassManagementDashboard from '../pages/lecturer/ClassManagementDashboard';
import ClassDetailPage from '../pages/lecturer/ClassDetailPage';
import ClassProjectOverview from '../pages/lecturer/ClassProjectOverview';
import TeamProjectDetail from '../pages/lecturer/TeamProjectDetail';
import CreateProject from '../pages/lecturer/CreateProject';
import ModuleLibrary from '../pages/lecturer/ModuleLibrary';
import ModuleDetail from '../pages/lecturer/ModuleDetail';
import ModuleAnalysis from '../pages/lecturer/ModuleAnalysis';
import LecturerMonitoringDashboard from '../pages/lecturer/LecturerMonitoringDashboard';
// Academic role imports
import AcademicList from '../pages/academic/AcademicList';
import AcademicDetail from '../pages/academic/AcademicDetail';
import AcademicCreate from '../pages/academic/AcademicCreate';
import ProjectApprovals from '../pages/academic/ProjectApprovals';
//Student role imports
import StudentHomePage from '../pages/student/StudentHomepage';
import StudentProjectPage from '../pages/student/StudentProjectPage';
import ProjectHomePage from '../pages/student/project/ProjectHomePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/lecturer/classes',
    element: <ClassManagementDashboard />,
  },
  {
    path: '/lecturer/classes/:classId',
    element: <ClassDetailPage />,
  },
  {
    path: '/lecturer/classes/:classId/projects',
    element: <ClassProjectOverview />,
  },
  {
    path: '/lecturer/classes/:classId/projects/:projectId',
    element: <TeamProjectDetail />,
  },
  {
    path: '/lecturer/create-project',
    element: <CreateProject />,
  },
  {
    path: '/lecturer/classes/:classId/create-project',
    element: <CreateProject />,
  },
  {
    path: '/lecturer/modules',
    element: <ModuleLibrary />,
  },
  {
    path: '/lecturer/modules/create',
    element: <CreateProject />,
  },
  {
    path: '/lecturer/modules/upload',
    element: <CreateProject />,
  },
  {
    path: '/lecturer/modules/:moduleId',
    element: <ModuleDetail />,
  },
  {
    path: '/lecturer/modules/:moduleId/edit',
    element: <ModuleDetail />,
  },
  {
    path: '/lecturer/modules/:moduleId/analysis',
    element: <ModuleAnalysis />,
  },
  {
    path: '/lecturer/monitoring/:classId',
    element: <LecturerMonitoringDashboard />,
  },
  {
    path: '/lecturer/monitoring',
    element: <LecturerMonitoringDashboard />,
  },
  // Academic role routes
  {
    path: '/academic',
    element: <AcademicList />,
  },
  {
    path: '/academic/create',
    element: <AcademicCreate />,
  },
  {
    path: '/academic/:id',
    element: <AcademicDetail />,
  },
  {
    path: '/academic/project-approvals',
    element: <ProjectApprovals />,
  },
  // Student role routes
  {
    path: '/student/home',
    element: <StudentHomePage />,
  },
  {
    path: '/student/projects',
    element: <StudentProjectPage />,
  },
  {
    path: '/student/project/:id',
    element: <ProjectHomePage />,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;