import React from 'react';
import { Button } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

const ThemeToggle: React.FC = () => {
  const { settings, updateSetting } = useUnifiedSettings();

  const toggleTheme = () => {
    updateSetting('theme', settings?.theme === 'light' ? 'dark' : 'light');
  };

  if (!settings) return null;

  return (
    <Button
      variant="link"
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <i className={`bi bi-${settings.theme === 'light' ? 'moon' : 'sun'}`} />
    </Button>
  );
};

export default ThemeToggle;