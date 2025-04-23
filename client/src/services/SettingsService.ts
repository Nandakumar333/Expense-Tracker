import { UserSettings, SettingsUpdateRequest } from '../common/types';
import { BaseRepository } from '../data/repositories/BaseRepository';

export class SettingsService extends BaseRepository<UserSettings> {
  private static instance: SettingsService;
  private readonly VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
  private readonly VALID_LANGUAGES = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'];
  private readonly VALID_THEMES = ['light', 'dark', 'system'];

  constructor() {
    super('user-settings');
    this.initializeDefaultSettings();
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  getSettings(): UserSettings {
    try {
      return this.getAll()[0] || this.getDefaultSettings();
    } catch (error) {
      console.error('Error retrieving settings:', error);
      return this.getDefaultSettings();
    }
  }

updateSettings(settings: Partial<UserSettings>, silent: boolean = false): void {
    try {
        const currentSettings = this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...settings,
            lastModified: {
                ...currentSettings.lastModified,
                ...Object.keys(settings).reduce((acc, key) => ({
                    ...acc,
                    [key]: Date.now()
                }), {})
            }
        };
        this.save([updatedSettings]);
        if (!silent) {
            this.notifySettingsUpdate(updatedSettings);
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        throw new Error('Failed to update settings');
    }
}

  updateSetting(request: SettingsUpdateRequest): void {
    try {
      this.validateSettingUpdate(request);
      const settings = this.getSettings();
      const updatedSettings = {
        ...settings,
        [request.setting]: request.value,
        lastModified: {
          ...settings.lastModified,
          [request.setting]: Date.now()
        }
      };
      this.save([updatedSettings]);
      this.notifySettingsUpdate(updatedSettings);
    } catch (error: unknown) {
      console.error('Error updating setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update setting ${request.setting}: ${errorMessage}`);
    }
  }

  resetToDefaults(): void {
    try {
      const defaultSettings = this.getDefaultSettings();
      this.save([defaultSettings]);
      this.notifySettingsUpdate(defaultSettings);
    } catch (error) {
      console.error('Error resetting settings to defaults:', error);
      throw new Error('Failed to reset settings to defaults');
    }
  }

  private validateSettingUpdate(request: SettingsUpdateRequest): void {
    const { setting, value } = request;
    
    switch (setting) {
      case 'currency':
        if (!this.VALID_CURRENCIES.includes(value as string)) {
          throw new Error(`Invalid currency. Must be one of: ${this.VALID_CURRENCIES.join(', ')}`);
        }
        break;
      case 'language':
        if (!this.VALID_LANGUAGES.includes(value as string)) {
          throw new Error(`Invalid language. Must be one of: ${this.VALID_LANGUAGES.join(', ')}`);
        }
        break;
      case 'theme':
        if (!this.VALID_THEMES.includes(value as string)) {
          throw new Error(`Invalid theme. Must be one of: ${this.VALID_THEMES.join(', ')}`);
        }
        break;
      case 'savingsGoal':
        if (typeof value !== 'number' || value < 0) {
          throw new Error('Savings goal must be a positive number');
        }
        break;
      case 'budgetAlertThreshold':
        if (typeof value !== 'number' || value < 0 || value > 100) {
          throw new Error('Budget alert threshold must be between 0 and 100');
        }
        break;
      case 'notificationDismissDelay':
        if (typeof value !== 'number' || value < 1000 || value > 30000) {
          throw new Error('Notification dismiss delay must be between 1 and 30 seconds');
        }
        break;
      case 'weekStartDay':
        if (!['sunday', 'monday'].includes(value as string)) {
          throw new Error('Week start day must be either "sunday" or "monday"');
        }
        break;
      case 'numberFormat':
        if (!['comma', 'dot', 'space'].includes(value as string)) {
          throw new Error('Number format must be one of: comma, dot, space');
        }
        break;
      case 'dateFormat':
        if (!['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(value as string)) {
          throw new Error('Invalid date format');
        }
        break;
      case 'notificationPosition':
        if (!['top-start', 'top-end', 'bottom-start', 'bottom-end'].includes(value as string)) {
          throw new Error('Invalid notification position');
        }
        break;
      case 'backupFrequency':
        if (!['never', 'daily', 'weekly', 'monthly'].includes(value as string)) {
          throw new Error('Invalid backup frequency');
        }
        break;
    }
  }

  private notifySettingsUpdate(settings: UserSettings): void {
    document.dispatchEvent(new CustomEvent('settings-updated', {
      detail: { settings }
    }));
  }

  private initializeDefaultSettings(): void {
    if (this.getAll().length === 0) {
      this.save([this.getDefaultSettings()]);
    }
  }

  private getDefaultSettings(): UserSettings {
    return {
      privacySettings: {},
      browserNotifications: true,
      version: '1.0.0',
      lastModified: new Date(),
      currency: 'USD',
      language: 'en-US',
      theme: 'light',
      savingsGoal: 0,
      notificationsEnabled: true,
      emailNotifications: false,
      budgetAlertThreshold: 80,
      dateFormat: 'MM/DD/YYYY',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekStartDay: 'sunday',
      numberFormat: 'comma',
      defaultTransactionType: 'expense',
      dashboardRefreshRate: 300000,
      exportFormat: 'csv',
      backupFrequency: 'never',
      privacyMode: false,
      categorySortOrder: 'alphabetical',
      expenseReminderDays: 3,
      autoDismissNotifications: true,
      notificationDismissDelay: 5000,
      notificationPosition: 'bottom-end',
      keyboardShortcutsEnabled: true
    };
  }

  public isValidCurrency(currency: string): boolean {
    return this.VALID_CURRENCIES.includes(currency);
  }

  public isValidLanguage(language: string): boolean {
    return this.VALID_LANGUAGES.includes(language);
  }

  public isValidTheme(theme: string): boolean {
    return this.VALID_THEMES.includes(theme);
  }

  public getValidCurrencies(): string[] {
    return [...this.VALID_CURRENCIES];
  }

  public getValidLanguages(): string[] {
    return [...this.VALID_LANGUAGES];
  }

  public getValidThemes(): string[] {
    return [...this.VALID_THEMES];
  }
}