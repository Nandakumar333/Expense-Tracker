import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Toast, ToastContainer, Spinner, Alert, ProgressBar, ButtonGroup, Badge } from 'react-bootstrap';
import BudgetManager from '../../components/Budget/BudgetManager';
import { getBudgets, saveBudget, deleteBudget, updateBudget } from '../../services/BudgetService';
import { CategoryService } from '../../services/CategoryService';
import { Budget, Category } from '../../common/types';

interface ToastMessage {
  text: string;
  variant: 'success' | 'danger' | 'warning';
}

const BudgetPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const [toast, setToast] = useState<ToastMessage>({ text: '', variant: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'monthly' | 'yearly'>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'name'>('amount');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const categoryService = new CategoryService();
      const [fetchedCategories, fetchedBudgets] = await Promise.all([
        categoryService.getCategories(),
        getBudgets()
      ]);
      setCategories(fetchedCategories);
      setBudgets(fetchedBudgets);
    } catch (err) {
      setError('Failed to load budget data. Please try again.');
      showNotification('Error loading data', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const newBudget = await saveBudget(budget);
      setBudgets([...budgets, newBudget]);
      showNotification('Budget saved successfully', 'success');
    } catch (err) {
      showNotification('Failed to save budget', 'danger');
    }
  };

  const handleUpdateBudget = async (budget: Budget) => {
    try {
      const updatedBudget = await updateBudget(budget);
      setBudgets(budgets.map(b => b.id === budget.id ? updatedBudget : b));
      showNotification('Budget updated successfully', 'success');
    } catch (err) {
      showNotification('Failed to update budget', 'danger');
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    try {
      await deleteBudget(budgetId);
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

  const handleOpenBudgetManager = () => {
    setShowBudgetManager(true);
  };

  const handleCloseBudgetManager = () => {
    setShowBudgetManager(false);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const filteredBudgets = budgets
    .filter(budget => filter === 'all' ? true : budget.period === filter)
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      return getCategoryName(a.categoryId).localeCompare(getCategoryName(b.categoryId));
    });

  const calculateBudgetProgress = (budget: Budget) => {
    return Math.floor(Math.random() * 100); // Replace with actual calculation
  };

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Budget Management</h4>
            <Button variant="primary" onClick={handleOpenBudgetManager}>
              <i className="bi bi-plus-lg me-2"></i>
              Add New Budget
            </Button>
          </div>
        </Col>
      </Row>

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
                  {filteredBudgets.map(budget => (
                    <Col key={budget.id}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <Card.Title className="d-flex justify-content-between">
                            <span>{getCategoryName(budget.categoryId)}</span>
                            <Badge bg={budget.period === 'monthly' ? 'info' : 'warning'}>
                              {budget.period}
                            </Badge>
                          </Card.Title>
                          <Card.Text className="h4 mb-3">
                            {currency} {budget.amount.toLocaleString()}
                          </Card.Text>
                          <ProgressBar 
                            now={calculateBudgetProgress(budget)}
                            variant={calculateBudgetProgress(budget) > 90 ? 'danger' : 'success'}
                            className="mb-3"
                          />
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => {
                                setShowBudgetManager(true);
                              }}
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
                  ))}
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
          onClose={handleCloseBudgetManager}
          currency={currency}
        />
      )}

      <ToastContainer className="position-fixed bottom-0 end-0 p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toast.variant}
          bg-text="white"
        >
          <Toast.Body>{toast.text}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default BudgetPage;
