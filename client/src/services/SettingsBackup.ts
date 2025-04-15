import { UserSettings } from '../common/types';
import { SettingsService } from './SettingsService';

export class SettingsBackup {
  private static instance: SettingsBackup;
  private settingsService: SettingsService;
  private backupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.settingsService = SettingsService.getInstance();
  }

  static getInstance(): SettingsBackup {
    if (!SettingsBackup.instance) {
      SettingsBackup.instance = new SettingsBackup();
    }
    return SettingsBackup.instance;
  }

  exportSettings(): string {
    const settings = this.settingsService.getSettings();
    const backup = {
      version: '1.1',
      timestamp: new Date().toISOString(),
      settings
    };

    return JSON.stringify(backup, null, 2);
  }

  importSettings(backupString: string): boolean {
    try {
      const backup = JSON.parse(backupString);
      
      // Validate backup format
      if (!backup.version || !backup.settings) {
        throw new Error('Invalid backup format');
      }

      // Version check
      if (!['1.0', '1.1'].includes(backup.version)) {
        throw new Error('Unsupported backup version');
      }

      // Validate settings structure
      this.validateSettings(backup.settings);

      // Import settings
      this.settingsService.updateSettings(backup.settings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  private validateSettings(settings: UserSettings): void {
    const requiredFields = [
      'currency',
      'language',
      'theme',
      'dateFormat',
      'timeZone',
      'weekStartDay',
      'numberFormat',
      'notificationsEnabled',
      'budgetAlertThreshold'
    ];

    for (const field of requiredFields) {
      if (!(field in settings)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate specific field values using SettingsService validators
    if (!this.settingsService.isValidCurrency(settings.currency)) {
      throw new Error('Invalid currency value');
    }

    if (!this.settingsService.isValidLanguage(settings.language)) {
      throw new Error('Invalid language value');
    }

    if (!this.settingsService.isValidTheme(settings.theme)) {
      throw new Error('Invalid theme value');
    }

    if (typeof settings.budgetAlertThreshold !== 'number' || 
        settings.budgetAlertThreshold < 0 || 
        settings.budgetAlertThreshold > 100) {
      throw new Error('Invalid budget alert threshold');
    }

    if (!['sunday', 'monday'].includes(settings.weekStartDay)) {
      throw new Error('Invalid week start day');
    }

    if (!['comma', 'dot', 'space'].includes(settings.numberFormat)) {
      throw new Error('Invalid number format');
    }

    if (!['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(settings.dateFormat)) {
      throw new Error('Invalid date format');
    }
  }

  scheduleBackup(): void {
    const settings = this.settingsService.getSettings();
    if (!settings.backupFrequency || settings.backupFrequency === 'never') {
      if (this.backupInterval) {
        clearInterval(this.backupInterval);
        this.backupInterval = null;
      }
      return;
    }

    const intervals = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const interval = intervals[settings.backupFrequency];
    
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(() => {
      const backup = this.exportSettings();
      this.saveBackup(backup);
    }, interval);
  }

  private saveBackup(backup: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `expense-tracker-settings-${timestamp}.json`;
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}