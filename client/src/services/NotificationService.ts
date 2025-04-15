import { SettingsService } from './SettingsService';
import { BudgetAlert, Transaction, Budget } from '../common/types';

export class NotificationService {
  private static instance: NotificationService;
  private settingsService: SettingsService;

  private constructor() {
    this.settingsService = SettingsService.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async shouldNotify(): Promise<boolean> {
    const settings = this.settingsService.getSettings();
    return settings.notificationsEnabled;
  }

  async notifyBudgetAlert(alert: BudgetAlert): Promise<void> {
    const settings = this.settingsService.getSettings();
    if (!settings.notificationsEnabled) return;

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('Budget Alert', {
        body: alert.message,
        icon: '/favicon.ico'
      });
    }

    // Email notification
    if (settings.emailNotifications) {
      await this.sendEmailNotification({
        subject: 'Budget Alert',
        message: alert.message
      });
    }
  }

  async notifyUpcomingBill(transaction: Transaction): Promise<void> {
    const settings = this.settingsService.getSettings();
    if (!settings.notificationsEnabled) return;

    const message = `Upcoming bill: ${transaction.description} - Due on ${transaction.date}`;

    if (Notification.permission === 'granted') {
      new Notification('Upcoming Bill', {
        body: message,
        icon: '/favicon.ico'
      });
    }

    if (settings.emailNotifications) {
      await this.sendEmailNotification({
        subject: 'Upcoming Bill Reminder',
        message
      });
    }
  }

  async notifyBudgetThresholdExceeded(budget: Budget, spent: number): Promise<void> {
    const settings = this.settingsService.getSettings();
    if (!settings.notificationsEnabled) return;

    const percentage = (spent / budget.amount) * 100;
    if (percentage >= settings.budgetAlertThreshold) {
      const message = `Budget alert: You've spent ${percentage.toFixed(1)}% of your ${budget.period} budget`;

      if (Notification.permission === 'granted') {
        new Notification('Budget Threshold Alert', {
          body: message,
          icon: '/favicon.ico'
        });
      }

      if (settings.emailNotifications) {
        await this.sendEmailNotification({
          subject: 'Budget Threshold Alert',
          message
        });
      }
    }
  }

  private async sendEmailNotification({ subject, message }: { subject: string; message: string }): Promise<void> {
    // Implementation for sending emails would go here
    // This would typically involve calling your backend API
    console.log('Sending email notification:', { subject, message });
  }

  async requestNotificationPermission(): Promise<void> {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  }

  async checkUpcomingBills(transactions: Transaction[]): Promise<void> {
    const settings = this.settingsService.getSettings();
    if (!settings.notificationsEnabled) return;

    const today = new Date();
    const reminderDays = settings.expenseReminderDays;
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() + reminderDays);

    const upcomingBills = transactions.filter(t => {
      const dueDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        dueDate > today &&
        dueDate <= reminderDate
      );
    });

    for (const bill of upcomingBills) {
      await this.notifyUpcomingBill(bill);
    }
  }

  private hasPermission(): boolean {
    return Notification.permission === 'granted';
  }

  public async sendNotification(options: { subject: string; message: string }): Promise<void> {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      // Send browser notification
      new Notification(options.subject, {
        body: options.message,
        icon: '/favicon.ico'
      });

      // Emit notification event
      document.dispatchEvent(new CustomEvent('notification', {
        detail: {
          title: options.subject,
          message: options.message,
          type: 'info',
          timestamp: new Date()
        }
      }));
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}