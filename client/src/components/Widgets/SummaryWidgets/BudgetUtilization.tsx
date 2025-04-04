import React from 'react';
import { WidgetProps } from '../../../common/types';

interface BudgetData {
  category: string;
  budgeted: number;
  spent: number;
  percentageUsed: number;
  color?: string;
}

interface BudgetUtilizationProps extends WidgetProps {
  budgetData: BudgetData[];
  currency: string;
}

const BudgetUtilization: React.FC<BudgetUtilizationProps> = ({
  budgetData,
  currency,
  loading
}) => {
  const totalBudgeted = budgetData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0);
  const overallUtilization = (totalSpent / totalBudgeted) * 100;

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title text-muted mb-0">Budget Utilization</h6>
          <span className={`badge ${overallUtilization > 100 ? 'bg-danger' : 'bg-success'}`}>
            {overallUtilization.toFixed(1)}% Used
          </span>
        </div>

        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ height: '100px' }}></span>
          </div>
        ) : (
          <>
            <div className="overall-progress mb-4">
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className={`progress-bar ${overallUtilization > 100 ? 'bg-danger' : 'bg-success'}`}
                  style={{ width: `${Math.min(overallUtilization, 100)}%` }}
                ></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">Total Spent: {currency}{totalSpent.toFixed(2)}</small>
                <small className="text-muted">Budget: {currency}{totalBudgeted.toFixed(2)}</small>
              </div>
            </div>

            <div className="category-breakdown">
              {budgetData.map((budget, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-truncate">{budget.category}</small>
                    <small className={budget.percentageUsed > 100 ? 'text-danger' : 'text-success'}>
                      {budget.percentageUsed.toFixed(1)}%
                    </small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min(budget.percentageUsed, 100)}%`,
                        backgroundColor: budget.color || (budget.percentageUsed > 100 ? '#dc3545' : '#198754')
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetUtilization;
