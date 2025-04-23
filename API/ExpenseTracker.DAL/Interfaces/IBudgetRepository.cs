using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.DAL.Interfaces
{
    public interface IBudgetRepository
    {
        Task<IEnumerable<BudgetEntity>> GetAllAsync(int userId);
        Task<BudgetEntity> GetByIdAsync(int id);
        Task<BudgetEntity> CreateAsync(BudgetEntity budget);
        Task<BudgetEntity> UpdateAsync(BudgetEntity budget);
        Task DeleteAsync(int id);
        Task<IEnumerable<BudgetEntity>> GetByCategoryAsync(int categoryId);
        Task<BudgetEntity?> GetByCategoryAndPeriodAsync(int categoryId, BudgetPeriod period, DateTime startDate);
    }
}