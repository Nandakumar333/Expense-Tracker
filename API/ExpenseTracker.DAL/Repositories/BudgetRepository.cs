using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Data;
using ExpenseTracker.DAL.Interfaces;

namespace ExpenseTracker.DAL.Repositories
{
    public class BudgetRepository : IBudgetRepository
    {
        private readonly AppDbContext _context;

        public BudgetRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BudgetEntity>> GetAllAsync(int userId)
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        public async Task<BudgetEntity> GetByIdAsync(int id)
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<BudgetEntity> CreateAsync(BudgetEntity budget)
        {
            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();
            return budget;
        }

        public async Task<BudgetEntity> UpdateAsync(BudgetEntity budget)
        {
            _context.Entry(budget).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return budget;
        }

        public async Task DeleteAsync(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget != null)
            {
                _context.Budgets.Remove(budget);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<BudgetEntity>> GetByCategoryAsync(int categoryId)
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<BudgetEntity?> GetByCategoryAndPeriodAsync(int categoryId, BudgetPeriod period, DateTime startDate)
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.CategoryId == categoryId && 
                                        b.Period == period && 
                                        b.StartDate == startDate);
        }
    }
}