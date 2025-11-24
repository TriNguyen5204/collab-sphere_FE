import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import styles from './LecturerBreadcrumbs.module.css';

const LecturerBreadcrumbs = ({ items, className, ariaLabel = 'Breadcrumb' }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav className={clsx(styles.wrapper, className)} aria-label={ariaLabel}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const isInteractive = Boolean(item.href) && !isCurrent;
          const key = `${item.label}-${index}`;
          const contentClassName = clsx(
            styles.link,
            isInteractive && styles.interactive,
            isCurrent && styles.current,
            !isInteractive && !isCurrent && styles.static
          );

          const content = isInteractive ? (
            <Link to={item.href} className={contentClassName}>
              {item.label}
            </Link>
          ) : (
            <span className={contentClassName} aria-current={isCurrent ? 'page' : undefined}>
              {item.label}
            </span>
          );

          return (
            <li key={key} className={styles.item}>
              {content}
              {!isCurrent && (
                <span className={styles.separator} aria-hidden="true">
                  <ChevronRightIcon />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

LecturerBreadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ).isRequired,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default LecturerBreadcrumbs;
