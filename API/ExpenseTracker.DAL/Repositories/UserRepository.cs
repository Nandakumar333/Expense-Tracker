using ExpenseTracker.Core.Entities;
using ExpenseTracker.DAL.Data;
using ExpenseTracker.DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ExpenseTracker.DAL.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        private readonly DbSet<UserEntity> _users;

        public UserRepository(AppDbContext context)
        {
            _context = context;
            _users = context.Set<UserEntity>();
        }

        public async Task<UserEntity> GetByIdAsync(int id)
        {
            return await _users.FindAsync(id);
        }

        public async Task<UserEntity> GetByEmailAsync(string email)
        {
            return await _users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Profile.Email == email);
        }

        public async Task<UserEntity> GetByUsernameAsync(string username)
        {
            return await _users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<UserEntity>> GetAllAsync()
        {
            return await _users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .ToListAsync();
        }

        public async Task<UserEntity> CreateAsync(UserEntity user)
        {
            await _users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<UserEntity> UpdateAsync(UserEntity user)
        {
            _users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _users.FindAsync(id);
            if (user == null) return false;

            user.IsDeleted = true;
            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(string username, string email)
        {
            return await _users.AnyAsync(u => 
                u.Username == username || 
                u.Profile.Email == email);
        }

        public async Task<UserEntity> FindByEmailAsync(string email)
        {
            return await _users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Profile.Email == email);
        }

        public async Task<UserEntity> FindByRefreshTokenAsync(string refreshToken)
        {
            return await _users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        public async Task<UserEntity> FindByResetTokenAsync(string resetToken)
        {
            return await _users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.ResetPasswordToken == resetToken);
        }

        public async Task<UserEntity> GetUserWithProfileAsync(int userId)
        {
            return await _users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<UserEntity> GetUserWithSettingsAsync(int userId)
        {
            return await _users
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<UserEntity> GetUserWithProfileAndSettingsAsync(int userId)
        {
            return await _users
                .Include(u => u.Profile)
                .Include(u => u.Settings)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public IQueryable<UserEntity> GetQuery()
        {
            return _users.AsQueryable();
        }

        public IQueryable<UserEntity> GetQueryWithIncludes(params Expression<Func<UserEntity, object>>[] includes)
        {
            var query = GetQuery();
            return includes.Aggregate(query, (current, include) => current.Include(include));
        }

        public Task<UserEntity> AddAsync(UserEntity entity)
        {
            throw new NotImplementedException();
        }

        Task IBaseRepository<UserEntity>.UpdateAsync(UserEntity entity)
        {
            return UpdateAsync(entity);
        }

        public Task DeleteAsync(UserEntity entity)
        {
            throw new NotImplementedException();
        }
    }
}