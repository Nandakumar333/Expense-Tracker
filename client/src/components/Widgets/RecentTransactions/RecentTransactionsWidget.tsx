import React from 'react';
import { Card, Button, Table, Badge } from 'react-bootstrap';
import TransactionFilters from '../../Transactions/TransactionFilters';
import { Transaction, Account, Category } from '../../../common/types';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  filters: any;
  showFilters: boolean;
  currencySymbol: string;
  onFilterChange: (filters: any) => void;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
}

const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  categories,
  accounts,
  filters,
  showFilters,
  currencySymbol,
  onFilterChange,
  onToggleFilters,
  onAddTransaction
}) => {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">Recent Transactions</Card.Title>
        <div>
          <Button 
            variant="outline-secondary" 
            size="sm"
            className="me-2" 
            onClick={onToggleFilters}
          >
            <i className={`bi bi-funnel${showFilters ? '-fill' : ''}`}></i> Filter
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={onAddTransaction}
          >
            <i className="bi bi-plus-lg"></i> Add Transaction
          </Button>
        </div>
      </Card.Header>
      
      {showFilters && (
        <Card.Body className="border-bottom">
          <TransactionFilters
            filters={filters}
            categories={categories}
            onFilterChange={onFilterChange}
          />
        </Card.Body>
      )}

      <Card.Body className="p-0">
        <Table hover responsive className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Account</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.categoryId);
              const account = accounts.find(a => a.id === transaction.accountId);
              
              return (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.description}</td>
                  <td>
                    {category && (
                      <Badge style={{ 
                        backgroundColor: category.color + '20',
                        color: category.color,
                        padding: '6px 12px',
                        fontWeight: 500
                      }}>
                        {category.name}
                      </Badge>
                    )}
                  </td>
                  <td>
                    <span className="text-secondary">
                      {account?.name || 'Unknown Account'}
                    </span>
                  </td>
                  <td className={`text-end ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{currencySymbol}
                    {Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No transactions found matching the filters
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default RecentTransactionsWidget;
