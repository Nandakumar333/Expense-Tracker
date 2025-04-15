import { Transaction, Category, Account, Budget } from '../common/types';
import { SettingsService } from './SettingsService';

export class ReportGenerator {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = SettingsService.getInstance();
  }

  generateReport(
    transactions: Transaction[],
    categories: Category[],
    accounts: Account[],
    budgets: Budget[],
    startDate: string,
    endDate: string
  ): string {
    const settings = this.settingsService.getSettings();
    const reportData = this.prepareReportData(transactions, categories, accounts, budgets, startDate, endDate);
    
    switch (settings.exportFormat) {
      case 'csv':
        return this.generateCSV(reportData);
      case 'excel':
        return this.generateExcel(reportData);
      case 'pdf':
        return this.generatePDF(reportData);
      default:
        return this.generateCSV(reportData);
    }
  }

  private prepareReportData(
    transactions: Transaction[],
    categories: Category[],
    accounts: Account[],
    budgets: Budget[],
    startDate: string,
    endDate: string
  ) {
    const settings = this.settingsService.getSettings();
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const numberFormatter = new Intl.NumberFormat(settings.language, {
      style: 'currency',
      currency: settings.currency
    });

    const dateFormatter = new Intl.DateTimeFormat(settings.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return {
      transactions: filteredTransactions.map(t => ({
        ...t,
        formattedAmount: numberFormatter.format(t.amount),
        formattedDate: dateFormatter.format(new Date(t.date))
      })),
      summary: this.calculateSummary(filteredTransactions),
      categories: this.calculateCategorySummary(filteredTransactions, categories)
        .map(cat => ({
          ...cat,
          formattedTotalAmount: numberFormatter.format(cat.totalAmount)
        })),
      accounts: this.calculateAccountSummary(filteredTransactions, accounts)
        .map(acc => ({
          ...acc,
          formattedTotalInflow: numberFormatter.format(acc.totalInflow),
          formattedTotalOutflow: numberFormatter.format(acc.totalOutflow)
        })),
      budgets: this.calculateBudgetSummary(filteredTransactions, budgets)
        .map(budget => ({
          ...budget,
          formattedSpent: numberFormatter.format(budget.spent),
          formattedRemaining: numberFormatter.format(budget.remaining)
        }))
    };
  }

  private calculateSummary(transactions: Transaction[]) {
    return transactions.reduce((summary, t) => ({
      totalIncome: summary.totalIncome + (t.type === 'income' ? t.amount : 0),
      totalExpenses: summary.totalExpenses + (t.type === 'expense' ? Math.abs(t.amount) : 0),
      totalTransactions: summary.totalTransactions + 1
    }), {
      totalIncome: 0,
      totalExpenses: 0,
      totalTransactions: 0
    });
  }

  private calculateCategorySummary(transactions: Transaction[], categories: Category[]) {
    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.categoryId === category.id);
      return {
        ...category,
        totalAmount: categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
        transactionCount: categoryTransactions.length
      };
    });
  }

  private calculateAccountSummary(transactions: Transaction[], accounts: Account[]) {
    return accounts.map(account => {
      const accountTransactions = transactions.filter(t => t.accountId === account.id);
      return {
        ...account,
        totalInflow: accountTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        totalOutflow: accountTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      };
    });
  }

  private calculateBudgetSummary(transactions: Transaction[], budgets: Budget[]) {
    return budgets.map(budget => {
      const budgetTransactions = transactions.filter(t => 
        t.categoryId === budget.categoryId && 
        t.type === 'expense'
      );
      const spent = budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: (spent / budget.amount) * 100
      };
    });
  }

  private generateCSV(data: any): string {
    // Implementation for CSV generation
    return '';
  }

  private generateExcel(data: any): string {
    // Implementation for Excel generation
    return '';
  }

  private generatePDF(data: any): string {
    // Implementation for PDF generation
    return '';
  }
}