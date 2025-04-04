import React, { useMemo } from 'react';
import { WidgetProps } from '../../../common/types';

interface BudgetSpendingData {
  category: string;
  budgeted: number;
  spent: number;
  color: string;
}

interface BudgetSpendingProps extends WidgetProps {
  data: BudgetSpendingData[];
  currency: string;
}

const BudgetSpending: React.FC<BudgetSpendingProps> = ({
  data,
  currency,
  loading
}) => {
  const { sortedData, totalSpent, totalBudget } = useMemo(() => {
    const sorted = [...data].sort((a, b) => (b.spent / b.budgeted) - (a.spent / a.budgeted));
    const spent = data.reduce((sum, item) => sum + item.spent, 0);
    const budget = data.reduce((sum, item) => sum + item.budgeted, 0);
    return { sortedData: sorted, totalSpent: spent, totalBudget: budget };
  }, [data]);

  const utilizationPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title text-muted mb-0">Budget Overview</h6>
          <span className={`badge ${utilizationPercentage > 100 ? 'bg-danger' : 'bg-success'}`}>
            {utilizationPercentage.toFixed(1)}% Used
          </span>
        </div>
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ height: '200px' }}></span>
          </div>
        ) : (
          <>
            <div className="overall-progress mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span>Total Budget Utilization</span>
                <span>
                  {currency}{totalSpent.toFixed(2)} / {currency}{totalBudget.toFixed(2)}
                </span>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div
                  className={`progress-bar ${utilizationPercentage > 100 ? 'bg-danger' : 'bg-success'}`}
                  role="progressbar"
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  aria-valuenow={utilizationPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
            <div className="budget-list">
              {sortedData.map((item, index) => {
                const percentage = (item.spent / item.budgeted) * 100;
                return (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted">{item.category}</span>
                      <span className="text-end">
                        <small className="text-muted">
                          {currency}{item.spent.toFixed(2)} / {currency}{item.budgeted.toFixed(2)}
                        </small>
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${percentage > 100 ? 'bg-danger' : 'bg-success'}`}
                        role="progressbar"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: item.color 
                        }}
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetSpending;
