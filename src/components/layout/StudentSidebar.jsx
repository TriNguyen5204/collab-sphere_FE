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
                match: path => path === '/student',
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
            showBrand={false}
            style={{
                ['--bg-card']: 'transparent',
                ['--border-color']: 'transparent',
                ['--bg-secondary']: 'rgb(226 232 240)',
                boxShadow: 'none',
            }}
            itemClassName="rounded-md px-3"
            activeItemClassName="bg-blue-200 border border-blue-500"
            sections={[
                {
                    items: navItems.map(item => ({
                        ...item,
                        match: path => (item.match ? item.match(path) : path === item.href),
                    })),
                },
            ]}
            expanded
            mode='inline'
        />
    );
};

export default StudentSidebar;