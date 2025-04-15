import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { DashboardSummary } from '../../../common/types';
import { useSettings } from '../../../context/SettingsContext';
import BaseWidget from '../BaseWidget';

interface SummaryWidgetProps {
  data: DashboardSummary;
  loading?: boolean;
}

const SummaryWidget: React.FC<SummaryWidgetProps> = ({ data, loading = false }) => {
  const { formatCurrency } = useSettings();

  const summaryItems = [
    {
      title: 'Total Balance',
      value: data.totalBalance,
      icon: 'bi-wallet2',
      colorClass: 'text-primary'
    },
    {
      title: 'Monthly Income',
      value: data.monthlyIncome,
      icon: 'bi-graph-up-arrow',
      colorClass: 'text-success'
    },
    {
      title: 'Monthly Expenses',
      value: data.monthlyExpense,
      icon: 'bi-graph-down-arrow',
      colorClass: 'text-danger'
    },
    {
      title: 'Monthly Savings',
      value: data.monthlySavings,
      icon: 'bi-piggy-bank',
      colorClass: data.monthlySavings >= 0 ? 'text-success' : 'text-danger'
    }
  ];

  return (
    <BaseWidget title="Financial Summary" loading={loading}>
      <Row>
        {summaryItems.map((item, index) => (
          <Col key={index} sm={6} lg={3} className="mb-3 mb-lg-0">
            <Card className="border-0 h-100">
              <Card.Body className="d-flex align-items-center">
                <i className={`bi ${item.icon} fs-1 me-3 ${item.colorClass}`} />
                <div>
                  <div className="text-muted small">{item.title}</div>
                  <div className={`fs-5 fw-bold ${item.colorClass}`}>
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </BaseWidget>
  );
};

export default SummaryWidget;