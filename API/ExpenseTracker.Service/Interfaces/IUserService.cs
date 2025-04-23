using System.Threading.Tasks;
using System.Collections.Generic;
using ExpenseTracker.Core.Dtos.Users;

namespace ExpenseTracker.Service.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetUserByIdAsync(int id);
        Task<UserDto> GetUserByEmailAsync(string email);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        
        // Profile management
        Task<UserDto> GetUserProfileAsync(int userId);
        Task<UserDto> UpdateUserProfileAsync(int userId, UpdateUserProfileDto dto);

        // Settings management
        Task<UserSettingsDto> GetUserSettingsAsync(int userId);
        Task<UserSettingsDto> UpdateUserSettingsAsync(int userId, UpdateUserSettingsDto dto);
    }
}