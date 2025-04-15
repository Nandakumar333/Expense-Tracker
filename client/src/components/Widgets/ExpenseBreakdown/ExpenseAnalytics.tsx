import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { WidgetProps, Transaction } from '../../../common/types';

interface ExpenseAnalyticsProps extends WidgetProps {
  transactions: Transaction[];
  previousPeriodTransactions: Transaction[];
  dateRange: { startDate: string; endDate: string };
}

const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({
  transactions,
  previousPeriodTransactions,
  currency,
  loading,
  dateRange
}) => {
  const calculateMetrics = (currentTransactions: Transaction[], previousTransactions: Transaction[]) => {
    const currentIncome = currentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const currentSavings = currentIncome - currentExpenses;

    const previousIncome = previousTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const previousExpenses = previousTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const previousSavings = previousIncome - previousExpenses;

    const incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100;
    const expensesChange = ((currentExpenses - previousExpenses) / previousExpenses) * 100;
    const savingsChange = ((currentSavings - previousSavings) / Math.abs(previousSavings)) * 100;

    return {
      currentIncome,
      currentExpenses,
      currentSavings,
      incomeChange,
      expensesChange,
      savingsChange
    };
  };

  const metrics = calculateMetrics(transactions, previousPeriodTransactions);

  const renderMetricCard = (
    title: string,
    currentValue: number,
    percentageChange: number,
    type: 'success' | 'danger' | 'primary'
  ) => (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="text-muted mb-0">{title}</h6>
          <span className={`badge bg-${type}-subtle text-${type}`}>
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
          </span>
        </div>
        <h3 className={`mb-0 text-${type}`}>
          {currency}{Math.abs(currentValue).toFixed(2)}
        </h3>
      </Card.Body>
    </Card>
  );

  return (
    <Row className="g-4 mb-4">
      <Col md={4}>
        {renderMetricCard(
          'Total Income',
          metrics.currentIncome,
          metrics.incomeChange,
          'success'
        )}
      </Col>
      <Col md={4}>
        {renderMetricCard(
          'Total Expenses',
          metrics.currentExpenses,
          metrics.expensesChange,
          'danger'
        )}
      </Col>
      <Col md={4}>
        {renderMetricCard(
          'Net Savings',
          metrics.currentSavings,
          metrics.savingsChange,
          'primary'
        )}
      </Col>
    </Row>
  );
};

export default ExpenseAnalytics;