using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Dtos.Transaction;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.DAL.Interfaces
{
    public interface ITransactionRepository
    {
        Task<IEnumerable<TransactionEntity>> GetTransactionsAsync(TransactionFilterDto filter);
        Task<TransactionEntity> GetByIdAsync(int id);
        Task<TransactionEntity> AddAsync(TransactionEntity transaction);
        Task<TransactionEntity> UpdateAsync(TransactionEntity transaction);
        Task DeleteAsync(int id);
    }
}