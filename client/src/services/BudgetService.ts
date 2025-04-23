import type { Budget } from '../common/types';

export class BudgetService {
  private static instance: BudgetService;
  private budgets: Budget[] = [];

  private constructor() {
    this.initializeDefaultBudgets();
  }

  public static getInstance(): BudgetService {
    if (!BudgetService.instance) {
      BudgetService.instance = new BudgetService();
    }
    return BudgetService.instance;
  }

  private initializeDefaultBudgets(): void {
    this.budgets = [
      {
        id: 1,
        categoryId: 1,
        amount: 500,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Food budget'
      },
      {
        id: 2,
        categoryId: 3,
        amount: 300,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Shopping budget'
      },
      {
        id: 3,
        categoryId: 5,
        amount: 1000,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        rollover: false,
        description: 'Bills budget'
      }
    ];
  }

  public async getBudgets(): Promise<Budget[]> {
    try {
      return this.budgets;
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      return [];
    }
  }

  public async saveBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    try {
      const newBudget: Budget = {
        ...budget,
        id: Math.max(...this.budgets.map(b => b.id), 0) + 1
      };
      this.budgets.push(newBudget);
      return newBudget;
    } catch (error) {
      throw new Error('Failed to save budget');
    }
  }

  public async updateBudget(budget: Budget): Promise<Budget> {
    try {
      const index = this.budgets.findIndex(b => b.id === budget.id);
      if (index === -1) throw new Error('Budget not found');
      this.budgets[index] = budget;
      return budget;
    } catch (error) {
      throw new Error('Failed to update budget');
    }
  }

  public async deleteBudget(budgetId: number): Promise<void> {
    try {
      const index = this.budgets.findIndex(b => b.id === budgetId);
      if (index === -1) throw new Error('Budget not found');
      this.budgets.splice(index, 1);
    } catch (error) {
      throw new Error('Failed to delete budget');
    }
  }
}

export const budgetService = BudgetService.getInstance();
export default budgetService;
