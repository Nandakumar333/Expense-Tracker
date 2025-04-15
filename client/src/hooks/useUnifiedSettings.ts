import { useCallback, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useSettingsUtils } from './useSettingsUtils';
import { SettingsSync } from '../services/SettingsSync';
import { UserSettings } from '../common/types';

export const useUnifiedSettings = () => {
  const { settings, updateSettings: contextUpdateSettings } = useSettings();
  const settingsUtils = useSettingsUtils();
  const settingsSync = SettingsSync.getInstance();

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    await contextUpdateSettings(newSettings);
    await settingsSync.pushChanges(newSettings);
  }, [contextUpdateSettings]);

  const updateSetting = useCallback(async (setting: keyof UserSettings, value: any) => {
    await updateSettings({ [setting]: value });
  }, [updateSettings]);

  const resetToDefaults = useCallback(async () => {
    const defaultSettings: UserSettings = {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      numberFormat: 'comma',
      dateFormat: 'MM/DD/YYYY',
      weekStartDay: 'sunday',
      budgetAlertThreshold: 80,
      dashboardRefreshRate: 5,
      backupFrequency: 'weekly',
      privacyMode: false,
      notificationsEnabled: true,
      browserNotifications: false,
      emailNotifications: false,
      autoDismissNotifications: true,
      notificationDismissDelay: 5000,
      notificationPosition: 'top-end',
      keyboardShortcutsEnabled: true,
      categorySortOrder: 'alphabetical',
      savingsGoal: 5000,
      defaultTransactionType: 'expense',
      expenseReminderDays: 3,
      version: '1.0',
      lastModified: {},
      exportFormat: 'json',
      privacySettings: {}
    };

    await updateSettings(defaultSettings);
  }, [updateSettings]);

  const resetSettings = useCallback(async () => {
    await resetToDefaults();
    return true;
  }, [resetToDefaults]);

  const exportSettings = useCallback(() => {
    if (!settings) return JSON.stringify({});
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const newSettings = JSON.parse(text);
      await updateSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }, [updateSettings]);

  // Sync settings on mount and handle conflicts
  useEffect(() => {
    const loadServerSettings = async () => {
      try {
        const serverSettings = await settingsSync.pullSettings();
        if (serverSettings) {
          updateSettings(serverSettings);
        }
      } catch (error) {
        console.error('Failed to load server settings:', error);
      }
    };

    loadServerSettings();
  }, [updateSettings]);

  return {
    ...settingsUtils,
    settings,
    updateSettings,
    updateSetting,
    resetSettings,
    resetToDefaults,
    exportSettings,
    importSettings
  };
};