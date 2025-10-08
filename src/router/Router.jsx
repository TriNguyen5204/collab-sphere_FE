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
import AcademicList from '../pages/academic/AcademicList';
import AcademicDetail from '../pages/academic/AcademicDetail';
import AcademicCreate from '../pages/academic/AcademicCreate';
import StaffPage from '../pages/staff/StaffPage';
import LecturerListStaff from '../pages/staff/LecturerListStaff';
import ClassListStaff from '../pages/staff/ClassListStaff';
import ClassDetail from '../pages/staff/ClassDetail';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ConnectRoom from '../test/ConnectRoom';
import VideoRoom from '../test/VideoRoom';
import ProjectApprovals from '../pages/academic/ProjectApprovals';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AccountManagement from '../pages/admin/AccountManagement';
import SystemReport from '../pages/admin/SystemReport';
import DepartmentDashboard from '../pages/headDepartment/Dashboard';
import SubjectManagement from '../pages/headDepartment/SubjectAndSyllabusManagement';
import MilestonePage from '../pages/student/project/MilestonePage';
import CheckpointPage from '../pages/student/project/CheckpointPage';
import PeerEvaluationPage from '../pages/student/project/PeerEvaluationPage';
//Student role imports
import StudentHomePage from '../pages/student/StudentHomepage';
import StudentProjectPage from '../pages/student/StudentProjectPage';
import ProjectBoard from '../pages/student/project/ProjectBoard';
import TestKanbanBoard from '../pages/TestKanbanBoard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentClassPage from '../pages/student/StudentClassPage';
import TeamWorkspace from '../pages/student/project/TeamWorkspace';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login', 
    element: <LoginPage />
  },
  {
    path: '/register', 
    element: <RegisterPage />
  },
  // student
  {
    path: '/student',
    element: <StudentHomePage />,
  },
  {
    path: '/student/projects',
    element: <StudentProjectPage />,
  },
  {
    path: '/student/classes',
    element: <StudentClassPage />,
  },
  {
    path: '/student/profile',
    element: <StudentProfile />,
  },
  {
    path: '/student/project/:id/:projectName',
    element: <ProjectBoard />,
  },
  {
    path: '/student/project/:id/:projectName/milestones',
    element: <MilestonePage />,
  },
  {
    path: '/student/project/:id/:projectName/checkpoints',
    element: <CheckpointPage />,
  },
  {
    path: '/student/project/:id/:projectName/peer-evaluation',
    element: <PeerEvaluationPage />,
  },
  {
    path: '/student/project/:id/:projectName/team-workspace',
    element: <TeamWorkspace />,
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
  {
    path: '/staff',
    element: <StaffPage />,
  },
  {
    path: '/academic',
    element: <AcademicList />,
  },
  {
    path: '/academic/new',
    element: <AcademicCreate />,
  },
  {
    path: '/academic/:id',
    element: <AcademicDetail />,
  },
  {
    path: '/staff/lecturers',
    element: <LecturerListStaff />,
  },
  {
    path: '/staff/classes',
    element: <ClassListStaff />,
  },
  {
    path: '/staff/classes/:classId',
    element: <ClassDetail />,
  },
  {
    path: '/room',
    element: <ConnectRoom />,
  },
  {
    path: '/room/:roomId',
    element: <VideoRoom />,
  },
  // {
  //   path: '/academic/project-approvals',
  //   element: <ProjectApprovals />,
  // },
  //admin
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/account-management',
    element: <AccountManagement />,
  },
  {
    path: '/admin/reports',
    element: <SystemReport />,
  },
  //head of department
  {
    path: '/head-department',
    element: <DepartmentDashboard />,
  },
  {
    path: '/head-department/subject-management',
    element: <SubjectManagement />,
  },
  {
    path: '/head-department/syllabus-management',
  },
  {
    path: '/test/kanban',
    element: <TestKanbanBoard />,
  },
  {
    path: '/test/kanban',
    element: <TestKanbanBoard />,
  },
  {
    path: '/academic/project-approvals',
    element: <ProjectApprovals />,
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;