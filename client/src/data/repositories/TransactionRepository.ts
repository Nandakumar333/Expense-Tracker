import { BaseRepository } from './BaseRepository';
import { Transaction } from '../../common/types';
import { CategoryRepository } from './CategoryRepository';
import { AccountRepository } from './AccountRepository';

export class TransactionRepository extends BaseRepository<Transaction> {
  private categoryRepository: CategoryRepository;
  private accountRepository: AccountRepository;

  constructor(
    categoryRepository: CategoryRepository = new CategoryRepository(),
    accountRepository: AccountRepository = new AccountRepository()
  ) {
    super('transactions');
    this.categoryRepository = categoryRepository;
    this.accountRepository = accountRepository;
    this.initializeDefaultTransactions();
  }

  getTransactions(): Transaction[] {
    return this.getAll();
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

  private initializeDefaultTransactions(): void {
    const categories = this.categoryRepository.getCategories();
    const accounts = this.accountRepository.getAccounts();

    if (!categories?.length || !accounts?.length) {
      return;
    }

    const defaultTransactions: Transaction[] = [];
    const today = new Date();
    let transactionId = 1;
    
    for (let month = 0; month < 6; month++) {
      for (let i = 0; i < 20; i++) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - month, 
          Math.floor(Math.random() * 28) + 1);
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        if (!category?.type) {
          continue;
        }

        const account = accounts[0];
        const isIncome = category.type === 'income';
        const amount = isIncome ? 
          5000 + Math.floor(Math.random() * 3000) : 
          -(20 + Math.floor(Math.random() * 980));

        defaultTransactions.push({
          id: transactionId++,
          description: `${category.name} - ${isIncome ? 'Income' : 'Payment'} (${monthDate.toLocaleString('default', { month: 'long' })})`,
          amount,
          date: monthDate.toISOString().split('T')[0],
          type: isIncome ? 'income' : 'expense',
          categoryId: category.id,
          categoryName: category.name,
          accountId: account.id,
          accountName: account.name
        });
      }
    }

    defaultTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (this.getAll().length === 0) {
      this.save(defaultTransactions);
    }
  }
}
