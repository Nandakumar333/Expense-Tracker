import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

interface BudgetAlert {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
}

interface OverBudgetAlertProps {
  alerts: BudgetAlert[];
  currency: string;
  showLegend?: boolean;
  height?: number;
  loading?: boolean;
  title?: string;
}

const getSeverityVariant = (severity: BudgetAlert['severity']): string => {
  switch (severity) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
};

export const OverBudgetAlert: React.FC<OverBudgetAlertProps> = ({
  alerts,
  currency,
  showLegend = true,
  height = 300,
  loading = false,
  title = "Budget Alerts"
}) => {
  return (
    <Card className="h-100">
      <Card.Header className="bg-white">
        <h6 className="card-title mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {title}
        </h6>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
          </div>
        ) : (
          <div className="alert-list" style={{ maxHeight: `${height}px`, overflowY: 'auto' }}>
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
                    <span className={`badge bg-${getSeverityVariant(alert.severity)}`}>
                      {alert.percentage.toFixed(1)}% Used
                    </span>
                  </div>
                  <ProgressBar
                    variant={getSeverityVariant(alert.severity)}
                    now={Math.min(alert.percentage, 100)}
                    style={{ height: '6px' }}
                  />
                  <small className="text-muted d-block mt-1">
                    Spent: {currency}{alert.spent.toFixed(2)} of {currency}{alert.budget.toFixed(2)}
                  </small>
                </div>
              ))
            )}
          </div>
        )}
        {showLegend && alerts.length > 0 && (
          <div className="legend mt-3 d-flex gap-3">
            <small><span className="badge bg-info me-1">●</span> Under 90%</small>
            <small><span className="badge bg-warning me-1">●</span> 90-99%</small>
            <small><span className="badge bg-danger me-1">●</span> 100% or more</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};