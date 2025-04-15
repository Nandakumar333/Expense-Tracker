import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { format, formatDistance, Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { UserSettings, Category } from '../common/types';

const locales: { [key: string]: Locale } = {
  en: enUS,
  es: es
};

export const useSettingsUtils = () => {
  const { settings } = useSettings();

  const getLocale = useCallback(() => {
    return locales[settings?.language || 'en'];
  }, [settings?.language]);

  const formatTimeAgo = useCallback((date: Date | string): string => {
    if (!settings) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: getLocale()
    });
  }, [getLocale, settings]);

  const getWeekDates = useCallback((date: Date) => {
    if (!settings) return { start: new Date(), end: new Date() };
    const currentDate = new Date(date);
    const startOffset = settings.weekStartDay === 'monday' ? 1 : 0;
    const currentDay = currentDate.getDay();
    
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - ((currentDay + 7 - startOffset) % 7));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [settings]);

  const formatDateRange = useCallback((start: Date, end: Date): string => {
    if (!settings) return '';
    if (start.getTime() === end.getTime()) {
      return formatDate(start);
    }

    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth()
    ) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }

    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [settings]);

  const formatCurrency = (amount: number): string => {
    if (!settings) return amount.toFixed(2);
    try {
      const locale = settings.language || 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: settings.currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback to basic formatting if locale is invalid
      return `${settings.currency || '$'}${amount.toFixed(2)}`;
    }
  };

  const formatDate = (date: Date | string, format?: string): string => {
    if (!settings) return new Date(date).toLocaleDateString();
    try {
      const locale = settings.language || 'en-US';
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      // Fallback to basic date formatting
      return new Date(date).toLocaleDateString();
    }
  };

  const formatTime = (date: Date | string): string => {
    if (!settings) return new Date(date).toLocaleTimeString();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(settings.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatNumber = (num: number): string => {
    if (!settings) return num.toString();
    return new Intl.NumberFormat(settings.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getPrivacyMask = (): string => {
    return '•••';
  };

  const shouldShowDecimals = (): boolean => {
    return true;
  };

  const getDateTimeFormat = (): Intl.DateTimeFormatOptions => {
    return {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
  };

  const sortCategories = useCallback((categories: Category[]): Category[] => {
    if (!settings || !categories) return categories;

    const sortOrder = settings.categorySortOrder || 'alphabetical';
    const sorted = [...categories];

    switch (sortOrder) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'mostUsed':
        // This would require tracking usage count in the Category type
        return sorted;
      case 'custom':
        // Custom sorting would require a custom order stored in settings
        return sorted;
      default:
        return sorted;
    }
  }, [settings?.categorySortOrder]);

  return {
    formatCurrency,
    formatNumber,
    formatDate,
    formatTimeAgo,
    formatDateRange,
    getWeekDates,
    getLocale,
    formatTime,
    getPrivacyMask,
    shouldShowDecimals,
    getDateTimeFormat,
    sortCategories
  };
};