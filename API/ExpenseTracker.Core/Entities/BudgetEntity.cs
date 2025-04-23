using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Core.Entities
{
    public enum BudgetPeriod
    {
        Monthly,
        Yearly
    }

    [Table("Budgets")]
    public class BudgetEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? CategoryId { get; set; }

        [Required]
        [Column(TypeName = "decimal(15,2)")]
        public decimal Amount { get; set; }

        [Required]
        public BudgetPeriod Period { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public bool Rollover { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual UserEntity? User { get; set; }

        [ForeignKey("CategoryId")]
        public virtual CategoryEntity? Category { get; set; }
    }
}