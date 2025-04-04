import { Budget } from '../common/types';

export const getBudgets = async (): Promise<Budget[]> => {
    const defaultBudgets: Budget[] = [
        {
          id: 1,
          categoryId: 1, // Food
          amount: 500,
          period: 'monthly',
          startDate: new Date().toISOString().split('T')[0]
        },
        {
          id: 2,
          categoryId: 3, // Shopping
          amount: 300,
          period: 'monthly',
          startDate: new Date().toISOString().split('T')[0]
        },
        {
          id: 3,
          categoryId: 5, // Bills
          amount: 1000,
          period: 'monthly',
          startDate: new Date().toISOString().split('T')[0]
        }
      ];
  return defaultBudgets;
};

export const saveBudget = async (budget: Omit<Budget, 'id'>): Promise<Budget> => {
  // Replace with actual API call
  return { id: Math.random(), ...budget };
};


export const updateBudget = async (budget: Budget): Promise<Budget> => {
  // Replace with actual API call
  return budget;
};

export const deleteBudget = async (budgetId: number): Promise<void> => {
  // Replace with actual API call
  return;
};