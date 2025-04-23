using AutoMapper;
using ExpenseTracker.Core.Dtos.Budget;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Interfaces;
using ExpenseTracker.Service.Interfaces;

namespace ExpenseTracker.Service.Services
{
    public class BudgetService : IBudgetService
    {
        private readonly IBudgetRepository _budgetRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public BudgetService(IBudgetRepository budgetRepository, ICategoryRepository categoryRepository, IMapper mapper)
        {
            _budgetRepository = budgetRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BudgetDto>> GetAllAsync(int userId)
        {
            var budgets = await _budgetRepository.GetAllAsync(userId);
            return _mapper.Map<IEnumerable<BudgetDto>>(budgets);
        }

        public async Task<BudgetDto> GetByIdAsync(int id)
        {
            var budget = await _budgetRepository.GetByIdAsync(id);
            if (budget == null)
                throw new KeyNotFoundException($"Budget with ID {id} not found.");
            return _mapper.Map<BudgetDto>(budget);
        }

        public async Task<BudgetDto> CreateAsync(CreateBudgetDto budgetDto, int userId)
        {
            // Validate category exists and is an expense category
            if (budgetDto.CategoryId <= 0)
                throw new ArgumentException("CategoryId is required");

            var category = await _categoryRepository.GetByIdAsync(budgetDto.CategoryId)
                ?? throw new KeyNotFoundException($"Category with ID {budgetDto.CategoryId} not found.");

            if (category.UserId != userId)
                throw new InvalidOperationException("Cannot create budget for another user's category");

            if (category.Type != CategoryType.Expense)
                throw new InvalidOperationException("Budgets can only be created for expense categories");

            // Check for existing budget in the same period
            var existingBudget = await _budgetRepository.GetByCategoryAndPeriodAsync(
                budgetDto.CategoryId,
                budgetDto.Period,
                budgetDto.StartDate);

            if (existingBudget != null)
                throw new InvalidOperationException($"A budget already exists for this category in the specified period");

            var budget = _mapper.Map<BudgetEntity>(budgetDto);
            budget.UserId = userId;
            budget.CreatedAt = DateTime.UtcNow;
            budget.UpdatedAt = DateTime.UtcNow;

            var createdBudget = await _budgetRepository.CreateAsync(budget);
            return _mapper.Map<BudgetDto>(createdBudget);
        }

        public async Task<BudgetDto> UpdateAsync(int id, UpdateBudgetDto budgetDto)
        {
            var existingBudget = await _budgetRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Budget with ID {id} not found.");

            // Validate category if it's being changed
            if (budgetDto.CategoryId > 0 && budgetDto.CategoryId != existingBudget.CategoryId)
            {
                var category = await _categoryRepository.GetByIdAsync(budgetDto.CategoryId)
                    ?? throw new KeyNotFoundException($"Category with ID {budgetDto.CategoryId} not found.");

                if (category.UserId != existingBudget.UserId)
                    throw new InvalidOperationException("Cannot update budget to use another user's category");

                if (category.Type != CategoryType.Expense)
                    throw new InvalidOperationException("Budgets can only be associated with expense categories");

                // Check for existing budget in the same period (excluding current budget)
                var duplicateBudget = await _budgetRepository.GetAllAsync(existingBudget.UserId);
                var startDate = budgetDto.StartDate != default ? budgetDto.StartDate : existingBudget.StartDate;

                var hasDuplicate = duplicateBudget.Any(b => 
                    b.CategoryId == budgetDto.CategoryId && 
                    b.Period == budgetDto.Period &&
                    b.StartDate == startDate &&
                    b.Id != id);

                if (hasDuplicate)
                    throw new InvalidOperationException($"Another budget already exists for this category in the specified period");
            }

            _mapper.Map(budgetDto, existingBudget);
            existingBudget.UpdatedAt = DateTime.UtcNow;

            var updatedBudget = await _budgetRepository.UpdateAsync(existingBudget);
            return _mapper.Map<BudgetDto>(updatedBudget);
        }

        public async Task DeleteAsync(int id)
        {
            var budget = await _budgetRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Budget with ID {id} not found.");
                
            await _budgetRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<BudgetDto>> GetByCategoryAsync(int categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId)
                ?? throw new KeyNotFoundException($"Category with ID {categoryId} not found.");

            if (category.Type != CategoryType.Expense)
                throw new InvalidOperationException("Can only retrieve budgets for expense categories");

            var budgets = await _budgetRepository.GetByCategoryAsync(categoryId);
            return _mapper.Map<IEnumerable<BudgetDto>>(budgets);
        }
    }
}