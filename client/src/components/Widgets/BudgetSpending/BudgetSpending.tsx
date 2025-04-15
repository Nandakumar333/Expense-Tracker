import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface BudgetSpendingProps {
  data: {
    categoryId: number;
    categoryName: string;
    spent: number;
    budgeted: number;
    color: string;
  }[];
  loading?: boolean;
  title: string;
  height?: number;
  showLegend?: boolean;
}

const BudgetSpending: React.FC<BudgetSpendingProps> = ({
  data,
  loading = false,
  title,
  height = 300,
  showLegend = true
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  const getVariant = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  return (
    <BaseWidget title={title} loading={loading}>
      <div className={`budget-spending theme-${settings?.theme ?? 'light'}`} style={{ height }}>
        {data.map((item) => {
          const percentage = (item.spent / item.budgeted) * 100;
          return (
            <div key={item.categoryId} className="budget-item mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center">
                  <div
                    className="color-dot me-2"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: item.color
                    }}
                  />
                  <span>{item.categoryName}</span>
                </div>
                <div className="text-end">
                  <small>
                    {formatCurrency(item.spent)} / {formatCurrency(item.budgeted)}
                  </small>
                </div>
              </div>
              <ProgressBar>
                <ProgressBar
                  now={Math.min(percentage, 100)}
                  variant={getVariant(percentage)}
                  label={`${percentage.toFixed(1)}%`}
                />
              </ProgressBar>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="text-center text-muted py-4">
            No budget data available
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default BudgetSpending;
