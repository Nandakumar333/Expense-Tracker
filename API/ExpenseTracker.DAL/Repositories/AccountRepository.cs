using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Data;
using ExpenseTracker.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.DAL.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _context;

        public AccountRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AccountEntity>> GetAllAsync(int userId)
        {
            return await _context.Accounts
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<AccountEntity> GetByIdAsync(int id, int userId)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        }

        public async Task<AccountEntity> CreateAsync(AccountEntity account)
        {
            await _context.Accounts.AddAsync(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task<AccountEntity> UpdateAsync(AccountEntity account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
            return account;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var account = await GetByIdAsync(id, userId);
            if (account != null)
            {
                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HasTransactionsAsync(int id)
        {
            return await _context.Accounts
                .AnyAsync(a => a.Id == id && a.Transactions.Any());
        }

        public async Task UpdateBalanceAsync(int id, decimal amount, int userId)
        {
            var account = await GetByIdAsync(id, userId);
            if (account != null)
            {
                account.Balance += amount;
                account.UpdatedAt = System.DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}