import { UserSettings } from '../common/types';
import { SettingsService } from './SettingsService';
import axios from 'axios';
import { debounce } from 'lodash';
type Settings = UserSettings;

export class SettingsSync {
  private static instance: SettingsSync;
  private settingsService: SettingsService;
  private channel: BroadcastChannel;
  private syncInProgress: boolean = false;
  private lastSyncTimestamp: number = 0;
  private pendingChanges: Partial<Settings> = {};
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private intervalId: NodeJS.Timeout | null = null;
  private isOfflineMode: boolean = false;

  private static SYNC_ENDPOINT = '/api/settings';
  private static LAST_SYNC_KEY = 'lastSettingsSync';
  private static OFFLINE_CHANGES_KEY = 'offlineSettingsChanges';

  private constructor() {
    this.settingsService = SettingsService.getInstance();
    this.channel = new BroadcastChannel('settings-sync');
    this.initializeSync();
    this.setupAutoSync();
    this.isOfflineMode = !navigator.onLine;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('beforeunload', this.handleUnload);
  }

  static getInstance(): SettingsSync {
    if (!SettingsSync.instance) {
      SettingsSync.instance = new SettingsSync();
    }
    return SettingsSync.instance;
  }

  private initializeSync(): void {
    // Listen for settings changes from other tabs
    this.channel.onmessage = (event) => {
      if (event.data.type === 'settings-update') {
        this.handleSettingsUpdate(event.data.settings);
      }
    };

    // Listen for storage changes (for older browsers without BroadcastChannel)
    window.addEventListener('storage', (event) => {
      if (event.key === 'user-settings') {
        try {
          const settings = JSON.parse(event.newValue || '');
          this.handleSettingsUpdate(settings);
        } catch (error) {
          console.error('Failed to parse settings from storage event:', error);
        }
      }
    });
  }

  private handleSettingsUpdate(newSettings: UserSettings): void {
    // Update local settings without triggering another sync
    this.settingsService.updateSettings(newSettings, false);

    // Notify any subscribers of the settings change
    document.dispatchEvent(new CustomEvent('settings-updated', {
      detail: { settings: newSettings }
    }));
  }

  syncSettings(settings: UserSettings): void {
    // Broadcast the settings change to other tabs
    this.channel.postMessage({
      type: 'settings-update',
      settings: settings
    });

    // Also update localStorage for older browser support
    localStorage.setItem('user-settings', JSON.stringify(settings));
  }

  // Clean up resources when no longer needed
  disconnect(): void {
    this.channel.close();
  }

  // Force a sync with all tabs
  async forceSyncAllTabs(): Promise<void> {
    const settings = this.settingsService.getSettings();
    this.syncSettings(settings);
  }

  private setupAutoSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(this.sync.bind(this), this.syncInterval);
  }

  private handleOnline = async (): Promise<void> => {
    if (Object.keys(this.pendingChanges).length > 0) {
      await this.sync();
    }
  };

  private handleOffline = (): void => {
    this.isOfflineMode = true;
    // Save any pending changes to localStorage
    if (Object.keys(this.pendingChanges).length > 0) {
      this.saveOfflineChanges();
    }
  };

  private handleUnload = async (): Promise<void> => {
    if (Object.keys(this.pendingChanges).length > 0) {
      await this.sync();
    }
  };

  public setSyncInterval(minutes: number): void {
    this.syncInterval = minutes * 60 * 1000;
    this.setupAutoSync();
  }

  private debouncedSync = debounce(async () => {
    await this.sync();
  }, 1000);

  private saveOfflineChanges(): void {
    const existingChanges = this.loadOfflineChanges();
    const mergedChanges = { ...existingChanges, ...this.pendingChanges };
    localStorage.setItem(SettingsSync.OFFLINE_CHANGES_KEY, JSON.stringify(mergedChanges));
  }

  private loadOfflineChanges(): Partial<Settings> {
    const savedChanges = localStorage.getItem(SettingsSync.OFFLINE_CHANGES_KEY);
    return savedChanges ? JSON.parse(savedChanges) : {};
  }

  private clearOfflineChanges(): void {
    localStorage.removeItem(SettingsSync.OFFLINE_CHANGES_KEY);
  }

  public async sync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    if (!navigator.onLine) {
      this.isOfflineMode = true;
      this.saveOfflineChanges();
      return;
    }

    let storedPendingChanges: Partial<Settings> = {};
    
    try {
      this.syncInProgress = true;
      storedPendingChanges = { ...this.pendingChanges };
      
      // Include offline changes if any
      if (this.isOfflineMode) {
        const offlineChanges = this.loadOfflineChanges();
        storedPendingChanges = { ...offlineChanges, ...storedPendingChanges };
      }

      this.pendingChanges = {};

      const response = await axios.post('/api/settings', {
        changes: storedPendingChanges,
        lastSyncTimestamp: this.lastSyncTimestamp
      });

      if (response.data.conflict) {
        await this.handleConflict(response.data.serverSettings, storedPendingChanges);
      } else {
        this.lastSyncTimestamp = Date.now();
        localStorage.setItem('settingsSyncTimestamp', this.lastSyncTimestamp.toString());
        
        if (this.isOfflineMode) {
          this.isOfflineMode = false;
          this.clearOfflineChanges();
        }
      }
    } catch (error) {
      console.warn('Settings sync failed, falling back to local storage:', error);
      // Store settings locally
      const currentSettings = this.settingsService.getSettings();
      const mergedSettings = { ...currentSettings, ...storedPendingChanges };
      localStorage.setItem('user-settings', JSON.stringify(mergedSettings));
      
      // Restore pending changes to retry later
      this.pendingChanges = storedPendingChanges;
      
      // Don't throw the error - we've handled it gracefully
      return;
    } finally {
      this.syncInProgress = false;
    }
  }
  handleConflict(serverSettings: any, storedPendingChanges: Partial<UserSettings>) {
    throw new Error('Method not implemented.');
  }

  public async pushChanges(changes: Partial<Settings>): Promise<void> {
    this.pendingChanges = {
      ...this.pendingChanges,
      ...changes
    };

    // Always store changes in localStorage as backup
    const currentSettings = this.settingsService.getSettings();
    const mergedSettings = { ...currentSettings, ...this.pendingChanges };
    localStorage.setItem('user-settings', JSON.stringify(mergedSettings));

    // If we're offline, save to offline changes
    if (this.isOfflineMode) {
      this.saveOfflineChanges();
      return;
    }

    await this.debouncedSync();
  }

  public async pullSettings(): Promise<Settings | null> {
    try {
      const response = await axios.get('/api/settings');
      const serverSettings = response.data;

      this.lastSyncTimestamp = Date.now();
      localStorage.setItem('settingsSyncTimestamp', this.lastSyncTimestamp.toString());

      return serverSettings;
    } catch (error) {
      console.error('Failed to pull settings:', error);
      return null;
    }
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  static async syncSettings(settings: UserSettings): Promise<void> {
    try {
      const response = await fetch(this.SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Handle case where API is not available
          console.warn('Settings sync API not available, storing settings locally only');
          localStorage.setItem('user-settings', JSON.stringify(settings));
          return;
        }
        throw new Error(`Failed to sync settings: ${response.statusText}`);
      }

      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Settings sync failed:', error);
      // Store settings locally as fallback
      localStorage.setItem('user-settings', JSON.stringify(settings));
      throw error;
    }
  }

  static async fetchRemoteSettings(): Promise<UserSettings | null> {
    try {
      const response = await fetch(this.SYNC_ENDPOINT, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Handle case where API is not available
          console.warn('Settings sync API not available, using local settings');
          const localSettings = localStorage.getItem('user-settings');
          return localSettings ? JSON.parse(localSettings) : null;
        }
        throw new Error(`Failed to fetch remote settings: ${response.statusText}`);
      }

      const settings = await response.json();
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      return settings;
    } catch (error) {
      console.error('Failed to fetch remote settings:', error);
      // Try to get settings from localStorage as fallback
      const localSettings = localStorage.getItem('user-settings');
      return localSettings ? JSON.parse(localSettings) : null;
    }
  }

  static getLastSyncTime(): Date | null {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  }

  static async resolveConflicts(
    localSettings: UserSettings,
    remoteSettings: UserSettings
  ): Promise<UserSettings> {
    // Merge strategy: Take the most recent changes for each setting
    const mergedSettings = { ...localSettings };
    
    Object.entries(remoteSettings).forEach(([key, value]) => {
      const remoteTimestamp = remoteSettings.lastModified?.[key];
      const localTimestamp = localSettings.lastModified?.[key];
      
      if (remoteTimestamp && (!localTimestamp || remoteTimestamp > localTimestamp)) {
        const typedKey = key as keyof UserSettings;
        (mergedSettings[typedKey] as any) = value;
      }
    });

    return mergedSettings;
  }

  static async performSync(localSettings: UserSettings): Promise<UserSettings> {
    const remoteSettings = await this.fetchRemoteSettings();
    
    if (!remoteSettings) {
      await this.syncSettings(localSettings);
      return localSettings;
    }

    const mergedSettings = await this.resolveConflicts(localSettings, remoteSettings);
    await this.syncSettings(mergedSettings);
    
    return mergedSettings;
  }
}