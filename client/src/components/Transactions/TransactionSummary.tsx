import React from 'react';
import { Row, Col, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';

interface SummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
}

const TransactionSummary: React.FC<SummaryProps> = ({
  totalIncome,
  totalExpense,
  balance,
  currency
}) => {
  const formatAmount = (amount: number) => {
    return `${currency}${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const calculatePercentage = () => {
    if (totalIncome === 0) return 0;
    return ((totalExpense / totalIncome) * 100).toFixed(1);
  };

  const renderSummaryCard = (
    title: string,
    amount: number,
    icon: string,
    variant: string,
    tooltip: string
  ) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltip}</Tooltip>}
    >
      <Card className="summary-card border-0 shadow-sm h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="text-muted mb-1">{title}</h6>
              <h4 className={`mb-0 text-${variant}`}>{formatAmount(amount)}</h4>
              {title === 'Total Expenses' && (
                <small className="text-muted">
                  {calculatePercentage()}% of income
                </small>
              )}
            </div>
            <div className={`rounded-circle bg-${variant} bg-opacity-10 p-3`}>
              <i className={`bi ${icon} text-${variant} fs-4`}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </OverlayTrigger>
  );

  return (
    <Row className="mb-4 g-3">
      <Col md={4}>
        {renderSummaryCard(
          'Total Income',
          totalIncome,
          'bi-arrow-up-circle',
          'success',
          'Total money received'
        )}
      </Col>

      <Col md={4}>
        {renderSummaryCard(
          'Total Expenses',
          totalExpense,
          'bi-arrow-down-circle',
          'danger',
          'Total money spent'
        )}
      </Col>

      <Col md={4}>
        {renderSummaryCard(
          'Net Balance',
          balance,
          'bi-wallet2',
          balance >= 0 ? 'primary' : 'danger',
          'Current balance'
        )}
      </Col>
    </Row>
  );
};

export default TransactionSummary;
