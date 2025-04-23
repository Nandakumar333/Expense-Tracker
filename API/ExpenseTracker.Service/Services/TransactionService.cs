using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ExpenseTracker.Core.Dtos.Transaction;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Interfaces;
using ExpenseTracker.Service.Interfaces;

namespace ExpenseTracker.Service.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IAccountService _accountService;
        private readonly IMapper _mapper;

        public TransactionService(
            ITransactionRepository transactionRepository,
            IAccountService accountService,
            IMapper mapper)
        {
            _transactionRepository = transactionRepository;
            _accountService = accountService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TransactionDto>> GetTransactionsAsync(TransactionFilterDto filter)
        {
            var transactions = await _transactionRepository.GetTransactionsAsync(filter);
            return _mapper.Map<IEnumerable<TransactionDto>>(transactions);
        }

        public async Task<TransactionDto> GetTransactionByIdAsync(int id)
        {
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null)
                throw new KeyNotFoundException($"Transaction with ID {id} not found");
                
            return _mapper.Map<TransactionDto>(transaction);
        }

        public async Task<TransactionDto> CreateTransactionAsync(CreateTransactionDto transactionDto)
        {
            // Validate account ownership and sufficient balance
            await _accountService.ValidateAccountOwnershipAsync(transactionDto.AccountId, transactionDto.UserId);
            
            // For expenses (negative amounts), check sufficient balance
            if (transactionDto.Amount < 0)
            {
                var hasSufficientBalance = await _accountService.HasSufficientBalanceAsync(
                    transactionDto.AccountId, 
                    transactionDto.Amount);

                if (!hasSufficientBalance)
                    throw new InvalidOperationException("Insufficient funds for this transaction");
            }

            var transaction = _mapper.Map<TransactionEntity>(transactionDto);
            transaction.Date = transactionDto.Date ?? DateTime.UtcNow;

            // Create transaction and update account balance atomically
            var result = await _transactionRepository.AddAsync(transaction);
            await _accountService.UpdateBalanceAsync(transaction.AccountId, transaction.Amount, transaction.UserId);

            return _mapper.Map<TransactionDto>(result);
        }

        public async Task<TransactionDto> UpdateTransactionAsync(UpdateTransactionDto transactionDto)
        {
            var existingTransaction = await _transactionRepository.GetByIdAsync(transactionDto.Id);
            if (existingTransaction == null)
                throw new KeyNotFoundException($"Transaction with ID {transactionDto.Id} not found");

            // Validate account ownership
            await _accountService.ValidateAccountOwnershipAsync(transactionDto.AccountId, transactionDto.UserId);

            // Calculate the difference in amount that needs to be applied to the account
            var amountDifference = transactionDto.Amount - existingTransaction.Amount;

            // If it's a withdrawal or the amount is being reduced, check balance
            if (amountDifference < 0)
            {
                var hasSufficientBalance = await _accountService.HasSufficientBalanceAsync(
                    transactionDto.AccountId,
                    amountDifference);

                if (!hasSufficientBalance)
                    throw new InvalidOperationException("Insufficient funds for this transaction update");
            }

            // If account is changing, validate new account ownership and balance
            if (transactionDto.AccountId != existingTransaction.AccountId)
            {
                await _accountService.ValidateAccountOwnershipAsync(transactionDto.AccountId, transactionDto.UserId);
                
                if (transactionDto.Amount < 0)
                {
                    var hasSufficientBalance = await _accountService.HasSufficientBalanceAsync(
                        transactionDto.AccountId,
                        transactionDto.Amount);

                    if (!hasSufficientBalance)
                        throw new InvalidOperationException("Insufficient funds in the target account");
                }

                // Revert amount from old account
                await _accountService.UpdateBalanceAsync(
                    existingTransaction.AccountId,
                    -existingTransaction.Amount,
                    transactionDto.UserId);

                // Apply amount to new account
                await _accountService.UpdateBalanceAsync(
                    transactionDto.AccountId,
                    transactionDto.Amount,
                    transactionDto.UserId);
            }
            else
            {
                // Update the balance with the difference
                await _accountService.UpdateBalanceAsync(
                    existingTransaction.AccountId,
                    amountDifference,
                    transactionDto.UserId);
            }

            var transaction = _mapper.Map<TransactionEntity>(transactionDto);
            var result = await _transactionRepository.UpdateAsync(transaction);
            
            return _mapper.Map<TransactionDto>(result);
        }

        public async Task DeleteTransactionAsync(int id)
        {
            var transaction = await _transactionRepository.GetByIdAsync(id);
            if (transaction == null)
                throw new KeyNotFoundException($"Transaction with ID {id} not found");

            // Revert the transaction amount from the account
            await _accountService.UpdateBalanceAsync(
                transaction.AccountId,
                -transaction.Amount,
                transaction.UserId);

            await _transactionRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<TransactionDto>> TransferMoneyAsync(TransferMoneyDto transferDto)
        {
            // Validate ownership of both accounts
            await _accountService.ValidateAccountOwnershipAsync(transferDto.FromAccountId, transferDto.UserId);
            await _accountService.ValidateAccountOwnershipAsync(transferDto.ToAccountId, transferDto.UserId);

            // Check sufficient balance in source account
            var hasSufficientBalance = await _accountService.HasSufficientBalanceAsync(
                transferDto.FromAccountId,
                -transferDto.Amount);

            if (!hasSufficientBalance)
                throw new InvalidOperationException("Insufficient funds for transfer");

            var transactions = new List<TransactionEntity>();

            // Create withdrawal transaction
            var withdrawalTransaction = new TransactionEntity
            {
                Description = $"Transfer: {transferDto.Description}",
                Amount = -transferDto.Amount,
                AccountId = transferDto.FromAccountId,
                Date = transferDto.Date ?? DateTime.UtcNow,
                Type = CategoryType.Transfer,
                UserId = transferDto.UserId
            };

            // Create deposit transaction
            var depositTransaction = new TransactionEntity
            {
                Description = $"Received: {transferDto.Description}",
                Amount = transferDto.Amount,
                AccountId = transferDto.ToAccountId,
                Date = transferDto.Date ?? DateTime.UtcNow,
                Type = CategoryType.Transfer,
                UserId = transferDto.UserId
            };

            // Execute transfers and balance updates
            await _transactionRepository.AddAsync(withdrawalTransaction);
            await _accountService.UpdateBalanceAsync(transferDto.FromAccountId, -transferDto.Amount, transferDto.UserId);

            await _transactionRepository.AddAsync(depositTransaction);
            await _accountService.UpdateBalanceAsync(transferDto.ToAccountId, transferDto.Amount, transferDto.UserId);

            transactions.Add(withdrawalTransaction);
            transactions.Add(depositTransaction);

            return _mapper.Map<IEnumerable<TransactionDto>>(transactions);
        }

        public async Task<IEnumerable<TransactionDto>> GetTransactionsByAccountIdAsync(int accountId, int userId)
        {
            // Validate account ownership first
            await _accountService.ValidateAccountOwnershipAsync(accountId, userId);

            // Create filter for the specific account
            var filter = new TransactionFilterDto
            {
                AccountId = accountId,
                UserId = userId
            };

            var transactions = await _transactionRepository.GetTransactionsAsync(filter);
            return _mapper.Map<IEnumerable<TransactionDto>>(transactions);
        }
    }
}