import React, { useMemo } from 'react';
import { WidgetProps, Transaction } from '../../../common/types';

interface TrendData {
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

interface ExpenseTrendProps extends WidgetProps {
  transactions: Transaction[];
  currency: string;
  showLegend: boolean;
}

const ExpenseTrend: React.FC<ExpenseTrendProps> = ({
  transactions,
  currency,
  loading,
  height = 300,
  showLegend = true
}) => {
  const data = useMemo(() => {
    if (!transactions?.length) return [];

    // Get last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    return months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        label: month.toLocaleString('default', { month: 'short' }),
        income,
        expenses,
        savings: income - expenses
      };
    });
  }, [transactions]);

  const maxValue = Math.max(
    ...data.flatMap(item => [item.income, item.expenses])
  );

  return (
    <div style={{ height: `${height}px`, position: 'relative', paddingBottom: '30px' }}>
      {loading ? (
        <div className="placeholder-glow">
          <span className="placeholder col-12 h-100"></span>
        </div>
      ) : (
        <>
          <div className="chart-container" style={{ height: 'calc(100% - 30px)', position: 'relative' }}>
            <div className="bars d-flex justify-content-between align-items-end h-100">
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className="trend-group position-relative" 
                  style={{ 
                    flex: '1',
                    minWidth: '60px',
                    display: 'flex',
                    gap: '4px',
                    justifyContent: 'center',
                    height: '100%',
                    alignItems: 'flex-end'
                  }}
                >
                  <div className="trend-bar" style={{ width: '20px', height: '100%', position: 'relative' }}>
                    <div
                      className="income-bar position-absolute bottom-0 w-100"
                      style={{
                        height: `${(item.income / maxValue) * 100}%`,
                        backgroundColor: 'rgba(40, 167, 69, 0.8)',
                        transition: 'height 0.3s ease',
                        borderRadius: '4px 4px 0 0'
                      }}
                      data-bs-toggle="tooltip"
                      title={`Income: ${currency}${item.income.toFixed(2)}`}
                    ></div>
                  </div>
                  
                  <div className="trend-bar" style={{ width: '20px', height: '100%', position: 'relative' }}>
                    <div
                      className="expense-bar position-absolute bottom-0 w-100"
                      style={{
                        height: `${(item.expenses / maxValue) * 100}%`,
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        transition: 'height 0.3s ease',
                        borderRadius: '4px 4px 0 0'
                      }}
                      data-bs-toggle="tooltip"
                      title={`Expenses: ${currency}${item.expenses.toFixed(2)}`}
                    ></div>
                  </div>

                  <div className="label position-absolute" style={{ bottom: '-25px', width: '100%', textAlign: 'center' }}>
                    <small className="text-muted">{item.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showLegend && (
            <div className="d-flex justify-content-center gap-4 mt-4">
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(40, 167, 69, 0.8)', borderRadius: '2px' }}></div>
                <small className="text-muted">Income</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: 'rgba(220, 53, 69, 0.8)', borderRadius: '2px' }}></div>
                <small className="text-muted">Expenses</small>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpenseTrend;
