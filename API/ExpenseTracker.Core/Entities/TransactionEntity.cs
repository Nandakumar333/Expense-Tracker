using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Core.Entities
{
    [Table("Transactions")]
    public class TransactionEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string? Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(15,2)")]
        public decimal Amount { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [Required]
        public int AccountId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public CategoryType Type { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual UserEntity? User { get; set; }

        [ForeignKey("CategoryId")]
        public virtual CategoryEntity? Category { get; set; }

        [ForeignKey("AccountId")]
        public virtual AccountEntity? Account { get; set; }
    }
}