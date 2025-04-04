import React, { useState, useEffect } from 'react';
import { Spinner, Toast, Container, Row, Col } from 'react-bootstrap';
import { Category } from '../../common/types';
import { CategoryService } from '../../services/CategoryService';
import CategoryForm from '../../components/Categories/CategoryForm';
import CategoryList from '../../components/Categories/CategoryList';
import CategoryFilter from '../../components/Categories/CategoryFilter';

interface ToastMessage {
  message: string;
  type: 'success' | 'danger' | 'warning';
}

interface CategoryPageProps {
  isModal?: boolean;
  filter?: 'all' | 'income' | 'expense';
  categories?: Category[];
  onAddCategory?: (category: Category) => Promise<void>;
  onDeleteCategory?: (id: number) => Promise<void>;
  onClose?: () => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  isModal = false,
  filter: initialFilter = 'all',
  categories: initialCategories,
  onAddCategory,
  onDeleteCategory,
  onClose
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(!initialCategories);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>(initialFilter);

  // Modify loadCategories to only load if not in modal mode
  useEffect(() => {
    if (!initialCategories) {
      loadCategories();
    }
  }, [initialCategories]);

  const showToast = (message: string, type: ToastMessage['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCategories = async () => {
    try {
      const categoryService = new CategoryService();
      const data = await categoryService.getCategories();
      setCategories(data);
      showToast('Categories loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load categories:', error);
      showToast('Failed to load categories', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Update handlers to use props if provided
  const handleAddCategory = async (newCategory: Category) => {
    try {
      if (onAddCategory) {
        await onAddCategory(newCategory);
      } else {
        const categoryService = new CategoryService();
        await categoryService.updateCategory(newCategory);
        setCategories([...categories, newCategory]);
      }
      showToast('Category added successfully', 'success');
    } catch (error) {
      console.error('Failed to add category:', error);
      showToast('Failed to add category', 'danger');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      if (onDeleteCategory) {
        await onDeleteCategory(id);
      } else {
        const categoryService = new CategoryService();
        await categoryService.deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
      }
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete category:', error);
      showToast('Failed to delete category', 'danger');
    }
  };

  // Filter categories
  const filteredCategories = filter === 'all' 
    ? categories 
    : categories.filter(cat => cat.type === filter);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className={isModal ? 'p-0' : 'py-4'}>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Categories Management</h4>
            <CategoryFilter filter={filter} onFilterChange={setFilter} />
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <CategoryForm categories={categories} onAddCategory={handleAddCategory} />
          <div className="categories-list">
            <CategoryList 
              categories={filteredCategories} 
              onDeleteCategory={handleDeleteCategory} 
            />
          </div>
        </Col>
      </Row>

      {toast && (
        <Toast
          show={true}
          onClose={() => setToast(null)}
          className={`position-fixed bottom-0 end-0 m-3 text-${toast.type === 'warning' ? 'dark' : 'white'}`}
          bg={toast.type}
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      )}
    </Container>
  );
};

export default CategoryPage;
