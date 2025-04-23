using System;
using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Transaction
{
    public class CreateTransactionDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int AccountId { get; set; }

        public DateTime? Date { get; set; }

        [Required]
        public CategoryType Type { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}