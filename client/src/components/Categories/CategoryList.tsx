import React, { useState } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Category } from '../../common/types';

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: number) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onDeleteCategory }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (showDeleteConfirm === id) {
      onDeleteCategory(id);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(id);
    }
  };

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {categories.length === 0 ? (
        <Col>
          <Alert variant="info">
            No categories found. Add your first category above.
          </Alert>
        </Col>
      ) : (
        categories.map(category => (
          <Col key={category.id}>
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: category.color + '10' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="rounded"
                      style={{ 
                        backgroundColor: category.color,
                        width: '24px',
                        height: '24px',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <h6 className="mb-0">{category.name}</h6>
                      <span className={`badge bg-${category.type === 'income' ? 'success' : 'danger'}`}>
                        {category.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={showDeleteConfirm === category.id ? 'danger' : 'outline-danger'}
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <i className="bi bi-trash"></i>
                    {showDeleteConfirm === category.id ? ' Confirm' : ' Delete'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))
      )}
    </Row>
  );
};

export default CategoryList;
