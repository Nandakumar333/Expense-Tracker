import React from 'react';
import { WidgetProps } from '../../../common/types';

interface AlertData {
  category: string;
  budgeted: number;
  spent: number;
  percentageUsed: number;
}

interface OverBudgetAlertProps extends WidgetProps {
  alerts: AlertData[];
  currency: string;
}

const OverBudgetAlert: React.FC<OverBudgetAlertProps> = ({
  alerts,
  currency,
  loading
}) => {
  const getSeverityClass = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'warning';
    return 'info';
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-danger text-white">
        <h6 className="card-title mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Budget Alerts
        </h6>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
          </div>
        ) : (
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="text-success d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                All categories within budget
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className="alert-item mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span>{alert.category}</span>
                    <span className={`badge bg-${getSeverityClass(alert.percentageUsed)}`}>
                      {alert.percentageUsed.toFixed(1)}% Used
                    </span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className={`progress-bar bg-${getSeverityClass(alert.percentageUsed)}`}
                      style={{ width: `${Math.min(alert.percentageUsed, 100)}%` }}
                    ></div>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Spent: {currency}{alert.spent.toFixed(2)} of {currency}{alert.budgeted.toFixed(2)}
                  </small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverBudgetAlert;
