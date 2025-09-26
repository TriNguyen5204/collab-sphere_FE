import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  BellIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);

  const navigationItems = [
    { name: 'Classes', href: '/lecturer/classes', icon: AcademicCapIcon },
    { name: 'Module Library', href: '/lecturer/modules', icon: BookOpenIcon },
    { name: 'Projects', href: '/lecturer/projects', icon: UserGroupIcon },
    { name: 'Grading', href: '/lecturer/grading', icon: ClipboardDocumentListIcon },
    { name: 'Analytics', href: '/lecturer/analytics', icon: ChartBarIcon },
    { name: 'Meetings', href: '/lecturer/meetings', icon: CalendarDaysIcon },
    { name: 'Tools', href: '/lecturer/tools', icon: WrenchScrewdriverIcon },
  ];

  const isActive = (href) => location.pathname === href;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced sidebar handlers to prevent lag and rapid toggling
  const handleSidebarMouseEnter = useCallback(() => {
    if (!isMobile) {
      // Clear any pending collapse timeout
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }
      
      // Clear any pending expand timeout to prevent duplicates
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current);
        expandTimeoutRef.current = null;
      }
      
      // Add small delay to prevent accidental triggers
      expandTimeoutRef.current = setTimeout(() => {
        setSidebarExpanded(true);
      }, 50);
    }
  }, [isMobile]);

  const handleSidebarMouseLeave = useCallback(() => {
    if (!isMobile) {
      // Clear any pending expand timeout
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current);
        expandTimeoutRef.current = null;
      }
      
      // Clear any pending collapse timeout to prevent duplicates
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
        collapseTimeoutRef.current = null;
      }
      
      // Add delay to prevent accidental collapse when moving to child elements
      collapseTimeoutRef.current = setTimeout(() => {
        setSidebarExpanded(false);
      }, 150);
    }
  }, [isMobile]);

  const handleMobileToggle = useCallback(() => {
    if (isMobile) {
      setSidebarExpanded(!sidebarExpanded);
    }
  }, [isMobile, sidebarExpanded]);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    }
  }, [isMobile]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    };
  }, []);

  return (
    <div className={styles.layout}>
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarExpanded && (
        <div className={styles.sidebarOverlay} onClick={closeMobileSidebar} />
      )}

      {/* Sidebar */}
      <div 
        className={`${styles.sidebar} ${!sidebarExpanded ? styles.sidebarCollapsed : ''}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <div className={styles.navList}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                    onClick={closeMobileSidebar}
                    title={!sidebarExpanded ? item.name : ''}
                  >
                    <Icon className={styles.navIcon} />
                    <span className={styles.navText}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`${styles.main} ${!sidebarExpanded ? styles.mainExpanded : ''}`}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.headerBg}></div>
          
          <div className={styles.headerContent}>
            {/* Logo and Mobile Menu Button */}
            <div className={styles.headerLeft}>
              {isMobile && (
                <button 
                  onClick={handleMobileToggle}
                  className={styles.menuButton}
                  aria-label={sidebarExpanded ? 'Close sidebar' : 'Open sidebar'}
                >
                  {sidebarExpanded ? (
                    <XMarkIcon className={styles.menuIcon} />
                  ) : (
                    <Bars3Icon className={styles.menuIcon} />
                  )}
                </button>
              )}
              
              <div className={styles.headerLogo}>
                <div className={styles.headerLogoIcon}>
                  <div className={styles.headerLogoIconInner}></div>
                </div>
                <span className={styles.headerLogoText}>CollabSphere</span>
              </div>
            </div>

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