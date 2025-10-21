import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from '../App';

// auth & public pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import Unauthorized from '../pages/errors/Unauthorized';
import NotFound from '../pages/errors/NotFound';

// student pages
import StudentHomePage from '../pages/student/StudentHomePage';
import StudentProjectPage from '../pages/student/StudentProjectPage';
import StudentClassPage from '../pages/student/StudentClassPage';
import StudentProfile from '../pages/student/StudentProfile';
import ProjectBoard from '../pages/student/project/ProjectBoard';
import MilestonePage from '../pages/student/project/MilestonePage';
import CheckpointPage from '../pages/student/project/CheckpointPage';
import PeerEvaluationPage from '../pages/student/project/PeerEvaluationPage';
import TeamWorkspace from '../pages/student/project/TeamWorkspace';
import StudentClassMembersPage from '../pages/student/StudentClassMembersPage';
import StudentClassProjectsPage from '../pages/student/StudentClassProjectsPage';

// lecturer pages
import ClassManagementDashboard from '../pages/lecturer/ClassManagementDashboard';
import ClassDetailPage from '../pages/lecturer/ClassDetailPage';
import ClassProjectOverview from '../pages/lecturer/ClassProjectOverview';
import TeamProjectDetail from '../pages/lecturer/TeamProjectDetail';
import CreateProject from '../pages/lecturer/CreateProject';
import ProjectLibrary from '../pages/lecturer/ProjectLibrary';
import ProjectDetail from '../pages/lecturer/ProjectDetail';
import ProjectAnalysis from '../pages/lecturer/ProjectAnalysis';
import LecturerMonitoringDashboard from '../pages/lecturer/LecturerMonitoringDashboard';
import ClassProjectAssignment from '../pages/lecturer/ClassProjectAssignment';

// academic services (staff) pages
import StaffPage from '../pages/staff/StaffPage';
import AcademicList from '../pages/academic/AcademicList';
import AcademicCreate from '../pages/academic/AcademicCreate';
import AcademicDetail from '../pages/academic/AcademicDetail';
import LecturerListStaff from '../pages/staff/LecturerListStaff';
import ClassListStaff from '../pages/staff/ClassListStaff';
import ClassDetail from '../pages/staff/ClassDetail';


// head department pages
import DepartmentDashboard from '../pages/headDepartment/Dashboard';
import SubjectManagement from '../pages/headDepartment/SubjectAndSyllabusManagement';
import SubjectDetail from '../pages/headDepartment/SubjectDetail';
import ProjectManagement from '../pages/headDepartment/ProjectManagement';
import ProjectApprovals from '../pages/headDepartment/ProjectApprovals';
import PendingProjectDetail from '../pages/headDepartment/PendingProjectDetail';

// admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AccountManagement from '../pages/admin/AccountManagement';
import SystemReport from '../pages/admin/SystemReport';

// misc / sandbox
import ConnectRoom from '../test/ConnectRoom';
import VideoRoom from '../test/VideoRoom';
import TestKanbanBoard from '../pages/TestKanbanBoard';

import RoleProtectedRoute from './RoleProtectedRoute';

const protectRoute = (allowedRoles, element) => (
  <RoleProtectedRoute allowedRoles={allowedRoles}>{element}</RoleProtectedRoute>
);

const publicRoutes = [
  { path: '/', element: <App /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  // { path: '/room', element: <ConnectRoom /> },
  // { path: '/room/:roomId', element: <VideoRoom /> },
  // { path: '/room', element: <RoomJoinPage/>},
  // { path: '/room/:roomId', element: <MeetingRoom/>},
  // { path: '/meeting', element: <WebRTC/> },
  { path: '/test/kanban', element: <TestKanbanBoard /> },
];

const studentRoutes = [
  { path: '/student', element: protectRoute(['STUDENT'], <StudentHomePage />) },
  { path: '/student/projects', element: protectRoute(['STUDENT'], <StudentProjectPage />) },
  { path: '/student/classes', element: protectRoute(['STUDENT'], <StudentClassPage />) },
  { path: '/student/profile', element: protectRoute(['STUDENT'], <StudentProfile />) },
  { path: '/student/project/:id/:projectName', element: protectRoute(['STUDENT'], <ProjectBoard />) },
  { path: '/student/project/:id/:projectName/milestones', element: protectRoute(['STUDENT'], <MilestonePage />) },
  { path: '/student/project/:id/:projectName/checkpoints', element: protectRoute(['STUDENT'], <CheckpointPage />) },
  { path: '/student/project/:id/:projectName/peer-evaluation', element: protectRoute(['STUDENT'], <PeerEvaluationPage />) },
  { path: '/student/project/:id/:projectName/team-workspace', element: protectRoute(['STUDENT'], <TeamWorkspace />) },
  { path: '/student/project/:id/:projectName/class-members', element: protectRoute(['STUDENT'], <StudentClassMembersPage />) },
  { path: '/student/project/:id/:projectName/class-projects', element: protectRoute(['STUDENT'], <StudentClassProjectsPage />) },
];

const lecturerRoutes = [
  { path: '/lecturer/classes', element: protectRoute(['LECTURER'], <ClassManagementDashboard />) },
  { path: '/lecturer/classes/:classId', element: protectRoute(['LECTURER'], <ClassDetailPage />) },
  { path: '/lecturer/classes/:classId/projects', element: protectRoute(['LECTURER'], <ClassProjectOverview />) },
  { path: '/lecturer/classes/:classId/project-assignments', element: protectRoute(['LECTURER'], <ClassProjectAssignment />) },
  { path: '/lecturer/classes/:classId/projects/:projectId', element: protectRoute(['LECTURER'], <TeamProjectDetail />) },
  { path: '/lecturer/create-project', element: protectRoute(['LECTURER'], <CreateProject />) },
  { path: '/lecturer/classes/:classId/create-project', element: protectRoute(['LECTURER'], <CreateProject />) },
  { path: '/lecturer/projects', element: protectRoute(['LECTURER'], <ProjectLibrary />) },
  { path: '/lecturer/projects/create', element: protectRoute(['LECTURER'], <CreateProject />) },
  { path: '/lecturer/projects/upload', element: protectRoute(['LECTURER'], <CreateProject />) },
  { path: '/lecturer/projects/:projectId', element: protectRoute(['LECTURER'], <ProjectDetail />) },
  { path: '/lecturer/projects/:projectId/edit', element: protectRoute(['LECTURER'], <ProjectDetail />) },
  { path: '/lecturer/projects/:projectId/analysis', element: protectRoute(['LECTURER'], <ProjectAnalysis />) },
  { path: '/lecturer/monitoring/:classId', element: protectRoute(['LECTURER'], <LecturerMonitoringDashboard />) },
  { path: '/lecturer/monitoring', element: protectRoute(['LECTURER'], <LecturerMonitoringDashboard />) },
];

const staffRoutes = [
  { path: '/staff', element: protectRoute(['STAFF'], <StaffPage />) },
  { path: '/academic', element: protectRoute(['STAFF'], <AcademicList />) },
  { path: '/academic/new', element: protectRoute(['STAFF'], <AcademicCreate />) },
  { path: '/academic/:id', element: protectRoute(['STAFF'], <AcademicDetail />) },
  { path: '/staff/lecturers', element: protectRoute(['STAFF'], <LecturerListStaff />) },
  { path: '/staff/classes', element: protectRoute(['STAFF'], <ClassListStaff />) },
  { path: '/staff/classes/:classId', element: protectRoute(['STAFF'], <ClassDetail />) },
];

const headDepartmentRoutes = [
  { path: '/head-department', element: protectRoute(['HEAD_DEPARTMENT'], <DepartmentDashboard />) },
  { path: '/head-department/subject-management', element: protectRoute(['HEAD_DEPARTMENT'], <SubjectManagement />) },
  { path: '/head-department/subject-management/:id', element: protectRoute(['HEAD_DEPARTMENT'], <SubjectDetail />) },
  { path: '/head-department/project-approvals', element: protectRoute(['HEAD_DEPARTMENT'], <ProjectApprovals />) },
  { path: '/head-department/project-management', element: protectRoute(['HEAD_DEPARTMENT'], <ProjectManagement />) },
  { path: '/head-department/project-approvals/:id', element: protectRoute(['HEAD_DEPARTMENT'], <PendingProjectDetail/>)}
];

const adminRoutes = [
  { path: '/admin', element: protectRoute(['ADMIN'], <AdminDashboard />) },
  { path: '/admin/account-management', element: protectRoute(['ADMIN'], <AccountManagement />) },
  { path: '/admin/reports', element: protectRoute(['ADMIN'], <SystemReport />) },
];

const fallbackRoutes = [
  { path: '*', element: <NotFound /> },
];

const router = createBrowserRouter([
  ...publicRoutes,
  ...studentRoutes,
  ...lecturerRoutes,
  ...staffRoutes,
  ...headDepartmentRoutes,
  ...adminRoutes,
  ...fallbackRoutes,
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;