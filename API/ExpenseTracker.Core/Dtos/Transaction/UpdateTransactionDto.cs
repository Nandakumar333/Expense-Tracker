using System;
using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Transaction
{
    public class UpdateTransactionDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Amount { get; set; }

        public int? CategoryId { get; set; }

        [Required]
        public int AccountId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public CategoryType Type { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}