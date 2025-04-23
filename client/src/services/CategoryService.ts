import type { Category, CategoryFormData } from '../common/types';

export class CategoryService {
  private readonly STORAGE_KEY = 'categories';

  async getCategories(): Promise<Category[]> {
    try {
      const categories = localStorage.getItem(this.STORAGE_KEY);
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async addCategory(data: CategoryFormData): Promise<Category> {
    const categories = await this.getCategories();
    const newCategory: Category = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    if (data.parentId) {
      const parentCategory = categories.find(c => c.id === data.parentId);
      if (parentCategory) {
        newCategory.path = `${parentCategory.path || parentCategory.id}/${newCategory.id}`;
        newCategory.level = (parentCategory.level || 0) + 1;
      }
    } else {
      newCategory.path = String(newCategory.id);
      newCategory.level = 0;
    }

    categories.push(newCategory);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    return newCategory;
  }

  async updateCategory(id: number, data: CategoryFormData): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const updatedCategory: Category = {
      ...categories[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Update path and level if parent changed
    if (data.parentId !== categories[index].parentId) {
      const parent = data.parentId ? categories.find(c => c.id === data.parentId) : null;
      updatedCategory.path = parent 
        ? `${parent.path || parent.id}/${id}`
        : String(id);
      updatedCategory.level = parent ? (parent.level || 0) + 1 : 0;

      // Update children paths
      this.updateChildrenPaths(categories, updatedCategory);
    }

    categories[index] = updatedCategory;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    const categories = await this.getCategories();
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) throw new Error('Category not found');

    // Get all descendant categories
    const descendants = this.getDescendants(categories, id);
    const idsToRemove = [id, ...descendants.map(c => c.id)];

    const filteredCategories = categories.filter(c => !idsToRemove.includes(c.id));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCategories));
  }

  private updateChildrenPaths(categories: Category[], parent: Category): void {
    const children = categories.filter(c => c.parentId === parent.id);
    children.forEach(child => {
      child.path = `${parent.path}/${child.id}`;
      child.level = (parent.level || 0) + 1;
      this.updateChildrenPaths(categories, child);
    });
  }

  private getDescendants(categories: Category[], parentId: number): Category[] {
    const descendants: Category[] = [];
    const children = categories.filter(c => c.parentId === parentId);
    
    children.forEach(child => {
      descendants.push(child);
      descendants.push(...this.getDescendants(categories, child.id));
    });

    return descendants;
  }

  buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map with children arrays
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const current = categoryMap.get(category.id);
      if (current) {
        if (category.parentId && categoryMap.has(category.parentId)) {
          const parent = categoryMap.get(category.parentId);
          parent?.children?.push(current);
        } else {
          rootCategories.push(current);
        }
      }
    });

    return rootCategories;
  }
}
