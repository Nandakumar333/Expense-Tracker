import { UserSettings } from '../common/types';
import { SettingsService } from './SettingsService';

interface MigrationStep {
  version: string;
  migrate: (settings: UserSettings) => UserSettings;
}

export class SettingsMigration {
  private static instance: SettingsMigration;
  private settingsService: SettingsService;
  private currentVersion = '1.2';
  
  private migrations: MigrationStep[] = [
    {
      version: '1.0',
      migrate: (settings: UserSettings) => {
        // Add default values for v1.0 settings
        return {
          ...settings,
          weekStartDay: settings.weekStartDay || 'monday',
          numberFormat: settings.numberFormat || 'comma',
          defaultTransactionType: settings.defaultTransactionType || 'expense',
          version: '1.0'
        };
      }
    },
    {
      version: '1.1',
      migrate: (settings: UserSettings) => {
        // Add new v1.1 settings
        return {
          ...settings,
          dashboardRefreshRate: settings.dashboardRefreshRate || 5,
          exportFormat: settings.exportFormat || 'csv',
          backupFrequency: settings.backupFrequency || 'never',
          privacyMode: settings.privacyMode || false,
          categorySortOrder: settings.categorySortOrder || 'alphabetical',
          version: '1.1'
        };
      }
    },
    {
      version: '1.2',
      migrate: (settings: UserSettings) => {
        // Add new v1.2 settings for enhanced notifications and keyboard shortcuts
        return {
          ...settings,
          keyboardShortcutsEnabled: settings.keyboardShortcutsEnabled ?? true,
          autoDismissNotifications: settings.autoDismissNotifications ?? true,
          notificationDismissDelay: settings.notificationDismissDelay ?? 5000,
          notificationPosition: settings.notificationPosition ?? 'top-end',
          lastModified: settings.lastModified || {},
          version: '1.2'
        };
      }
    }
  ];

  private constructor() {
    this.settingsService = SettingsService.getInstance();
  }

  static getInstance(): SettingsMigration {
    if (!SettingsMigration.instance) {
      SettingsMigration.instance = new SettingsMigration();
    }
    return SettingsMigration.instance;
  }

  async migrateSettings(): Promise<void> {
    let settings = this.settingsService.getSettings();
    const currentVersion = settings.version || '1.0';

    if (currentVersion === this.currentVersion) {
      return;
    }

    // Find migrations that need to be applied
    const pendingMigrations = this.migrations.filter(migration => 
      this.compareVersions(migration.version, currentVersion) > 0
    );

    // Apply migrations in order
    for (const migration of pendingMigrations) {
      try {
        settings = migration.migrate(settings);
        this.settingsService.updateSettings(settings);
        console.log(`Successfully migrated settings to version ${migration.version}`);
      } catch (error) {
        console.error(`Failed to migrate settings to version ${migration.version}:`, error);
        throw error;
      }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }
}