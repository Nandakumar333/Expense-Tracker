using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using ExpenseTracker.Core.Dtos.Users;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.DAL.Data;

namespace ExpenseTracker.Service.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _dbContext;

        public UserService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            var user = await _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == id);

            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto> GetUserByEmailAsync(string email)
        {
            var user = await _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Profile.Email == email);

            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .ToListAsync();

            return users.ConvertAll(MapToUserDto);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null) return false;

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<UserDto> GetUserProfileAsync(int userId)
        {
            var user = await _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto> UpdateUserProfileAsync(int userId, UpdateUserProfileDto dto)
        {
            var user = await _dbContext.Users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            user.Profile.FirstName = dto.FirstName;
            user.Profile.LastName = dto.LastName;

            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Profile.Email)
            {
                var existingUser = await _dbContext.Users
                    .AnyAsync(u => u.Profile.Email == dto.Email && u.Id != userId);

                if (existingUser)
                    throw new InvalidOperationException("Email is already in use");

                user.Profile.Email = dto.Email;
                user.Username = dto.Email;
            }

            user.Profile.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return MapToUserDto(user);
        }

        public async Task<UserSettingsDto> GetUserSettingsAsync(int userId)
        {
            var user = await _dbContext.Users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.Settings != null ? MapToSettingsDto(user.Settings) : null;
        }

        public async Task<UserSettingsDto> UpdateUserSettingsAsync(int userId, UpdateUserSettingsDto dto)
        {
            var user = await _dbContext.Users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Settings == null) return null;

            if (!string.IsNullOrEmpty(dto.DefaultCurrency))
                user.Settings.Currency = dto.DefaultCurrency;

            if (!string.IsNullOrEmpty(dto.TimeZone))
                user.Settings.TimeZone = dto.TimeZone;

            if (!string.IsNullOrEmpty(dto.Language))
                user.Settings.Language = dto.Language;

            user.Settings.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return MapToSettingsDto(user.Settings);
        }

        private static UserDto MapToUserDto(UserEntity user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Profile.Email,
                FirstName = user.Profile.FirstName,
                LastName = user.Profile.LastName,
                DefaultCurrency = user.Settings.Currency,
                TimeZone = user.Settings.TimeZone,
                Language = user.Settings.Language
            };
        }

        private static UserSettingsDto MapToSettingsDto(UserSettingsEntity settings)
        {
            return new UserSettingsDto
            {
                Id = settings.Id,
                UserId = settings.UserId,
                Currency = settings.Currency,
                Language = settings.Language,
                Theme = settings.Theme,
                DateFormat = settings.DateFormat,
                TimeZone = settings.TimeZone,
                NotificationsEnabled = settings.NotificationsEnabled,
                EmailNotificationsEnabled = settings.EmailNotificationsEnabled,
                DefaultTransactionType = settings.DefaultTransactionType
            };
        }
    }
}