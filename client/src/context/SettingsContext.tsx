import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings } from '../common/types';
import { SettingsService } from '../services/SettingsService';

interface SettingsContextType {
  settings: UserSettings | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateSetting: (setting: keyof UserSettings, value: any) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  formatNumber: (num: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const settingsService = SettingsService.getInstance();

  useEffect(() => {
    const userSettings = settingsService.getSettings();
    setSettings(userSettings);
  }, []);

  const updateSetting = (setting: keyof UserSettings, value: any) => {
    if (!settings) return;
    settingsService.updateSetting({ setting, value });
    setSettings({ ...settings, [setting]: value });
  };

  const formatCurrency = (amount: number): string => {
    if (!settings) return amount.toString();
    
    const formatter = new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency,
    });
    
    return formatter.format(amount);
  };

  const formatDate = (date: string): string => {
    if (!settings) return date;
    
    return new Date(date).toLocaleDateString(settings.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: settings.timeZone
    });
  };

  const formatNumber = (num: number): string => {
    if (!settings) return num.toString();
    
    const formatter = new Intl.NumberFormat(settings.language, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    
    return formatter.format(num);
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings: async (newSettings: Partial<UserSettings>) => {
        await settingsService.updateSettings(newSettings);
        setSettings({ ...settings, ...newSettings });
      },
      updateSetting,
      formatCurrency,
      formatDate,
      formatNumber
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};