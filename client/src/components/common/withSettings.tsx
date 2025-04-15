import React from 'react';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

export interface WithSettingsProps {
  settings?: any;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: string | Date) => string;
  formatNumber?: (num: number) => string;
  formatTimeAgo?: (date: Date | string) => string;
}

export function withSettings<P extends WithSettingsProps>(
  WrappedComponent: React.ComponentType<P>
): React.FC<Omit<P, keyof WithSettingsProps>> {
  return function WithSettingsComponent(props: Omit<P, keyof WithSettingsProps>) {
    const {
      settings,
      formatCurrency,
      formatDate,
      formatNumber,
      formatTimeAgo
    } = useUnifiedSettings();

    const settingsProps: WithSettingsProps = {
      settings,
      formatCurrency,
      formatDate,
      formatNumber,
      formatTimeAgo
    };

    return <WrappedComponent {...(props as P)} {...settingsProps} />;
  };
}

export default withSettings;