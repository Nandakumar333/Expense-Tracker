import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import AddAccount from '../Account/AddAccount';
import TransactionModal from '../../components/Transactions/TransactionModal';
import { Account, Category, Transaction, TransactionForm, TransferForm, Budget } from '../../common/types';
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

interface DashboardError {
  message: string;
  type: 'error' | 'warning';
}

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showModal, setShowModal] = useState<'account' | 'transaction' | 'categories' | 'budget' | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    categoryId: 'all',
    accountId: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState<DashboardError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  const dashboardService = new DashboardService();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = dashboardService.getDashboardData();
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

  const getCurrencySymbol = () => {
    switch(userProfile?.currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

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

  const handleCategoryAction = async (actionType: 'add' | 'delete', categoryData: Category | number) => {
    try {
      const categoryService = new CategoryService();
      if (actionType === 'add') {
        const newCategory = categoryData as Category;
        await categoryService.updateCategory(newCategory);
        setCategories([...categories, newCategory]);
        showToast('Category added successfully', 'success');
      } else {
        const categoryId = categoryData as number;
        await categoryService.deleteCategory(categoryId);
        setCategories(categories.filter(cat => cat.id !== categoryId));
        showToast('Category deleted successfully', 'success');
      }
    } catch (error) {
      console.error(`Failed to ${actionType} category:`, error);
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

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className={`dashboard-wrapper py-4 ${isModalOpen ? 'modal-open' : ''}`}>
      {error && (
        <Alert variant={error.type} dismissible onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}

      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}</h4>
              <p className="text-muted mb-0">Here's your financial overview</p>
            </div>
            <Button 
              variant="primary"
              onClick={() => handleOpenModal('transaction')}
              className="d-flex align-items-center"
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Transaction
            </Button>
          </div>
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row className="g-3 mb-4">
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
              <h3 className="mb-2">{getCurrencySymbol()}{summaryData.totalBalance.toFixed(2)}</h3>
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
              <h3 className="mb-2">{getCurrencySymbol()}{summaryData.monthlyIncome.toFixed(2)}</h3>
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
              <h3 className="mb-2">{getCurrencySymbol()}{summaryData.monthlyExpense.toFixed(2)}</h3>
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
              <h3 className="mb-2">{getCurrencySymbol()}{summaryData.monthlySavings.toFixed(2)}</h3>
              <div className="text-muted small">
                Target savings progress
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row className="g-4">
        <Col lg={8}>
          {/* Expense vs Income Chart */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="border-0 bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Income vs Expenses</Card.Title>
                <div className="btn-group">
                  <Button
                    variant={viewMode === 'monthly' ? 'secondary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setViewMode('monthly')}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={viewMode === 'yearly' ? 'secondary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setViewMode('yearly')}
                  >
                    Yearly
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <ExpenseTrend
                transactions={transactions}
                currency={getCurrencySymbol()}
                loading={isLoading}
                height={300}
                showLegend={true} data={[]}              />
              <Row className="mt-4">
                <Col md={4}>
                  <div className="text-center p-3 border-end">
                    <div className="text-muted mb-1">Income</div>
                    <h4 className="text-success mb-0">
                      {getCurrencySymbol()}
                      {summaryData.monthlyIncome.toFixed(2)}
                    </h4>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 border-end">
                    <div className="text-muted mb-1">Expenses</div>
                    <h4 className="text-danger mb-0">
                      {getCurrencySymbol()}
                      {summaryData.monthlyExpense.toFixed(2)}
                    </h4>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <div className="text-muted mb-1">Net Balance</div>
                    <h4 className={summaryData.monthlySavings >= 0 ? 'text-success' : 'text-danger'}>
                      {getCurrencySymbol()}
                      {Math.abs(summaryData.monthlySavings).toFixed(2)}
                    </h4>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Categories Widget */}
          <CategoriesWidget
            categories={categories}
            onAddCategory={() => handleOpenModal('categories')}
            onDeleteCategory={(id: number) => handleCategoryAction('delete', id)}
            currencySymbol={getCurrencySymbol()}
          />

          {/* Recent Transactions Card */}
          <RecentTransactionsWidget
            transactions={filteredTransactions}
            categories={categories}
            accounts={accounts}
            filters={filters}
            showFilters={showFilters}
            currencySymbol={getCurrencySymbol()}
            onFilterChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onAddTransaction={() => handleOpenModal('transaction')}
          />

          {/* Bottom Row Analytics */}
          <Row className="g-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <CategoryChart
                    title="Expense Distribution"
                    data={widgetData.categoryExpenses.map(category => ({
                      name: categories.find(c => c.id === category.categoryId)?.name || 'Unknown',
                      amount: category.amount,
                      percentage: (category.amount / widgetData.categoryExpenses.reduce((sum, cat) => sum + cat.amount, 0)) * 100,
                      color: categories.find(c => c.id === category.categoryId)?.color || '#000000'
                    }))}
                    currency={getCurrencySymbol()}
                    loading={isLoading} categoryExpense={[]} showLegend={false} height={0}                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="border-0 bg-transparent">
                  <Card.Title className="mb-0">Savings Trend</Card.Title>
                </Card.Header>
                <Card.Body>
                  <SavingsTrend
                    transactions={transactions}
                    accounts={accounts}
                    currency={getCurrencySymbol()}
                    targetSavings={5000}
                    currentSavings={summaryData.monthlySavings}
                    data={widgetData.monthlyTrends}
                    loading={isLoading} showLegend={false} height={0}                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col lg={4}>
          {/* Accounts Summary */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Accounts</Card.Title>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => handleOpenModal('account')}
              >
                <i className="bi bi-plus-lg"></i>
              </Button>
            </Card.Header>
            <Card.Body>
              {widgetData.accountSummary.map(account => (
                <div key={account.id} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-medium">{account.name}</span>
                    <span className="fw-bold">{getCurrencySymbol()}{account.balance.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <small className="text-success">
                      <i className="bi bi-arrow-up-short"></i>
                      {getCurrencySymbol()}{account.monthlyIncome.toFixed(2)}
                    </small>
                    <small className="text-danger">
                      <i className="bi bi-arrow-down-short"></i>
                      {getCurrencySymbol()}{account.monthlyExpense.toFixed(2)}
                    </small>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Budget Overview */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Budget Overview</Card.Title>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => handleOpenModal('budget')}
              >
                <i className="bi bi-plus-lg"></i>
              </Button>
            </Card.Header>
            <Card.Body>
              {widgetData.budgetSpending.length > 0 ? (
                <BudgetSpending
                  data={widgetData.budgetSpending.map(spending => ({
                    ...spending,
                    budgeted: budgets.find(b => b.categoryId === spending.categoryId)?.amount || 0,
                    color: categories.find(c => c.id === spending.categoryId)?.color || '#000000'
                  }))}
                  currency={getCurrencySymbol()}
                  loading={isLoading}
                  title="Monthly Budget" categoryExpense={[]} showLegend={false} height={0}                />
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-pie-chart mb-2 fs-2"></i>
                  <p className="mb-0">No budgets set yet</p>
                  <Button 
                    variant="outline-primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleOpenModal('budget')}
                  >
                    Set up your first budget
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Budget Summary */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <Card.Title className="mb-0">Budget Summary</Card.Title>
            </Card.Header>
            <Card.Body>
              <ul>
                {budgets.map(budget => (
                  <li key={budget.id}>
                    {budget.categoryId} - {budget.amount} ({budget.period})
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          {/* Alerts Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
              <Card.Title className="mb-0">Alerts & Reminders</Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <OverBudgetAlert
                alerts={budgets.map(budget => {
                  const spent = widgetData.categoryExpenses.find(exp => exp.categoryId === budget.categoryId
                  )?.amount || 0;
                  return {
                    category: categories.find(c => c.id === budget.categoryId)?.name || 'Unknown',
                    budgeted: budget.amount,
                    spent: spent,
                    percentageUsed: (spent / budget.amount) * 100
                  };
                }).filter(alert => alert.percentageUsed > 80)}
                currency={getCurrencySymbol()}
                loading={isLoading} title={''} categoryExpense={[]} data={[]} showLegend={false} height={0}              />
              <hr className="my-3" />
              <UpcomingBills
                bills={widgetData.upcomingBills.map(bill => ({
                  id: bill.id,
                  name: bill.description,
                  amount: bill.amount,
                  dueDate: bill.dueDate,
                  isPaid: false,
                  isRecurring: false,
                  status: 'upcoming',
                  category: categories.find(c => c.id === bill.categoryId)?.name || 'Unknown'
                }))}
                currency={getCurrencySymbol()}
                loading={isLoading} title={''} categoryExpense={[]} data={[]} showLegend={false} height={0}              />
            </Card.Body>
          </Card>
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
          <div className="modal-dialog-wrapper">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Categories</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body p-0">
                <CategoryForm
                  categories={categories}
                  onAddCategory={(category: Category) => handleCategoryAction('add', category)}
                />
              </div>
            </div>
          </div>
        )}

        {showModal === 'budget' && (
          <div className="modal-dialog-wrapper">
            <BudgetManager
              categories={categories}
              budgets={budgets}
              onSaveBudget={handleSaveBudget}
              onClose={handleCloseModal}
              currency={getCurrencySymbol()}
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

function showToast(arg0: string, arg1: string) {
  throw new Error('Function not implemented.');
}
