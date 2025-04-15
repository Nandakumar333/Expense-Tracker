import React, { useState, useEffect } from 'react';
import './PrivacyFilter.css';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface PrivacyFilterProps {
  children: React.ReactNode;
  type: 'amount' | 'account' | 'note' | 'balance';
  showToggle?: boolean;
}

interface PrivacySettings {
  amount?: boolean;
  account?: boolean;
  note?: boolean;
  balance?: boolean;
}

const PrivacyFilter: React.FC<PrivacyFilterProps> = ({ 
  children, 
  type,
  showToggle = false 
}) => {
  const { settings } = useUnifiedSettings();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Sync with global privacy settings
    if (settings?.privacyMode) {
      const privacySettings: PrivacySettings = settings.privacySettings || {};
      setIsVisible(!privacySettings[type]);
    } else {
      setIsVisible(true);
    }
  }, [settings?.privacyMode, settings?.privacySettings, type]);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  if (!settings?.privacyMode) {
    return <>{children}</>;
  }

  return (
    <span className={`privacy-filter-container theme-${settings?.theme ?? 'light'}`}>
      <span className={`privacy-filter ${!isVisible ? 'blurred' : ''}`}>
        {children}
      </span>
      {showToggle && (
        <button
          className="privacy-toggle"
          onClick={toggleVisibility}
          title={isVisible ? 'Hide' : 'Show'}
        >
          <i className={`bi bi-eye${isVisible ? '' : '-slash'}`} />
        </button>
      )}
    </span>
  );
};

export default PrivacyFilter;