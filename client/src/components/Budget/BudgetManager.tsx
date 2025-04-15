import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Budget, Category } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface BudgetManagerProps {
  categories: Category[];
  budgets: Budget[];
  currency: string;
  onSaveBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: number) => void;
  onUpdateBudget: (budget: Budget) => void;
  onClose: () => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({
  categories,
  budgets,
  onSaveBudget,
  onDeleteBudget,
  onUpdateBudget,
  onClose
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget({
      categoryId: Number(formData.categoryId),
      amount: Number(formData.amount),
      period: formData.period as 'monthly' | 'yearly',
      startDate: ''
    });
    setFormData({ categoryId: '', amount: '', period: 'monthly' });
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      categoryId: budget.categoryId.toString(),
      amount: budget.amount.toString(),
      period: budget.period
    });
  };

  return (
    <Modal show onHide={onClose} centered className={`theme-${settings?.theme ?? 'light'}`}>
      <Modal.Header closeButton>
        <Modal.Title>Budget Manager</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories
                .filter(category => category.type === 'expense')
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Budget Amount ({settings?.currency})</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period</Form.Label>
            <Form.Select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit">
            Add Budget
          </Button>
        </Form>

        <hr />

        <h6>Current Budgets</h6>
        <div className="budget-list">
          {budgets.map(budget => (
            <div key={budget.id} className="budget-item p-3 border rounded mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{categories.find(c => c.id === budget.categoryId)?.name}</strong>
                  <div className="text-muted small">
                    {formatCurrency(budget.amount)} per {budget.period}
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(budget)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDeleteBudget(budget.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {budgets.length === 0 && (
            <div className="text-muted text-center py-3">
              No budgets set yet
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BudgetManager;
