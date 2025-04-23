import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';

interface BudgetSpendingProps {
  data: Array<{
    categoryId: number;
    categoryName: string;
    spent: number;
    budgeted: number;
    color?: string;
  }>;
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
      <div className={`budget-spending theme-${settings?.theme ?? 'light'}`} 
           style={{ maxHeight: height, overflowY: 'auto', padding: '1rem' }}>
        {data.length === 0 ? (
          <div className="text-center text-muted py-4">
            No budget data available
          </div>
        ) : (
          data.map((item) => {
            const percentage = (item.spent / item.budgeted) * 100;
            return (
              <div key={item.categoryId} className="budget-item mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div
                      className="color-dot me-2"
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: item.color || '#6c757d'
                      }}
                    />
                    <span className="fw-medium">{item.categoryName}</span>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">
                      {formatCurrency(item.spent)} / {formatCurrency(item.budgeted)}
                    </small>
                  </div>
                </div>
                <ProgressBar
                  now={Math.min(percentage, 100)}
                  variant={getVariant(percentage)}
                  label={`${percentage.toFixed(1)}%`}
                  style={{ height: '8px' }}
                />
              </div>
            );
          })
        )}
        {showLegend && data.length > 0 && (
          <div className="budget-legend mt-3 border-top pt-3">
            <div className="d-flex justify-content-around">
              <small><span className="badge bg-success">●</span> Under 80%</small>
              <small><span className="badge bg-warning">●</span> 80-99%</small>
              <small><span className="badge bg-danger">●</span> 100% or more</small>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default BudgetSpending;
