import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parentId?: string;
  children?: Category[];
  budget?: number;
  spent?: number;
  color: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  currency: string;
  showBudget?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onSelect,
  onEdit,
  onDelete,
  currency,
  showBudget = true
}) => {
  const { settings } = useUnifiedSettings();
  
  return (
    <div className={`category-list theme-${settings?.theme ?? 'light'}`}>
      <Table responsive hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Color</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category: Category) => (
            <tr key={category.id}>
              <td>
                <div className="d-flex align-items-center">
                  <span
                    className="color-dot me-2"
                    style={{
                      backgroundColor: category.color,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}
                  />
                  <i className={`bi ${category.icon} me-2`} style={{ color: category.color }} />
                  {category.name}
                </div>
              </td>
              <td>
                <span className={`badge bg-${category.type === 'income' ? 'success' : 'danger'}`}>
                  {category.type}
                </span>
              </td>
              <td>
                <div
                  className="color-preview"
                  style={{
                    backgroundColor: category.color,
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px'
                  }}
                />
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => onEdit(category)}
                  >
                    <i className="bi bi-pencil" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onDelete(category.id)}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted py-4">
                No categories found. Add your first category to get started.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CategoryList;