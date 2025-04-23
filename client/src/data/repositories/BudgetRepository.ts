import { BaseRepository } from './BaseRepository';
import { Budget } from '../../common/types';

export class BudgetRepository extends BaseRepository<Budget> {
  constructor() {
    super('budgets');
    this.initializeDefaultBudgets();
  }

  getBudgets(): Budget[] {
    return this.getAll();
  }

  addBudget(budget: Budget): void {
    const budgets = this.getAll();
    budgets.push(budget);
    this.save(budgets);
  }

  updateBudget(budget: Budget): void {
    const budgets = this.getAll();
    const index = budgets.findIndex(b => b.id === budget.id);
    if (index !== -1) {
      budgets[index] = budget;
      this.save(budgets);
    }
  }

  deleteBudget(id: number): void {
    const budgets = this.getAll();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets.splice(index, 1);
      this.save(budgets);
    }
  }

  private initializeDefaultBudgets(): void {
    const defaultBudgets: Budget[] = [
      {
        id: 1,
        categoryId: 1, // Food
        amount: 500,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Food Budget'
      },
      {
        id: 2,
        categoryId: 3, // Shopping
        amount: 300,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Shopping Budget'
      },
      {
        id: 3,
        categoryId: 5, // Bills
        amount: 1000,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Bills Budget'
      },
      {
        id: 4,
        categoryId: 6, // Entertainment
        amount: 200,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Entertainment Budget'
      }
    ];

    if (this.getAll().length === 0) {
      this.save(defaultBudgets);
    }
  }
}