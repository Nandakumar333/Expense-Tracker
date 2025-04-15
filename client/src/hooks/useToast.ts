import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { NotificationService } from '../services/NotificationService';

type ToastType = 'success' | 'warning' | 'danger' | 'info';

interface ToastOptions {
  autoHide?: boolean;
  delay?: number;
  position?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
}

interface UseToastResult {
  showToast: (message: string, type?: ToastType) => void;
  showBudgetAlert: (categoryName: string, percentage: number) => void;
  showTransactionAlert: (amount: number, type: 'expense' | 'income') => void;
  success: (title: string, message: string, options?: ToastOptions) => void;
  warning: (title: string, message: string, options?: ToastOptions) => void;
  error: (title: string, message: string, options?: ToastOptions) => void;
  info: (title: string, message: string, options?: ToastOptions) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

export const useToast = (): UseToastResult => {
  const { settings, formatCurrency } = useSettings();
  const notificationService = NotificationService.getInstance();

  const showToast = useCallback(
    async (message: string, type: ToastType = 'info') => {
      if (!settings?.notificationsEnabled) return;

      const notification = new CustomEvent('notification', {
        detail: {
          title: 'ExpenseTracker Alert',
          message,
          type,
          autoHide: settings.autoDismissNotifications,
          delay: settings.notificationDismissDelay,
          position: settings.notificationPosition
        }
      });

      document.dispatchEvent(notification);

      // If browser notifications are supported and enabled
      if (settings.browserNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('ExpenseTracker Alert', {
            body: message,
            icon: '/favicon.ico'
          });
        }
      }

      // Handle email notifications if enabled
      if (settings.emailNotifications && (type === 'danger' || type === 'warning')) {
        await notificationService.sendNotification({
          subject: 'ExpenseTracker Alert',
          message
        });
      }
    },
    [settings?.notificationsEnabled, settings?.emailNotifications]
  );

  const success = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast(message, 'success');
  }, [showToast]);

  const warning = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast(message, 'warning');
  }, [showToast]);

  const error = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast(message, 'danger');
  }, [showToast]);

  const info = useCallback((title: string, message: string, options?: ToastOptions) => {
    showToast(message, 'info');
  }, [showToast]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showBudgetAlert = useCallback(
    (categoryName: string, percentage: number) => {
      if (!settings?.notificationsEnabled) return;
      
      if (percentage >= settings.budgetAlertThreshold) {
        showToast(
          `Budget Alert: ${categoryName} spending is at ${percentage.toFixed(1)}% of budget`,
          percentage >= 90 ? 'danger' : 'warning'
        );
      }
    },
    [settings?.notificationsEnabled, settings?.budgetAlertThreshold, showToast]
  );

  const showTransactionAlert = useCallback(
    (amount: number, type: 'expense' | 'income') => {
      if (!settings?.notificationsEnabled) return;

      const formattedAmount = formatCurrency(amount);
      if (type === 'expense' && amount > 1000) {
        showToast(
          `Large expense detected: ${formattedAmount}`,
          'warning'
        );
      } else if (type === 'income') {
        showToast(
          `Income received: ${formattedAmount}`,
          'success'
        );
      }
    },
    [settings?.notificationsEnabled, formatCurrency, showToast]
  );

  return {
    showToast,
    showBudgetAlert,
    showTransactionAlert,
    success,
    warning,
    error,
    info,
    requestNotificationPermission
  };
};