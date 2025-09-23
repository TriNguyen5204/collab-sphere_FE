import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import ClassManagementDashboard from '../pages/lecturer/ClassManagementDashboard';
import ClassDetailPage from '../pages/lecturer/ClassDetailPage';
import ClassProjectOverview from '../pages/lecturer/ClassProjectOverview';
import QuickAccess from '../pages/QuickAccess';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/quick-access',
    element: <QuickAccess />,
  },
  {
    path: '/lecturer',
    element: <ClassManagementDashboard />,
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
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;