import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Category } from '../../../common/types';

interface CategoryListItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

const CategoryListItem: React.FC<CategoryListItemProps> = ({
    category,
    onEdit,
    onDelete
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete(category.id);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    return (
        <div className="d-flex align-items-center p-2 rounded border category-item">
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
                    <div className="btn-group">
                        <span className={`badge bg-${category.type === 'income' ? 'success' : 'danger'} me-2`}>
                            {category.type}
                        </span>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-0 me-2"
                            onClick={() => onEdit(category)}
                        >
                            <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                            variant={showDeleteConfirm ? "danger" : "link"}
                            size="sm"
                            className={showDeleteConfirm ? "" : "text-danger p-0"}
                            onClick={handleDelete}
                            onBlur={() => setTimeout(() => setShowDeleteConfirm(false), 200)}
                        >
                            <i className="bi bi-trash"></i>
                            {showDeleteConfirm && " Confirm"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryListItem;
