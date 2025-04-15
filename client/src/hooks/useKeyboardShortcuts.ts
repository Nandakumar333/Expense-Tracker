import { useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

interface ShortcutAction {
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const shortcuts: Record<string, ShortcutAction> = {
    'shift+n': {
      description: 'New transaction',
      action: () => navigate('/transactions/new')
    },
    'shift+b': {
      description: 'View budgets',
      action: () => navigate('/budget')
    },
    'shift+r': {
      description: 'View reports',
      action: () => navigate('/reports')
    },
    'shift+s': {
      description: 'Open settings',
      action: () => navigate('/settings')
    },
    'shift+d': {
      description: 'Go to dashboard',
      action: () => navigate('/dashboard')
    },
    'shift+c': {
      description: 'Manage categories',
      action: () => navigate('/categories')
    },
    'shift+a': {
      description: 'View accounts',
      action: () => navigate('/accounts')
    },
    'shift+p': {
      description: 'Toggle privacy mode',
      action: () => {
        // This will be handled by the settings context
        document.dispatchEvent(new CustomEvent('togglePrivacyMode'))
      }
    },
    'shift+/': {
      description: 'Show keyboard shortcuts help',
      action: () => {
        document.dispatchEvent(new CustomEvent('showShortcutsHelp'))
      }
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!settings?.keyboardShortcutsEnabled) return;

    // Don't trigger shortcuts when typing in input fields
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
      return;
    }

    const key = event.key.toLowerCase();
    const shortcutKey = `${event.shiftKey ? 'shift+' : ''}${key}`;

    if (shortcuts[shortcutKey]) {
      event.preventDefault();
      shortcuts[shortcutKey].action();
    }
  }, [settings?.keyboardShortcutsEnabled, navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const getShortcutsList = () => {
    return Object.entries(shortcuts).map(([key, { description }]) => ({
      key,
      description
    }));
  };

  return {
    shortcuts: getShortcutsList()
  };
};