import { BaseRepository } from './BaseRepository';
import { Transaction } from '../../common/types';

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super('transactions');
    this.initializeDefaultTransactions();
  }

  initializeDefaultTransactions(): void {
    const defaultTransactions: Transaction[] = [
      {
        id: 1,
        description: 'Monthly Salary',
        amount: 5000,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        categoryId: 2,
        categoryName: 'Salary',
        accountId: 1,
        accountName: 'Main Account'
      },
      {
        id: 2,
        description: 'Grocery Shopping',
        amount: -150,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        categoryId: 1,
        categoryName: 'Food',
        accountId: 1,
        accountName: 'Main Account'
      }
    ];

    if (this.getAll().length === 0) {
      this.save(defaultTransactions);
    }
  }

  getTransactions(): Transaction[] {
    return this.getAll() || [];
  }

  addTransaction(transaction: Transaction): Transaction {
    const transactions = this.getAll();
    const newTransaction = {
      ...transaction,
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1
    };
    transactions.unshift(newTransaction);
    this.save(transactions);
    return newTransaction;
  }

  updateTransaction(transaction: Transaction): Transaction {
    const transactions = this.getAll();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    transactions[index] = transaction;
    this.save(transactions);
    return transaction;
  }

  deleteTransaction(id: number): boolean {
    const transactions = this.getAll();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    if (filteredTransactions.length === transactions.length) {
      return false;
    }
    this.save(filteredTransactions);
    return true;
  }
}
