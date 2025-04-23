import React from 'react';
import { Alert } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';
import { DashboardSummary } from '../../../common/types';

interface AlertsInsightsWidgetProps {
  summary: DashboardSummary;
  className?: string;
}

const AlertsInsightsWidget: React.FC<AlertsInsightsWidgetProps> = ({ 
  summary, 
  className = '' 
}) => {
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
      type: balance >= 0 ? 'surplus' : 'deficit',
      percentage: balance !== 0 ? (Math.abs(balance) / summary.monthlyIncome) * 100 : 0
    };
  };

  const balanceInfo = getBalanceChange();

  return (
    <div className={`alerts-insights theme-${settings.theme} ${className}`}>
      {/* Monthly Balance Status */}
      <Alert 
        variant={balanceInfo.type === 'surplus' ? 'success' : 'warning'}
        className="d-flex align-items-center mb-3"
      >
        <i className={`bi bi-${balanceInfo.type === 'surplus' ? 'graph-up' : 'graph-down'}-arrow me-2 fs-5`}></i>
        <div>
          <div className="fw-medium">Monthly {balanceInfo.type}</div>
          <div>
            {formatCurrency(balanceInfo.amount)}
            {balanceInfo.percentage > 0 && (
              <small className="text-muted ms-2">
                ({balanceInfo.percentage.toFixed(1)}% of income)
              </small>
            )}
          </div>
        </div>
      </Alert>

      {/* Savings Goal Progress */}
      {settings.savingsGoal > 0 && (
        <Alert 
          variant={calculateSavingsPercent() >= settings.budgetAlertThreshold ? 'success' : 'info'}
          className="d-flex align-items-center mb-3"
        >
          <i className="bi bi-piggy-bank-fill me-2 fs-5"></i>
          <div>
            <div className="fw-medium">Savings Progress</div>
            <div>
              Currently saving {calculateSavingsPercent().toFixed(1)}% of income
              {calculateSavingsPercent() < settings.budgetAlertThreshold && (
                <small className="d-block text-muted">
                  Target: {settings.budgetAlertThreshold}%
                </small>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Yearly Overview */}
      {summary.yearlyExpense > 0 && (
        <Alert variant="primary" className="d-flex align-items-center mb-3">
          <i className="bi bi-calendar-check me-2 fs-5"></i>
          <div>
            <div className="fw-medium">Yearly Overview</div>
            <div>
              Total expenses: {formatCurrency(summary.yearlyExpense)}
              <small className="d-block text-muted">
                Monthly average: {formatCurrency(summary.yearlyExpense / 12)}
              </small>
            </div>
          </div>
        </Alert>
      )}

      {/* Overspending Warning */}
      {summary.monthlyExpense > summary.monthlyIncome && (
        <Alert variant="danger" className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>
            <div className="fw-medium">Overspending Alert</div>
            <div>
              Expenses exceed income by {formatCurrency(summary.monthlyExpense - summary.monthlyIncome)}
              <small className="d-block text-muted">
                Consider reviewing your budget
              </small>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default AlertsInsightsWidget;