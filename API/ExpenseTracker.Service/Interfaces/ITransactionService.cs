using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Dtos.Transaction;

namespace ExpenseTracker.Service.Interfaces
{
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionDto>> GetTransactionsAsync(TransactionFilterDto filter);
        Task<TransactionDto> GetTransactionByIdAsync(int id);
        Task<TransactionDto> CreateTransactionAsync(CreateTransactionDto transactionDto);
        Task<TransactionDto> UpdateTransactionAsync(UpdateTransactionDto transactionDto);
        Task DeleteTransactionAsync(int id);
        Task<IEnumerable<TransactionDto>> TransferMoneyAsync(TransferMoneyDto transferDto);
        Task<IEnumerable<TransactionDto>> GetTransactionsByAccountIdAsync(int accountId, int userId);
    }
}