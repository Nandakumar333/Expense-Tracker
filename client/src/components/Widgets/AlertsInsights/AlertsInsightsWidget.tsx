import React from 'react';
import { Alert } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';
import { DashboardSummary } from '../../../common/types';

interface AlertsInsightsWidgetProps {
  summary: DashboardSummary;
  className?: string;
}

const AlertsInsightsWidget: React.FC<AlertsInsightsWidgetProps> = ({ summary, className = '' }) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  if (!settings) {
    return null;
  }

  const calculateSavingsPercent = () => {
    if (summary.monthlyIncome === 0) return 0;
    return (summary.monthlySavings / summary.monthlyIncome) * 100;
  };

  const getMonthlyBalance = () => {
    return summary.monthlyIncome - summary.monthlyExpense;
  };

  const getBalanceChange = () => {
    const balance = getMonthlyBalance();
    return {
      amount: Math.abs(balance),
      type: balance >= 0 ? 'surplus' : 'deficit'
    };
  };

  return (
    <BaseWidget title="Insights">
      <div className={`alerts-insights theme-${settings.theme} ${className}`}>
        {/* Monthly Balance Alert */}
        {getMonthlyBalance() < 0 && (
          <Alert variant="warning" className="mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Your expenses ({formatCurrency(summary.monthlyExpense)}) exceed your income (
            {formatCurrency(summary.monthlyIncome)}) by {formatCurrency(Math.abs(getMonthlyBalance()))} this month.
          </Alert>
        )}

        {/* Savings Goal Alert */}
        {settings.savingsGoal > 0 && calculateSavingsPercent() < settings.budgetAlertThreshold && (
          <Alert variant="info" className="mb-3">
            <i className="bi bi-piggy-bank-fill me-2"></i>
            You're saving {calculateSavingsPercent().toFixed(1)}% of your income.
            {calculateSavingsPercent() < 0 ? (
              " You're currently in a deficit."
            ) : (
              ` Your target is ${settings.budgetAlertThreshold}%.`
            )}
          </Alert>
        )}

        {/* Monthly Performance */}
        <Alert 
          variant={getBalanceChange().type === 'surplus' ? 'success' : 'danger'}
          className="mb-3"
        >
          <i className={`bi bi-graph-${getBalanceChange().type === 'surplus' ? 'up' : 'down'}-arrow me-2`}></i>
          Monthly {getBalanceChange().type}: {formatCurrency(getBalanceChange().amount)}
        </Alert>

        {/* High Expense Categories */}
        {summary.yearlyExpense > 0 && (
          <Alert variant="primary">
            <i className="bi bi-calendar-check me-2"></i>
            Total expenses this year: {formatCurrency(summary.yearlyExpense)}
          </Alert>
        )}
      </div>
    </BaseWidget>
  );
};

export default AlertsInsightsWidget;