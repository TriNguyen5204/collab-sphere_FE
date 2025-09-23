import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './DashboardLayout.module.css';
import { 
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Overview', href: '/lecturer', icon: HomeIcon },
    { name: 'Classes', href: '/lecturer/classes', icon: AcademicCapIcon },
    { name: 'Topics Library', href: '/lecturer/topics', icon: BookOpenIcon },
    { name: 'Projects', href: '/lecturer/projects', icon: UserGroupIcon },
    { name: 'Grading', href: '/lecturer/grading', icon: ClipboardDocumentListIcon },
    { name: 'Analytics', href: '/lecturer/analytics', icon: ChartBarIcon },
    { name: 'Meetings', href: '/lecturer/meetings', icon: CalendarDaysIcon },
    { name: 'Tools', href: '/lecturer/tools', icon: WrenchScrewdriverIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoContent}>
            <div className={styles.logoIcon}>
              <div className={styles.logoIconInner}></div>
            </div>
            <span className={styles.logoText}>CollabSphere</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <p className={styles.navTitle}>Navigation</p>
            <div className={styles.navList}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                  >
                    <Icon className={styles.navIcon} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerBg}></div>
          
          <div className={styles.headerContent}>
            {/* Search Bar */}
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchBg}></div>
                <div className="relative">
                  <MagnifyingGlassIcon className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className={styles.searchInput}
                  />
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className={styles.actions}>
              {/* Quick Add Button */}
              <button className={styles.quickAddBtn}>
                <div className={styles.quickAddContent}>
                  <PlusIcon className={styles.quickAddIcon} />
                  Quick Add
                </div>
              </button>
              
              {/* Notification Button */}
              <div className="relative">
                <button className={styles.notificationBtn}>
                  <BellIcon className={styles.notificationIcon} />
                  <span className={styles.notificationBadge}>3</span>
                </button>
              </div>

              {/* Profile Avatar */}
              <div className={styles.profileSection}>
                <div className={styles.profileBorder}></div>
                <button className={styles.profileBtn}>
                  <div className={styles.profileAvatar}>L</div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;