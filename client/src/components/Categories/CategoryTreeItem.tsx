import React from 'react';
import { Button, Badge, ProgressBar } from 'react-bootstrap';
import { Category } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import './CategoryTreeItem.css';

interface CategoryTreeItemProps {
  category: Category;
  children?: React.ReactNode;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onAddSubcategory: (id: number) => void;
  showAmount?: boolean;
  amount?: number;
  budget?: number;
  depth?: number;
  level: number;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  children,
  onEdit,
  onDelete,
  onAddSubcategory,
  showAmount = false,
  amount = 0,
  budget = 0,
  depth = 0
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();
  const progress = budget > 0 ? (amount / budget) * 100 : 0;
  const variant = progress > 90 ? 'danger' : progress > 75 ? 'warning' : 'success';

  return (
    <div className={`category-tree-item theme-${settings?.theme ?? 'light'}`} style={{ marginLeft: `${depth * 20}px` }}>
      <div className="category-content p-2 rounded mb-2">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            <i className={`bi ${category.icon} me-2`} style={{ color: category.color }} />
            <span className="category-name">{category.name}</span>
            <Badge 
              bg={category.type === 'income' ? 'success' : 'danger'}
              className="ms-2"
            >
              {category.type}
            </Badge>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            {showAmount && (
              <div className="budget-progress">
                <small className="text-muted d-block mb-1">
                  {budget > 0 
                    ? `${formatCurrency(amount)} / ${formatCurrency(budget)}`
                    : formatCurrency(amount)
                  }
                </small>
                {budget > 0 && (
                  <ProgressBar 
                    now={progress} 
                    variant={variant} 
                    style={{ width: '120px', height: '6px' }} 
                  />
                )}
              </div>
            )}
            
            <div className="category-actions">
              <Button
                variant="light"
                size="sm"
                onClick={() => onAddSubcategory(category.id)}
                title="Add subcategory"
              >
                <i className="bi bi-plus-lg" />
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => onEdit(category)}
                title="Edit category"
              >
                <i className="bi bi-pencil" />
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => onDelete(category.id)}
                title="Delete category"
              >
                <i className="bi bi-trash" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default CategoryTreeItem;
