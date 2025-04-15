import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from './SettingsContext';

interface ThemeContextType {
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // Apply theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${settings.theme}`);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        settings.theme === 'dark' ? '#1a1d21' : '#ffffff'
      );
    }
  }, [settings?.theme]);

  if (!settings) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme: settings.theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};