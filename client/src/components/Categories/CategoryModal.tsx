import React from 'react';
import { Modal } from 'react-bootstrap';
import { Category, CategoryForm as CategoryFormType } from '../../common/types';
import CategoryForm from './CategoryForm';
import { useUnifiedSettings } from '../../hooks/useUnifiedSettings';

interface CategoryModalProps {
  show: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory?: Category | null;
  parentCategoryId: number | null;
  onAddCategory: (data: CategoryFormType) => Promise<void>;
  onEditCategory: (id: number, data: CategoryFormType) => Promise<void>;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  show,
  onClose,
  categories,
  selectedCategory,
  parentCategoryId,
  onAddCategory,
  onEditCategory
}) => {
  const { settings } = useUnifiedSettings();

  const handleSubmit = (data: CategoryFormType) => {
    if (selectedCategory) {
      onEditCategory(selectedCategory.id, { ...data, parentId: parentCategoryId });
    } else {
      onAddCategory({ ...data, parentId: parentCategoryId });
    }
    onClose();
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [show, onClose]);

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      centered 
      className={`category-modal theme-${settings?.theme ?? 'light'}`}
      aria-labelledby="category-modal-title"
      backdrop="static"
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title id="category-modal-title">
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CategoryForm
          category={selectedCategory || undefined}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </Modal.Body>
    </Modal>
  );
};

export default CategoryModal;
