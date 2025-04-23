using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpenseTracker.Core.Dtos.Category;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var categories = await _categoryService.GetAllAsync(userId);
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound();
            return Ok(category);
        }

        [HttpGet("type/{type}")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetByType(CategoryType type)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var categories = await _categoryService.GetByTypeAsync(userId, type);
            return Ok(categories);
        }

        [HttpGet("{parentId}/subcategories")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetSubcategories(int parentId)
        {
            var subcategories = await _categoryService.GetSubcategoriesAsync(parentId);
            return Ok(subcategories);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDto>> Create(CreateCategoryDto categoryDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var createdCategory = await _categoryService.CreateAsync(categoryDto, userId);
            return CreatedAtAction(nameof(GetById), new { id = createdCategory.Id }, createdCategory);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> Update(int id, UpdateCategoryDto categoryDto)
        {
            try
            {
                var updatedCategory = await _categoryService.UpdateAsync(id, categoryDto);
                return Ok(updatedCategory);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                await _categoryService.DeleteAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/inUse")]
        public async Task<ActionResult<bool>> IsCategoryInUse(int id)
        {
            var isInUse = await _categoryService.IsCategoryInUseAsync(id);
            return Ok(isInUse);
        }
    }
}