import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Archive, User, School } from 'lucide-react';
import AppSidebar from './AppSidebar';

const StudentSidebar = () => {
    const location = useLocation();
    const navItems = useMemo(
        () => [
            {
                label: 'Overview',
                href: '/student',
                icon: Home,
                match: path => path === '/student' || path === '/student/home',
            },
            {
                label: 'Projects',
                href: '/student/projects',
                icon: Archive,
                match: path => path.startsWith('/student/projects'),
            },
            {
                label: 'Classes',
                href: '/student/classes',
                icon: School,
                match: path => path.startsWith('/student/classes'),
            },
            {
                label: 'Profile',
                href: '/student/profile',
                icon: User,
                match: path => path.startsWith('/student/profile'),
            },
        ],
        [],
    );

    return (
        <AppSidebar
            brand={{ title: 'Student hub', subtitle: 'CollabSphere', to: '/student' }}
            sections={[
                {
                    title: 'Navigate',
                    items: navItems.map(item => ({
                        ...item,
                        match: path => (item.match ? item.match(path) : path === item.href),
                    })),
                },
            ]}
            expanded
            mode='inline'
            className='h-full w-64 border-r border-slate-200 bg-white'
        />
    );
};

export default StudentSidebar;