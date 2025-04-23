using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Core.Entities
{
    public enum CategoryType
    {
        Income,
        Expense,
        Transfer
    }

    [Table("Categories")]
    public class CategoryEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [Required]
        public CategoryType Type { get; set; }
        
        [MaxLength(50)]
        public string Color { get; set; }
        
        public int? ParentId { get; set; }
        
        [MaxLength(255)]
        public string Path { get; set; }
        
        public int? Level { get; set; }
        
        public string Description { get; set; }
        
        [MaxLength(50)]
        public string Icon { get; set; }
        
        public bool IsActive { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual UserEntity User { get; set; }
        
        [ForeignKey("ParentId")]
        public virtual CategoryEntity ParentCategory { get; set; }
        
        public virtual ICollection<CategoryEntity> SubCategories { get; set; }
        public virtual ICollection<TransactionEntity> Transactions { get; set; }
        public virtual ICollection<BudgetEntity> Budgets { get; set; }
    }
}