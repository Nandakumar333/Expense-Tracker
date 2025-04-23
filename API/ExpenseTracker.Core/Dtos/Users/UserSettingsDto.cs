using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Core.Dtos.Users
{
    public class UserSettingsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        
        [Required]
        [StringLength(3)]
        public string Currency { get; set; } = "USD";

        [Required]
        [StringLength(10)]
        public string Language { get; set; } = "en-US";

        [Required]
        [StringLength(10)]
        public string Theme { get; set; } = "light";

        [Required]
        [StringLength(20)]
        public string DateFormat { get; set; } = "MM/DD/YYYY";

        [Required]
        [StringLength(50)]
        public string TimeZone { get; set; }

        public bool NotificationsEnabled { get; set; } = true;
        
        public bool EmailNotificationsEnabled { get; set; }

        [Required]
        [StringLength(10)]
        public string DefaultTransactionType { get; set; } = "expense";
    }
}