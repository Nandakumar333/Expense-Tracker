using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Dtos.Category;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Service.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllAsync(int userId);
        Task<CategoryDto?> GetByIdAsync(int id);
        Task<IEnumerable<CategoryDto>> GetByTypeAsync(int userId, CategoryType type);
        Task<CategoryDto> CreateAsync(CreateCategoryDto categoryDto, int userId);
        Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto categoryDto);
        Task DeleteAsync(int id);
        Task<IEnumerable<CategoryDto>> GetSubcategoriesAsync(int parentId);
        Task<bool> IsCategoryInUseAsync(int categoryId);
    }
}