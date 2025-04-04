import { TransactionService } from './TransactionService';
import { AccountService } from './AccountService';
import { CategoryService } from './CategoryService';
import { Transaction, Account, Category, Budget, DashboardSummary, WidgetData, TransactionForm, TransferForm } from '../common/types';
import { AccountRepository } from '../data/repositories/AccountRepository';
import { CategoryRepository } from '../data/repositories/CategoryRepository';

export class DashboardService {
  private transactionService: TransactionService;
  private accountService: AccountService;
  private categoryService: CategoryService;

  constructor() {
    this.transactionService = new TransactionService();
    this.accountService = new AccountService();
    this.categoryService = new CategoryService();

    // Initialize repositories with default data
    const accountRepo = new AccountRepository();
    const categoryRepo = new CategoryRepository();
    accountRepo.initializeDefaultAccounts();
    categoryRepo.initializeDefaultCategories();
  }

  getDashboardData(): {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    budgets: Budget[];
  } {
    // Initialize default data
    const accountRepo = new AccountRepository();
    const categoryRepo = new CategoryRepository();
    accountRepo.initializeDefaultAccounts();
    categoryRepo.initializeDefaultCategories();

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

    return {
      transactions: this.transactionService.getTransactions(),
      accounts: this.accountService.getAccounts(),
      categories: this.categoryService.getCategories(),
      budgets: defaultBudgets
    };
  }

  addTransaction(data: TransactionForm): Transaction {
    return this.transactionService.addTransaction(data);
  }

  transferMoney(data: TransferForm): Transaction[] {
    return this.transactionService.transferMoney(data);
  }

  deleteTransaction(id: number): void {
    this.transactionService.deleteTransaction(id);
  }

  getAccounts(): Account[] {
    return this.accountService.getAccounts();
  }

  addAccount(accountData: { name: string; balance: number }): Account {
    return this.accountService.addAccount(accountData);
  }

  updateBalance(accountId: number, amount: number): void {
    this.accountService.updateBalance(accountId, amount);
  }

  calculateSummary(transactions: Transaction[], accounts: Account[]): DashboardSummary {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = Math.abs(monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    const yearlyExpense = Math.abs(transactions
      .filter(t => new Date(t.date).getFullYear() === currentYear && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    return {
      totalBalance: accounts.reduce((sum, account) => sum + account.balance, 0),
      monthlyIncome,
      monthlyExpense,
      monthlySavings: monthlyIncome - monthlyExpense,
      yearlyExpense
    };
  }

  calculateWidgetData(
    transactions: Transaction[],
    categories: Category[],
    accounts: Account[],
    budgets: Budget[]
  ): WidgetData {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate monthly income vs expense trends
    const expenseTrends = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === month.getMonth() &&
               transDate.getFullYear() === month.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const savings = income - expenses;

      return {
        month: month.toLocaleString('default', { month: 'short' }),
        income,
        expenses,
        savings
      };
    }).reverse();

    // Account Summary calculations
    const accountSummary = accounts.map(account => {
      const monthlyIncome = transactions
        .filter(t => t.accountId === account.id && 
                    t.type === 'income' &&
                    new Date(t.date).getMonth() === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpense = transactions
        .filter(t => t.accountId === account.id && 
                    t.type === 'expense' &&
                    new Date(t.date).getMonth() === currentMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        id: account.id,
        name: account.name,
        balance: account.balance,
        monthlyIncome,
        monthlyExpense,
        netFlow: monthlyIncome - monthlyExpense
      };
    });

    // Category Distribution calculations
    const categoryDistribution = categories
      .map(category => {
        const transactions_category = transactions.filter(t => 
          t.categoryId === category.id &&
          t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth
        );
        
        const amount = Math.abs(transactions_category.reduce((sum, t) => sum + t.amount, 0));
        const count = transactions_category.length;
        
        return {
          id: category.id,
          name: category.name,
          color: category.color,
          amount,
          count,
          type: category.type
        };
      })
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // Calculate category expenses
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryExpenses = categories.map(category => {
      const expenses = transactions.filter(t => 
        t.categoryId === category.id && 
        t.type === 'expense' &&
        new Date(t.date).getMonth() === currentMonth
      );
      const amount = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
      
      return {
        categoryId: category.id,
        amount: amount,
        percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0
      };
    });

    // Calculate monthly expenses per category
    const monthlyExpenses = transactions.reduce((acc, transaction) => {
      if (
        transaction.type === 'expense' &&
        new Date(transaction.date).getMonth() === currentMonth &&
        new Date(transaction.date).getFullYear() === currentYear
      ) {
        acc[transaction.categoryId] = (acc[transaction.categoryId] || 0) + Math.abs(transaction.amount);
      }
      return acc;
    }, {} as { [key: number]: number });

    // Format budget data
    const budgetSpending = budgets.map(budget => {
      const spent = monthlyExpenses[budget.categoryId] || 0;
      const category = categories.find(c => c.id === budget.categoryId);
      return {
        categoryId: budget.categoryId,
        category: category?.name || 'Unknown',
        amount: spent,
        spent: spent,
        total: budget.amount,
        percentage: (spent / budget.amount) * 100,
        color: category?.color || '#000000',
        status: spent > budget.amount ? 'over' : spent >= budget.amount * 0.8 ? 'warning' : 'good'
      };
    });

    const overBudgetAlerts = budgetSpending
      .filter(budget => budget.percentage > 80)
      .map(budget => ({
        category: budget.category,
        currentSpending: budget.spent,
        amount: budget.total,
        message: `${budget.category} spending is at ${budget.percentage.toFixed(1)}% of budget`,
        severity: budget.percentage > 90 ? 'high' as const : 'medium' as const
      }));

    // Calculate monthly savings trend
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === month.getMonth() &&
               transDate.getFullYear() === month.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        month: month.toISOString(),
        income,
        expense: expenses
      };
    }).reverse();

    return {
      categoryExpenses,
      alerts: overBudgetAlerts,
      budgetSpending,
      upcomingBills: transactions
        .filter(t => t.type === 'expense' &&
          new Date(t.date) > new Date() &&
          new Date(t.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        )
        .map(t => ({
          id: t.id,
          categoryId: t.categoryId,
          description: t.description,
          amount: Math.abs(t.amount),
          dueDate: t.date
        })),
      monthlyTrends,
      savingsTarget: 5000, // You can make this configurable
      budgetData: [],
      overBudgetAlerts: [],
      accountSummary,
      categoryDistribution,
      totals: {
        income: accountSummary.reduce((sum, acc) => sum + acc.monthlyIncome, 0),
        expenses: accountSummary.reduce((sum, acc) => sum + acc.monthlyExpense, 0),
        balance: accounts.reduce((sum, acc) => sum + acc.balance, 0)
      },
      expenseTrends,
      yearlyTrends: expenseTrends // Use the same data for yearly view for now
    };
  }
}
