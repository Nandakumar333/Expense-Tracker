using System;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Transaction
{
    public class TransactionFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public CategoryType? Type { get; set; }
        public int? CategoryId { get; set; }
        public int? AccountId { get; set; }
        public int? UserId { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }
}