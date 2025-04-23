import { TransactionService } from './TransactionService';
import { AccountService } from './AccountService';
import { CategoryService } from './CategoryService';
import budgetService from './BudgetService';
import { Transaction, Account, Category, Budget, DashboardSummary, WidgetData, TransactionForm, TransferForm } from '../common/types';

export class DashboardService {
  private transactionService: TransactionService;
  private accountService: AccountService;
  private categoryService: CategoryService;

  constructor() {
    this.transactionService = new TransactionService();
    this.accountService = new AccountService();
    this.categoryService = new CategoryService();
  }

  async getDashboardData() {   
    try {
      const [transactions, accounts, categories, budgets] = await Promise.all([
        this.transactionService.getTransactions(),
        this.accountService.getAccounts(),
        this.categoryService.getCategories(),
        budgetService.getBudgets()
      ]);

      return {
        transactions,
        accounts,
        categories,
        budgets
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return {
        transactions: [],
        accounts: [],
        categories: [],
        budgets: []
      };
    }
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
      yearlyExpense,
      totalSavings: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) -
        Math.abs(transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0))
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

    // Calculate monthly income vs expense trends with improved date handling
    const expenseTrends = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= month && transDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const savings = income - expenses;

      return {
        date: month.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income,
        expenses,
        savings
      };
    }).reverse();

    // Enhanced category distribution with period comparison
    const categoryDistribution = categories
      .map(category => {
        const currentMonthTransactions = transactions.filter(t => 
          t.categoryId === category.id &&
          t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth
        );
        
        const previousMonthTransactions = transactions.filter(t => 
          t.categoryId === category.id &&
          t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth - 1
        );
        
        const currentAmount = Math.abs(currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0));
        const previousAmount = Math.abs(previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0));
        const changePercent = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;
        
        return {
          id: category.id,
          name: category.name,
          color: category.color,
          amount: currentAmount,
          count: currentMonthTransactions.length,
          type: category.type,
          percentage: 0, // Will be calculated after total is known
          previousAmount,
          changePercent
        };
      })
      .filter(cat => cat.amount > 0 || cat.previousAmount > 0)
      .sort((a, b) => b.amount - a.amount);

    // Calculate percentages based on total expenses
    const totalExpenses = categoryDistribution.reduce((sum, cat) => sum + cat.amount, 0);
    categoryDistribution.forEach(cat => {
      cat.percentage = (cat.amount / totalExpenses) * 100;
    });

    // Enhanced budget utilization tracking
    const budgetSpending = budgets.map(budget => {
      const spent = transactions
        .filter(t => 
          t.categoryId === budget.categoryId && 
          t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth
        )
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const category = categories.find(c => c.id === budget.categoryId);
      const percentage = (spent / budget.amount) * 100;
      const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good';
      
      return {
        categoryId: budget.categoryId,
        category: category?.name || 'Unknown',
        spent,
        total: budget.amount,
        percentage,
        color: category?.color,
        status,
        remaining: budget.amount - spent,
        projectedOverspend: this.calculateProjectedOverspend(spent, budget.amount, currentDate.getDate())
      };
    });

    // Enhanced alerts generation
    const overBudgetAlerts = budgetSpending
      .filter(budget => budget.percentage > 80)
      .map(budget => ({
        category: budget.category,
        currentSpending: budget.spent,
        amount: budget.total,
        message: `${budget.category} spending is at ${budget.percentage.toFixed(1)}% of budget`,
        severity: budget.percentage > 100 ? 'high' as const : 
                 budget.percentage > 90 ? 'medium' as const : 
                 'low' as const,
        projectedOverspend: budget.projectedOverspend
      }));

    // Enhanced upcoming bills detection
    const upcomingBills = this.getUpcomingBills(transactions, 7); // Next 7 days

    // Calculate account summary with trends
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

    const totals = {
      income: accountSummary.reduce((sum, acc) => sum + acc.monthlyIncome, 0),
      expenses: accountSummary.reduce((sum, acc) => sum + acc.monthlyExpense, 0),
      balance: accounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    return {
      expenseTrends,
      yearlyTrends: this.calculateYearlyTrends(transactions),
      budgetData: budgetSpending.map(b => ({
        categoryId: b.categoryId,
        category: b.category,
        budgeted: b.total,
        spent: b.spent,
        percentageUsed: b.percentage,
        color: b.color
      })),
      overBudgetAlerts,
      categoryExpenses: categoryDistribution.map(({ id, amount, percentage }) => ({
        categoryId: id,
        amount,
        percentage
      })),
      monthlyTrends: expenseTrends.map(t => ({
        month: t.date,
        income: t.income,
        expense: t.expenses,
        savings: t.savings
      })),
      savingsTarget: this.calculateSavingsTarget(totals.income),
      upcomingBills,
      alerts: this.generateInsightAlerts(categoryDistribution, budgetSpending, totals),
      budgetSpending,
      accountSummary,
      categoryDistribution,
      totals
    };
  }

  private calculateProjectedOverspend(spent: number, budget: number, currentDay: number): number {
    const dailyRate = spent / currentDay;
    const projectedMonthlySpend = dailyRate * 30;
    return projectedMonthlySpend > budget ? projectedMonthlySpend - budget : 0;
  }

  private calculateYearlyTrends(transactions: Transaction[]): any[] {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentYear, i, 1);
      const monthEnd = new Date(currentYear, i + 1, 0);
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= month && date <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        month: month.toLocaleString('default', { month: 'short' }),
        income,
        expenses,
        savings: income - expenses
      };
    });
  }

  private calculateSavingsTarget(monthlyIncome: number): number {
    // Default target is 20% of monthly income
    return monthlyIncome * 0.2;
  }

  private getUpcomingBills(transactions: Transaction[], days: number): any[] {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    return transactions
      .filter(t => 
        t.type === 'expense' &&
        new Date(t.date) > today &&
        new Date(t.date) <= futureDate
      )
      .map(t => ({
        id: t.id,
        categoryId: t.categoryId,
        description: t.description,
        amount: Math.abs(t.amount),
        dueDate: t.date
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  private generateInsightAlerts(
    categoryDistribution: any[],
    budgetSpending: any[],
    totals: { income: number; expenses: number; balance: number }
  ): any[] {
    const alerts = [];

    // Check for significant category increases
    categoryDistribution
      .filter(cat => cat.changePercent > 50)
      .forEach(cat => {
        alerts.push({
          category: cat.name,
          message: `${cat.name} spending increased by ${cat.changePercent.toFixed(1)}% from last month`,
          severity: cat.changePercent > 100 ? 'high' : 'medium'
        });
      });

    // Check overall spending vs income
    if (totals.expenses > totals.income) {
      alerts.push({
        category: 'Overall',
        message: `Monthly expenses exceed income by ${(totals.expenses - totals.income).toLocaleString()}`,
        severity: 'high'
      });
    }

    // Add budget alerts
    budgetSpending
      .filter(b => b.projectedOverspend > 0)
      .forEach(b => {
        alerts.push({
          category: b.category,
          message: `Projected to exceed ${b.category} budget by ${b.projectedOverspend.toLocaleString()}`,
          severity: 'medium'
        });
      });

    return alerts;
  }
}
