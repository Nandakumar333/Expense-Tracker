import React, { useState, useEffect, useCallback } from 'react';
import { Spinner, Toast, Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, CategoryFormData } from '../../common/types';
import { CategoryService } from '../../services/CategoryService';
import CategoryForm from '../../components/Categories/CategoryForm';
import CategoryFilter from '../../components/Categories/CategoryFilter';
import CategoryListItem from '../../components/Widgets/Categories/CategoryListItem';
import CategoryTreeItem from '../../components/Categories/CategoryTreeItem';
import CategoryModal from '../../components/Categories/CategoryModal';

interface ToastMessage {
  message: string;
  type: 'success' | 'danger' | 'warning';
}

interface CategoryTreeItem extends Category {
  children: CategoryTreeItem[];
  level: number;
}

interface CategoryPageProps {
  isModal?: boolean;
  filter?: 'all' | 'income' | 'expense';
  categories?: Category[];
  onAddCategory?: (category: Category) => Promise<void>;
  onDeleteCategory?: (id: number) => Promise<void>;
  onClose?: () => void;
}

const SortableItem = ({ category, onEdit, onDelete, onAddSub, actionInProgress }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${category.level * 2}rem`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="category-content">
        <div className="d-flex align-items-center" {...listeners}>
          <i className="bi bi-grip-vertical me-2 text-muted" />
          <div 
            className="color-dot"
            style={{ backgroundColor: category.color }}
          />
          <span className="ms-2">{category.name}</span>
          <Badge 
            bg={category.type === 'income' ? 'success' : 'danger'}
            className="ms-2"
          >
            {category.type}
          </Badge>
        </div>
        <div className="category-actions">
          <Button
            variant="light"
            size="sm"
            onClick={() => onAddSub(category.id)}
          >
            <i className="bi bi-plus-lg" />
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <i className="bi bi-pencil" />
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => onDelete(category.id)}
            disabled={category.children?.length > 0 || actionInProgress === `deleting-${category.id}`}
          >
            {actionInProgress === `deleting-${category.id}` ? (
              <Spinner size="sm" />
            ) : (
              <i className="bi bi-trash" />
            )}
          </Button>
        </div>
      </div>
      {category.children?.length > 0 && (
        <div className="ms-4">
          <SortableContext 
            items={category.children.map((c: CategoryTreeItem) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {category.children.map((child: CategoryTreeItem) => (
              <SortableItem 
                key={child.id}
                category={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSub={onAddSub}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [parentCategory, setParentCategory] = useState<number | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const categoryService = new CategoryService();

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
    setActionInProgress('loading');
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      showToast('Failed to load categories. Please try again.', 'danger');
    } finally {
      setActionInProgress(null);
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (data: CategoryFormData) => {
    setActionInProgress('adding');
    try {
      // Optimistic update
      const tempId = Date.now();
      const tempCategory = {
        ...data,
        id: tempId,
        parentId: data.parentId || null,
        children: []
      };

      setCategories(prev => [...prev, tempCategory]);
      setShowModal(false);

      const newCategory = await categoryService.addCategory({
        ...data,
        parentId: data.parentId || null
      });
      
      setCategories(prev => prev.map(c => c.id === tempId ? newCategory : c));
      showToast('Category added successfully', 'success');
    } catch (error) {
      await loadCategories(); // Reload on error
      showToast('Failed to add category. Please try again.', 'danger');
    } finally {
      setActionInProgress(null);
      setParentCategory(null);
    }
  };

  const handleEditCategory = useCallback(async (category: Category) => {
    setSelectedCategory(category);
    setParentCategory(category.parentId ?? null);
    setShowModal(true);
  }, []);

  const handleSaveCategory = async (id: number, data: CategoryFormData) => {
    setActionInProgress('updating');
    try {
      // Optimistic update
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, ...data } : c
      ));
      setShowModal(false);

      const updatedCategory = await categoryService.updateCategory(id, data);
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...updatedCategory, children: c.children } : c
      ));
      showToast('Category updated successfully', 'success');
    } catch (error) {
      await loadCategories(); // Reload on error
      showToast('Failed to update category. Please try again.', 'danger');
    } finally {
      setActionInProgress(null);
      setSelectedCategory(null);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setActionInProgress(`deleting-${id}`);
    try {
      // Optimistic update
      setCategories(prev => prev.filter(c => c.id !== id));
      await categoryService.deleteCategory(id);
      showToast('Category deleted successfully', 'success');
    } catch (error) {
      await loadCategories(); // Reload on error
      showToast('Failed to delete category. Please try again.', 'danger');
    } finally {
      setActionInProgress(null);
    }
  };

  const buildCategoryTree = (categories: Category[]) => {
    const categoryMap = new Map<number, CategoryTreeItem>();
    const rootCategories: CategoryTreeItem[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0
      });
    });

    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          const child = categoryMap.get(category.id);
          if (child) {
            child.level = parent.level + 1;
            parent.children.push(child);
          }
        }
      } else {
        const root = categoryMap.get(category.id);
        if (root) rootCategories.push(root);
      }
    });

    return rootCategories;
  };

  const handleAddSubcategory = (parentId: number | null) => {
    setSelectedCategory(null);
    setParentCategory(parentId);
    setShowModal(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUpdateCategoryParent = async (sourceId: number, destinationId: number | null) => {
    try {
      const sourceCategory = categories.find(c => c.id === sourceId);
      if (!sourceCategory) throw new Error('Category not found');
      
      await categoryService.updateCategory(sourceId, {
        name: sourceCategory.name,
        type: sourceCategory.type,
        color: sourceCategory.color,
        parentId: destinationId
      });
      await loadCategories(); // Reload categories to reflect the new structure
      showToast('Category moved successfully', 'success');
    } catch (error) {
      showToast('Failed to move category', 'danger');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const sourceId = active.id as number;
    const destinationId = over.id as number;
    
    handleUpdateCategoryParent(sourceId, destinationId);
  };

  // Get tree structure for display
  const categoryTree = React.useMemo(() => {
    return categoryService.buildCategoryTree(
      filter === 'all' ? categories : categories.filter(c => c.type === filter)
    );
  }, [categories, filter]);

  const filteredCategories = filter === 'all' 
    ? categories 
    : categories.filter(cat => cat.type === filter);

  const stats = {
    total: filteredCategories.length,
    income: categories.filter(c => c.type === 'income').length,
    expense: categories.filter(c => c.type === 'expense').length
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className={isModal ? 'p-0' : 'py-4'}>
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white px-4 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="mb-0">Categories</h5>
                    <Badge bg="secondary" className="rounded-pill">
                      {stats.total}
                    </Badge>
                  </div>
                  <div className="mt-1 d-flex gap-3">
                    <small className="text-success">
                      <i className="bi bi-arrow-up-circle-fill me-1"></i>
                      {stats.income} Income
                    </small>
                    <small className="text-danger">
                      <i className="bi bi-arrow-down-circle-fill me-1"></i>
                      {stats.expense} Expense
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <CategoryFilter filter={filter} onFilterChange={setFilter} />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddSubcategory(null)}
                    className="d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-lg"></i>
                    Add Category
                  </Button>
                </div>
              </div>
            </Card.Header>

            <div className="px-4 py-2 border-bottom bg-light">
              <small className="text-muted">
                Organize your transactions by creating categories and subcategories. 
                Drag and drop to rearrange them.
              </small>
            </div>

            <Card.Body className="p-0">
              {categoryTree.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="categories-container">
                    <SortableContext
                      items={categoryTree.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {categoryTree
                        .filter(cat => filter === 'all' || cat.type === filter)
                        .map((category) => (
                          <SortableItem
                            key={category.id}
                            category={category}
                            onEdit={handleEditCategory}
                            onDelete={handleDeleteCategory}
                            onAddSub={handleAddSubcategory}
                            actionInProgress={actionInProgress}
                          />
                        ))}
                    </SortableContext>
                  </div>
                </DndContext>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-folder-x display-4 text-muted"></i>
                  <p className="mt-3 text-muted">
                    {categories.length === 0
                      ? "No categories found. Add your first category to get started!"
                      : "No categories match the selected filter."}
                  </p>
                  {categories.length === 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddSubcategory(null)}
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      Add First Category
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CategoryModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
          setParentCategory(null);
        }}
        categories={categories}
        selectedCategory={selectedCategory}
        parentCategoryId={parentCategory}
        onAddCategory={handleAddCategory}
        onEditCategory={handleSaveCategory}
      />

      {toast && (
        <Toast
          show={true}
          onClose={() => setToast(null)}
          className="position-fixed bottom-0 end-0 m-3"
          bg={toast.type}
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      )}
    </Container>
  );
};

export default CategoryPage;
