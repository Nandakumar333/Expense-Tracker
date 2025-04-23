using System.Threading.Tasks;
using System.Collections.Generic;
using ExpenseTracker.Core.Entities;
using System.Linq;
using System.Linq.Expressions;
using System;

namespace ExpenseTracker.DAL.Interfaces
{
    public interface IUserRepository : IBaseRepository<UserEntity>
    {
        Task<UserEntity> GetByIdAsync(int id);
        Task<UserEntity> GetByEmailAsync(string email);
        Task<UserEntity> GetByUsernameAsync(string username);
        Task<IEnumerable<UserEntity>> GetAllAsync();
        Task<UserEntity> CreateAsync(UserEntity user);
        Task<UserEntity> UpdateAsync(UserEntity user);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(string username, string email);

        // Authentication related methods
        Task<UserEntity> FindByEmailAsync(string email);
        Task<UserEntity> FindByRefreshTokenAsync(string refreshToken);
        Task<UserEntity> FindByResetTokenAsync(string resetToken);
        
        // Profile and settings related methods
        Task<UserEntity> GetUserWithProfileAsync(int userId);
        Task<UserEntity> GetUserWithSettingsAsync(int userId);
        Task<UserEntity> GetUserWithProfileAndSettingsAsync(int userId);

        // Query methods
        IQueryable<UserEntity> GetQuery();
        IQueryable<UserEntity> GetQueryWithIncludes(params Expression<Func<UserEntity, object>>[] includes);
    }
}