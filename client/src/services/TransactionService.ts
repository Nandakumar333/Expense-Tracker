import { TransactionRepository } from '../data/repositories/TransactionRepository';
import { AccountRepository } from '../data/repositories/AccountRepository';
import { Transaction, TransactionForm, TransferForm } from '../common/types';

export class TransactionService {
  private transactionRepo: TransactionRepository;
  private accountRepo: AccountRepository;

  constructor() {
    this.transactionRepo = new TransactionRepository();
    this.accountRepo = new AccountRepository();
  }

  addTransaction(data: TransactionForm): Transaction {
    const newTransaction: Transaction = {
      id: Date.now(),
      description: data.description,
      amount: data.amount,
      date: data.date,
      type: data.amount > 0 ? 'income' : 'expense',
      categoryId: Number(data.categoryId),
      categoryName: '', // Will be set by component
      accountId: data.accountId,
      accountName: '' // Will be set by component
    };

    this.transactionRepo.addTransaction(newTransaction);
    this.accountRepo.updateBalance(data.accountId, data.amount);

    return newTransaction;
  }

  transferMoney(data: TransferForm): Transaction[] {
    const transferId = Date.now();
    
    const transactions: Transaction[] = [
      {
        id: transferId,
        description: `Transfer: ${data.description}`,
        amount: -data.amount,
        date: data.date,
        type: 'transfer',
        categoryId: 0,
        categoryName: 'Transfer',
        accountId: data.fromAccountId,
        accountName: '' // Will be set by component
      },
      {
        id: transferId + 1,
        description: `Received: ${data.description}`,
        amount: data.amount,
        date: data.date,
        type: 'transfer',
        categoryId: 0,
        categoryName: 'Transfer',
        accountId: data.toAccountId,
        accountName: '' // Will be set by component
      }
    ];

    transactions.forEach(t => this.transactionRepo.addTransaction(t));
    this.accountRepo.updateBalance(data.fromAccountId, -data.amount);
    this.accountRepo.updateBalance(data.toAccountId, data.amount);

    return transactions;
  }

  getTransactions(): Transaction[] {
    return this.transactionRepo.getTransactions();
  }

  deleteTransaction(id: number): void {
    this.transactionRepo.deleteTransaction(id);
  }

  updateTransaction(data: Transaction): void {
    this.transactionRepo.updateTransaction(data);
  }
}
