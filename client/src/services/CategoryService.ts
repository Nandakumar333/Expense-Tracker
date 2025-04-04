import { CategoryRepository } from '../data/repositories/CategoryRepository';
import { Category } from '../common/types';

export class CategoryService {
  private repo: CategoryRepository;

  constructor() {
    this.repo = new CategoryRepository();
  }

  getCategories(): Category[] {
    return this.repo.getCategories();
  }

  addCategory(categoryData: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now()
    };
    this.repo.addCategory(newCategory);
    return newCategory;
  }

  updateCategory(category: Category): void {
    this.repo.updateCategory(category);
  }

  deleteCategory(id: number): void {
    this.repo.deleteCategory(id);
  }
}
