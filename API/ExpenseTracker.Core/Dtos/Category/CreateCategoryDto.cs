using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Category
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public CategoryType Type { get; set; }

        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;

        public int? ParentId { get; set; }

        public string Description { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;
    }
}