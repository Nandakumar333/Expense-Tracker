import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Category, Account } from '../../common/types';
import DateRangePicker from '../common/DateRangePicker';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface TransactionFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    type: string;
    categoryId: string;
    accountId: string;
    search: string;
  };
  categories: Category[];
  accounts: Account[];
  onFilterChange: (filters: any) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  categories,
  accounts,
  onFilterChange
}) => {
  const { settings } = useUnifiedSettings();

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className={`transaction-filters mb-4 theme-${settings?.theme ?? 'light'}`}>
      <Form>
        <Row className="g-3">
          <Col md={6} lg={4}>
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <DateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(date) => handleFilterChange('startDate', date)}
                onEndDateChange={(date) => handleFilterChange('endDate', date)}
              />
            </Form.Group>
          </Col>

          <Col md={6} lg={2}>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
                <option value="transfer">Transfers</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={2}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} lg={2}>
            <Form.Group>
              <Form.Label>Account</Form.Label>
              <Form.Select
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
              >
                <option value="all">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col lg={2}>
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default TransactionFilters;
