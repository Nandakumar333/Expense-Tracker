using System;

namespace ExpenseTracker.Core.Dtos.Account
{
    public class AccountDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Balance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
    }

    public class CreateAccountDto
    {
        public string Name { get; set; }
        public decimal Balance { get; set; }
    }

    public class UpdateAccountDto
    {
        public string Name { get; set; }
        public decimal Balance { get; set; }
    }
}