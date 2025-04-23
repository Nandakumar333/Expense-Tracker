using ExpenseTracker.Core.Dtos.Users;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ExpenseTracker.Service.Interfaces
{
    public interface IIdentityService
    {
        Task<ServiceResult> RegisterAsync(RegisterUserDto dto);
        Task<ServiceResult> LoginAsync(LoginDto dto);
        Task<ServiceResult> ChangePasswordAsync(ClaimsPrincipal user, ChangePasswordDto dto);
        Task<ServiceResult> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<ServiceResult> ResetPasswordAsync(ResetPasswordDto dto);
        Task<ServiceResult> RefreshTokenAsync(RefreshTokenDto dto);
        Task<ServiceResult> LogoutAsync(ClaimsPrincipal user);
    }

    public class ServiceResult
    {
        public bool Succeeded { get; set; }
        public string[] Errors { get; set; } = new string[0];
        public object Data { get; set; }
    }
}