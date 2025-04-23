using System;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Transaction
{
    public class TransactionDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int? CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int? AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public CategoryType Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
    }
}