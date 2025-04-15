import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { useUnifiedSettings } from '../../../hooks/useUnifiedSettings';
import BaseWidget from '../BaseWidget';
import { Transaction, Account, Category, TransactionForm } from '../../../common/types';
import PrivacyFilter from '../../common/PrivacyFilter';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  filters: TransactionForm;
  showFilters: boolean;
  currencySymbol: string;
  limit?: number;
  compact?: boolean;
  onFilterChange: (filters: TransactionForm) => void;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
}

const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  categories,
  accounts,
  filters,
  showFilters,
  onFilterChange,
  onToggleFilters,
  onAddTransaction
}) => {
  const { settings, formatCurrency, formatDate } = useUnifiedSettings();

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  const getAccountName = (accountId: number) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown Account';
  };

  const getTransactionTypeVariant = (type: string) => {
    switch (type) {
      case 'income':
        return 'success';
      case 'expense':
        return 'danger';
      case 'transfer':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <BaseWidget title="Recent Transactions">
      <div className={`recent-transactions theme-${settings?.theme ?? 'light'}`}>
        <div className="d-flex justify-content-between mb-3">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onToggleFilters}
          >
            <i className="bi bi-funnel me-1"></i>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddTransaction}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Transaction
          </Button>
        </div>

        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th className="text-end">Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date, settings?.dateFormat)}</td>
                    <td>
                      <PrivacyFilter type="note" showToggle>
                        {transaction.description}
                      </PrivacyFilter>
                    </td>
                    <td>{getCategoryName(transaction.categoryId)}</td>
                    <td>{getAccountName(transaction.accountId)}</td>
                    <td className="text-end">
                      <PrivacyFilter type="amount" showToggle>
                        <span className={transaction.type === 'expense' ? 'text-danger' : 'text-success'}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </PrivacyFilter>
                    </td>
                    <td>
                      <Badge bg={getTransactionTypeVariant(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </BaseWidget>
  );
};

export default RecentTransactionsWidget;
