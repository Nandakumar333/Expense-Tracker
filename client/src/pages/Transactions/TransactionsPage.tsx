import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Dropdown } from 'react-bootstrap';
import TransactionFilters from '../../components/Transactions/TransactionFilters';
import TransactionSummary from '../../components/Transactions/TransactionSummary';
import TransactionList from '../../components/Transactions/TransactionList';
import TransactionModal from '../../components/Transactions/TransactionModal';
import { useAuth } from '../../context/AuthContext';
import { Transaction, Account, Category, TransactionForm, TransferForm } from '../../common/types';
import { TransactionService } from '../../services/TransactionService';
import { AccountService } from '../../services/AccountService';
import { CategoryService } from '../../services/CategoryService';
import './TransactionsPage.css';

// Move services outside component to prevent recreation on each render
const transactionService = new TransactionService();
const accountService = new AccountService();
const categoryService = new CategoryService();

const TransactionsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    categoryId: 'all',
    accountId: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate summary whenever transactions change
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    setSummaryData({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });
  }, [transactions]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedAccounts, loadedCategories, loadedTransactions] = await Promise.all([
        accountService.getAccounts() || [],
        categoryService.getCategories() || [],
        transactionService.getTransactions() || []
      ]);

      if (!loadedTransactions || !loadedAccounts || !loadedCategories) {
        throw new Error('Failed to load data');
      }

      setAccounts(loadedAccounts);
      setCategories(loadedCategories);
      setTransactions(loadedTransactions);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencySymbol = () => {
    switch(userProfile?.currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory = filters.categoryId === 'all' || transaction.categoryId === Number(filters.categoryId);
    const matchesAccount = filters.accountId === 'all' || transaction.accountId === Number(filters.accountId);
    const matchesDate = (!filters.startDate || transaction.date >= filters.startDate) &&
                       (!filters.endDate || transaction.date <= filters.endDate);

    return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesDate;
  });

  const handleTransaction = async (data: TransactionForm) => {
    try {
      if (showModal === 'edit' && selectedTransaction) {
        // Handle edit
        const updatedTransaction = {
          ...selectedTransaction,
          ...data,
          categoryId: Number(data.categoryId),
          amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
          type: data.type as 'income' | 'expense' | 'transfer'
        };
        await handleEditTransaction(updatedTransaction);
      } else {
        // Handle create
        const newTransaction = await transactionService.addTransaction(data);
        setTransactions([newTransaction, ...transactions]);
        await loadData(); // Reload to update balances
      }
      setShowModal(null);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Failed to save transaction');
    }
  };

  const handleTransfer = async (data: TransferForm) => {
    try {
      const newTransactions = await transactionService.transferMoney(data);
      await loadData(); // Reload to get updated balances and transactions
      setShowModal(null);
    } catch (err) {
      setError('Failed to process transfer');
    }
  };

  const handleEditTransaction = async (transaction: Transaction) => {
    try {
      await transactionService.updateTransaction(transaction);
      await loadData(); // Reload to get updated data
      setShowModal(null);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Failed to update transaction');
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction({
      ...transaction,
      amount: Math.abs(transaction.amount)
    });
    setShowModal('edit');
  };

  const handleDeleteTransaction = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      transactionService.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleTransactionAction = useCallback(async (action: 'add' | 'edit' | 'delete', data?: any) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'add':
          await handleTransaction(data);
          break;
        case 'edit':
          await handleEditTransaction(data);
          break;
        case 'delete':
          await handleDeleteTransaction(data);
          break;
      }
      await loadData();
    } catch (err) {
      setError(`Failed to ${action} transaction`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Transactions</h4>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-transaction">
              <i className="bi bi-plus-lg me-2"></i>Add Transaction
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowModal('add')}>
                <i className="bi bi-plus-circle text-success me-2"></i>Add Income
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowModal('add')}>
                <i className="bi bi-dash-circle text-danger me-2"></i>Add Expense
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setShowModal('add')}>
                <i className="bi bi-arrow-left-right text-info me-2"></i>Transfer Money
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TransactionSummary
        totalIncome={summaryData.totalIncome}
        totalExpense={summaryData.totalExpense}
        balance={summaryData.balance}
        currency={getCurrencySymbol()}
      />

      <TransactionFilters
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
      />

      <Card className="border-0 shadow-sm">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            accounts={accounts}
            currency={getCurrencySymbol()}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransaction}
          />
        )}
      </Card>

      <TransactionModal
        show={!!showModal}
        mode={showModal}
        accounts={accounts}
        categories={categories}
        onTransaction={handleTransaction}
        onTransfer={handleTransfer}
        onClose={() => {
          setShowModal(null);
          setSelectedTransaction(null);
        }}
        selectedTransaction={selectedTransaction}
      />
    </Container>
  );
};

export default TransactionsPage;
