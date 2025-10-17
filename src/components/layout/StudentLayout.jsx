import React, { useMemo } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  HomeIcon,
  SparklesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import AppShell from './AppShell';
import usePrimaryHeaderConfig from './usePrimaryHeaderConfig.jsx';
import logo from '../../assets/logov1.png';

const StudentLayout = ({ children }) => {
  const headerConfig = usePrimaryHeaderConfig();

  const sidebarBrand = useMemo(
    () => ({
      title: 'CollabSphere',
      subtitle: 'Student hub',
      to: '/student',
      logo,
    }),
    [],
  );

  const sidebarSections = useMemo(
    () => [
      {
        title: 'Navigation',
        items: [
          {
            label: 'Overview',
            href: '/student/home',
            icon: HomeIcon,
          },
          {
            label: 'My Classes',
            href: '/student/classes',
            icon: ClockIcon,
            match: path => path.startsWith('/student/classes'),
          },
          {
            label: 'My Projects',
            href: '/student/projects',
            icon: SparklesIcon,
            match: path => path.startsWith('/student/projects'),
          },
          {
            label: 'Team space',
            href: '/student/team',
            icon: UsersIcon,
            match: path => path.startsWith('/student/team'),
          },
          {
            label: 'Calendar',
            href: '/student/calendar',
            icon: CalendarDaysIcon,
            match: path => path.startsWith('/student/calendar'),
          },
        ],
      },
    ],
    [],
  );
  return (
    <AppShell
      brand={sidebarBrand}
      sidebarSections={sidebarSections}
      headerNavLinks={headerConfig.navLinks}
      headerActions={headerConfig.actions}
      headerDesktopRightContent={headerConfig.desktopRightContent}
      headerMobileMenuContent={headerConfig.mobileMenuContent}
    >
      <div className='min-h-screen bg-slate-50 px-4 py-6 md:px-6 lg:px-8'>{children}</div>
    </AppShell>
  );
};

export default StudentLayout;
