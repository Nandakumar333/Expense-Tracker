import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import { Transaction, Category, Account } from '../../common/types';

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
  currency,
  onEdit,
  onDelete
}) => {
  const formatAmount = (amount: number) => {
    return `${currency}${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getAccountName = (accountId: number) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  return (
    <>
      <Card.Header className="bg-transparent border-bottom">
        <h5 className="mb-0">Recent Transactions</h5>
      </Card.Header>
      <Table responsive hover className="mb-0">
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
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.description}</td>
                <td>
                  <Badge bg="secondary" className="rounded-pill">
                    {getCategoryName(transaction.categoryId)}
                  </Badge>
                </td>
                <td>{getAccountName(transaction.accountId)}</td>
                <td>
                  <span className={transaction.type === 'expense' ? 'text-danger' : 'text-success'}>
                    {formatAmount(transaction.amount)}
                  </span>
                </td>
                <td>
                  <Button
                    variant="light"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(transaction)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    className="text-danger"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
};

export default TransactionList;
