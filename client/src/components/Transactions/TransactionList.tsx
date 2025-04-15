import React from 'react';
import { Table, Badge } from 'react-bootstrap';
import { Transaction, Category, Account } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import PrivacyFilter from '../common/PrivacyFilter';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currency: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  categories, 
  accounts, 
  onEdit, 
  onDelete 
}) => {
  const { settings, formatCurrency, formatDate } = useUnifiedSettings();

  return (
    <div className={`transaction-list theme-${settings?.theme ?? 'light'}`}>
      <Table hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Account</th>
            <th className="text-end">Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date, settings?.dateFormat ?? 'MM/dd/yyyy')}</td>
              <td>
                <PrivacyFilter type="note" showToggle>
                  {transaction.description}
                </PrivacyFilter>
              </td>
              <td>
                <Badge bg={transaction.type === 'expense' ? 'danger' : 'success'}>
                  {transaction.categoryName}
                </Badge>
              </td>
              <td>
                <PrivacyFilter type="account">
                  {transaction.accountName}
                </PrivacyFilter>
              </td>
              <td className={`text-end ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                <PrivacyFilter type="amount">
                  {formatCurrency(Math.abs(transaction.amount))}
                </PrivacyFilter>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEdit(transaction)}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TransactionList;
