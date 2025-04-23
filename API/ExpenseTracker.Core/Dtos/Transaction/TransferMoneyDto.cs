using System;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Core.Dtos.Transaction
{
    public class TransferMoneyDto
    {
        [Required]
        public int FromAccountId { get; set; }

        [Required]
        public int ToAccountId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string Description { get; set; } = string.Empty; 

        public DateTime? Date { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}