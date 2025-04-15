import { useEffect, useCallback, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

interface AutoRefreshOptions {
  enabled?: boolean;
  interval?: number;
  onRefresh: () => Promise<void>;
  refreshOnFocus?: boolean;
  refreshOnNetwork?: boolean;
}

export const useAutoRefresh = ({
  enabled = true,
  interval,
  onRefresh,
  refreshOnFocus = true,
  refreshOnNetwork = true
}: AutoRefreshOptions) => {
  const { settings } = useSettings();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  const refresh = useCallback(async () => {
    try {
      await onRefresh();
      lastRefreshRef.current = Date.now();
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  }, [onRefresh]);

  // Schedule next refresh
  const scheduleNextRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!enabled || !settings?.dashboardRefreshRate) return;

    const refreshRate = interval || settings.dashboardRefreshRate * 1000;
    refreshTimeoutRef.current = setTimeout(refresh, refreshRate);
  }, [enabled, interval, settings?.dashboardRefreshRate, refresh]);

  // Handle window focus
  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = async () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      const minRefreshInterval = 5000; // Minimum 5 seconds between refreshes

      if (timeSinceLastRefresh >= minRefreshInterval) {
        await refresh();
        scheduleNextRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refresh, refreshOnFocus, scheduleNextRefresh]);

  // Handle network status changes
  useEffect(() => {
    if (!refreshOnNetwork) return;

    const handleOnline = async () => {
      await refresh();
      scheduleNextRefresh();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refresh, refreshOnNetwork, scheduleNextRefresh]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (enabled && settings?.dashboardRefreshRate) {
      refresh();
      scheduleNextRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [enabled, settings?.dashboardRefreshRate, refresh, scheduleNextRefresh]);

  return {
    refresh,
    lastRefresh: lastRefreshRef.current
  };
};