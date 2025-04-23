using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Data;
using ExpenseTracker.DAL.Interfaces;

namespace ExpenseTracker.DAL.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryEntity>> GetAllAsync(int userId)
        {
            return await _context.Categories
                .Include(c => c.ParentCategory)
                .Include(c => c.SubCategories)
                .Where(c => c.UserId == userId && c.IsActive)
                .OrderBy(c => c.Level)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<CategoryEntity?> GetByIdAsync(int id, bool includeChildren = false)
        {
            var query = _context.Categories.AsQueryable();

            if (includeChildren)
            {
                query = query
                    .Include(c => c.SubCategories)
                    .ThenInclude(c => c.SubCategories);
            }

            return await query
                .Include(c => c.ParentCategory)
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<CategoryEntity> CreateAsync(CategoryEntity category)
        {
            await ValidateCategoryAsync(category);
            
            // Initialize basic properties
            category.IsActive = true;
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;

            // Handle parent-child relationship
            if (category.ParentId.HasValue)
            {
                var parent = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == category.ParentId && c.IsActive)
                    ?? throw new InvalidOperationException($"Parent category {category.ParentId} not found or inactive");
                
                if (parent.UserId != category.UserId)
                    throw new InvalidOperationException("Parent category belongs to different user");
                
                category.Level = parent.Level + 1;
            }
            else
            {
                category.Level = 0;
                category.Path = "temp"; // Will be updated after save
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Now that we have the ID, update the path
            if (category.ParentId.HasValue)
            {
                var parent = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == category.ParentId && c.IsActive)
                    ?? throw new InvalidOperationException($"Parent category {category.ParentId} not found or inactive");
                
                category.Path = $"{parent.Path}/{category.Id}";
            }
            else
            {
                category.Path = category.Id.ToString();
            }

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<CategoryEntity> UpdateAsync(CategoryEntity category)
        {
            var existing = await GetByIdAsync(category.Id, includeChildren: true)
                ?? throw new InvalidOperationException($"Category {category.Id} not found");

            // Don't allow changing user
            if (existing.UserId != category.UserId)
                throw new InvalidOperationException("Cannot change category ownership");

            // If parent is changing, validate the new hierarchy
            if (existing.ParentId != category.ParentId)
            {
                if (await WouldCreateCycle(category.Id, category.ParentId))
                    throw new InvalidOperationException("Cannot create cyclic relationship in category hierarchy");

                // Update level and path for this category and all descendants
                await UpdateHierarchyAsync(category);
            }

            // Update basic properties
            existing.Name = category.Name;
            existing.Type = category.Type;
            existing.Color = category.Color;
            existing.Description = category.Description;
            existing.Icon = category.Icon;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var category = await GetByIdAsync(id, includeChildren: true)
                ?? throw new InvalidOperationException($"Category {id} not found");

            if (category.SubCategories.Any())
                throw new InvalidOperationException("Cannot delete category with subcategories");

            if (await IsCategoryInUseAsync(id))
                throw new InvalidOperationException("Cannot delete category that is in use");

            // Soft delete
            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        private async Task ValidateCategoryAsync(CategoryEntity category)
        {
            // Check for duplicate names under same parent and user
            var duplicateExists = await _context.Categories
                .AnyAsync(c => c.UserId == category.UserId 
                    && c.ParentId == category.ParentId 
                    && c.Name == category.Name 
                    && c.Id != category.Id
                    && c.IsActive);

            if (duplicateExists)
                throw new InvalidOperationException($"Category '{category.Name}' already exists at this level");
        }

        private async Task<string> BuildCategoryPathAsync(CategoryEntity category)
        {
            var path = category.Id.ToString();
            
            if (category.ParentId.HasValue)
            {
                var parent = await GetByIdAsync(category.ParentId.Value);
                if (parent != null && !string.IsNullOrEmpty(parent.Path))
                {
                    path = $"{parent.Path}/{path}";
                }
            }

            return path;
        }

        private async Task<bool> WouldCreateCycle(int categoryId, int? newParentId)
        {
            if (!newParentId.HasValue || categoryId == newParentId)
                return false;

            var ancestor = await GetByIdAsync(newParentId.Value);
            while (ancestor != null)
            {
                if (ancestor.Id == categoryId)
                    return true;
                
                ancestor = ancestor.ParentId.HasValue ? 
                    await GetByIdAsync(ancestor.ParentId.Value) : null;
            }

            return false;
        }

        private async Task UpdateHierarchyAsync(CategoryEntity category)
        {
            // Get all descendants
            var descendants = await GetDescendantsAsync(category.Id);
            
            // Update the category's level and path
            if (category.ParentId.HasValue)
            {
                var parent = await GetByIdAsync(category.ParentId.Value)
                    ?? throw new InvalidOperationException($"Parent category {category.ParentId} not found");
                
                category.Level = parent.Level + 1;
                category.Path = $"{parent.Path}/{category.Id}";
            }
            else
            {
                category.Level = 0;
                category.Path = category.Id.ToString();
            }

            // Update all descendants
            foreach (var descendant in descendants)
            {
                if (descendant.ParentId.HasValue)
                {
                    var parent = await GetByIdAsync(descendant.ParentId.Value)
                        ?? throw new InvalidOperationException($"Parent category {descendant.ParentId} not found");
                    
                    descendant.Level = parent.Level + 1;
                    descendant.Path = $"{parent.Path}/{descendant.Id}";
                    _context.Update(descendant);
                }
            }
        }

        private async Task<List<CategoryEntity>> GetDescendantsAsync(int categoryId)
        {
            var descendants = new List<CategoryEntity>();
            var queue = new Queue<int>();
            queue.Enqueue(categoryId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                var children = await _context.Categories
                    .Where(c => c.ParentId == currentId && c.IsActive)
                    .ToListAsync();

                descendants.AddRange(children);
                foreach (var child in children)
                {
                    queue.Enqueue(child.Id);
                }
            }

            return descendants;
        }

        public async Task<bool> IsCategoryInUseAsync(int categoryId)
        {
            return await _context.Transactions
                .AnyAsync(t => t.CategoryId == categoryId) ||
                await _context.Budgets
                .AnyAsync(b => b.CategoryId == categoryId);
        }

        public async Task<IEnumerable<CategoryEntity>> GetByTypeAsync(int userId, CategoryType type)
        {
            return await _context.Categories
                .Include(c => c.ParentCategory)
                .Where(c => c.UserId == userId && c.Type == type && c.IsActive)
                .OrderBy(c => c.Level)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryEntity>> GetRootCategoriesAsync(int userId)
        {
            return await _context.Categories
                .Include(c => c.SubCategories)
                .Where(c => c.UserId == userId && !c.ParentId.HasValue && c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<CategoryEntity?> GetByIdAsync(int id)
        {
            return await _context.Categories
                .Include(c => c.ParentCategory)
                .Include(c => c.SubCategories)
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<IEnumerable<CategoryEntity>> GetSubcategoriesAsync(int parentId)
        {
            return await _context.Categories
                .Include(c => c.ParentCategory)
                .Where(c => c.ParentId == parentId && c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }
    }
}