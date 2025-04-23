using AutoMapper;
using ExpenseTracker.Core.Dtos.Category;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Interfaces;
using ExpenseTracker.Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpenseTracker.Service.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync(int userId)
        {
            var categories = await _categoryRepository.GetAllAsync(userId);
            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            return category != null ? _mapper.Map<CategoryDto>(category) : null;
        }

        public async Task<IEnumerable<CategoryDto>> GetByTypeAsync(int userId, CategoryType type)
        {
            var categories = await _categoryRepository.GetByTypeAsync(userId, type);
            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto categoryDto, int userId)
        {
            var category = _mapper.Map<CategoryEntity>(categoryDto);
            category.UserId = userId;
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;
            category.IsActive = true;
            category.Path = "temp"; // Temporary path, will be updated after save

            // Initialize Level based on parent relationship
            if (categoryDto.ParentId.HasValue)
            {
                var parent = await _categoryRepository.GetByIdAsync(categoryDto.ParentId.Value)
                    ?? throw new InvalidOperationException($"Parent category with ID {categoryDto.ParentId} not found");

                if (parent.UserId != userId)
                    throw new InvalidOperationException("Cannot add subcategory to another user's category");

                category.Level = parent.Level + 1;
            }
            else
            {
                category.Level = 0;
            }

            var createdCategory = await _categoryRepository.CreateAsync(category);
            
            // Now update the path with the correct format
            if (categoryDto.ParentId.HasValue)
            {
                var parent = await _categoryRepository.GetByIdAsync(categoryDto.ParentId.Value)
                    ?? throw new InvalidOperationException($"Parent category {categoryDto.ParentId} not found");
                createdCategory.Path = $"{parent.Path}/{createdCategory.Id}";
            }
            else
            {
                createdCategory.Path = createdCategory.Id.ToString();
            }

            await _categoryRepository.UpdateAsync(createdCategory);
            return _mapper.Map<CategoryDto>(createdCategory);
        }

        public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto categoryDto)
        {
            var existingCategory = await _categoryRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Category with ID {id} not found");

            var category = _mapper.Map<UpdateCategoryDto, CategoryEntity>(categoryDto, existingCategory);
            category.UpdatedAt = DateTime.UtcNow;

            // If parent is changing, update path and level
            if (categoryDto.ParentId != existingCategory.ParentId)
            {
                if (categoryDto.ParentId.HasValue)
                {
                    var parent = await _categoryRepository.GetByIdAsync(categoryDto.ParentId.Value)
                        ?? throw new InvalidOperationException($"Parent category {categoryDto.ParentId} not found");

                    category.Level = parent.Level + 1;
                    category.Path = $"{parent.Path}/{category.Id}";
                }
                else
                {
                    category.Level = 0;
                    category.Path = category.Id.ToString();
                }
            }

            var updatedCategory = await _categoryRepository.UpdateAsync(category);
            return _mapper.Map<CategoryDto>(updatedCategory);
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Category with ID {id} not found");

            // Check if category has subcategories
            var subcategories = await GetSubcategoriesAsync(id);
            if (subcategories.Any())
                throw new InvalidOperationException("Cannot delete category that has subcategories");

            if (await _categoryRepository.IsCategoryInUseAsync(id))
                throw new InvalidOperationException("Cannot delete category that is in use");

            await _categoryRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<CategoryDto>> GetSubcategoriesAsync(int parentId)
        {
            var subcategories = await _categoryRepository.GetSubcategoriesAsync(parentId);
            return _mapper.Map<IEnumerable<CategoryDto>>(subcategories);
        }

        public async Task<bool> IsCategoryInUseAsync(int categoryId)
        {
            return await _categoryRepository.IsCategoryInUseAsync(categoryId);
        }
    }
}