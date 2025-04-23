using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.DAL.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<CategoryEntity>> GetAllAsync(int userId);
        Task<CategoryEntity?> GetByIdAsync(int id);
        Task<IEnumerable<CategoryEntity>> GetByTypeAsync(int userId, CategoryType type);
        Task<CategoryEntity> CreateAsync(CategoryEntity category);
        Task<CategoryEntity> UpdateAsync(CategoryEntity category);
        Task DeleteAsync(int id);
        Task<IEnumerable<CategoryEntity>> GetSubcategoriesAsync(int parentId);
        Task<bool> IsCategoryInUseAsync(int categoryId);
    }
}