import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Toast, ToastContainer, Spinner, Alert, ProgressBar, ButtonGroup, Badge } from 'react-bootstrap';
import BudgetManager from '../../components/Budget/BudgetManager';
import OverBudgetAlert from '../../components/Budget/OverBudgetAlert';
import { budgetService } from '../../services/BudgetService';
import { CategoryService } from '../../services/CategoryService';
import { TransactionService } from '../../services/TransactionService';
import { Budget, Category, Transaction } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface BudgetWithSpending extends Budget {
  currentSpending: number;
  progress: number;
  remainingBudget: number;
  transactions: Transaction[];
}

interface ToastMessage {
  text: string;
  variant: 'success' | 'danger' | 'warning';
}

const BudgetPage: React.FC = () => {
  const { settings, formatCurrency } = useUnifiedSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [toast, setToast] = useState<ToastMessage>({ text: '', variant: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'monthly' | 'yearly'>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'name' | 'progress'>('progress');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    fetchData();
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const categoryService = new CategoryService();
      const transactionService = new TransactionService();
      const [fetchedCategories, fetchedBudgets, fetchedTransactions] = await Promise.all([
        categoryService.getCategories(),
        budgetService.getBudgets(),
        transactionService.getTransactions()
      ]);
      setCategories(fetchedCategories);
      setBudgets(fetchedBudgets);
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError('Failed to load budget data. Please try again.');
      showNotification('Error loading data', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const newBudget = await budgetService.saveBudget(budget);
      setBudgets([...budgets, newBudget]);
      showNotification('Budget saved successfully', 'success');
      setShowBudgetManager(false);
    } catch (err) {
      showNotification('Failed to save budget', 'danger');
    }
  };

  const handleUpdateBudget = async (budget: Budget) => {
    try {
      const updatedBudget = await budgetService.updateBudget(budget);
      setBudgets(budgets.map(b => b.id === budget.id ? updatedBudget : b));
      showNotification('Budget updated successfully', 'success');
      setShowBudgetManager(false);
      setSelectedBudget(null);
    } catch (err) {
      showNotification('Failed to update budget', 'danger');
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await budgetService.deleteBudget(budgetId);
      setBudgets(budgets.filter(budget => budget.id !== budgetId));
      showNotification('Budget deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete budget', 'danger');
    }
  };

  const showNotification = (text: string, variant: ToastMessage['variant'] = 'success') => {
    setToast({ text, variant });
    setShowToast(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetManager(true);
  };

  const budgetsWithSpending = useMemo<BudgetWithSpending[]>(() => {
    return budgets.map(budget => {
      const budgetTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const budgetStartDate = new Date(budget.startDate);
        const isInPeriod = budget.period === 'monthly' 
          ? transactionDate.getMonth() === budgetStartDate.getMonth() && 
            transactionDate.getFullYear() === budgetStartDate.getFullYear()
          : transactionDate.getFullYear() === budgetStartDate.getFullYear();
        
        return t.categoryId === budget.categoryId && isInPeriod;
      });

      const currentSpending = Math.abs(budgetTransactions.reduce((sum, t) => sum + t.amount, 0));
      const progress = (currentSpending / budget.amount) * 100;
      const remainingBudget = budget.amount - currentSpending;

      return {
        ...budget,
        currentSpending,
        progress,
        remainingBudget,
        transactions: budgetTransactions
      };
    });
  }, [budgets, transactions]);

  const filteredBudgets = budgetsWithSpending
    .filter(budget => filter === 'all' ? true : budget.period === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'progress':
          return b.progress - a.progress;
        case 'name':
          const categoryA = categories.find(c => c.id === a.categoryId)?.name || '';
          const categoryB = categories.find(c => c.id === b.categoryId)?.name || '';
          return categoryA.localeCompare(categoryB);
        default:
          return 0;
      }
    });

  const overBudgetItems = filteredBudgets.filter(budget => budget.progress > 100);

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Budget Management</h4>
              <small className="text-muted">
                Track and manage your spending limits across categories
              </small>
            </div>
            <Button variant="primary" onClick={() => {
              setSelectedBudget(null);
              setShowBudgetManager(true);
            }}>
              <i className="bi bi-plus-lg me-2"></i>
              Add New Budget
            </Button>
          </div>
        </Col>
      </Row>

      {overBudgetItems.length > 0 && (
        <Row className="mb-4">
          <Col>
            {overBudgetItems.map(budget => (
              <OverBudgetAlert
                key={budget.id}
                budget={budget}
                category={categories.find(c => c.id === budget.categoryId)!}
                currentSpending={budget.currentSpending}
                onViewDetails={() => handleEditBudget(budget)}
                onAdjustBudget={() => handleEditBudget(budget)}
              />
            ))}
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <ButtonGroup size="sm">
                  <Button 
                    variant={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filter === 'monthly' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('monthly')}
                  >
                    Monthly
                  </Button>
                  <Button 
                    variant={filter === 'yearly' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('yearly')}
                  >
                    Yearly
                  </Button>
                </ButtonGroup>
                <ButtonGroup size="sm">
                  <Button 
                    variant={sortBy === 'progress' ? 'secondary' : 'outline-secondary'}
                    onClick={() => setSortBy('progress')}
                  >
                    Sort by Progress
                  </Button>
                  <Button 
                    variant={sortBy === 'amount' ? 'secondary' : 'outline-secondary'}
                    onClick={() => setSortBy('amount')}
                  >
                    Sort by Amount
                  </Button>
                  <Button 
                    variant={sortBy === 'name' ? 'secondary' : 'outline-secondary'}
                    onClick={() => setSortBy('name')}
                  >
                    Sort by Name
                  </Button>
                </ButtonGroup>
              </div>

              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : filteredBudgets.length === 0 ? (
                <Alert variant="info">
                  No budgets found. Click the "Add New Budget" button to create one.
                </Alert>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {filteredBudgets.map(budget => {
                    const category = categories.find(c => c.id === budget.categoryId);
                    if (!category) return null;

                    return (
                      <Col key={budget.id}>
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Body>
                            <Card.Title className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="d-flex align-items-center gap-2">
                                  <i className={`bi ${category.icon}`} style={{ color: category.color }} />
                                  <span>{category.name}</span>
                                </div>
                                <Badge 
                                  bg={budget.period === 'monthly' ? 'info' : 'warning'}
                                  className="mt-1"
                                >
                                  {budget.period}
                                </Badge>
                              </div>
                              <div className="text-end">
                                <div className="h5 mb-0">{formatCurrency(budget.amount)}</div>
                                <small className="text-muted">budget</small>
                              </div>
                            </Card.Title>
                            
                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small>Spent: {formatCurrency(budget.currentSpending)}</small>
                                <small className={budget.remainingBudget < 0 ? 'text-danger' : 'text-success'}>
                                  {budget.remainingBudget < 0 ? 'Over by: ' : 'Remaining: '}
                                  {formatCurrency(Math.abs(budget.remainingBudget))}
                                </small>
                              </div>
                              <ProgressBar 
                                now={budget.progress}
                                variant={budget.progress > 90 ? 'danger' : budget.progress > 75 ? 'warning' : 'success'}
                                className="mb-3"
                              />
                            </div>

                            <div className="d-flex gap-2 mt-3">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleEditBudget(budget)}
                              >
                                <i className="bi bi-pencil me-1"></i> Edit
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteBudget(budget.id)}
                              >
                                <i className="bi bi-trash me-1"></i> Delete
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showBudgetManager && (
        <BudgetManager
          categories={categories}
          budgets={budgets}
          onSaveBudget={handleSaveBudget}
          onUpdateBudget={handleUpdateBudget}
          onDeleteBudget={handleDeleteBudget}
          onClose={() => {
            setShowBudgetManager(false);
            setSelectedBudget(null);
          }}
          selectedBudget={selectedBudget || undefined}
          currency={settings?.currency || 'USD'}
        />
      )}

      <ToastContainer className="position-fixed bottom-0 end-0 p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toast.variant}
          className="text-white"
        >
          <Toast.Body>{toast.text}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default BudgetPage;
