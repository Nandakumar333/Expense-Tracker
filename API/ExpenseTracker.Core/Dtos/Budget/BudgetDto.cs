using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Budget
{
    public class BudgetDto
    {
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public decimal Amount { get; set; }
        public BudgetPeriod Period { get; set; }
        public DateTime StartDate { get; set; }
        public bool Rollover { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}