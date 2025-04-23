using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Dtos.Account;

namespace ExpenseTracker.Service.Interfaces
{
    public interface IAccountService
    {
        Task<IEnumerable<AccountDto>> GetAllAccountsAsync(int userId);
        Task<AccountDto> GetAccountByIdAsync(int id, int userId);
        Task<AccountDto> CreateAccountAsync(CreateAccountDto createAccountDto, int userId);
        Task<AccountDto> UpdateAccountAsync(int id, UpdateAccountDto updateAccountDto, int userId);
        Task DeleteAccountAsync(int id, int userId);
        Task UpdateBalanceAsync(int id, decimal amount, int userId);
        Task ValidateAccountOwnershipAsync(int accountId, int userId);
        Task<bool> HasSufficientBalanceAsync(int accountId, decimal amount);
    }
}