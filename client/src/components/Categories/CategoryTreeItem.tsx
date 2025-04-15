import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Category } from '../../common/types';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';
import './CategoryTreeItem.css';

interface CategoryTreeItemProps {
  category: Category;
  children?: React.ReactNode;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onAddSubcategory: (parentId: number | null) => void;
  showAmount?: boolean;
  amount?: number;
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
  depth = 0
}) => {
  const { settings, formatCurrency } = useUnifiedSettings();

  return (
    <div className={`category-tree-item theme-${settings?.theme ?? 'light'}`} style={{ marginLeft: `${depth * 20}px` }}>
      <div className="category-content p-2 rounded mb-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <i className={`bi ${category.icon} me-2`} style={{ color: category.color }} />
            <span className="category-name">{category.name}</span>
            {showAmount && (
              <Badge bg={category.type === 'expense' ? 'danger' : 'success'} className="ms-2">
                {formatCurrency(amount)}
              </Badge>
            )}
          </div>
          <div className="category-actions">
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              onClick={() => onEdit(category)}
            >
              <i className="bi bi-pencil text-primary" />
            </Button>
            <Button
              variant="link"
              size="sm"
              className="p-0"
              onClick={() => onDelete(category.id)}
            >
              <i className="bi bi-trash text-danger" />
            </Button>
          </div>
        </div>
      </div>
      {children && (
        <div className="subcategories">
          {children}
        </div>
      )}
    </div>
  );
};

export default CategoryTreeItem;
