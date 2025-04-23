using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ExpenseTracker.Core.Dtos.Account;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Interfaces;
using ExpenseTracker.Service.Interfaces;

namespace ExpenseTracker.Service.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IMapper _mapper;

        public AccountService(IAccountRepository accountRepository, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AccountDto>> GetAllAccountsAsync(int userId)
        {
            var accounts = await _accountRepository.GetAllAsync(userId);
            return _mapper.Map<IEnumerable<AccountDto>>(accounts);
        }

        public async Task<AccountDto> GetAccountByIdAsync(int id, int userId)
        {
            var account = await _accountRepository.GetByIdAsync(id, userId);
            return _mapper.Map<AccountDto>(account);
        }

        public async Task<AccountDto> CreateAccountAsync(CreateAccountDto createAccountDto, int userId)
        {
            var account = _mapper.Map<AccountEntity>(createAccountDto);
            account.UserId = userId;
            account.CreatedAt = DateTime.UtcNow;
            account.UpdatedAt = DateTime.UtcNow;

            var createdAccount = await _accountRepository.CreateAsync(account);
            return _mapper.Map<AccountDto>(createdAccount);
        }

        public async Task<AccountDto> UpdateAccountAsync(int id, UpdateAccountDto updateAccountDto, int userId)
        {
            var existingAccount = await _accountRepository.GetByIdAsync(id, userId);
            if (existingAccount == null)
                throw new Exception($"Account with ID {id} not found");

            _mapper.Map(updateAccountDto, existingAccount);
            existingAccount.UpdatedAt = DateTime.UtcNow;

            var updatedAccount = await _accountRepository.UpdateAsync(existingAccount);
            return _mapper.Map<AccountDto>(updatedAccount);
        }

        public async Task DeleteAccountAsync(int id, int userId)
        {
            var hasTransactions = await _accountRepository.HasTransactionsAsync(id);
            if (hasTransactions)
                throw new InvalidOperationException("Cannot delete account with existing transactions");

            await _accountRepository.DeleteAsync(id, userId);
        }

        public async Task UpdateBalanceAsync(int id, decimal amount, int userId)
        {
            await ValidateAccountOwnershipAsync(id, userId);
            
            if (amount < 0)
            {
                var hasSufficientBalance = await HasSufficientBalanceAsync(id, amount);
                if (!hasSufficientBalance)
                    throw new InvalidOperationException("Insufficient funds for this operation");
            }

            await _accountRepository.UpdateBalanceAsync(id, amount, userId);
        }

        public async Task ValidateAccountOwnershipAsync(int accountId, int userId)
        {
            var account = await _accountRepository.GetByIdAsync(accountId, userId);
            if (account == null)
                throw new UnauthorizedAccessException($"Account {accountId} does not belong to user {userId}");
        }

        public async Task<bool> HasSufficientBalanceAsync(int accountId, decimal amount)
        {
            var account = await _accountRepository.GetByIdAsync(accountId, 0); // userId not needed for balance check
            if (account == null)
                throw new Exception($"Account with ID {accountId} not found");

            return account.Balance + amount >= 0;
        }
    }
}