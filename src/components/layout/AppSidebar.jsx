import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './DashboardLayout.module.css';

const defaultBrand = {
  title: 'CollabSphere',
  subtitle: 'Workspace',
  to: '/',
};

const AppSidebar = ({
  brand = defaultBrand,
  sections = [],
  expanded = true,
  onMouseEnter,
  onMouseLeave,
  mode = 'overlay',
  onNavigate,
  topSlot,
  footerSlot,
  className,
  showBrand = true,
  style,
  itemClassName,
  activeItemClassName,
}) => {
  const normalizePath = path => {
    if (!path) return '/';
    const trimmed = path.replace(/\/+$/, '');
    return trimmed.length ? trimmed : '/';
  };
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);
  const effectiveSections = sections.length ? sections : [{ items: [] }];
  const collapsed = !expanded;

  return (
    <div
      className={clsx(
        styles.sidebar,
        collapsed && styles.sidebarCollapsed,
        mode === 'inline' && styles.sidebarInline,
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      {showBrand && (
        <div className={styles.logo}>
          {brand.to ? (
            <Link to={brand.to} className={styles.logoContent}>
              {brand.logo ? (
                <img src={brand.logo} alt={brand.title} className={styles.logoImage} />
              ) : (
                <div className={styles.logoIcon}>
                  <div className={styles.logoIconInner}></div>
                </div>
              )}
              <div className={styles.logoTextGroup}>
                <span className={styles.logoText}>{brand.title}</span>
                {brand.subtitle && <span className={styles.logoSubtitle}>{brand.subtitle}</span>}
              </div>
            </Link>
          ) : (
            <div className={styles.logoContent}>
              {brand.logo ? (
                <img src={brand.logo} alt={brand.title} className={styles.logoImage} />
              ) : (
                <div className={styles.logoIcon}>
                  <div className={styles.logoIconInner}></div>
                </div>
              )}
              <div className={styles.logoTextGroup}>
                <span className={styles.logoText}>{brand.title}</span>
                {brand.subtitle && <span className={styles.logoSubtitle}>{brand.subtitle}</span>}
              </div>
            </div>
          )}
        </div>
      )}


      <nav className={styles.navigation}>
        {topSlot && <div>{topSlot}</div>}
        {effectiveSections.map((section, index) => (
          <div key={section.title ?? index} className={styles.navSection}>
            {section.title && <div className={styles.navTitle}>{section.title}</div>}
            <div className={styles.navList}>
              {(section.items ?? []).map(item => {
                const Icon = item.icon;
                const targetHref = normalizePath(item.href);
                const isActive = item.match ? item.match(currentPath) : currentPath === targetHref;
                const linkContent = (
                  <>
                    {Icon && <Icon className={styles.navIcon} />}
                    <span className={styles.navText}>{item.label}</span>
                    {item.badge && expanded && <span className={styles.navBadge}>{item.badge}</span>}
                  </>
                );

                const itemClassName = clsx(styles.navItem, isActive && styles.navItemActive);

                if (item.toExternal) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.target ?? '_blank'}
                      rel={item.rel ?? 'noreferrer'}
                      className={itemClassName}
                      title={!expanded ? item.label : undefined}
                    >
                      {linkContent}
                    </a>
                  );
                }

                const extraItemClasses =
                  typeof itemClassName === 'function' ? itemClassName(item, isActive) : itemClassName;
                const extraActiveClasses =
                  isActive && (typeof activeItemClassName === 'function' ? activeItemClassName(item) : activeItemClassName);

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={clsx(styles.navItem, isActive && 'active', extraItemClasses, extraActiveClasses)}
                    onClick={() => {
                      if (onNavigate) onNavigate(item.href);
                      if (item.onClick) item.onClick(item.href);
                    }}
                    title={!expanded ? item.label : undefined}
                  >
                    {linkContent}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {footerSlot}
    </div>
  );
};

AppSidebar.propTypes = {
  brand: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    to: PropTypes.string,
    logo: PropTypes.string,
    showEmblem: PropTypes.bool,
  }),
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          href: PropTypes.string.isRequired,
          icon: PropTypes.elementType,
          badge: PropTypes.string,
          match: PropTypes.func,
          onClick: PropTypes.func,
          toExternal: PropTypes.bool,
          target: PropTypes.string,
          rel: PropTypes.string,
        }),
      ),
    }),
  ),
  expanded: PropTypes.bool,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  mode: PropTypes.oneOf(['overlay', 'inline']),
  onNavigate: PropTypes.func,
  topSlot: PropTypes.node,
  footerSlot: PropTypes.node,
  className: PropTypes.string,
  itemClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  activeItemClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};

export default AppSidebar;
