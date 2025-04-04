import React, { useMemo } from 'react';
import { WidgetProps, Transaction, Account } from '../../../common/types';

interface SavingsTrendProps extends WidgetProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
  targetSavings: number;
  currentSavings: number;
  loading: boolean;
}

const SavingsTrend: React.FC<SavingsTrendProps> = ({
  transactions,
  accounts,
  currency,
  targetSavings,
  loading
}) => {
  const trendData = useMemo(() => {
    if (!transactions?.length) return [];
    
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    return last6Months.map(month => {
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
        value: income - expenses
      };
    });
  }, [transactions]);

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
  const maxValue = Math.max(
    Math.abs(targetSavings),
    ...trendData.map(item => Math.abs(item.value)),
    1  // Prevent division by zero
  ) * 1.2; // Add 20% padding
  const averageSavings = trendData.reduce((sum, item) => sum + item.value, 0) / trendData.length;
  const reachedTarget = totalBalance >= targetSavings;

  if (!transactions?.length || !accounts?.length) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-muted">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', minHeight: '300px' }}>
      {loading ? (
        <div className="placeholder-glow">
          <span className="placeholder col-12" style={{ height: '150px' }}></span>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="card-title text-muted mb-0">Savings Trend</h6>
              <small className="text-muted">Last 6 months</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="text-end">
                <small className="text-muted d-block">Total Savings</small>
                <span className={`badge ${reachedTarget ? 'bg-success' : 'bg-primary'}`}>
                  {currency}{totalBalance.toFixed(2)}
                </span>
              </div>
              {reachedTarget && (
                <i className="bi bi-check-circle-fill text-success fs-5" 
                   data-bs-toggle="tooltip" 
                   title="Target Reached!"></i>
              )}
            </div>
          </div>

          <div className="trend-chart position-relative" style={{ height: '200px' }}>
            {/* Target Line */}
            {targetSavings > 0 && (
              <div 
                className="target-line"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  top: `${(1 - targetSavings / maxValue) * 100}%`,
                  backgroundColor: 'rgba(231, 76, 60, 0.3)',
                  borderTop: '2px dashed rgba(231, 76, 60, 0.8)',
                  zIndex: 1
                }}
              >
                <span 
                  className="badge bg-danger"
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '-10px',
                    transform: 'translateY(-50%)'
                  }}
                >
                  Target: {currency}{targetSavings.toFixed(0)}
                </span>
              </div>
            )}

            {/* Average Line */}
            <div 
              className="average-line"
              style={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                top: `${(1 - averageSavings / maxValue) * 100}%`,
                backgroundColor: 'rgba(108, 117, 125, 0.3)',
                borderTop: '2px dotted rgba(108, 117, 125, 0.5)',
                zIndex: 1
              }}
            >
              <span 
                className="badge bg-secondary"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '-10px',
                  transform: 'translateY(-50%)'
                }}
              >
                Avg: {currency}{averageSavings.toFixed(0)}
              </span>
            </div>

            {/* Bars Container */}
            <div 
              className="bars d-flex justify-content-between align-items-end"
              style={{ 
                height: '100%',
                position: 'relative',
                padding: '20px 0'
              }}
            >
              {trendData.map((item, index) => (
                <div 
                  key={index}
                  className="bar-group"
                  style={{ 
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Bar */}
                  <div 
                    className="bar"
                    style={{
                      width: '30px',
                      height: `${Math.abs(item.value) / maxValue * 100}%`,
                      backgroundColor: item.value >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.3s ease',
                      position: 'absolute',
                      bottom: item.value >= 0 ? '50%' : 'auto',
                      top: item.value >= 0 ? 'auto' : '50%'
                    }}
                    data-bs-toggle="tooltip"
                    title={`${item.label}: ${currency}${item.value.toFixed(2)}`}
                  >
                    <span 
                      className={`value-label ${item.value >= 0 ? 'text-success' : 'text-danger'}`}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        textAlign: 'center',
                        top: item.value >= 0 ? '-25px' : '100%',
                        fontSize: '0.75rem'
                      }}
                    >
                      {currency}{Math.abs(item.value).toFixed(0)}
                    </span>
                  </div>
                  
                  {/* Month Label */}
                  <div 
                    className="month-label"
                    style={{
                      position: 'absolute',
                      bottom: '-25px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="d-flex justify-content-between mt-4 pt-2 border-top">
            <div className="text-center">
              <small className="text-muted d-block">Monthly Average</small>
              <span className={`fw-medium ${averageSavings >= 0 ? 'text-success' : 'text-danger'}`}>
                {currency}{Math.abs(averageSavings).toFixed(2)}
              </span>
            </div>
            <div className="text-center">
              <small className="text-muted d-block">Target Progress</small>
              <span className="fw-medium">
                {Math.min((totalBalance / targetSavings) * 100, 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-center">
              <small className="text-muted d-block">Current Balance</small>
              <span className="fw-medium">{currency}{totalBalance.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SavingsTrend;
