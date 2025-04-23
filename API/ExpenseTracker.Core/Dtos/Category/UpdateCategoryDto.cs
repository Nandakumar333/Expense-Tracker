using System.ComponentModel.DataAnnotations;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Category
{
    public class UpdateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        public CategoryType Type { get; set; }

        [MaxLength(50)]
        public string Color { get; set; }

        public int? ParentId { get; set; }

        public string Description { get; set; }

        [MaxLength(50)]
        public string Icon { get; set; }

        public bool IsActive { get; set; }
    }
}