import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Transaction, Category, Account } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import PrivacyFilter from '../common/PrivacyFilter';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  accounts,
  onEdit,
  onDelete
}) => {
  const { settings, formatCurrency, formatDate } = useUnifiedSettings();

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  const getAccountName = (accountId: number) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown Account';
  };

  return (
    <div className={`transaction-table theme-${settings?.theme ?? 'light'}`}>
      <Table hover responsive>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Account</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date, settings?.dateFormat ?? 'MM/dd/yyyy')}</td>
              <td>
                <PrivacyFilter type="note">
                  {transaction.description}
                </PrivacyFilter>
              </td>
              <td>
                <Badge 
                  bg={transaction.type === 'income' ? 'success' : 
                      transaction.type === 'expense' ? 'danger' : 
                      'info'}
                >
                  {getCategoryName(transaction.categoryId)}
                </Badge>
              </td>
              <td>
                <PrivacyFilter type="account">
                  {getAccountName(transaction.accountId)}
                </PrivacyFilter>
              </td>
              <td>
                <PrivacyFilter type="amount">
                  <span className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </PrivacyFilter>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(transaction)}
                >
                  <i className="bi bi-pencil" />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(transaction.id)}
                >
                  <i className="bi bi-trash" />
                </Button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No transactions found. Add your first transaction to get started.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TransactionTable;