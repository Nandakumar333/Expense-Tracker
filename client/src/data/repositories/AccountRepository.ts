import { BaseRepository } from './BaseRepository';
import { Account } from '../../common/types';

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super('accounts');
    this.initializeDefaultAccounts();
  }

  getAccounts(): Account[] {
    return this.getAll();
  }

  addAccount(account: Account): void {
    const accounts = this.getAll();
    const newAccount = {
      ...account,
      id: accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1
    };
    accounts.push(newAccount);
    this.save(accounts);
  }

  updateAccount(account: Account): void {
    const accounts = this.getAll();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index !== -1) {
      accounts[index] = account;
      this.save(accounts);
    }
  }

  updateBalance(accountId: number, amount: number): void {
    const accounts = this.getAll();
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      account.balance += amount;
      this.save(accounts);
    }
  }

  deleteAccount(id: number): void {
    const accounts = this.getAll();
    this.save(accounts.filter(a => a.id !== id));
  }

  private initializeDefaultAccounts(): void {
    const defaultAccounts: Account[] = [
      { id: 1, name: 'Main Account', balance: 5000 },
      { id: 2, name: 'Savings Account', balance: 10000 },
      { id: 3, name: 'Investment Account', balance: 15000 }
    ];

    if (this.getAll().length === 0) {
      this.save(defaultAccounts);
    }
  }
}
