import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const actionVariants = {
  subtle:
    'inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600',
  primary:
    'inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500',
  ghost:
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-blue-600',
};

const renderAction = action => {
  const { label, icon: Icon, type = 'button', variant = 'subtle', to, onClick, className, ...rest } = action;
  const content = (
    <>
      {Icon && <Icon className='h-4 w-4' aria-hidden='true' />}
      <span>{label}</span>
    </>
  );

  const baseClass = actionVariants[variant] ?? actionVariants.subtle;
  const combined = clsx(baseClass, className);

  if (type === 'link' && to) {
    return (
      <Link key={label} to={to} className={combined} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button key={label} type='button' onClick={onClick} className={combined} {...rest}>
      {content}
    </button>
  );
};

const AppHeader = ({
  brand,
  navLinks = [],
  actions = [],
  desktopRightContent,
  mobileMenuContent,
  showSidebarToggle = false,
  sidebarOpen = false,
  onToggleSidebar,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerBrand = useMemo(() => {
    if (!brand) return null;
    const {
      to = '/',
      logo,
      title,
      subtitle,
      showEmblem = true,
      showTitle = true,
      showSubtitle = true,
    } = brand;
    return (
      <Link to={to} className='flex items-center gap-3 group'>
        {showEmblem && (
          <div className='relative hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition group-hover:shadow-md sm:flex'>
            {logo ? (
              <img src={logo} alt={title || 'Brand'} className='h-8 w-8 rounded-xl object-cover' />
            ) : (
              <div className='h-6 w-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500' />
            )}
          </div>
        )}
        <div className='flex flex-col'>
          {showTitle && title && (
            <span className='text-base font-semibold text-slate-800 lg:text-lg'>{title}</span>
          )}
          {showSubtitle && subtitle && (
            <span className='text-xs font-medium text-slate-400'>{subtitle}</span>
          )}
        </div>
      </Link>
    );
  }, [brand]);

  const desktopActions = desktopRightContent ?? (
    <div className='hidden items-center gap-3 md:flex'>{actions.map(renderAction)}</div>
  );

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const mobileActionsContent =
    typeof mobileMenuContent === 'function'
      ? mobileMenuContent(closeMobileMenu)
      : mobileMenuContent;

  const mobileActions = mobileActionsContent ?? (
    <div className='space-y-2 pt-3'>{actions.map(action => renderAction({ ...action, className: 'w-full justify-center' }))}</div>
  );

  return (
    <header className={clsx('sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur', className)}>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-2 sm:gap-3'>
          {showSidebarToggle && (
            <button
              type='button'
              onClick={onToggleSidebar}
              className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-400 hover:text-blue-600 hover:shadow-md lg:hidden'
              aria-label='Toggle sidebar'
            >
              {sidebarOpen ? <XMarkIcon className='h-5 w-5' /> : <Bars3Icon className='h-5 w-5' />}
            </button>
          )}
          {headerBrand}
        </div>

        <nav className='hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex'>
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.href}
              className='group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:text-blue-600'
            >
              {link.icon && <link.icon className='h-4 w-4' />}
              <span>{link.label}</span>
              <span className='absolute bottom-0 left-1/2 hidden h-1 w-0 -translate-x-1/2 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-full md:group-hover:block'></span>
            </Link>
          ))}
        </nav>

        {desktopActions}

        <button
          type='button'
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-400 hover:text-blue-600 hover:shadow-md md:hidden'
          aria-label='Toggle navigation'
        >
          {mobileMenuOpen ? <XMarkIcon className='h-5 w-5' /> : <Bars3Icon className='h-5 w-5' />}
        </button>
      </div>

      <div
        className={clsx(
          'md:hidden transition-all duration-300 ease-in-out',
          {
            'max-h-96 opacity-100': mobileMenuOpen,
            'pointer-events-none max-h-0 opacity-0': !mobileMenuOpen,
          },
        )}
      >
        <div className='space-y-2 px-4 py-4'>
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.href}
              onClick={closeMobileMenu}
              className='flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-600'
            >
              {link.icon && <link.icon className='h-4 w-4' />}
              <span>{link.label}</span>
            </Link>
          ))}

          {mobileActions}
        </div>
      </div>
    </header>
  );
};

AppHeader.propTypes = {
  brand: PropTypes.shape({
    to: PropTypes.string,
    logo: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showEmblem: PropTypes.bool,
    showTitle: PropTypes.bool,
    showSubtitle: PropTypes.bool,
  }),
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    }),
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
      type: PropTypes.oneOf(['button', 'link']),
      variant: PropTypes.oneOf(['subtle', 'primary', 'ghost']),
      to: PropTypes.string,
      onClick: PropTypes.func,
      className: PropTypes.string,
    }),
  ),
  desktopRightContent: PropTypes.node,
  mobileMenuContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  showSidebarToggle: PropTypes.bool,
  sidebarOpen: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
  className: PropTypes.string,
};

export default AppHeader;
