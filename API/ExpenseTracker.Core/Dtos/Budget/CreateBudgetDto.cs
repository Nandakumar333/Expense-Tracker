using ExpenseTracker.Core.Entities;
using System;
using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Core.Dtos.Budget
{
    public class CreateBudgetDto
    {
        [Required]
        public int CategoryId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        public BudgetPeriod Period { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public bool Rollover { get; set; }

        public string Description { get; set; } = string.Empty;
    }
}