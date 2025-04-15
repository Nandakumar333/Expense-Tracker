import { BaseRepository } from './BaseRepository';
import { Category } from '../../common/types';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories');
    this.initializeDefaultCategories();
  }

  getCategories(): Category[] {
    return this.getAll();
  }

  addCategory(category: Category): void {
    const categories = this.getAll();
    const newCategory = {
      ...category,
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1
    };
    categories.push(newCategory);
    this.save(categories);
  }

  updateCategory(category: Category): void {
    const categories = this.getAll();
    const index = categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
      this.save(categories);
    }
  }

  deleteCategory(id: number): void {
    const categories = this.getAll();
    this.save(categories.filter(c => c.id !== id));
  }

  private initializeDefaultCategories(): void {
    const defaultCategories: Category[] = [
      { id: 1, name: 'Food', type: 'expense', color: '#e74c3c' },
      { id: 2, name: 'Salary', type: 'income', color: '#2ecc71' },
      { id: 3, name: 'Shopping', type: 'expense', color: '#3498db' },
      { id: 4, name: 'Investment', type: 'income', color: '#f1c40f' },
      { id: 5, name: 'Bills', type: 'expense', color: '#9b59b6' },
      { id: 6, name: 'Entertainment', type: 'expense', color: '#e67e22' }
    ];

    if (this.getAll().length === 0) {
      this.save(defaultCategories);
    }
  }
}
