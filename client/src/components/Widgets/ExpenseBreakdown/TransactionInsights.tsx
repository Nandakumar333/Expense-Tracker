import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { WidgetProps, Transaction, Category } from '../../../common/types';

interface TransactionInsightsProps extends WidgetProps {
  transactions: Transaction[];
  categories: Category[];
  dateRange: { startDate: string; endDate: string };
}

const TransactionInsights: React.FC<TransactionInsightsProps> = ({
  transactions,
  categories,
  currency,
  dateRange,
  loading
}) => {
  const insights = useMemo(() => {
    // Calculate total transactions and amount
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Find busiest day
    const dailyTransactions: { [key: string]: { count: number; amount: number } } = {};
    transactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (!dailyTransactions[date]) {
        dailyTransactions[date] = { count: 0, amount: 0 };
      }
      dailyTransactions[date].count++;
      dailyTransactions[date].amount += Math.abs(t.amount);
    });

    const busiestDay = Object.entries(dailyTransactions)
      .sort(([, a], [, b]) => b.amount - a.amount)[0];

    // Find most expensive category
    const categorySpending: { [key: number]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + Math.abs(t.amount);
      });

    const mostExpensiveCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];

    const categoryName = categories.find(c => 
      c.id === Number(mostExpensiveCategory?.[0]))?.name || 'Unknown';

    // Calculate average transaction size
    const averageAmount = totalAmount / totalTransactions;

    // Find largest transaction
    const largestTransaction = transactions
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];

    return {
      totalTransactions,
      totalAmount,
      averageAmount,
      busiestDay: busiestDay?.[0] ? {
        date: new Date(busiestDay[0]).toLocaleDateString(),
        amount: busiestDay[1].amount,
        count: busiestDay[1].count
      } : null,
      mostExpensiveCategory: {
        name: categoryName,
        amount: mostExpensiveCategory?.[1] || 0
      },
      largestTransaction: largestTransaction ? {
        amount: Math.abs(largestTransaction.amount),
        date: new Date(largestTransaction.date).toLocaleDateString(),
        category: categories.find(c => c.id === largestTransaction.categoryId)?.name || 'Unknown'
      } : null
    };
  }, [transactions, categories]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ height: '200px' }}></span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <h6 className="text-muted mb-4">Transaction Insights</h6>
        
        <div className="insights-list">
          <div className="insight-item mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-primary bg-opacity-10 text-primary me-3">
                <i className="bi bi-graph-up"></i>
              </div>
              <div>
                <h6 className="mb-1">Total Activity</h6>
                <div className="text-muted">
                  {insights.totalTransactions} transactions
                  <span className="mx-2">•</span>
                  {currency}{insights.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {insights.busiestDay && (
            <div className="insight-item mb-3">
              <div className="d-flex align-items-center">
                <div className="icon-box bg-warning bg-opacity-10 text-warning me-3">
                  <i className="bi bi-calendar-event"></i>
                </div>
                <div>
                  <h6 className="mb-1">Busiest Day</h6>
                  <div className="text-muted">
                    {insights.busiestDay.date}
                    <span className="mx-2">•</span>
                    {insights.busiestDay.count} transactions
                    <span className="mx-2">•</span>
                    {currency}{insights.busiestDay.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="insight-item mb-3">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-success bg-opacity-10 text-success me-3">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div>
                <h6 className="mb-1">Average Transaction</h6>
                <div className="text-muted">
                  {currency}{insights.averageAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {insights.mostExpensiveCategory && (
            <div className="insight-item mb-3">
              <div className="d-flex align-items-center">
                <div className="icon-box bg-danger bg-opacity-10 text-danger me-3">
                  <i className="bi bi-tag"></i>
                </div>
                <div>
                  <h6 className="mb-1">Top Category</h6>
                  <div className="text-muted">
                    {insights.mostExpensiveCategory.name}
                    <span className="mx-2">•</span>
                    {currency}{insights.mostExpensiveCategory.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {insights.largestTransaction && (
            <div className="insight-item">
              <div className="d-flex align-items-center">
                <div className="icon-box bg-info bg-opacity-10 text-info me-3">
                  <i className="bi bi-arrow-up-right"></i>
                </div>
                <div>
                  <h6 className="mb-1">Largest Transaction</h6>
                  <div className="text-muted">
                    {currency}{insights.largestTransaction.amount.toFixed(2)}
                    <span className="mx-2">•</span>
                    {insights.largestTransaction.category}
                    <span className="mx-2">•</span>
                    {insights.largestTransaction.date}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.Body>

      <style>{`
        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-box i {
          font-size: 1.2rem;
        }
        .insight-item:not(:last-child) {
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding-bottom: 1rem;
        }
      `}</style>
    </Card>
  );
};

export default TransactionInsights;