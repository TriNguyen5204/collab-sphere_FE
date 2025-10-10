import AppHeader from './AppHeader';
import usePrimaryHeaderConfig from './usePrimaryHeaderConfig.jsx';

const Header = () => {
  const { brand, navLinks, actions, desktopRightContent, mobileMenuContent } = usePrimaryHeaderConfig();

  return (
    <AppHeader
      brand={brand}
      navLinks={navLinks}
      actions={actions}
      desktopRightContent={desktopRightContent}
      mobileMenuContent={mobileMenuContent}
    />
  );
};

export default Header;
