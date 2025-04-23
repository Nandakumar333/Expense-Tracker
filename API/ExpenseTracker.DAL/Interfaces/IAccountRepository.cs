using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.DAL.Interfaces
{
    public interface IAccountRepository
    {
        Task<IEnumerable<AccountEntity>> GetAllAsync(int userId);
        Task<AccountEntity> GetByIdAsync(int id, int userId);
        Task<AccountEntity> CreateAsync(AccountEntity account);
        Task<AccountEntity> UpdateAsync(AccountEntity account);
        Task DeleteAsync(int id, int userId);
        Task<bool> HasTransactionsAsync(int id);
        Task UpdateBalanceAsync(int id, decimal amount, int userId);
    }
}