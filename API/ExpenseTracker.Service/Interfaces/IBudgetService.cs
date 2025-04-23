using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Dtos.Budget;

namespace ExpenseTracker.Service.Interfaces
{
    public interface IBudgetService
    {
        Task<IEnumerable<BudgetDto>> GetAllAsync(int userId);
        Task<BudgetDto> GetByIdAsync(int id);
        Task<BudgetDto> CreateAsync(CreateBudgetDto budgetDto, int userId);
        Task<BudgetDto> UpdateAsync(int id, UpdateBudgetDto budgetDto);
        Task DeleteAsync(int id);
        Task<IEnumerable<BudgetDto>> GetByCategoryAsync(int categoryId);
    }
}