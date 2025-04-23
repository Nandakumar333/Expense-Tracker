using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.Core.Dtos.Transaction;
using ExpenseTracker.Service.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ExpenseTracker.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IMapper _mapper;

        public TransactionsController(ITransactionService transactionService, IMapper mapper)
        {
            _transactionService = transactionService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions([FromQuery] TransactionFilterDto filter)
        {
            var transactions = await _transactionService.GetTransactionsAsync(filter);
            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDto>> GetTransaction(int id)
        {
            var transaction = await _transactionService.GetTransactionByIdAsync(id);
            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpPost]
        public async Task<ActionResult<TransactionDto>> CreateTransaction(CreateTransactionDto transactionDto)
        {
            var transaction = await _transactionService.CreateTransactionAsync(transactionDto);
            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, UpdateTransactionDto transactionDto)
        {
            if (id != transactionDto.Id)
                return BadRequest();

            await _transactionService.UpdateTransactionAsync(transactionDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            await _transactionService.DeleteTransactionAsync(id);
            return NoContent();
        }

        [HttpPost("transfer")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> TransferMoney(TransferMoneyDto transferDto)
        {
            var transactions = await _transactionService.TransferMoneyAsync(transferDto);
            return Ok(transactions);
        }

        [HttpGet("account/{accountId}")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactionsByAccount(int accountId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var transactions = await _transactionService.GetTransactionsByAccountIdAsync(accountId, userId);
            return Ok(transactions);
        }
    }
}