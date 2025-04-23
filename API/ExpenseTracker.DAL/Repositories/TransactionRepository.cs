using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Core.Dtos.Transaction;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Data;
using ExpenseTracker.DAL.Interfaces;

namespace ExpenseTracker.DAL.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;

        public TransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TransactionEntity>> GetTransactionsAsync(TransactionFilterDto filter)
        {
            var query = _context.Transactions
                .Include(t => t.Category)
                .Include(t => t.Account)
                .AsQueryable();

            if (filter != null)
            {
                if (filter.StartDate.HasValue)
                    query = query.Where(t => t.Date >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(t => t.Date <= filter.EndDate.Value);

                if (filter.Type.HasValue)
                    query = query.Where(t => t.Type == filter.Type.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(t => t.CategoryId == filter.CategoryId.Value);

                if (filter.AccountId.HasValue)
                    query = query.Where(t => t.AccountId == filter.AccountId.Value);

                if (filter.UserId.HasValue)
                    query = query.Where(t => t.UserId == filter.UserId.Value);

                if (filter.MinAmount.HasValue)
                    query = query.Where(t => t.Amount >= filter.MinAmount.Value);

                if (filter.MaxAmount.HasValue)
                    query = query.Where(t => t.Amount <= filter.MaxAmount.Value);

                if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                    query = query.Where(t => t.Description.Contains(filter.SearchTerm));
            }

            return await query
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<TransactionEntity> GetByIdAsync(int id)
        {
            return await _context.Transactions
                .Include(t => t.Category)
                .Include(t => t.Account)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TransactionEntity> AddAsync(TransactionEntity transaction)
        {
            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<TransactionEntity> UpdateAsync(TransactionEntity transaction)
        {
            _context.Entry(transaction).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task DeleteAsync(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction != null)
            {
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();
            }
        }
    }
}