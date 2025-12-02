import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import styles from './DashboardLayout.module.css';

const AppShell = ({
  children,
  brand,
  sidebarSections = [],
  sidebarFooter,
  sidebarTop,
  headerBrand,
  headerNavLinks,
  headerActions,
  headerDesktopRightContent,
  headerMobileMenuContent,
  contentClassName,
  initialSidebarExpanded = false,
  sidebarCollapsible = true,
}) => {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(initialSidebarExpanded);
  const [isMobile, setIsMobile] = useState(false);
  const expandTimeoutRef = useRef(null);
  const collapseTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarExpanded(false);
      } else if (!sidebarCollapsible) {
        setSidebarExpanded(true);
      } else {
        setSidebarExpanded(initialSidebarExpanded);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialSidebarExpanded, sidebarCollapsible]);

  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    } else if (!sidebarCollapsible) {
      setSidebarExpanded(true);
    }
  }, [isMobile, location.pathname, sidebarCollapsible]);

  useEffect(() => {
    return () => {
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    };
  }, []);

  const handleSidebarMouseEnter = useCallback(() => {
    if (isMobile || !sidebarCollapsible) return;
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    expandTimeoutRef.current = setTimeout(() => {
      setSidebarExpanded(true);
    }, 60);
  }, [isMobile, sidebarCollapsible]);

  const handleSidebarMouseLeave = useCallback(() => {
    if (isMobile || !sidebarCollapsible) return;
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = null;
    }
    if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
    collapseTimeoutRef.current = setTimeout(() => {
      setSidebarExpanded(false);
    }, 150);
  }, [isMobile, sidebarCollapsible]);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(prev => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) setSidebarExpanded(false);
  }, [isMobile]);

  const showOverlay = isMobile && sidebarExpanded;
  const mainClassName = clsx(styles.main, {
    [styles.mainExpanded]: !sidebarExpanded && !isMobile,
  });

  const sidebarSectionsMemo = useMemo(() => sidebarSections, [sidebarSections]);

  const hasSidebarBrand = useMemo(() => {
    if (!brand) return false;
    const hasSections = sidebarSectionsMemo.some(
      section => (section.items ?? []).length > 0,
    );
    return Boolean(hasSections || brand.logo || brand.title || brand.subtitle);
  }, [brand, sidebarSectionsMemo]);

  const effectiveHeaderBrand = useMemo(() => {
    if (headerBrand) return headerBrand;
    if (hasSidebarBrand) return undefined;
    return brand;
  }, [brand, headerBrand, hasSidebarBrand]);

  return (
    <div className={styles.layout}>
      {showOverlay && <div className={styles.sidebarOverlay} onClick={closeMobileSidebar} />}

      <AppSidebar
        brand={brand}
        sections={sidebarSectionsMemo}
        expanded={sidebarExpanded}
        onMouseEnter={sidebarCollapsible ? handleSidebarMouseEnter : undefined}
        onMouseLeave={sidebarCollapsible ? handleSidebarMouseLeave : undefined}
        onNavigate={closeMobileSidebar}
        topSlot={sidebarTop}
        footerSlot={sidebarFooter}
        mode='overlay'
      />

      <div className={mainClassName}>
        <AppHeader
          brand={effectiveHeaderBrand}
          navLinks={headerNavLinks}
          actions={headerActions}
          desktopRightContent={headerDesktopRightContent}
          mobileMenuContent={headerMobileMenuContent}
          showSidebarToggle={isMobile}
          sidebarOpen={sidebarExpanded}
          onToggleSidebar={toggleSidebar}
        />

        <main className={clsx(styles.content, contentClassName)}>{children}</main>
      </div>
    </div>
  );
};

AppShell.propTypes = {
  children: PropTypes.node,
  brand: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    to: PropTypes.string,
    logo: PropTypes.string,
    showEmblem: PropTypes.bool,
    showTitle: PropTypes.bool,
    showSubtitle: PropTypes.bool,
  }),
  sidebarSections: PropTypes.array,
  sidebarFooter: PropTypes.node,
  sidebarTop: PropTypes.node,
  headerBrand: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    to: PropTypes.string,
    logo: PropTypes.string,
    showEmblem: PropTypes.bool,
    showTitle: PropTypes.bool,
    showSubtitle: PropTypes.bool,
  }),
  headerNavLinks: PropTypes.array,
  headerActions: PropTypes.array,
  headerDesktopRightContent: PropTypes.node,
  headerMobileMenuContent: PropTypes.node,
  contentClassName: PropTypes.string,
  initialSidebarExpanded: PropTypes.bool,
  sidebarCollapsible: PropTypes.bool,
};

export default AppShell;
