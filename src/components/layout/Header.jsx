import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AppHeader from './AppHeader';
import usePrimaryHeaderConfig from './usePrimaryHeaderConfig.jsx';
import ReportSystemModal from '../../features/student/components/ReportSystemModal';

const Header = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const { userId } = useSelector(state => state.user);
  
  const { brand, navLinks, actions, desktopRightContent, mobileMenuContent } = usePrimaryHeaderConfig({
    onOpenReport: () => setShowReportModal(true)
  });

  return (
    <>
      <AppHeader
        brand={brand}
        navLinks={navLinks}
        actions={actions}
        desktopRightContent={desktopRightContent}
        mobileMenuContent={mobileMenuContent}
      />
      <ReportSystemModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={userId}
      />
    </>
  );
};

export default Header;
