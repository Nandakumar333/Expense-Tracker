import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Category } from '../../../common/types';

interface CategoriesWidgetProps {
    categories: Category[];
    onAddCategory: (categories: Category) => void;
    onDeleteCategory: (id: number) => void;
    currencySymbol: string;
}

const CategoriesWidget: React.FC<CategoriesWidgetProps> = ({
    categories,
    onAddCategory,
    onDeleteCategory,
    currencySymbol
}) => {
    return (
        <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0">
                <div className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0">Categories</Card.Title>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAddCategory({ id: 0, name: '', type: 'expense', color: '#000000' })}
                    >
                        <i className="bi bi-plus-lg"></i> Add Category
                    </Button>
                </div>
            </Card.Header>
            <Card.Body>
                <Row xs={1} md={2} className="g-3">
                    {categories.map(category => (
                        <Col key={category.id}>
                            <div className="d-flex align-items-center p-2 rounded border">
                                <div 
                                    className="rounded me-2"
                                    style={{ 
                                        backgroundColor: category.color,
                                        width: '24px',
                                        height: '24px',
                                        flexShrink: 0
                                    }}
                                />
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-medium">{category.name}</span>
                                        <div>
                                            <span className={`badge bg-${category.type === 'income' ? 'success' : 'danger'} me-2`}>
                                                {category.type}
                                            </span>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="text-danger p-0"
                                                onClick={() => onDeleteCategory(category.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CategoriesWidget;
