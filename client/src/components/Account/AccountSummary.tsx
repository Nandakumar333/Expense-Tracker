import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import PrivacyFilter from '../common/PrivacyFilter';

interface AccountData {
  id: string;
  balance: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
}

interface AccountSummaryProps {
  account: AccountData;
  currency: string;
  period?: 'week' | 'month' | 'year';
  showTransactions?: boolean;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({
  account,
  currency,
  period = 'month',
  showTransactions = true
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  const totalBalance = account.balance;
  const totalAssets = account.balance > 0 ? account.balance : 0;
  const totalLiabilities = account.balance < 0 ? Math.abs(account.balance) : 0;

  return (
    <div className={`account-summary theme-${settings?.theme ?? 'light'}`}>
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="stats-icon bg-primary-subtle text-primary">
                    <i className="bi bi-wallet2" />
                  </div>
                </div>
                <div className="ms-3">
                  <h6 className="mb-0">Net Worth</h6>
                  <h4 className="mb-0">
                    <PrivacyFilter type="balance">
                      {formatCurrency(totalBalance)}
                    </PrivacyFilter>
                  </h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="stats-icon bg-success-subtle text-success">
                    <i className="bi bi-graph-up-arrow" />
                  </div>
                </div>
                <div className="ms-3">
                  <h6 className="mb-0">Total Assets</h6>
                  <h4 className="mb-0 text-success">
                    <PrivacyFilter type="balance">
                      {formatCurrency(totalAssets)}
                    </PrivacyFilter>
                  </h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="stats-icon bg-danger-subtle text-danger">
                    <i className="bi bi-graph-down-arrow" />
                  </div>
                </div>
                <div className="ms-3">
                  <h6 className="mb-0">Total Liabilities</h6>
                  <h4 className="mb-0 text-danger">
                    <PrivacyFilter type="balance">
                      {formatCurrency(totalLiabilities)}
                    </PrivacyFilter>
                  </h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Accounts List */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Accounts</h5>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {}}
            >
              <i className="bi bi-plus-lg me-1" />
              Add Account
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="account-list">
            <div
              key={account.id}
              className="account-item p-3 border rounded mb-2"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">{account.id}</h6>
                  <div className={`${account.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    <PrivacyFilter type="balance">
                      {formatCurrency(account.balance)}
                    </PrivacyFilter>
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => {}}
                  >
                    <i className="bi bi-pencil" />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {}}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </div>
              </div>
            </div>
            {account.transactions.length === 0 && (
              <div className="text-center text-muted py-4">
                No transactions added yet.
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};