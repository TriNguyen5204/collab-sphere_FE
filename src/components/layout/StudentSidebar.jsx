import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Archive, User, School, Sparkles, GitBranch } from 'lucide-react';
import AppSidebar from './AppSidebar';

const StudentSidebar = () => {
    const location = useLocation();
    const userId = useSelector(state => state.user.userId);
    const profileHref = userId ? `/${userId}/profile` : '/student/profile';
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
                label: 'AI PR Analysis',
                href: '/student/ai/pr-analysis',
                icon: Sparkles,
                match: path => path.startsWith('/student/ai/pr-analysis'),
            },
        ],
        [profileHref],
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
            activeItemClassName="bg-orangeFpt-50/60 text-orangeFpt-600 font-semibold shadow-inner"
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
