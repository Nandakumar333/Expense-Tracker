import { AccountRepository } from '../data/repositories/AccountRepository';
import type { Account } from '../common/types';

export class AccountService {
  private repo: AccountRepository;

  constructor() {
    this.repo = new AccountRepository();
  }

  getAccounts(): Account[] {
    return this.repo.getAccounts();
  }

  addAccount(accountData: { name: string; balance: number }): Account {
    const newAccount: Account = {
      id: Date.now(),
      name: accountData.name,
      balance: accountData.balance
    };
    this.repo.addAccount(newAccount);
    return newAccount;
  }

  updateBalance(accountId: number, amount: number): void {
    this.repo.updateBalance(accountId, amount);
  }
}
