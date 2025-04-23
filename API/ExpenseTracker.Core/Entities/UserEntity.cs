using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Core.Entities
{
    [Table("Users")]
    public class UserEntity
    {
        public UserEntity()
        {
            Categories = new List<CategoryEntity>();
            Accounts = new List<AccountEntity>();
            Transactions = new List<TransactionEntity>();
            Budgets = new List<BudgetEntity>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [StringLength(50)]
        public string Role { get; set; } = "User";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLogin { get; set; }

        public DateTime? DeletedAt { get; set; }

        public string? DeletedBy { get; set; }

        public bool IsDeleted { get; set; }

        // Authentication fields
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiry { get; set; }

        // Navigation properties
        public virtual ICollection<CategoryEntity> Categories { get; set; }
        public virtual ICollection<AccountEntity> Accounts { get; set; }
        public virtual ICollection<TransactionEntity> Transactions { get; set; }
        public virtual ICollection<BudgetEntity> Budgets { get; set; }
        public virtual UserProfileEntity Profile { get; set; }
        public virtual UserSettingsEntity Settings { get; set; }
    }
}
