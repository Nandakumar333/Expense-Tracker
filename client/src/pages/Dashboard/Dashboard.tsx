import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import AddAccount from '../Account/AddAccount';
import TransactionModal from '../../components/Transactions/TransactionModal';
import { Account, Category, Transaction, TransactionForm, TransferForm, Budget, CategoryFormData, WidgetData, DashboardSummary } from '../../common/types';
import TotalExpenses from '../../components/Widgets/SummaryWidgets/TotalExpenses';
import ExpenseTrend from '../../components/Widgets/SummaryWidgets/ExpenseTrend';
import SavingsTrend from '../../components/Widgets/SummaryWidgets/SavingsTrend';
import CategoryChart from '../../components/Widgets/ExpenseBreakdown/CategoryChart';
import OverBudgetAlert from '../../components/Widgets/AlertsInsights/OverBudgetAlert';
import UpcomingBills from '../../components/Widgets/AlertsInsights/UpcomingBills';
import BudgetManager from '../../components/Budget/BudgetManager';
import BudgetSpending from '../../components/Widgets/BudgetSpending/BudgetSpending';
import BudgetUtilization from '../../components/Widgets/SummaryWidgets/BudgetUtilization';
import { DashboardService } from '../../services/DashboardService';
import { getBudgets } from '../../services/BudgetService';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Alert, Spinner, Toast } from 'react-bootstrap';
import RecentTransactionsWidget from '../../components/Widgets/RecentTransactions/RecentTransactionsWidget';
import { TransactionService } from '../../services/TransactionService';
import CategoriesWidget from '../../components/Widgets/Categories/CategoriesWidget';
import { CategoryService } from '../../services/CategoryService';
import CategoryPage from '../Categories/CategoryPage';
import CategoryForm from '../../components/Categories/CategoryForm';
import CategoryModal from '../../components/Categories/CategoryModal';
import { useSettingsUtils } from '../../hooks/useSettingsUtils';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import SummaryWidget from '../../components/Widgets/SummaryWidgets/SummaryWidget';
import BudgetSpendingWidget from '../../components/Widgets/BudgetSpending/BudgetSpendingWidget';
import AlertsInsightsWidget from '../../components/Widgets/AlertsInsights/AlertsInsightsWidget';
import LoadingState from '../../components/common/LoadingState';
import BaseWidget from '../../components/Widgets/BaseWidget';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface DashboardError {
  message: string;
  type: 'error' | 'warning';
}

interface DashboardFilters extends Omit<TransactionForm, 'amount'> {
  startDate: string;
  endDate: string;
  amount: number;
  description?: string;
  date?: string;
}

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { formatCurrency, settings } = useUnifiedSettings();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showModal, setShowModal] = useState<'account' | 'transaction' | 'categories' | 'budget' | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: '',
    endDate: '',
    type: 'all',
    categoryId: 'all',
    accountId: 'all',
    amount: 0,
    description: '',
    date: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState<DashboardError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dashboardData, setDashboardData] = useState<WidgetData | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const dashboardService = new DashboardService();
  useSettingsUtils();

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await dashboardService.getDashboardData();
      const calculatedSummary = dashboardService.calculateSummary(
        data.transactions,
        data.accounts
      );
      const widgetData = dashboardService.calculateWidgetData(
        data.transactions,
        data.categories,
        data.accounts,
        data.budgets
      );

      setSummary(calculatedSummary);
      setDashboardData(widgetData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up auto-refresh
  useAutoRefresh({ onRefresh: fetchDashboardData });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getDashboardData();
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTransactions(data.transactions);
        setBudgets(data.budgets);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        handleError('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchBudgets = async () => {
      const fetchedBudgets = await getBudgets();
      setBudgets(fetchedBudgets);
    };
    fetchBudgets();
  }, []);

  const handleOpenModal = (type: 'account' | 'transaction' | 'categories' | 'budget') => {
    setShowModal(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setIsModalOpen(false);
  };

  const handleError = (message: string, type: DashboardError['type'] = 'error') => {
    setError({ message, type });
    setTimeout(() => setError(null), 5000);
  };

  const showToast = (message: string, type: 'success' | 'danger' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const summaryData = dashboardService.calculateSummary(transactions, accounts);
  const widgetData = dashboardService.calculateWidgetData(transactions, categories, accounts, budgets);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesDate = (!filters.startDate || transaction.date >= filters.startDate) &&
                       (!filters.endDate || transaction.date <= filters.endDate);
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory = filters.categoryId === 'all' || transaction.categoryId === Number(filters.categoryId);
    const matchesAccount = filters.accountId === 'all' || transaction.accountId === Number(filters.accountId);

    return matchesDate && matchesType && matchesCategory && matchesAccount;
  });

  const handleAddAccount = (accountData: { name: string; balance: number }) => {
    try {
      const newAccount = dashboardService.addAccount(accountData);
      setAccounts([...accounts, newAccount]);
      handleCloseModal();
    } catch (error) {
      console.error('Error adding account:', error);
      handleError('Error adding account');
    }
  };

  const handleTransaction = (data: TransactionForm) => {
    try {
      const newTransaction = dashboardService.addTransaction(data);
      setTransactions([newTransaction, ...transactions]);
      setAccounts(dashboardService.getAccounts()); // Refresh accounts after transaction
      handleCloseModal();
    } catch (error) {
      console.error('Error adding transaction:', error);
      handleError('Error adding transaction');
    }
  };

  const handleTransfer = (data: TransferForm) => {
    try {
      const newTransactions = dashboardService.transferMoney(data);
      setTransactions([...newTransactions, ...transactions]);
      setAccounts(dashboardService.getAccounts()); // Refresh accounts after transfer
      handleCloseModal();
    } catch (error) {
      console.error('Error performing transfer:', error);
      handleError('Error performing transfer');
    }
  };

  const handleCategoryAction = async (actionType: 'add' | 'edit' | 'delete', categoryData: Category | CategoryFormData | number, parentId?: number | null) => {
    try {
      const categoryService = new CategoryService();
      
      if (actionType === 'delete' && typeof categoryData === 'number') {
        await categoryService.deleteCategory(categoryData);
        setCategories(prev => prev.filter(cat => cat.id !== categoryData));
        showToast('Category deleted successfully', 'success');
        return;
      }

      if (typeof categoryData === 'object') {
        const formData = categoryData as CategoryFormData;
        if (actionType === 'add') {
          const newCategory = await categoryService.addCategory({
            ...formData,
            parentId: parentId ?? formData.parentId
          });
          setCategories(prev => [...prev, newCategory]);
          showToast('Category added successfully', 'success');
        } else {
          const updatedCategory = await categoryService.updateCategory(
            (categoryData as Category).id,
            formData
          );
          setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
          showToast('Category updated successfully', 'success');
        }
        handleCloseModal();
      }
    } catch (error) {
      showToast(`Failed to ${actionType} category`, 'danger');
    }
  };

  const handleSaveBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: budgets.length + 1
    };
    setBudgets([...budgets, newBudget]);
    handleCloseModal();
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (isLoading) {
    return (
      <Container fluid className="dashboard-wrapper py-4">
        <Row className="g-4">
          {[1, 2, 3, 4].map(i => (
            <Col key={i} xs={12} sm={6} lg={3}>
              <LoadingState />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className={`dashboard-wrapper py-4 ${isModalOpen ? 'modal-open' : ''}`}>
      {error && (
        <Alert variant={error.type} dismissible onClose={() => setError(null)} className="mb-4">
          {error.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}</h4>
              <p className="text-muted mb-0">Here's your financial overview</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary"
                onClick={() => handleOpenModal('budget')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-wallet me-2"></i>
                Manage Budget
              </Button>
              <Button 
                variant="primary"
                onClick={() => handleOpenModal('transaction')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Add Transaction
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0 me-3">
                  <div className="stats-icon bg-primary-subtle text-primary">
                    <i className="bi bi-wallet2"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Total Balance</h6>
                </div>
              </div>
              <h3 className="mb-2">{formatCurrency(summaryData.totalBalance)}</h3>
              <div className="text-muted small">
                Across {accounts.length} accounts
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0 me-3">
                  <div className="stats-icon bg-success-subtle text-success">
                    <i className="bi bi-arrow-up-circle"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Monthly Income</h6>
                </div>
              </div>
              <h3 className="mb-2">{formatCurrency(summaryData.monthlyIncome)}</h3>
              <div className="text-muted small">
                From various sources
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0 me-3">
                  <div className="stats-icon bg-danger-subtle text-danger">
                    <i className="bi bi-arrow-down-circle"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Monthly Expenses</h6>
                </div>
              </div>
              <h3 className="mb-2">{formatCurrency(summaryData.monthlyExpense)}</h3>
              <div className="text-muted small">
                Across all categories
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0 me-3">
                  <div className="stats-icon bg-info-subtle text-info">
                    <i className="bi bi-piggy-bank"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="card-title mb-0">Monthly Savings</h6>
                </div>
              </div>
              <h3 className="mb-2">{formatCurrency(summaryData.monthlySavings)}</h3>
              <div className="text-muted small">
                Target savings progress
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Row className="g-4">
            <Col xs={12}>
              {/* Expense Trend Chart */}
              <BaseWidget 
                title="Income vs Expenses"
                loading={isLoading}
                height={350}
                action={
                  <div className="btn-group">
                    <Button
                      size="sm"
                      variant={viewMode === 'monthly' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('monthly')}
                    >
                      Monthly
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'yearly' ? 'primary' : 'outline-primary'}
                      onClick={() => setViewMode('yearly')}
                    >
                      Yearly
                    </Button>
                  </div>
                }
              >
                <ExpenseTrend
                  data={widgetData.monthlyTrends.map(trend => ({
                    date: trend.month,
                    income: trend.income,
                    expenses: trend.expense
                  }))}
                  transactions={transactions}
                  currency={settings?.currency ?? 'USD'}
                  loading={isLoading}
                  height={300}
                  showLegend={true}
                />
              </BaseWidget>
            </Col>

            <Col md={6}>
              <BaseWidget 
                title="Expense Distribution"
                loading={isLoading}
                height={350}
              >
                <CategoryChart
                  data={widgetData.categoryDistribution.map(cat => ({
                    ...cat,
                    percentage: (cat.amount / summaryData.monthlyExpense) * 100
                  }))}
                  loading={isLoading}
                  showLegend={true}
                  height={300}
                  title=""
                />
              </BaseWidget>
            </Col>

            <Col md={6}>
              <BaseWidget 
                title="Savings Progress"
                loading={isLoading}
                height={350}
              >
                <SavingsTrend
                  data={widgetData.monthlyTrends.map(trend => ({
                    date: trend.month,
                    savings: trend.income - trend.expense,
                    target: widgetData.savingsTarget
                  }))}
                  targetSavings={widgetData.savingsTarget}
                  currentSavings={summaryData.monthlyIncome - summaryData.monthlyExpense}
                  loading={isLoading}
                  height={300}
                  showLegend={true}
                />
              </BaseWidget>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col xs={12}>
              <BaseWidget 
                title="Recent Transactions"
                loading={isLoading}
                action={
                  <Link to="/transactions" className="btn btn-link btn-sm text-decoration-none">
                    View All
                  </Link>
                }
              >
                <RecentTransactionsWidget 
                  limit={5}
                  showFilters={false}
                  compact={true}
                  transactions={filteredTransactions}
                  categories={categories}
                  accounts={accounts}
                  filters={filters}
                  currencySymbol={settings?.currency ?? '$'}
                  onFilterChange={handleFilterChange}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  onAddTransaction={() => handleOpenModal('transaction')}
                />
              </BaseWidget>
            </Col>
          </Row>
        </Col>

        <Col lg={4}>
          <Row className="g-4">
            <Col xs={12}>
              <BaseWidget 
                title="Accounts Overview"
                loading={isLoading}
                action={
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenModal('account')}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                }
              >
                {accounts.map(account => (
                  <div key={account.id} className="account-item p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{account.name}</h6>
                        <div className="d-flex gap-3">
                          <small className="text-success">
                            <i className="bi bi-arrow-up-short"></i>
                            {formatCurrency(account.balance)}
                          </small>
                        </div>
                      </div>
                      <h5 className="mb-0">{formatCurrency(account.balance)}</h5>
                    </div>
                  </div>
                ))}
              </BaseWidget>
            </Col>

            <Col xs={12}>
              <BaseWidget 
                title="Budget Overview"
                loading={isLoading}
                action={
                  <Button 
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenModal('budget')}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                }
              >
                <BudgetSpending
                  data={widgetData.budgetSpending.map(budget => ({
                    categoryId: budget.categoryId,
                    categoryName: categories.find(c => c.id === budget.categoryId)?.name || 'Unknown',
                    spent: budget.spent,
                    budgeted: budget.total,
                    color: categories.find(c => c.id === budget.categoryId)?.color || '#cccccc'
                  }))}
                  loading={isLoading}
                  title=""
                  height={300}
                  showLegend={true}
                />
              </BaseWidget>
            </Col>

            <Col xs={12}>
              <BaseWidget 
                title="Alerts & Insights"
                loading={isLoading}
              >
                <AlertsInsightsWidget
                  summary={summary || {
                    totalSavings: 0,
                    yearlyExpense: 0,
                    totalBalance: 0,
                    monthlyIncome: 0,
                    monthlyExpense: 0,
                    monthlySavings: 0
                  }}
                  className="mb-0"
                />
              </BaseWidget>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modal Container */}
      <div className={`modal-backdrop ${isModalOpen ? 'show' : ''}`}>
        {showModal === 'account' && (
          <div className="modal-dialog-wrapper">
            <AddAccount
              onAdd={handleAddAccount}
              onClose={handleCloseModal}
            />
          </div>
        )}

        {showModal === 'transaction' && (
          <div className="modal-dialog-wrapper">
            <TransactionModal
              show={true}
              mode="add"
              accounts={accounts}
              categories={categories}
              onTransaction={handleTransaction}
              onTransfer={handleTransfer}
              onClose={handleCloseModal}
              selectedTransaction={null}
            />
          </div>
        )}

        {showModal === 'categories' && (
          <CategoryModal
            show={true}
            onClose={handleCloseModal}
            categories={categories}
            selectedCategory={selectedCategory}
            parentCategoryId={null}
            onAddCategory={(data) => handleCategoryAction('add', { ...data, type: data.type as 'income' | 'expense' })}
            onEditCategory={(id, data) => handleCategoryAction('edit', { ...data, id, type: data.type as 'income' | 'expense' })}
          />
        )}

        {showModal === 'budget' && (
          <div className="modal-dialog-wrapper">
            <BudgetManager
              categories={categories}
              budgets={budgets}
              onSaveBudget={handleSaveBudget}
              onClose={handleCloseModal}
              currency={settings?.currency ?? 'USD'}
              onDeleteBudget={(budgetId: number) => {
                setBudgets(budgets.filter(budget => budget.id !== budgetId));
              }}
              onUpdateBudget={(updatedBudget: Budget) => {
                setBudgets(budgets.map(budget => 
                  budget.id === updatedBudget.id ? updatedBudget : budget
                ));
              }}
            />
          </div>
        )}
      </div>

      {toast && (
        <Toast
          show={true}
          onClose={() => setToast(null)}
          className="position-fixed bottom-0 end-0 m-3"
          bg={toast.type}
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      )}
    </Container>
  );
};

export default Dashboard;

