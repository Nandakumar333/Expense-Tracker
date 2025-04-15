import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface BudgetData {
  category: string;
  spent: number;
  total: number;
  percentage: number;
  color: string;
}

interface BudgetSpendingWidgetProps {
  data: BudgetData[];
  loading?: boolean;
}

const BudgetSpendingWidget: React.FC<BudgetSpendingWidgetProps> = ({ data, loading = false }) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  const getVariant = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  return (
    <BaseWidget title="Budget Overview" loading={loading}>
      <div className={`budget-spending-list theme-${settings?.theme ?? 'light'}`}>
        {data.map((item, index) => (
          <div key={index} className="budget-item mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="category-name">{item.category}</span>
              <span className="amounts">
                {formatCurrency(item.spent)} / {formatCurrency(item.total)}
              </span>
            </div>
            <ProgressBar
              now={Math.min(item.percentage, 100)}
              variant={getVariant(item.percentage)}
              style={{ height: '8px' }}
            />
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-center text-muted py-3">
            No budget data available
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default BudgetSpendingWidget;