import React from 'react';
import { WidgetProps } from '../../../common/types';

interface TotalExpensesProps extends WidgetProps {
  monthlyExpense: number;
  yearlyExpense: number;
  currency: string;
}

const TotalExpenses: React.FC<TotalExpensesProps> = ({
  monthlyExpense,
  yearlyExpense,
  currency,
  loading
}) => {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h6 className="card-title text-muted mb-3">Total Expenses</h6>
        {loading ? (
          <div className="placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center mb-2">
              <div className="me-3">
                <span className="text-muted small">This Month</span>
                <h4 className="mb-0">{currency}{monthlyExpense.toFixed(2)}</h4>
              </div>
              <div>
                <span className="text-muted small">This Year</span>
                <h4 className="mb-0">{currency}{yearlyExpense.toFixed(2)}</h4>
              </div>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div 
                className="progress-bar"
                style={{ width: `${(monthlyExpense / (yearlyExpense/12)) * 100}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TotalExpenses;
