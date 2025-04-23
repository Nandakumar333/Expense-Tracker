using System;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Dtos.Category
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public CategoryType Type { get; set; }
        public string Color { get; set; }
        public int? ParentId { get; set; }
        public string Path { get; set; }
        public int? Level { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
        public string ParentCategoryName { get; set; }
    }
}