using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.Core.Dtos.Budget;
using ExpenseTracker.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetController : ControllerBase
    {
        private readonly IBudgetService _budgetService;

        public BudgetController(IBudgetService budgetService)
        {
            _budgetService = budgetService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BudgetDto>>> GetAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var budgets = await _budgetService.GetAllAsync(userId);
            return Ok(budgets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BudgetDto>> GetById(int id)
        {
            var budget = await _budgetService.GetByIdAsync(id);
            if (budget == null)
                return NotFound();
            return Ok(budget);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<BudgetDto>>> GetByCategory(int categoryId)
        {
            var budgets = await _budgetService.GetByCategoryAsync(categoryId);
            return Ok(budgets);
        }

        [HttpPost]
        public async Task<ActionResult<BudgetDto>> Create(CreateBudgetDto budgetDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var createdBudget = await _budgetService.CreateAsync(budgetDto, userId);
            return CreatedAtAction(nameof(GetById), new { id = createdBudget.Id }, createdBudget);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<BudgetDto>> Update(int id, UpdateBudgetDto budgetDto)
        {
            try
            {
                var updatedBudget = await _budgetService.UpdateAsync(id, budgetDto);
                return Ok(updatedBudget);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _budgetService.DeleteAsync(id);
            return NoContent();
        }
    }
}