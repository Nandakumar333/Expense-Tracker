import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Category, CategoryForm as CategoryFormType } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormType) => void;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onClose }) => {
  const { settings } = useUnifiedSettings();
  const [formData, setFormData] = useState<CategoryFormType>({
    name: '',
    type: 'expense',
    color: '#6c757d',
    icon: 'bi-tag',
    parentId: null
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon ?? 'bi-tag',
        parentId: category.parentId ?? null
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit} className={`theme-${settings?.theme ?? 'light'}`}>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Type</Form.Label>
        <Form.Select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Color</Form.Label>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
          <div
            className="color-preview"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: formData.color,
              borderRadius: '4px'
            }}
          />
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Icon</Form.Label>
        <Form.Select
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
        >
          <option value="bi-tag">Tag</option>
          <option value="bi-cart">Cart</option>
          <option value="bi-house">House</option>
          <option value="bi-car-front">Car</option>
          <option value="bi-cash">Cash</option>
          <option value="bi-credit-card">Credit Card</option>
          <option value="bi-gift">Gift</option>
          <option value="bi-heart">Heart</option>
          <option value="bi-lightbulb">Utilities</option>
          <option value="bi-phone">Phone</option>
          <option value="bi-shop">Shop</option>
          <option value="bi-basket">Groceries</option>
        </Form.Select>
        <div className="mt-2">
          <i className={`bi ${formData.icon} fs-4`} style={{ color: formData.color }} />
        </div>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {category ? 'Update' : 'Add'} Category
        </Button>
      </div>
    </Form>
  );
};

export default CategoryForm;
