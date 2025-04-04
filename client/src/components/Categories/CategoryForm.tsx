import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Category } from '../../common/types';

interface CategoryFormProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categories, onAddCategory }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#e74c3c');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      setError('Category already exists');
      return;
    }

    const newCategory: Category = {
      id: categories.length + 1,
      name: name.trim(),
      type,
      color
    };

    onAddCategory(newCategory);
    setName('');
    setType('expense');
    setColor('#e74c3c');
    setError('');
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="g-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Color</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    title="Choose category color"
                  />
                  <Button type="submit" variant="primary" className="flex-grow-1">
                    <i className="bi bi-plus-lg"></i> Add
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CategoryForm;
