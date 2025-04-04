import React, { useState, useCallback } from 'react';
import { Budget, Category } from '../../common/types';
import { Modal, Form, Button, ListGroup, Alert, InputGroup } from 'react-bootstrap';

interface BudgetManagerProps {
  categories: Category[];
  budgets: Budget[];
  onSaveBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: number) => void;
  onClose: () => void;
  currency: string;
  isLoading?: boolean;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({
  categories,
  budgets,
  onSaveBudget,
  onUpdateBudget,
  onDeleteBudget,
  onClose,
  currency,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    id: null as number | null,
    categoryId: categories[0]?.id || 0,
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!formData.categoryId || !formData.amount || !formData.startDate) {
      setError('Please fill in all required fields');
      return false;
    }
    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);
    
    if (!validateForm()) return;

    const budgetData = {
      categoryId: Number(formData.categoryId),
      amount: Number(formData.amount),
      period: formData.period,
      startDate: formData.startDate
    };

    if (isEditing && formData.id) {
      onUpdateBudget({ ...budgetData, id: formData.id });
    } else {
      onSaveBudget(budgetData);
    }

    resetForm();
    setValidated(false);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      categoryId: categories[0]?.id || 0,
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      id: budget.id,
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate
    });
    setIsEditing(true);
  };

  const handleDelete = (budgetId: number) => {
    if (deleteConfirmation === budgetId) {
      onDeleteBudget(budgetId);
      setDeleteConfirmation(null);
    } else {
      setDeleteConfirmation(budgetId);
    }
  };

  const sortedBudgets = useCallback(() => {
    return [...budgets].sort((a, b) => b.amount - a.amount);
  }, [budgets]);

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Budget' : 'Add New Budget'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Budget Amount</Form.Label>
            <InputGroup>
              <InputGroup.Text>{currency}</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
                min="0"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period</Form.Label>
            <Form.Select
              value={formData.period}
              onChange={e => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isEditing ? 'Update Budget' : 'Save Budget')}
            </Button>
            {isEditing && (
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </Form>

        <hr />

        <h6>Current Budgets</h6>
        <ListGroup>
          {sortedBudgets().map(budget => (
            <ListGroup.Item key={budget.id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">
                    {categories.find(c => c.id === budget.categoryId)?.name}
                  </h6>
                  <small className="text-muted">
                    {budget.period === 'monthly' ? 'Monthly' : 'Yearly'} Budget
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="h6 mb-0">{currency}{budget.amount}</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(budget)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={deleteConfirmation === budget.id ? 'danger' : 'outline-danger'}
                    size="sm"
                    onClick={() => handleDelete(budget.id)}
                    disabled={isLoading}
                  >
                    {deleteConfirmation === budget.id ? 'Confirm' : 'Delete'}
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default BudgetManager;
