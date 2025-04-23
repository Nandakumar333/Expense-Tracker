import React, { useState, useEffect, memo } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Budget, Category } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

type BudgetPeriod = 'monthly' | 'yearly';

interface BudgetFormData {
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
  description: string;
  rollover: boolean;
}

interface BudgetManagerProps {
  categories: Category[];
  budgets: Budget[];
  onSaveBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onClose: () => void;
  onDeleteBudget: (budgetId: number) => void;
  selectedBudget?: Budget;
  currency: string;
}

const BudgetManager: React.FC<BudgetManagerProps> = memo(({
  categories,
  budgets,
  onSaveBudget,
  onUpdateBudget,
  onClose,
  selectedBudget,
  currency
}) => {
  const { settings } = useUnifiedSettings();
  const [formData, setFormData] = useState<BudgetFormData>(() => ({
    categoryId: selectedBudget?.categoryId.toString() || '',
    amount: selectedBudget?.amount.toString() || '',
    period: selectedBudget?.period || 'monthly',
    startDate: selectedBudget?.startDate || new Date().toISOString().split('T')[0],
    description: selectedBudget?.description || '',
    rollover: selectedBudget?.rollover || false
  }));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Reset form when selected budget changes
    setFormData({
      categoryId: selectedBudget?.categoryId.toString() || '',
      amount: selectedBudget?.amount.toString() || '',
      period: selectedBudget?.period || 'monthly',
      startDate: selectedBudget?.startDate || new Date().toISOString().split('T')[0],
      description: selectedBudget?.description || '',
      rollover: selectedBudget?.rollover || false
    });
  }, [selectedBudget]);

  // Filter out categories that already have budgets unless it's the selected budget's category
  const availableCategories = categories.filter(category => 
    category.type === 'expense' && 
    (!budgets.some(b => b.categoryId === category.id) || category.id === selectedBudget?.categoryId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.categoryId || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = Number(formData.amount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const budgetData = {
      ...formData,
      categoryId: Number(formData.categoryId),
      amount: amount,
      period: formData.period
    };

    if (selectedBudget) {
      onUpdateBudget({ ...budgetData, id: selectedBudget.id });
    } else {
      onSaveBudget(budgetData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <Modal show={true} onHide={onClose} centered className={`theme-${settings?.theme ?? 'light'}`}>
      <Modal.Header closeButton>
        <Modal.Title>{selectedBudget ? 'Edit Budget' : 'Create New Budget'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount ({currency})</Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period</Form.Label>
            <Form.Select
              name="period"
              value={formData.period}
              onChange={handleChange}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="rollover"
              checked={formData.rollover}
              onChange={handleChange}
              label="Roll over unused budget to next period"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedBudget ? 'Update' : 'Create'} Budget
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
});

export default BudgetManager;
