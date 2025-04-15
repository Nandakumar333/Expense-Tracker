import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import PrivacyFilter from '../common/PrivacyFilter';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  totalIncome,
  totalExpense,
  balance
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  return (
    <Row className="mb-4">
      <Col md={4}>
        <Card className={`border-0 shadow-sm theme-${settings?.theme ?? 'light'}`}>
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="stats-icon bg-success-subtle text-success">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
              </div>
              <div>
                <h6 className="mb-1">Total Income</h6>
                <h4 className="mb-0 text-success">
                  <PrivacyFilter type="amount">
                    {formatCurrency(totalIncome)}
                  </PrivacyFilter>
                </h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={4}>
        <Card className={`border-0 shadow-sm theme-${settings?.theme ?? 'light'}`}>
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="stats-icon bg-danger-subtle text-danger">
                  <i className="bi bi-graph-down-arrow"></i>
                </div>
              </div>
              <div>
                <h6 className="mb-1">Total Expenses</h6>
                <h4 className="mb-0 text-danger">
                  <PrivacyFilter type="amount">
                    {formatCurrency(totalExpense)}
                  </PrivacyFilter>
                </h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={4}>
        <Card className={`border-0 shadow-sm theme-${settings?.theme ?? 'light'}`}>
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className={`stats-icon ${balance >= 0 ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'}`}>
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
              <div>
                <h6 className="mb-1">Net Balance</h6>
                <h4 className={`mb-0 ${balance >= 0 ? 'text-primary' : 'text-warning'}`}>
                  <PrivacyFilter type="amount">
                    {formatCurrency(balance)}
                  </PrivacyFilter>
                </h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionSummary;
